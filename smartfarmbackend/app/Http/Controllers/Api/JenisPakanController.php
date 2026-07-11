<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JenisPakan;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JenisPakanController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $jenisPakan = JenisPakan::all();
        return response()->json([
            'status' => 'success',
            'data' => $jenisPakan
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!Auth::user()->hasRole(['Super Admin', 'Admin'])) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'nama_pakan' => 'required|string|max:255|unique:jenis_pakan,nama_pakan',
            'kandungan_nutrisi' => 'nullable|string',
            'satuan' => 'required|string|max:50',
        ]);

        $jenisPakan = JenisPakan::create($request->only(['nama_pakan', 'kandungan_nutrisi', 'satuan']));

        $this->logActivity('Menambahkan jenis pakan baru: ' . $jenisPakan->nama_pakan, 'Jenis Pakan');

        return response()->json([
            'status' => 'success',
            'message' => 'Jenis pakan berhasil ditambahkan',
            'data' => $jenisPakan
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(JenisPakan $jenisPakan)
    {
        return response()->json([
            'status' => 'success',
            'data' => $jenisPakan
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JenisPakan $jenisPakan)
    {
        if (!Auth::user()->hasRole(['Super Admin', 'Admin'])) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'nama_pakan' => 'required|string|max:255|unique:jenis_pakan,nama_pakan,' . $jenisPakan->id_pakan . ',id_pakan',
            'kandungan_nutrisi' => 'nullable|string',
            'satuan' => 'required|string|max:50',
        ]);

        $jenisPakan->update($request->only(['nama_pakan', 'kandungan_nutrisi', 'satuan']));

        $this->logActivity('Memperbarui jenis pakan: ' . $jenisPakan->nama_pakan, 'Jenis Pakan');

        return response()->json([
            'status' => 'success',
            'message' => 'Jenis pakan berhasil diperbarui',
            'data' => $jenisPakan
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, JenisPakan $jenisPakan)
    {
        if (!Auth::user()->hasRole(['Super Admin', 'Admin'])) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak.'], 403);
        }

        $nama = $jenisPakan->nama_pakan;
        $jenisPakan->delete();

        $this->logActivity('Menghapus jenis pakan: ' . $nama, 'Jenis Pakan');

        return response()->json([
            'status' => 'success',
            'message' => 'Jenis pakan berhasil dihapus'
        ]);
    }
}
