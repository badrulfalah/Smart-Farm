<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TindakanCepat;
use App\Models\Peringatan;
use App\Models\Dashboard;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TindakanCepatController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->hasRole(['Super Admin', 'Admin'])) {
            $tindakan = TindakanCepat::with('peringatan.ternak')->orderBy('id_tindakan', 'desc')->get();
        } else {
            $tindakan = TindakanCepat::whereHas('peringatan.ternak.peternakan', function ($query) use ($user) {
                $query->where('id_pengguna', $user->id_pengguna);
            })->with('peringatan.ternak')->orderBy('id_tindakan', 'desc')->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $tindakan
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_peringatan' => 'required|exists:peringatan,id_peringatan',
            'tindakan' => 'required|string|max:255',
            'penanggung_jawab' => 'required|string|max:255',
            'status' => 'required|string|max:50',
            'catatan' => 'nullable|string',
        ]);

        $peringatan = Peringatan::findOrFail($request->id_peringatan);
        
        // Ownership check
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $peringatan->ternak->peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $tindakan = TindakanCepat::create($request->all());

        // Business Logic: If action is completed, mark parent warning as resolved/handled
        if ($request->status === 'Selesai') {
            $peringatan->status = 'Selesai';
            $peringatan->save();
            Dashboard::recalculate($peringatan->ternak->id_peternakan);
        }

        $this->logActivity('Mencatat tindakan cepat untuk peringatan: ' . $peringatan->jenis_peringatan, 'Tindakan Cepat');

        return response()->json([
            'status' => 'success',
            'message' => 'Tindakan cepat berhasil dicatat',
            'data' => $tindakan
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(TindakanCepat $tindakanCepat)
    {
        $peringatan = $tindakanCepat->peringatan;
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $peringatan->ternak->peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $tindakanCepat->load('peringatan.ternak')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TindakanCepat $tindakanCepat)
    {
        $request->validate([
            'id_peringatan' => 'required|exists:peringatan,id_peringatan',
            'tindakan' => 'required|string|max:255',
            'penanggung_jawab' => 'required|string|max:255',
            'status' => 'required|string|max:50',
            'catatan' => 'nullable|string',
        ]);

        $peringatan = Peringatan::findOrFail($request->id_peringatan);
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && ($peringatan->ternak->peternakan->id_pengguna !== Auth::id() || $tindakanCepat->peringatan->ternak->peternakan->id_pengguna !== Auth::id())) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $tindakanCepat->update($request->all());

        // Sync warning status if action is marked as Selesai
        if ($request->status === 'Selesai') {
            $peringatan->status = 'Selesai';
            $peringatan->save();
            Dashboard::recalculate($peringatan->ternak->id_peternakan);
        }

        $this->logActivity('Memperbarui tindakan cepat untuk peringatan: ' . $peringatan->jenis_peringatan, 'Tindakan Cepat');

        return response()->json([
            'status' => 'success',
            'message' => 'Tindakan cepat berhasil diperbarui',
            'data' => $tindakanCepat
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TindakanCepat $tindakanCepat)
    {
        $peringatan = $tindakanCepat->peringatan;
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $peringatan->ternak->peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $tindakanText = $tindakanCepat->tindakan;
        $tindakanCepat->delete();

        $this->logActivity('Menghapus catatan tindakan cepat: ' . $tindakanText, 'Tindakan Cepat');

        return response()->json([
            'status' => 'success',
            'message' => 'Tindakan cepat berhasil dihapus'
        ]);
    }
}
