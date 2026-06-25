<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class PublicController extends Controller
{
    /**
     * Provide public-facing Smart Farm overview data.
     */
    public function overview()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'metrics' => [
                    [
                        'label' => 'Soil Moisture',
                        'value' => 64,
                        'unit' => '%',
                        'status' => 'Ideal',
                    ],
                    [
                        'label' => 'Temperature',
                        'value' => 27,
                        'unit' => 'C',
                        'status' => 'Stable',
                    ],
                    [
                        'label' => 'Humidity',
                        'value' => 82,
                        'unit' => '%',
                        'status' => 'Healthy',
                    ],
                    [
                        'label' => 'Irrigation',
                        'value' => 18,
                        'unit' => 'min',
                        'status' => 'Scheduled',
                    ],
                ],
                'features' => [
                    [
                        'title' => 'Realtime Monitoring',
                        'description' => 'Pantau kelembapan tanah, suhu, dan kondisi lahan dari satu dashboard yang mudah dibaca.',
                    ],
                    [
                        'title' => 'Smart Irrigation',
                        'description' => 'Bantu pengambilan keputusan penyiraman berdasarkan kondisi sensor dan kebutuhan tanaman.',
                    ],
                    [
                        'title' => 'Operational Insights',
                        'description' => 'Ringkas data kebun menjadi status praktis untuk petani, operator, dan admin.',
                    ],
                ],
                'telemetry' => [
                    ['time' => '06:00', 'soil_moisture' => 68, 'temperature' => 24],
                    ['time' => '09:00', 'soil_moisture' => 63, 'temperature' => 27],
                    ['time' => '12:00', 'soil_moisture' => 56, 'temperature' => 31],
                    ['time' => '15:00', 'soil_moisture' => 59, 'temperature' => 29],
                    ['time' => '18:00', 'soil_moisture' => 65, 'temperature' => 26],
                ],
            ],
        ]);
    }
}
