<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JenisPakan;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;

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
        $request->validate([
            'nama_pakan' => 'required|string|max:255|unique:jenis_pakan,nama_pakan',
            'kandungan_nutrisi' => 'nullable|string',
            'satuan' => 'required|string|max:50',
        ]);

        $jenisPakan = JenisPakan::create($request->all());

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
        $request->validate([
            'nama_pakan' => 'required|string|max:255|unique:jenis_pakan,nama_pakan,' . $jenisPakan->id_pakan . ',id_pakan',
            'kandungan_nutrisi' => 'nullable|string',
            'satuan' => 'required|string|max:50',
        ]);

        $jenisPakan->update($request->all());

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
    public function destroy(JenisPakan $jenisPakan)
    {
        $nama = $jenisPakan->nama_pakan;
        $jenisPakan->delete();

        $this->logActivity('Menghapus jenis pakan: ' . $nama, 'Jenis Pakan');

        return response()->json([
            'status' => 'success',
            'message' => 'Jenis pakan berhasil dihapus'
        ]);
    }
}
