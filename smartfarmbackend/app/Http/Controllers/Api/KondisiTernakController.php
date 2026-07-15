<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KondisiTernak;
use App\Models\Ternak;
use App\Models\Dashboard;
use App\Models\Peringatan;
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

        $ternak->berat = $request->berat;
        $isAbnormal = false;
        $abnormalReasons = [];
        
        if ($request->suhu_tubuh > 39.5) {
            $isAbnormal = true;
            $abnormalReasons[] = "Suhu tubuh tinggi ({$request->suhu_tubuh}°C)";
        }
        if ($request->nafsu_makan === 'Sangat Kurang') {
            $isAbnormal = true;
            $abnormalReasons[] = "Nafsu makan sangat kurang";
        }
        if (str_contains(strtolower($request->kondisi_fisik), 'sakit')) {
            $isAbnormal = true;
            $abnormalReasons[] = "Kondisi fisik menunjukkan sakit";
        }
        
        if ($isAbnormal) {
            $ternak->status_kesehatan = 'Sakit';
            
            Peringatan::create([
                'id_ternak' => $ternak->id_ternak,
                'jenis_peringatan' => 'Kesehatan Abnormal',
                'tingkat_peringatan' => $request->suhu_tubuh > 40 ? 'Berat' : 'Sedang',
                'pesan' => 'Terdeteksi kondisi abnormal: ' . implode(', ', $abnormalReasons) . '. Segera lakukan pemeriksaan dan tindakan.',
                'status' => 'belum_ditangani',
            ]);
        } else {
            $ternak->status_kesehatan = 'Sehat';
        }
        $ternak->save();

        Dashboard::recalculate($ternak->id_peternakan);

        $this->logActivity('Mencatat kondisi kesehatan baru untuk ternak: ' . $ternak->kode_ternak, 'Kondisi Ternak');

        return response()->json([
            'status' => 'success',
            'message' => 'Kondisi kesehatan ternak berhasil dicatat' . ($isAbnormal ? ' dan peringatan otomatis dibuat.' : '.'),
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

        $ternak->berat = $request->berat;
        $isAbnormal = false;
        $abnormalReasons = [];
        
        if ($request->suhu_tubuh > 39.5) {
            $isAbnormal = true;
            $abnormalReasons[] = "Suhu tubuh tinggi ({$request->suhu_tubuh}°C)";
        }
        if ($request->nafsu_makan === 'Sangat Kurang') {
            $isAbnormal = true;
            $abnormalReasons[] = "Nafsu makan sangat kurang";
        }
        if (str_contains(strtolower($request->kondisi_fisik), 'sakit')) {
            $isAbnormal = true;
            $abnormalReasons[] = "Kondisi fisik menunjukkan sakit";
        }
        
        if ($isAbnormal) {
            $ternak->status_kesehatan = 'Sakit';
            
            Peringatan::create([
                'id_ternak' => $ternak->id_ternak,
                'jenis_peringatan' => 'Kesehatan Abnormal',
                'tingkat_peringatan' => $request->suhu_tubuh > 40 ? 'Berat' : 'Sedang',
                'pesan' => 'Terdeteksi kondisi abnormal: ' . implode(', ', $abnormalReasons) . '. Segera lakukan pemeriksaan dan tindakan.',
                'status' => 'belum_ditangani',
            ]);
        } else {
            $ternak->status_kesehatan = 'Sehat';
        }
        $ternak->save();

        Dashboard::recalculate($ternak->id_peternakan);

        $this->logActivity('Memperbarui kondisi kesehatan ternak: ' . $ternak->kode_ternak, 'Kondisi Ternak');

        return response()->json([
            'status' => 'success',
            'message' => 'Kondisi kesehatan ternak berhasil diperbarui' . ($isAbnormal ? ' dan peringatan otomatis dibuat.' : '.'),
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
