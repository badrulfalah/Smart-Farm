<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PemberianPakan;
use App\Models\Ternak;
use App\Models\StokPakan;
use App\Models\Dashboard;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PemberianPakanController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->hasRole(['Super Admin', 'Admin'])) {
            $pemberian = PemberianPakan::with(['ternak', 'jenisPakan'])->orderBy('id_pemberian', 'desc')->get();
        } else {
            $pemberian = PemberianPakan::whereHas('ternak.peternakan', function ($query) use ($user) {
                $query->where('id_pengguna', $user->id_pengguna);
            })->with(['ternak', 'jenisPakan'])->orderBy('id_pemberian', 'desc')->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $pemberian
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_ternak' => 'required|exists:ternak,id_ternak',
            'id_pakan' => 'required|exists:jenis_pakan,id_pakan',
            'jumlah' => 'required|numeric|min:0.01',
            'keterangan' => 'nullable|string',
        ]);

        $ternak = Ternak::findOrFail($request->id_ternak);
        $farmId = $ternak->id_peternakan;

        // Ownership check
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $ternak->peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        // Deduct feed from inventory stock (stok_pakan) for this farm
        $stok = StokPakan::where('id_peternakan', $farmId)
            ->where('id_pakan', $request->id_pakan)
            ->first();

        if (!$stok || $stok->jumlah < $request->jumlah) {
            return response()->json([
                'status' => 'error',
                'message' => 'Stok pakan tidak mencukupi atau tidak tersedia di peternakan ini. Stok saat ini: ' . ($stok ? $stok->jumlah : 0)
            ], 400);
        }

        // Decrement stock
        $stok->jumlah -= $request->jumlah;
        $stok->save();

        $pemberian = PemberianPakan::create($request->all());

        // Update dashboard
        Dashboard::recalculate($farmId);

        $this->logActivity('Mencatat pemberian pakan untuk ternak: ' . $ternak->kode_ternak . ' sebanyak ' . $request->jumlah . ' ' . $stok->jenisPakan->satuan, 'Pemberian Pakan');

        return response()->json([
            'status' => 'success',
            'message' => 'Pemberian pakan berhasil dicatat',
            'data' => $pemberian
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PemberianPakan $pemberianPakan)
    {
        $ternak = $pemberianPakan->ternak;
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $ternak->peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $pemberianPakan->load(['ternak', 'jenisPakan'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PemberianPakan $pemberianPakan)
    {
        $request->validate([
            'id_ternak' => 'required|exists:ternak,id_ternak',
            'id_pakan' => 'required|exists:jenis_pakan,id_pakan',
            'jumlah' => 'required|numeric|min:0.01',
            'keterangan' => 'nullable|string',
        ]);

        $ternak = Ternak::findOrFail($request->id_ternak);
        $farmId = $ternak->id_peternakan;

        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && ($ternak->peternakan->id_pengguna !== Auth::id() || $pemberianPakan->ternak->peternakan->id_pengguna !== Auth::id())) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        // Adjust stock back (add old amount, subtract new amount)
        $oldFarmId = $pemberianPakan->ternak->id_peternakan;
        
        // Return old amount to old stock
        $oldStok = StokPakan::where('id_peternakan', $oldFarmId)
            ->where('id_pakan', $pemberianPakan->id_pakan)
            ->first();
        if ($oldStok) {
            $oldStok->jumlah += $pemberianPakan->jumlah;
            $oldStok->save();
        }

        // Try to deduct new amount from new stock
        $newStok = StokPakan::where('id_peternakan', $farmId)
            ->where('id_pakan', $request->id_pakan)
            ->first();

        if (!$newStok || $newStok->jumlah < $request->jumlah) {
            // Rollback old stock update
            if ($oldStok) {
                $oldStok->jumlah -= $pemberianPakan->jumlah;
                $oldStok->save();
            }
            return response()->json([
                'status' => 'error',
                'message' => 'Stok pakan tidak mencukupi di peternakan target. Stok saat ini: ' . ($newStok ? $newStok->jumlah : 0)
            ], 400);
        }

        $newStok->jumlah -= $request->jumlah;
        $newStok->save();

        $pemberianPakan->update($request->all());

        // Update dashboard
        Dashboard::recalculate($oldFarmId);
        if ($oldFarmId !== $farmId) {
            Dashboard::recalculate($farmId);
        }

        $this->logActivity('Memperbarui pemberian pakan untuk ternak: ' . $ternak->kode_ternak, 'Pemberian Pakan');

        return response()->json([
            'status' => 'success',
            'message' => 'Pemberian pakan berhasil diperbarui',
            'data' => $pemberianPakan
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PemberianPakan $pemberianPakan)
    {
        $ternak = $pemberianPakan->ternak;
        if (!Auth::user()->hasRole(['Super Admin', 'Admin']) && $ternak->peternakan->id_pengguna !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized Access.'], 403);
        }

        $farmId = $ternak->id_peternakan;
        
        // Return feed back to stock on delete
        $stok = StokPakan::where('id_peternakan', $farmId)
            ->where('id_pakan', $pemberianPakan->id_pakan)
            ->first();
        if ($stok) {
            $stok->jumlah += $pemberianPakan->jumlah;
            $stok->save();
        }

        $kode = $ternak->kode_ternak;
        $pemberianPakan->delete();

        // Update dashboard
        Dashboard::recalculate($farmId);

        $this->logActivity('Menghapus catatan pemberian pakan untuk ternak: ' . $kode, 'Pemberian Pakan');

        return response()->json([
            'status' => 'success',
            'message' => 'Catatan pemberian pakan berhasil dihapus'
        ]);
    }
}
