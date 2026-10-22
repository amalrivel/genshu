# Penghapusan konten admin — 21 Oktober 2026

## Perbaikan

Daftar Topik, Subjek, Latihan, Pengumuman, Rekaman, dan Jadwal sebelumnya tidak
menyediakan tombol maupun server action untuk penghapusan. Keenam bagian kini
memiliki Hapus pada konten draft dan terbit, mengikuti pola konfirmasi Materi.

Dialog menyebut judul serta dampaknya, memfokuskan Batal, mencegah klik ganda,
dan menampilkan kegagalan tanpa menutup dialog agar pengguna dapat mencoba lagi.
Daftar dimuat ulang melalui invalidasi server setelah penghapusan berhasil.

## Perlindungan relasi

- Topik hanya dapat dihapus setelah seluruh subjek dihapus atau dipindahkan.
- Subjek hanya dapat dihapus setelah materi dan draftnya dihapus.
- Latihan dengan pengerjaan atau hasil siswa tidak dapat dihapus. Latihan tanpa
  pengerjaan dihapus bersama soal-soalnya; kategori latihan tetap dipertahankan.
- Pengumuman, rekaman, dan kegiatan dihapus berdasarkan satu ID. Penghapusan
  rekaman tidak menghapus video pada layanan eksternal.

Server memeriksa peran guru/admin dan membatasi jenis konten yang diterima.
Penghapusan akun tidak ditambahkan. Topik, subjek, dan latihan dikunci dengan
`SELECT … FOR UPDATE` sebelum memeriksa dependensi dalam transaksi yang sama,
agar insert relasi bersamaan tidak terhapus melalui cascade yang tidak disengaja.
Tidak ada perubahan skema, migrasi, atau deployment.

Review, keputusan, serta pengujian ditangani **GPT-6.1 Sol high**. Pengujian
penghapusan menggunakan fixture sementara, bukan konten pengguna.

## Verifikasi

- TypeScript dan ESLint lulus.
- **22 tes / 234 assertions lulus.** Tes render baru memeriksa tombol Hapus pada
  keenam bagian untuk draft dan konten terbit, serta pesan dampak tiap jenis.
  Isi portal diuji dengan shell dialog mock; interaksi dialog diuji di browser.
- Integrasi server action asli pada database lokal lulus **51 pemeriksaan**:
  penghapusan keenam jenis konten, penolakan dependensi, riwayat `in_progress`
  dan `submitted`, cascade soal latihan, target tidak valid/tidak ditemukan,
  penghapusan berulang, penolakan siswa, akses guru, serta invalidasi halaman.
- Uji konkurensi pada Topik, Subjek, dan Latihan memulai insert anak pada
  transaksi lain. Penghapusan menunggu lock, lalu menolak setelah insert commit;
  induk dan anak tetap tersedia. Seluruh fixture integrasi telah dibersihkan.
- Graf diperbarui dengan `graphify update .` melalui AST tanpa panggilan LLM.
- Build produksi Next.js dengan `--webpack` lulus, termasuk kompilasi TypeScript
  dan 11/11 halaman statis. Secret acak hanya dipakai proses build; `.env` dan
  sesi dev tidak diubah.
- Browser tema gelap pada 1874 × 1034 dan 390 × 844 memeriksa tombol Hapus,
  judul/dampak konfirmasi, fokus awal Batal, siklus Tab/Shift+Tab, serta Batal yang
  mengembalikan fokus ke tombol Hapus tanpa mengubah filter. Data tetap ada
  setelah pembatalan. Dua topik dan satu subjek fixture browser kemudian
  dibersihkan secara terarah; query pembersihan mengonfirmasi nol tersisa.
- Browser dikembalikan ke `/admin?section=topics`, filter fixture dihapus,
  override viewport direset, dan console tidak menunjukkan warning/error.

## Batas pengujian browser

Alat browser memerlukan konfirmasi pengguna pada saat menekan tindakan hapus
permanen. Tombol tersebut tidak ditekan dalam pemeriksaan browser. Keberhasilan
penghapusan nyata diverifikasi melalui pemanggilan server action pada fixture
database lokal; hasil itu tidak menggantikan bukti klik hapus permanen di browser.
Tema terang, reduced motion, dan zoom 200% tidak diperiksa ulang pada perubahan ini.
