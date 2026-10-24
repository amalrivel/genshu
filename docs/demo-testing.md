# Demo dan pengujian Genshu

Panduan skenario lokal, bukan bukti seluruh alur sudah lulus pada source terbaru.
Setup ada di [README](../README.md); perilaku produk di [PRD](PRD.md), sumber dan
batas teknis di [ARCHITECTURE](ARCHITECTURE.md).

## Menjalankan demo

Setelah environment dan schema database lokal tersedia, jalankan dari root:

```sh
bun run db:seed:demo
bun run demo:docx
bun run dev
```

Seed memakai `DATABASE_URL`, menolak target remote/`NODE_ENV=production`, dan
menambahkan akun serta konten dalam satu transaksi tanpa migrasi/reset. `db:seed`
biasa hanya menambahkan kategori practice. Gunakan database demo tanpa data pribadi;
seed bukan bootstrap administrator atau prosedur pemulihan produksi.

## Akun pengujian

Password awal: **`GenshuDemo!2026`**, khusus fixture lokal.

| Email                           | Role    | Skenario awal                                      |
| ------------------------------- | ------- | -------------------------------------------------- |
| `admin-demo@genshu.local`       | admin   | Kelola konten/akun; satu hasil latihan             |
| `teacher-demo@genshu.local`     | teacher | Kelola konten tanpa pengelolaan akun               |
| `student-demo@genshu.local`     | student | Draft dan hasil 100%, 40%, 0%; pengelolaan ditolak |
| `new-student-demo@genshu.local` | student | Belum punya attempt/hasil                          |

Akun/kredensial yang sudah ada tidak direset; benturan email/ID membatalkan transaksi.
Password yang sudah diganti tidak dikembalikan. Rerun mempertahankan perubahan dan
menambah data yang hilang, tanpa menambahkan soal demo ke latihan yang sudah diedit.
Draft terbit tidak dibuat ulang selama materi masih memakai judul revisi demo.
Tanggal event relatif hanya saat pertama dimasukkan; rerun tidak memajukannya.

Login development menawarkan tombol pengisi kredensial; tekan **Masuk** untuk auth
normal. Di luar development, tombol hanya aktif jika server mengatur
`GENSHU_ENABLE_DEMO_LOGIN=true`. Flag mengirim kredensial demo, termasuk admin, ke
pengunjung login; gunakan hanya deployment demo terisolasi. Menonaktifkannya tidak
menghapus akun atau mencegah login dengan kredensial yang sudah diketahui.

## Checklist browser

Gunakan fixture demo; publikasi/hapus mengubah data. Checklist bukan hasil pengujian.

1. **Home:** periksa pengumuman, event belum berakhir, hasil pribadi dan lanjutkan
   draft; akun new-student menguji hasil kosong.
2. **Learn:** Bahasa Jepang → Kosakata/Sapaan; periksa ruby, format, tabel/gambar,
   link, heading berulang dan empty state. Topik/subjek/materi draft harus tersembunyi.
3. **Practice:** lanjutkan draft dengan pilihan True/False tersimpan, ubah jawaban,
   tunggu status simpan, reload, tinjau dan kirim. Periksa benar/keliru/kosong,
   hasil lama, klik kirim berulang dan attempt baru melalui Ulangi latihan.
4. **Management:** siswa ditolak; guru mengelola konten, admin mengelola akun.
   Periksa pencarian/paginasi/back-forward, validasi, isian gagal simpan, konfirmasi
   buang perubahan, pemisahan draft/terbit dan penolakan publikasi latihan tanpa soal.
5. **Word:** impor fixture kecil `tests/fixtures/demo-lesson.docx`; periksa preview,
   ruby/tabel/gambar/warnings dan review. Publikasi mengganti materi subject tujuan;
   revisi harus mempertahankan materi lama hingga terbit. Uji metadata tanpa file,
   file tidak valid, dan penolakan jika induk belum terbit.
6. **Penghapusan/akun:** gunakan fixture terpisah. Periksa batal, izin, proteksi
   dependensi/riwayat dan pencabutan sesi setelah email/peran/password berubah.
7. **Kabar/jadwal:** detail pengumuman, link rekaman eksternal, event mendatang/
   berlangsung dalam Asia/Tokyo; draft/event lampau tidak masuk agenda.
8. **Interaksi:** keyboard/fokus, mobile, tema, zoom dan reduced motion; logout lalu
   buka halaman terlindungi. Signup publik tetap ditolak.

## Pemeriksaan otomatis dan batas

```sh
bun run test
bunx tsc --noEmit --incremental false
bun run lint
```

Suite menguji helper, fixture, konversi DOCX dan render UI, sering dengan action/
dialog mock; bukan suite integrasi auth/database/browser. Batas upload converter/UI
10 MiB belum selaras dengan request Server Action default 1 MB: fixture kecil tidak
membuktikan upload maksimal. Kebijakan attempt setelah unpublish dan approval review
server masih [belum diputuskan](PRD.md#unresolved-product-decisions).

## Ringkasan verifikasi historis

Diringkas dari laporan sesi 10–23 Oktober 2026 yang telah digabungkan ke dokumen
utama. Ini catatan hasil terdahulu, **tidak dijalankan ulang saat perapian dokumen**.

| Tanggal (JST)             | Cakupan yang dilaporkan                                                                                                                                                                                                                                                      | Batas bukti                                                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 10 Okt                    | Init database uji setelah dry-run 49 operasi aditif; login/logout, penolakan siswa, materi/ruby/tabel, resume/hasil/retry, mobile dan waktu Tokyo dengan server di zona lain.                                                                                                | Tidak reset; file picker DOCX, duplicate HTTP serentak dan pemulihan kegagalan belum tercakup penuh.                                                                           |
| 15 Okt + tindak lanjut    | 19 tes/152 assertions; validasi, antrean simpan, kontras token, tema; integrasi draft/publication/material CRUD, snapshot, submission serentak, pencarian literal dan paginasi 20+1, proteksi role/owner. Editor materi diperiksa 375–1440 px dan fokus dialog.              | Integrasi action memakai header serta cache/redirect simulasi, bukan tes HTTP; bukan audit responsivitas/aksesibilitas seluruh aplikasi. Hapus browser hanya konfirmasi/batal. |
| 21 Okt, latihan           | 21 tes/177 assertions; review tanpa kunci, pilihan false/kosong, fokus/keyboard; klik ganda menghasilkan satu hasil, retry attempt baru; tema gelap 390/768/1440 px.                                                                                                         | Tema terang, zoom 200% dan reduced motion tidak diuji ulang di sesi ini.                                                                                                       |
| 21 Okt, hapus konten      | 22 tes/234 assertions; 51 pemeriksaan action/database untuk enam jenis konten, dependensi, riwayat, cascade soal, role dan race insert anak; dialog/fokus/batal desktop/mobile.                                                                                              | Hapus nyata lewat action fixture, bukan klik hapus permanen di browser.                                                                                                        |
| 21–22 Okt, akun/pencarian | 23 tes/254 assertions; 68 pemeriksaan action/database termasuk normalisasi email, role, sesi, kredensial tetap, cascade/race riwayat; 16 kelompok browser/auth mencakup pencarian, form select, edit/cancel dan login email baru. Tiga endpoint admin terlarang memberi 404. | 68 pemeriksaan berasal dari 21 Okt, bukan diulang semuanya pada 22 Okt; browser production dan klik hapus permanen tidak diuji.                                                |
| 23 Okt, audit             | 23 tes/254 assertions, TypeScript dan ESLint lulus.                                                                                                                                                                                                                          | Metadata database lokal gagal terhubung (`ECONNREFUSED`); browser/build/production tidak diverifikasi pada audit tersebut.                                                     |

Laporan sesi 21–22 Okt mencatat build **Webpack** lulus. Build default Turbopack
pada sesi 21 Okt gagal karena sandbox menolak binding port (`EPERM`); keberhasilan
Webpack tidak membuktikan build default berhasil. Fixture/sesi sementara dilaporkan
dibersihkan; laporan tersebut tidak mencatat deployment produksi. Jangan memakai
hasil historis sebagai bukti source/environment terbaru lulus.

## Verifikasi internationalization, 24 Oktober 2026

Antarmuka Indonesia/Jepang memakai next-intl; pilihan bahasa ada pada login dan
menu akun. Konten database tidak diterjemahkan. Suite otomatis setelah perubahan:
27 tes lulus (1.201 assertions), termasuk kesamaan kunci katalog, render pesan ICU,
validasi locale, feedback admin, serta judul/soal asli yang tetap utuh pada kedua
bahasa. Tes render memakai provider next-intl dan mock dialog/action.

Browser lokal yang sudah berjalan: Indonesia → Jepang berhasil pada Beranda,
pilihan bertahan setelah reload, atribut html.lang menjadi ja, metadata dan tanggal
mengikuti bahasa, dan menu Pengelolaan tampil dalam Jepang. Tidak melakukan
mutasi konten atau database. Login/logout dan seluruh formulir belum diuji ulang.
Pemeriksaan browser berikutnya terputus saat restart koneksi.

TypeScript dan ESLint lulus. Build Webpack di sandbox awalnya gagal membaca
output TypeScript --showConfig; percobaan ulang di luar sandbox selesai dan lulus
sebelum penghentian pengujian tambahan. Tidak ada pemeriksaan lanjutan setelah
permintaan untuk membatasi pengujian. Build Turbopack belum dipastikan.
