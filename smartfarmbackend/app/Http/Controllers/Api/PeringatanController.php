<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Peringatan;
use App\Models\Ternak;
use App\Models\Dashboard;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PeringatanController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->hasRole(['Super Admin', 'Admin'])) {
            $peringatan = Peringatan::with('ternak')->orderBy('id_peringatan', 'desc')->get();
        } else {
            $peringatan = Peringatan::whereHas('ternak.peternakan', function ($query) use ($user) {
                $query->where('id_pengguna', $user->id_pengguna);
            })->with('ternak')->orderBy('id_peringatan', 'desc')->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $peringatan
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_ternak' => 'required|exists:ternak,id_ternak',
            'jenis_peringatan' => 'required|string|max:255',
            'tingkat_peringatan' => 'required|string|max:50',
            'pesan' => 'required|string',
            'status' => 'required|in:belum_ditangani,sudah_ditangani',
        ]);

        $ternak = Ternak::findOrFail($request->id_ternak);
        
        // Ownership check
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $ternak->peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $peringatan = Peringatan::create($request->all());

        // Update dashboard
        Dashboard::recalculate($ternak->id_peternakan);

        $this->logActivity('Membuat peringatan baru untuk ternak: ' . $ternak->kode_ternak, 'Peringatan');

        return response()->json([
            'status' => 'success',
            'message' => 'Peringatan berhasil dibuat',
            'data' => $peringatan
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Peringatan $peringatan)
    {
        $ternak = $peringatan->ternak;
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $ternak->peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $peringatan->load(['ternak', 'tindakanCepat'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Peringatan $peringatan)
    {
        $request->validate([
            'id_ternak' => 'required|exists:ternak,id_ternak',
            'jenis_peringatan' => 'required|string|max:255',
            'tingkat_peringatan' => 'required|string|max:50',
            'pesan' => 'required|string',
            'status' => 'required|in:belum_ditangani,sudah_ditangani',
        ]);

        $ternak = Ternak::findOrFail($request->id_ternak);
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && ($ternak->peternakan->id_pengguna !== Auth::id() || $peringatan->ternak->peternakan->id_pengguna !== Auth::id())) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $oldFarmId = $peringatan->ternak->id_peternakan;
        $peringatan->update($request->all());

        // Update dashboard
        Dashboard::recalculate($oldFarmId);
        if ($oldFarmId !== $ternak->id_peternakan) {
            Dashboard::recalculate($ternak->id_peternakan);
        }

        $this->logActivity('Memperbarui peringatan untuk ternak: ' . $ternak->kode_ternak, 'Peringatan');

        return response()->json([
            'status' => 'success',
            'message' => 'Peringatan berhasil diperbarui',
            'data' => $peringatan
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Peringatan $peringatan)
    {
        $ternak = $peringatan->ternak;
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $ternak->peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $kode = $ternak->kode_ternak;
        $farmId = $ternak->id_peternakan;
        $peringatan->delete();

        // Update dashboard
        Dashboard::recalculate($farmId);

        $this->logActivity('Menghapus peringatan untuk ternak: ' . $kode, 'Peringatan');

        return response()->json([
            'status' => 'success',
            'message' => 'Peringatan berhasil dihapus'
        ]);
    }
}
