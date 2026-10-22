# Pencarian admin dan CRUD akun — 21 Oktober 2026

## Pencarian

Pencarian admin sebelumnya menggunakan form HTML GET biasa. Submit meminta
dokumen HTML baru sehingga shell aplikasi ikut dimuat ulang. Form sekarang
menggunakan `next/form` dengan navigasi client dan `scroll={false}`, mempertahankan
parameter bagian/status dan mereset halaman hasil ke awal. Input memiliki key
berdasarkan query agar nilai mengikuti URL ketika bagian berubah atau pengguna
menelusuri riwayat browser. Tombol menampilkan Cari dan keadaan Mencari saat pending.

## Akun

Bagian Akun sebelumnya menyediakan tambah, daftar, dan reset kata sandi; tombol
Ubah sebenarnya hanya membuka reset kata sandi. Kini akun siswa/guru menyediakan
Ubah akun untuk nama/email/peran, Hapus, dan Ganti kata sandi sebagai tindakan
terpisah. Keterangan halaman menjelaskan perubahan langsung berlaku, tanpa draft.

Hanya administrator dapat memanggil action akun. Akun yang sedang digunakan dan
seluruh akun administrator dilindungi dari perubahan profil/peran dan penghapusan.
Peran target maupun peran baru dibatasi ke siswa/guru. Akun dengan pengerjaan atau
hasil latihan tidak dapat dihapus agar riwayat tetap tersedia.

Perubahan profil dan penghapusan memakai transaksi dengan lock akun target.
Email dinormalisasi dan divalidasi sesuai Better Auth/Zod yang terpasang. Perubahan
email menghapus status verifikasi email; perubahan email/peran mengakhiri semua
sesi target dalam transaksi yang sama. Perubahan nama saja mempertahankan sesi.
Penghapusan akun tanpa riwayat menghapus kredensial serta sesi melalui cascade
database. Kredensial/kata sandi tidak diganti oleh penyimpanan profil.

Endpoint HTTP Better Auth untuk update-user, set-role, dan remove-user
dinonaktifkan melalui `disabledPaths`; pengelolaan tersebut memakai action Genshu
yang memeriksa perlindungan akun dan riwayat secara transaksional. Login dan reset
kata sandi tetap memakai alur yang sudah tersedia.

Review, keputusan, dan pengujian ditangani **GPT-6.1 Sol high**. Tidak ada
perubahan skema, migrasi, atau deployment. Pengujian memakai fixture sementara.

## Verifikasi

- **23 tes / 254 assertions lulus**, termasuk tes antarmuka akun siswa/guru dan
  perlindungan akun administrator.
- Integrasi action asli dan database lokal lulus **68 pemeriksaan**: validasi
  input/email, duplikasi email, izin admin, akun dilindungi, normalisasi email,
  status verifikasi, pencabutan sesi, kredensial yang tetap sama saat edit,
  perlindungan dua jenis riwayat latihan, serta cascade penghapusan akun kosong.
- Uji race insert pengerjaan melawan penghapusan memastikan lock akun menunggu
  transaksi penulis lalu menolak penghapusan; akun, kredensial, sesi, dan riwayat
  tetap tersedia. Fixture integrasi telah dibersihkan dan query sisa pada akun,
  sesi, kredensial, dan pengerjaan mengonfirmasi nol tersisa untuk prefix uji.
- Tiga endpoint HTTP pengelolaan yang dinonaktifkan mengembalikan 404 saat POST.

## Verifikasi lanjutan — 22 Oktober 2026 (JST)

Hasil 68 pemeriksaan integrasi di atas adalah bukti dari sesi sebelumnya, bukan
pengulangan hari ini. Review hari ini menemukan satu masalah pada batas Server
Component: `NativeSelect` diteruskan ke `AdminField` sebagai wrapper yang sudah
dirender, sehingga atribut `name` ditempelkan pada `div`, bukan `select`. Form akun
tidak mengirim peran. Penambahan `"use client"` pada komponen bersama memperbaiki
pengiriman peran dan asosiasi label tanpa mengubah tampilan.

Hasil pada source setelah perbaikan:

- **23 tes / 254 assertions lulus**, `tsc --noEmit`, ESLint, dan
  `git diff --check` lulus.
- Production build **Webpack Next.js 16.3.7 lulus**, termasuk pemeriksaan
  TypeScript dan generasi halaman. `prisma contract emit` berhasil; tidak ada
  migrasi/reset database. Secret build acak hanya berada di environment proses
  anak, tanpa dicetak atau ditulis ke `.env`.
- **16 kelompok pemeriksaan browser/auth lulus** memakai Playwright dan Chrome
  yang sudah terpasang terhadap server development lokal: klik Cari, Enter,
  pagination, back/forward, input mengikuti URL, serta status draft tetap tersimpan.
  Referensi DOM shell yang sama bertahan saat pencarian dan tidak ada request
  navigasi dokumen; tidak memakai asumsi `performance.timeOrigin`.
- Form tambah akun mengirim `role=student`; selector topik pada form subjek juga
  memiliki `name` dan asosiasi label yang benar, tanpa menyimpan konten baru.
  Edit/cancel, konfirmasi buang perubahan, dan error duplikasi email terverifikasi.
- Penyimpanan email lewat action asli berhasil. Login HTTP dengan email baru
  mengembalikan 200 dan ID fixture yang benar; email lama mengembalikan 401 dengan
  kata sandi yang sama. Seluruh kolom kredensial yang diperiksa, termasuk hash
  password, tetap sama.
- Dialog hapus menampilkan identitas/konsekuensi, fokus awal pada Batal, dan Batal
  mempertahankan akun. Tombol Hapus permanen tidak ditekan. Tiga endpoint HTTP
  terlarang diuji ulang dan mengembalikan 404. Tidak ada uncaught page error.
- Seluruh **21 fixture lama** dengan ID persis `qa-search-20261021-1` hingga
  `qa-search-20261021-21` diperiksa judul/deskripsi/status dan ketiadaan subjek,
  kemudian dihapus. Query ulang mengonfirmasi nol tersisa. Fixture akun/topik
  setiap percobaan dibersihkan dalam `finally`; query user/account/session untuk
  ID akun uji mengonfirmasi nol. Sesi login QA administrator demo juga dibersihkan.
- Graph diperbarui dengan `graphify update .`. Semua perubahan kotor sebelumnya
  dipertahankan; tambahan source hari ini hanya batas client `NativeSelect`.

Browser memakai administrator demo yang sudah tersedia. Auto-review menolak
pembuatan administrator sementara karena akan menambah akses berhak tinggi;
pendekatan itu tidak dijalankan. Tab QA sementara mencapai
`/admin?section=accounts&q=` sebelum sign-out sesi QA dan penutupan browser.
Browser production dan penghapusan permanen lewat UI tidak diuji; bukti action
penghapusan/race/cascade tetap berasal dari sesi sebelumnya. Tidak ada commit atau
deployment.
