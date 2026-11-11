# ISSUE 001: PROJECT FOUNDATION

**Project:** Modern Rhythm Battle  
**Phase:** 1 - Project Foundation  
**Priority:** Critical  
**Status:** To Do

## 1. Objective

Bangun fondasi awal proyek Modern Rhythm Battle menggunakan arsitektur monorepo berbasis Bun Workspaces.

Proyek harus memiliki frontend React, backend ElysiaJS, shared package, dan game-data package yang terpisah dengan struktur yang rapi dan siap dikembangkan untuk game rhythm battle multiplayer berbasis browser.

Fokus pengerjaan adalah memastikan seluruh fondasi berjalan stabil. Jangan membuat gameplay, sistem pertarungan, karakter 3D, ataupun multiplayer pada tahap ini.

## 2. Technology Stack

Gunakan teknologi berikut:

- Runtime dan package manager: Bun.
- Monorepo: Bun Workspaces.
- Frontend: React + Vite + TypeScript.
- Styling: Tailwind CSS lokal.
- Backend: Bun + ElysiaJS.
- Database: MySQL.
- ORM: Drizzle ORM.
- Validation: Zod.
- Version control: Git.

Pastikan seluruh dependency dipasang secara lokal melalui package manager. Jangan menggunakan Tailwind CDN atau dependency yang dimuat dari CDN.

## 3. Project Structure

Buat struktur dasar berikut:

```text
modern-rhythm-battle/
├── apps/
│   ├── web/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── game/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── hooks/
│   │   │   ├── styles/
│   │   │   ├── utils/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── server/
│       ├── src/
│       │   ├── config/
│       │   ├── modules/
│       │   ├── database/
│       │   ├── middleware/
│       │   ├── services/
│       │   ├── utils/
│       │   └── index.ts
│       └── package.json
├── packages/
│   ├── shared/
│   │   ├── src/
│   │   └── package.json
│   └── game-data/
│       ├── characters/
│       ├── songs/
│       ├── charts/
│       └── package.json
├── docs/
├── scripts/
├── tests/
├── .env.example
├── .gitignore
├── package.json
├── bun.lock
└── README.md
```

Folder yang belum digunakan cukup disiapkan sebagai struktur. Jangan membuat implementasi fitur yang belum menjadi bagian dari issue ini.

## 4. Frontend Setup

Siapkan aplikasi React menggunakan Vite dan TypeScript.

Persyaratan:

- Aplikasi dapat dijalankan melalui Bun.
- Tailwind CSS dipasang dan dikonfigurasi secara lokal.
- Pisahkan file CSS utama dari komponen React.
- Buat halaman awal sederhana dengan identitas Modern Rhythm Battle.
- Gunakan tampilan sementara yang bersih dan modern, bukan desain final game.
- Siapkan konfigurasi environment untuk alamat backend.
- Pastikan frontend dapat melakukan request ke backend.

Jangan membuat sistem login, dashboard lengkap, menu game, atau gameplay.

## 5. Backend Setup

Siapkan backend menggunakan Bun dan ElysiaJS.

Buat endpoint:

**GET /api/health**

Contoh respons:

```json
{
  "success": true,
  "message": "Modern Rhythm Battle API is running",
  "service": "server"
}
```

Persyaratan:

- Backend berjalan menggunakan Bun.
- Gunakan konfigurasi environment.
- Pisahkan konfigurasi aplikasi dari entry point.
- Aktifkan CORS untuk alamat frontend lokal.
- Sediakan error handling dasar.
- Pastikan endpoint health dapat diakses dari frontend.

## 6. Shared Package

Siapkan package bersama untuk tipe data dan validasi yang nantinya digunakan frontend dan backend.

Buat contoh:

- API response type.
- Common error type.
- Konfigurasi dasar game.
- Schema validasi menggunakan Zod.

Pastikan package dapat diimpor oleh aplikasi frontend dan backend tanpa masalah resolusi module.

## 7. Database Preparation

Siapkan integrasi MySQL menggunakan Drizzle ORM.

Untuk tahap ini:

- Buat konfigurasi koneksi database.
- Siapkan folder schema dan migration.
- Buat contoh konfigurasi environment.
- Pastikan koneksi database dapat diuji.
- Jangan membuat tabel bisnis atau gameplay terlebih dahulu.

Jangan menaruh kredensial database langsung di source code.

## 8. Root Scripts

Buat script di root project untuk menjalankan:

- Frontend development.
- Backend development.
- Menjalankan frontend dan backend bersama-sama.
- Type checking.
- Build frontend dan backend.

Gunakan Bun Workspaces dan pastikan perintah dapat dijalankan dari root repository.

## 9. Environment Configuration

Buat `.env.example` yang mencakup konfigurasi minimum:

- Frontend API URL.
- Backend port.
- Database host.
- Database port.
- Database name.
- Database username.
- Database password.

Jangan memasukkan password asli.

## 10. Testing & Acceptance Criteria

Issue dinyatakan selesai apabila:

- [ ] Struktur monorepo berhasil dibuat.
- [ ] Bun Workspaces berjalan dengan benar.
- [ ] Frontend React dapat dijalankan secara lokal.
- [ ] Tailwind CSS lokal berfungsi.
- [ ] Backend ElysiaJS dapat dijalankan.
- [ ] Endpoint `/api/health` memberikan respons yang benar.
- [ ] Frontend berhasil berkomunikasi dengan backend.
- [ ] Shared package dapat digunakan oleh frontend dan backend.
- [ ] Konfigurasi Drizzle ORM dan MySQL sudah disiapkan.
- [ ] Environment example tersedia.
- [ ] Type checking berjalan tanpa error.
- [ ] Build berhasil.
- [ ] README berisi petunjuk instalasi dan menjalankan proyek.

## 11. Important Development Rules

1. Jangan mengubah arsitektur utama tanpa alasan teknis yang jelas.
2. Jangan menambahkan fitur di luar cakupan issue.
3. Gunakan TypeScript secara konsisten.
4. Hindari penggunaan `any` kecuali benar-benar diperlukan.
5. Pisahkan tanggung jawab setiap modul.
6. Jangan menyimpan secret di repository.
7. Jangan menggunakan CDN untuk Tailwind CSS.
8. Jangan membuat implementasi palsu yang hanya terlihat berjalan.
9. Pastikan frontend dan backend benar-benar dapat berkomunikasi.
10. Dokumentasikan dependency dan konfigurasi yang diperlukan.

## 12. Final Report

Setelah implementasi selesai, berikan laporan berisi:

- Struktur proyek yang berhasil dibuat.
- Dependency yang dipasang.
- File konfigurasi penting.
- Perintah untuk menjalankan aplikasi.
- Hasil pengujian.
- Kendala yang ditemukan.
- Hal yang belum selesai.

**Definition of Done:** Fondasi Modern Rhythm Battle berjalan secara lokal, frontend dan backend saling terhubung, dan proyek siap memasuki Phase 2: Rhythm Engine.