<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Peternakan;
use App\Models\Dashboard;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PeternakanController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the peternakan.
     */
    public function index(Request $request)
    {
        // Farmers can only see their own farms, Admin/Super Admin can see all.
        $user = $request->user();
        if ($user->hasRole(['Super Admin', 'Admin'])) {
            $peternakan = Peternakan::with('pengguna')->orderBy('dibuat_pada', 'desc')->get();
        } else {
            $peternakan = Peternakan::where('id_pengguna', $user->id_pengguna)->orderBy('dibuat_pada', 'desc')->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $peternakan
        ]);
    }

    /**
     * Store a newly created peternakan in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_peternakan' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'kota' => 'nullable|string|max:255',
            'provinsi' => 'nullable|string|max:255',
            'luas_lahan' => 'nullable|numeric|min:0',
        ]);

        $peternakan = Peternakan::create([
            'id_pengguna' => Auth::id(),
            'nama_peternakan' => $request->nama_peternakan,
            'alamat' => $request->alamat,
            'kota' => $request->kota,
            'provinsi' => $request->provinsi,
            'luas_lahan' => $request->luas_lahan,
        ]);

        // Initialize dashboard for this farm
        Dashboard::create([
            'id_peternakan' => $peternakan->id_peternakan,
            'total_ternak' => 0,
            'ternak_sehat' => 0,
            'ternak_sakit' => 0,
            'jumlah_peringatan' => 0,
            'stok_pakan' => 0.00,
        ]);

        $this->logActivity('Membuat peternakan baru: ' . $peternakan->nama_peternakan, 'Peternakan');

        return response()->json([
            'status' => 'success',
            'message' => 'Peternakan berhasil dibuat',
            'data' => $peternakan
        ], 201);
    }

    /**
     * Display the specified peternakan.
     */
    public function show(Peternakan $peternakan)
    {
        // Auth check
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $peternakan->load('pengguna')
        ]);
    }

    /**
     * Update the specified peternakan in storage.
     */
    public function update(Request $request, Peternakan $peternakan)
    {
        // Auth check
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $request->validate([
            'nama_peternakan' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'kota' => 'nullable|string|max:255',
            'provinsi' => 'nullable|string|max:255',
            'luas_lahan' => 'nullable|numeric|min:0',
        ]);

        $peternakan->update($request->only(['nama_peternakan', 'alamat', 'kota', 'provinsi', 'luas_lahan']));

        $this->logActivity('Memperbarui peternakan: ' . $peternakan->nama_peternakan, 'Peternakan');

        return response()->json([
            'status' => 'success',
            'message' => 'Peternakan berhasil diperbarui',
            'data' => $peternakan
        ]);
    }

    /**
     * Remove the specified peternakan from storage.
     */
    public function destroy(Peternakan $peternakan)
    {
        // Auth check
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $nama = $peternakan->nama_peternakan;
        $peternakan->delete();

        $this->logActivity('Menghapus peternakan: ' . $nama, 'Peternakan');

        return response()->json([
            'status' => 'success',
            'message' => 'Peternakan berhasil dihapus'
        ]);
    }
}
