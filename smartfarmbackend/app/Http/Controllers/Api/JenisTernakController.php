<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JenisTernak;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JenisTernakController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $jenisTernak = JenisTernak::all();
        return response()->json([
            'status' => 'success',
            'data' => $jenisTernak
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
            'nama_jenis' => 'required|string|max:255|unique:jenis_ternak,nama_jenis',
            'deskripsi' => 'nullable|string',
        ]);

        $jenisTernak = JenisTernak::create($request->all());

        $this->logActivity('Menambahkan jenis ternak: ' . $jenisTernak->nama_jenis, 'Jenis Ternak');

        return response()->json([
            'status' => 'success',
            'message' => 'Jenis ternak berhasil ditambahkan',
            'data' => $jenisTernak
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(JenisTernak $jenisTernak)
    {
        return response()->json([
            'status' => 'success',
            'data' => $jenisTernak
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JenisTernak $jenisTernak)
    {
        if (!Auth::user()->hasRole(['Super Admin', 'Admin'])) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'nama_jenis' => 'required|string|max:255|unique:jenis_ternak,nama_jenis,' . $jenisTernak->id_jenis . ',id_jenis',
            'deskripsi' => 'nullable|string',
        ]);

        $jenisTernak->update($request->all());

        $this->logActivity('Memperbarui jenis ternak: ' . $jenisTernak->nama_jenis, 'Jenis Ternak');

        return response()->json([
            'status' => 'success',
            'message' => 'Jenis ternak berhasil diperbarui',
            'data' => $jenisTernak
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, JenisTernak $jenisTernak)
    {
        if (!Auth::user()->hasRole(['Super Admin', 'Admin'])) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak.'], 403);
        }

        $nama = $jenisTernak->nama_jenis;
        $jenisTernak->delete();

        $this->logActivity('Menghapus jenis ternak: ' . $nama, 'Jenis Ternak');

        return response()->json([
            'status' => 'success',
            'message' => 'Jenis ternak berhasil dihapus'
        ]);
    }
}
