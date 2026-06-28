<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ternak;
use App\Models\Peternakan;
use App\Models\Dashboard;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TernakController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Retrieve livestock. Filter by peternakan ownership for ordinary users.
        if ($user->hasRole(['Super Admin', 'Admin'])) {
            $ternak = Ternak::with(['peternakan', 'jenisTernak'])->orderBy('id_ternak', 'desc')->get();
        } else {
            $ternak = Ternak::whereHas('peternakan', function ($query) use ($user) {
                $query->where('id_pengguna', $user->id_pengguna);
            })->with(['peternakan', 'jenisTernak'])->orderBy('id_ternak', 'desc')->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $ternak
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_peternakan' => 'required|exists:peternakan,id_peternakan',
            'id_jenis' => 'required|exists:jenis_ternak,id_jenis',
            'kode_ternak' => 'required|string|max:50|unique:ternak,kode_ternak',
            'nama_ternak' => 'required|string|max:255',
            'jenis_kelamin' => 'required|string|max:10',
            'umur' => 'required|integer|min:0',
            'berat' => 'required|numeric|min:0',
            'status_kesehatan' => 'required|string|max:50',
            'tanggal_masuk' => 'required|date',
            'foto' => 'nullable|string',
        ]);

        // Ownership check
        $peternakan = Peternakan::findOrFail($request->id_peternakan);
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $ternak = Ternak::create($request->all());

        // Update dashboard
        Dashboard::recalculate($ternak->id_peternakan);

        $this->logActivity('Menambahkan ternak baru: ' . $ternak->kode_ternak . ' (' . $ternak->nama_ternak . ')', 'Ternak');

        return response()->json([
            'status' => 'success',
            'message' => 'Ternak berhasil ditambahkan',
            'data' => $ternak
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Ternak $ternak)
    {
        $peternakan = $ternak->peternakan;
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $ternak->load(['peternakan', 'jenisTernak', 'kondisiTernak'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ternak $ternak)
    {
        $request->validate([
            'id_peternakan' => 'required|exists:peternakan,id_peternakan',
            'id_jenis' => 'required|exists:jenis_ternak,id_jenis',
            'kode_ternak' => 'required|string|max:50|unique:ternak,kode_ternak,' . $ternak->id_ternak . ',id_ternak',
            'nama_ternak' => 'required|string|max:255',
            'jenis_kelamin' => 'required|string|max:10',
            'umur' => 'required|integer|min:0',
            'berat' => 'required|numeric|min:0',
            'status_kesehatan' => 'required|string|max:50',
            'tanggal_masuk' => 'required|date',
            'foto' => 'nullable|string',
        ]);

        // Check ownership of existing farm
        $oldFarmId = $ternak->id_peternakan;
        $peternakan = Peternakan::findOrFail($request->id_peternakan);
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && ($peternakan->id_pengguna !== Auth::id() || $ternak->peternakan->id_pengguna !== Auth::id())) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $ternak->update($request->all());

        // Recalculate dashboard for old and new farms
        Dashboard::recalculate($oldFarmId);
        if ($oldFarmId !== $request->id_peternakan) {
            Dashboard::recalculate($request->id_peternakan);
        }

        $this->logActivity('Memperbarui data ternak: ' . $ternak->kode_ternak, 'Ternak');

        return response()->json([
            'status' => 'success',
            'message' => 'Ternak berhasil diperbarui',
            'data' => $ternak
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ternak $ternak)
    {
        $peternakan = $ternak->peternakan;
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $kode = $ternak->kode_ternak;
        $farmId = $ternak->id_peternakan;
        $ternak->delete();

        // Update dashboard
        Dashboard::recalculate($farmId);

        $this->logActivity('Menghapus ternak: ' . $kode, 'Ternak');

        return response()->json([
            'status' => 'success',
            'message' => 'Ternak berhasil dihapus'
        ]);
    }
}
