<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Peternakan;
use App\Models\JenisTernak;
use App\Models\Ternak;
use App\Models\KondisiTernak;
use App\Models\JenisPakan;
use App\Models\StokPakan;
use App\Models\PemberianPakan;
use App\Models\Peringatan;
use App\Models\TindakanCepat;
use App\Models\RiwayatAktivitas;
use App\Models\Dashboard;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class SmartFarmSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Get farmer user
        $farmer = User::where('email', 'farmer@smartfarm.com')->first();
        if (!$farmer) {
            return;
        }

        // 2. Create Peternakan
        $farm1 = Peternakan::create([
            'id_pengguna' => $farmer->id_pengguna,
            'nama_peternakan' => 'Peternakan Jaya Makmur',
            'alamat' => 'Jl. Kaliurang KM 12',
            'kota' => 'Sleman',
            'provinsi' => 'Yogyakarta',
            'luas_lahan' => 1500.50,
        ]);

        $farm2 = Peternakan::create([
            'id_pengguna' => $farmer->id_pengguna,
            'nama_peternakan' => 'Sinar Ternak Hijau',
            'alamat' => 'Jl. Godean KM 5',
            'kota' => 'Sleman',
            'provinsi' => 'Yogyakarta',
            'luas_lahan' => 850.00,
        ]);

        // 3. Create JenisTernak
        $jenisSapi = JenisTernak::create([
            'nama_jenis' => 'Sapi Limousin',
            'deskripsi' => 'Sapi potong unggulan dengan pertumbuhan daging yang sangat cepat.',
        ]);

        $jenisKambing = JenisTernak::create([
            'nama_jenis' => 'Kambing Etawa',
            'deskripsi' => 'Kambing penghasil susu perah berkualitas tinggi.',
        ]);

        // 4. Create Ternak
        $ternak1 = Ternak::create([
            'id_peternakan' => $farm1->id_peternakan,
            'id_jenis' => $jenisSapi->id_jenis,
            'kode_ternak' => 'SP-001',
            'nama_ternak' => 'Bimo',
            'jenis_kelamin' => 'Jantan',
            'umur' => 24, // months
            'berat' => 450.50,
            'status_kesehatan' => 'Sehat',
            'tanggal_masuk' => '2025-01-15',
            'foto' => null,
        ]);

        $ternak2 = Ternak::create([
            'id_peternakan' => $farm1->id_peternakan,
            'id_jenis' => $jenisSapi->id_jenis,
            'kode_ternak' => 'SP-002',
            'nama_ternak' => 'Sari',
            'jenis_kelamin' => 'Betina',
            'umur' => 18,
            'berat' => 380.00,
            'status_kesehatan' => 'Sakit',
            'tanggal_masuk' => '2025-02-10',
            'foto' => null,
        ]);

        $ternak3 = Ternak::create([
            'id_peternakan' => $farm2->id_peternakan,
            'id_jenis' => $jenisKambing->id_jenis,
            'kode_ternak' => 'KB-001',
            'nama_ternak' => 'Rambo',
            'jenis_kelamin' => 'Jantan',
            'umur' => 12,
            'berat' => 45.20,
            'status_kesehatan' => 'Sehat',
            'tanggal_masuk' => '2025-03-01',
            'foto' => null,
        ]);

        // 5. Create KondisiTernak
        KondisiTernak::create([
            'id_ternak' => $ternak1->id_ternak,
            'suhu_tubuh' => 38.5,
            'berat' => 450.50,
            'nafsu_makan' => 'Baik',
            'kondisi_fisik' => 'Sangat Prima',
            'produksi' => 0.00,
            'catatan' => 'Pertumbuhan berat badan optimal',
        ]);

        KondisiTernak::create([
            'id_ternak' => $ternak2->id_ternak,
            'suhu_tubuh' => 40.2, // Demam
            'berat' => 380.00,
            'nafsu_makan' => 'Menurun',
            'kondisi_fisik' => 'Lemas, hidung kering',
            'produksi' => 0.00,
            'catatan' => 'Terindikasi mengalami gejala kembung/demam.',
        ]);

        // 6. Create JenisPakan
        $pakanKonsentrat = JenisPakan::create([
            'nama_pakan' => 'Konsentrat Sapi Super',
            'kandungan_nutrisi' => 'Protein 16%, Serat Kasar 12%, Lemak 4%',
            'satuan' => 'kg',
        ]);

        $pakanRumput = JenisPakan::create([
            'nama_pakan' => 'Rumput Gajah Segar',
            'kandungan_nutrisi' => 'Serat Kasar 30%, Kadar Air Tinggi',
            'satuan' => 'kg',
        ]);

        // 7. Create StokPakan
        StokPakan::create([
            'id_peternakan' => $farm1->id_peternakan,
            'id_pakan' => $pakanKonsentrat->id_pakan,
            'jumlah' => 500.00,
            'stok_minimum' => 100.00,
        ]);

        StokPakan::create([
            'id_peternakan' => $farm1->id_peternakan,
            'id_pakan' => $pakanRumput->id_pakan,
            'jumlah' => 1200.00,
            'stok_minimum' => 300.00,
        ]);

        StokPakan::create([
            'id_peternakan' => $farm2->id_peternakan,
            'id_pakan' => $pakanKonsentrat->id_pakan,
            'jumlah' => 80.00, // Menipis
            'stok_minimum' => 100.00,
        ]);

        // 8. Create PemberianPakan
        PemberianPakan::create([
            'id_ternak' => $ternak1->id_ternak,
            'id_pakan' => $pakanKonsentrat->id_pakan,
            'jumlah' => 5.50,
            'keterangan' => 'Pemberian pagi hari rutin.',
        ]);

        PemberianPakan::create([
            'id_ternak' => $ternak2->id_ternak,
            'id_pakan' => $pakanRumput->id_pakan,
            'jumlah' => 10.00,
            'keterangan' => 'Nafsu makan berkurang, rumput tersisa.',
        ]);

        // 9. Create Peringatan
        $peringatan = Peringatan::create([
            'id_ternak' => $ternak2->id_ternak,
            'jenis_peringatan' => 'Suhu Tubuh Tinggi',
            'tingkat_peringatan' => 'Tinggi',
            'pesan' => 'Suhu tubuh SP-002 (Sari) terdeteksi mencapai 40.2 derajat celcius.',
            'status' => 'belum_ditangani',
        ]);

        // 10. Create TindakanCepat
        TindakanCepat::create([
            'id_peringatan' => $peringatan->id_peringatan,
            'tindakan' => 'Pemberian obat penurun demam & vitamin',
            'penanggung_jawab' => 'drh. Budi Setiawan',
            'status' => 'Selesai',
            'catatan' => 'Diberikan injeksi antipiretik, pantau suhu dalam 24 jam.',
        ]);

        // 11. Create RiwayatAktivitas
        RiwayatAktivitas::create([
            'id_pengguna' => $farmer->id_pengguna,
            'aktivitas' => 'Menambahkan data ternak baru SP-002',
            'modul' => 'Ternak',
        ]);

        RiwayatAktivitas::create([
            'id_pengguna' => $farmer->id_pengguna,
            'aktivitas' => 'Mencatat kondisi kesehatan harian SP-002',
            'modul' => 'Kondisi Ternak',
        ]);

        // 12. Create Dashboard
        Dashboard::create([
            'id_peternakan' => $farm1->id_peternakan,
            'total_ternak' => 2,
            'ternak_sehat' => 1,
            'ternak_sakit' => 1,
            'jumlah_peringatan' => 1,
            'stok_pakan' => 1700.00, // 500 + 1200
        ]);

        Dashboard::create([
            'id_peternakan' => $farm2->id_peternakan,
            'total_ternak' => 1,
            'ternak_sehat' => 1,
            'ternak_sakit' => 0,
            'jumlah_peringatan' => 0,
            'stok_pakan' => 80.00,
        ]);
    }
}
