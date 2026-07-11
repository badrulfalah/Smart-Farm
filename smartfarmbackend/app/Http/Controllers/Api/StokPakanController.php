<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StokPakan;
use App\Models\Peternakan;
use App\Models\Dashboard;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StokPakanController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->hasRole(['Super Admin', 'Admin'])) {
            $stok = StokPakan::with(['peternakan', 'jenisPakan'])->orderBy('id_stok', 'desc')->get();
        } else {
            $stok = StokPakan::whereHas('peternakan', function ($query) use ($user) {
                $query->where('id_pengguna', $user->id_pengguna);
            })->with(['peternakan', 'jenisPakan'])->orderBy('id_stok', 'desc')->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $stok
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_peternakan' => 'required|exists:peternakan,id_peternakan',
            'id_pakan' => 'required|exists:jenis_pakan,id_pakan',
            'jumlah' => 'required|numeric|min:0',
            'stok_minimum' => 'required|numeric|min:0',
        ]);

        $peternakan = Peternakan::findOrFail($request->id_peternakan);
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        // Avoid duplicate entry of pakan in the same farm
        $stok = StokPakan::where('id_peternakan', $request->id_peternakan)
            ->where('id_pakan', $request->id_pakan)
            ->first();

        if ($stok) {
            $stok->jumlah += $request->jumlah;
            $stok->stok_minimum = $request->stok_minimum;
            $stok->save();
        } else {
            $stok = StokPakan::create($request->only(['id_peternakan', 'id_pakan', 'jumlah', 'stok_minimum']));
        }

        // Update dashboard
        Dashboard::recalculate($stok->id_peternakan);

        $this->logActivity('Menambahkan stok pakan pada peternakan: ' . $peternakan->nama_peternakan, 'Stok Pakan');

        return response()->json([
            'status' => 'success',
            'message' => 'Stok pakan berhasil ditambahkan',
            'data' => $stok->load('jenisPakan')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(StokPakan $stokPakan)
    {
        $peternakan = $stokPakan->peternakan;
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $stokPakan->load(['peternakan', 'jenisPakan'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, StokPakan $stokPakan)
    {
        $request->validate([
            'id_peternakan' => 'required|exists:peternakan,id_peternakan',
            'id_pakan' => 'required|exists:jenis_pakan,id_pakan',
            'jumlah' => 'required|numeric|min:0',
            'stok_minimum' => 'required|numeric|min:0',
        ]);

        $peternakan = Peternakan::findOrFail($request->id_peternakan);
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && ($peternakan->id_pengguna !== Auth::id() || $stokPakan->peternakan->id_pengguna !== Auth::id())) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $oldFarmId = $stokPakan->id_peternakan;
        $stokPakan->update($request->only(['id_peternakan', 'id_pakan', 'jumlah', 'stok_minimum']));

        // Update dashboard
        Dashboard::recalculate($oldFarmId);
        if ($oldFarmId !== $request->id_peternakan) {
            Dashboard::recalculate($request->id_peternakan);
        }

        $this->logActivity('Memperbarui stok pakan pada peternakan: ' . $peternakan->nama_peternakan, 'Stok Pakan');

        return response()->json([
            'status' => 'success',
            'message' => 'Stok pakan berhasil diperbarui',
            'data' => $stokPakan
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StokPakan $stokPakan)
    {
        $peternakan = $stokPakan->peternakan;
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $farmId = $stokPakan->id_peternakan;
        $stokPakan->delete();

        // Update dashboard
        Dashboard::recalculate($farmId);

        $this->logActivity('Menghapus catatan stok pakan pada peternakan: ' . $peternakan->nama_peternakan, 'Stok Pakan');

        return response()->json([
            'status' => 'success',
            'message' => 'Stok pakan berhasil dihapus'
        ]);
    }
}
