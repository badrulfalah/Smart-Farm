<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KondisiTernak;
use App\Models\Ternak;
use App\Models\Dashboard;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KondisiTernakController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->hasRole(['Super Admin', 'Admin'])) {
            $kondisi = KondisiTernak::with('ternak')->orderBy('id_kondisi', 'desc')->get();
        } else {
            $kondisi = KondisiTernak::whereHas('ternak.peternakan', function ($query) use ($user) {
                $query->where('id_pengguna', $user->id_pengguna);
            })->with('ternak')->orderBy('id_kondisi', 'desc')->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $kondisi
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_ternak' => 'required|exists:ternak,id_ternak',
            'suhu_tubuh' => 'required|numeric|min:30|max:45',
            'berat' => 'required|numeric|min:0',
            'nafsu_makan' => 'required|string|max:50',
            'kondisi_fisik' => 'required|string|max:255',
            'produksi' => 'nullable|numeric|min:0',
            'catatan' => 'nullable|string',
        ]);

        $ternak = Ternak::findOrFail($request->id_ternak);
        
        // Ownership check
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $ternak->peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $kondisi = KondisiTernak::create($request->all());

        // Sync weight and potentially status back to Ternak
        $ternak->berat = $request->berat;
        // Optionally map condition to health status if it indicates sickness
        if ($request->suhu_tubuh > 39.5 || $request->nafsu_makan === 'Sangat Kurang' || str_contains(strtolower($request->kondisi_fisik), 'sakit')) {
            $ternak->status_kesehatan = 'Sakit';
        } else {
            $ternak->status_kesehatan = 'Sehat';
        }
        $ternak->save();

        // Update dashboard
        Dashboard::recalculate($ternak->id_peternakan);

        $this->logActivity('Mencatat kondisi kesehatan baru untuk ternak: ' . $ternak->kode_ternak, 'Kondisi Ternak');

        return response()->json([
            'status' => 'success',
            'message' => 'Kondisi kesehatan ternak berhasil dicatat',
            'data' => $kondisi
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(KondisiTernak $kondisiTernak)
    {
        $ternak = $kondisiTernak->ternak;
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $ternak->peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $kondisiTernak->load('ternak')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, KondisiTernak $kondisiTernak)
    {
        $request->validate([
            'id_ternak' => 'required|exists:ternak,id_ternak',
            'suhu_tubuh' => 'required|numeric|min:30|max:45',
            'berat' => 'required|numeric|min:0',
            'nafsu_makan' => 'required|string|max:50',
            'kondisi_fisik' => 'required|string|max:255',
            'produksi' => 'nullable|numeric|min:0',
            'catatan' => 'nullable|string',
        ]);

        $ternak = Ternak::findOrFail($request->id_ternak);
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && ($ternak->peternakan->id_pengguna !== Auth::id() || $kondisiTernak->ternak->peternakan->id_pengguna !== Auth::id())) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $kondisiTernak->update($request->all());

        // Update Ternak properties
        $ternak->berat = $request->berat;
        if ($request->suhu_tubuh > 39.5 || $request->nafsu_makan === 'Sangat Kurang' || str_contains(strtolower($request->kondisi_fisik), 'sakit')) {
            $ternak->status_kesehatan = 'Sakit';
        } else {
            $ternak->status_kesehatan = 'Sehat';
        }
        $ternak->save();

        // Update dashboard
        Dashboard::recalculate($ternak->id_peternakan);

        $this->logActivity('Memperbarui kondisi kesehatan ternak: ' . $ternak->kode_ternak, 'Kondisi Ternak');

        return response()->json([
            'status' => 'success',
            'message' => 'Kondisi kesehatan ternak berhasil diperbarui',
            'data' => $kondisiTernak
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KondisiTernak $kondisiTernak)
    {
        $ternak = $kondisiTernak->ternak;
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $ternak->peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $kode = $ternak->kode_ternak;
        $farmId = $ternak->id_peternakan;
        $kondisiTernak->delete();

        // Update dashboard
        Dashboard::recalculate($farmId);

        $this->logActivity('Menghapus catatan kondisi kesehatan ternak: ' . $kode, 'Kondisi Ternak');

        return response()->json([
            'status' => 'success',
            'message' => 'Catatan kondisi kesehatan ternak berhasil dihapus'
        ]);
    }
}
