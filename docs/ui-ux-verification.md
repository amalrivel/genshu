# Verifikasi perbaikan UI/UX — 15 Oktober 2026

## Implementasi

Genshu memakai shadcn Base UI dengan token netral, bahasa antarmuka Indonesia,
sidebar desktop, navigasi bawah seluler, dan pilihan tema melalui menu akun.
Aturan desain ada di [DESIGN.md](../DESIGN.md).

Beranda menampilkan draft latihan milik pengguna yang masih tersedia. Daftar
latihan dapat langsung dibuka dari `/activities`; URL kategori lama tetap
berfungsi. Pengerjaan menyediakan navigasi soal, progres jumlah terjawab,
penyimpanan berurutan, coba simpan lagi, tinjauan sebelum kirim, dan hasil server.
Jawaban `false` diperlakukan sebagai jawaban, bukan keadaan kosong.

Pengelolaan dibagi melalui parameter `section`, dengan pencarian dan paginasi
server 20 item. Editor terbuka saat dipilih; editor soal menggunakan pertanyaan
serta pilihan kunci jawaban. Formulir mempertahankan isian ketika gagal,
menampilkan kesalahan field, serta memperingatkan perubahan belum tersimpan.
HTML draft Word dimuat ketika pratinjau dipilih, bukan untuk seluruh daftar.

Tidak ada perubahan kontrak database, migrasi, atau reset. Perubahan lokal yang
sudah ada dipertahankan; dokumen dan konten guru tidak diterjemahkan otomatis.

## Pemeriksaan yang lulus

- `bun run test`: 19 tes, 152 assertions. Termasuk antrean simpan, retry kegagalan,
  kunci `false`, kontrak soal terstruktur, parameter daftar yang tidak valid,
  pesan kesalahan aman, tanggal Asia/Tokyo, konversi DOCX, dan bootstrap tema.
- Tes kontras token tema terang dan gelap: teks utama/sekunder/status minimal
  4,5:1; batas input dan ring fokus minimal 3:1. Ini bukan audit seluruh warna
  hasil komposisi/transparansi di browser.
- `bunx tsc --noEmit`, `bun run lint`, dan `git diff --check` lulus.
- Build produksi Next.js lulus dengan secret acak khusus proses pemeriksaan.
  Secret pengujian tidak ditulis ke `.env` dan tidak mengganti sesi pengguna.
- `graphify update .` memperbarui graf secara AST tanpa panggilan LLM.

## Pemeriksaan browser dan data nyata

Browser lokal pada viewport 390 px memeriksa beranda bertema gelap, pemilihan
  tema terang, serta alur berikut menggunakan akun demo administrator:

1. Publikasi latihan tanpa soal ditolak dengan pesan yang jelas.
2. Editor dapat menambah soal, memilih kunci Salah, dan memindahkan urutan.
3. Menutup perubahan belum tersimpan membuka konfirmasi; kembali ke editor
   mempertahankan isian. Draft kemudian berhasil disimpan dan diterbitkan.
4. Latihan yang diterbitkan muncul langsung pada daftar siswa.
5. Jawaban Salah menaikkan jumlah terjawab dan segera mengubah status simpan.
6. Navigasi ke beranda menampilkan Lanjutkan latihan; jawaban dipulihkan saat
   latihan dibuka kembali. Tinjauan menyebut jumlah soal belum dijawab.
7. Klik ganda Kirim jawaban menghasilkan satu hasil 50/100 dengan satu jawaban
   benar dan satu soal belum dijawab.

Pemeriksaan tambahan menjalankan query dan server action langsung pada database
**lokal**, dengan konteks header request pengujian serta invalidasi cache/redirect
framework yang disimulasikan. Pemeriksaan ini bukan tes HTTP atau pengganti
pemeriksaan visual. Yang diverifikasi:

- Semua delapan bagian pengelolaan mengambil data bagian aktif.
- Jumlah hasil browser yang tersimpan tepat satu; submission bersamaan bersifat
  idempotent. Snapshot dua soal tetap digunakan setelah soal sumber diedit.
- Draft dari latihan yang tidak diterbitkan tidak ditawarkan untuk dilanjutkan.
- Kesalahan urutan waktu ditautkan ke field selesai. DOCX tidak valid ditolak;
  DOCX fixture asli menjadi draft dengan ruby, tabel, dan gambar yang utuh.
- Daftar 21 fixture terbagi 20 + 1 tanpa duplikasi, dan pencarian memperlakukan
  karakter `%`/`_` secara literal.
- Siswa tidak dapat membaca pengelolaan, menyimpan konten, atau mengakses attempt
  milik akun lain. Guru dapat mengelola konten tetapi tidak membaca atau membuat
  akun melalui action administrator.

Seluruh fixture sementara dan sesi login pengujian telah dibersihkan. Materi
Word pengujian tidak diterbitkan untuk mengganti materi pengguna.

## Batas verifikasi dan konfigurasi

Pemeriksaan browser lanjutan dihentikan oleh kebijakan keamanan alat browser.
Matriks visual lengkap 375/390/768/1024/1440 px, zoom 200%, reduced motion,
penelusuran keyboard menyeluruh, login/logout melalui UI terbaru, serta pemilihan
berkas DOCX melalui browser **belum selesai diverifikasi**. Pemeriksaan server
terhadap impor dan hak akses tidak membuktikan interaksi file picker atau
kesesuaian tata letak pada semua perangkat.

Build dengan konfigurasi lokal semula mengeluarkan peringatan Better Auth bahwa
`BETTER_AUTH_SECRET` masih menggunakan nilai bawaan. Konfigurasikan secret kuat
untuk environment produksi sebelum deployment. Pemeriksaan ini tidak mengubah
konfigurasi autentikasi lokal. Tidak ada deployment yang dilakukan.

## Tindak lanjut: lokasi materi dan editor pengelolaan

Daftar Materi sekarang memisahkan Materi terbit dan Draft dengan pencarian serta
paginasi masing-masing. Materi yang diterbitkan tetap dapat ditemukan; kartu
menunjukkan lokasi topik/subjek dan tautan ke halaman Belajar. Materi terbit yang
lokasinya masih draft ditandai dan diarahkan ke pengelolaan topik/subjek.
Pratinjau menjelaskan bagian yang perlu diterbitkan sebelum publikasi materi.

Editor bersama seluruh bagian pengelolaan kini terbuka sebagai Dialog shadcn
layar penuh tanpa mengubah URL, menggantikan kartu editor di dalam daftar.
Daftar, sidebar, dan navigasi seluler tertutup serta tidak dapat dijangkau dengan
pointer atau Tab. Formulir dibatasi 56rem dan memakai satu area gulir dengan
ruang safe area. Escape dan klik luar tidak menutup editor. Tombol kembali
meminta konfirmasi jika isian belum disimpan, mempertahankan isian ketika
dibatalkan, dan dinonaktifkan saat formulir sedang menyimpan. Fokus dikembalikan
ke tombol yang membuka editor ketika ditutup. Pratinjau Word bergulir bersama
editor, tanpa area baca vertikal sempit yang terpisah.

Verifikasi tambahan:

- Browser berhasil mencari dan membuka materi pengguna “Sample” melalui tautan
  Belajar. Pilihan Draft menjelaskan ke mana materi yang sudah terbit berada.
- Editor layar penuh topik diperiksa pada 375, 390, 768, 1024, dan 1440 px tanpa
  overflow horizontal. Tab dari kontrol terakhir dan Shift+Tab dari tombol
  kembali tetap berada dalam editor; tautan Topik di belakang editor tidak
  tersedia pada pohon aksesibilitas. Escape dan batal konfirmasi mempertahankan
  isian; membuang isian pengujian mengembalikan fokus ke tombol Ubah.
- Editor tambah latihan diperiksa di HP pada tema terang dan gelap, termasuk
  penambahan soal dan gulir formulir panjang. Isian uji dibuang tanpa menyimpan
  atau mengubah topik maupun latihan pengguna.
- Tes render memastikan lokasi materi terbit tampil dan tautan siswa tidak
  ditawarkan ketika topiknya belum terbit.
- Integrasi query/action pada database lokal memeriksa impor DOCX, metadata
  tujuan pratinjau, penolakan publikasi yang mempertahankan draft, paginasi draft
  20 + 1, pemindahan draft ke daftar terbit, dan penolakan publikasi ulang draft
  yang sama. Revisi mempertahankan ID materi dan versi lama sampai publikasi.
- Akses langsung materi di bawah topik draft ditolak; siswa tidak dapat membaca
  daftar pengelolaan, pratinjau draft, atau menerbitkannya. Seluruh fixture dan
  sesi pengujian tambahan dibersihkan tanpa mengubah materi pengguna.

Pemeriksaan ini memperbarui cakupan halaman materi dan editor; batas verifikasi
menyeluruh untuk halaman lain yang disebut sebelumnya tetap berlaku.

## Tindak lanjut: CRUD materi

Tambah materi tetap melalui DOCX; materi terbit dan draft sekarang memiliki
Ubah/Hapus. Editor dapat mengubah judul/deskripsi tanpa unggahan, atau mengganti
isi menggunakan Word. Materi terbit menghasilkan draft revisi dan tetap tersedia
sampai revisi diterbitkan. Penyimpanan berikutnya dalam editor yang sama
memperbarui draft revisi tersebut. Perubahan isian membatalkan pratinjau dan
persetujuan sebelumnya agar publikasi selalu memakai hasil yang baru ditinjau.

Penghapusan dibatasi pada satu ID materi atau draft, dengan validasi server serta
akses guru/admin. Dialog menyebut penghapusan permanen dan dampaknya. Topik,
subjek, materi lain, dan draft revisi independen tidak dihapus. Cache semua
halaman Belajar diinvalidasi setelah publikasi/penghapusan materi.

Pemeriksaan tambahan yang lulus:

- Integrasi database lokal: impor DOCX, perubahan metadata yang mempertahankan
  HTML/furigana/tabel/peringatan, edit berulang pada satu ID draft, penggantian
  DOCX, dan publikasi yang mempertahankan identitas materi.
- File tidak valid, judul kosong, sumber tidak ditemukan, dan jenis target hapus
  tidak valid ditolak tanpa mengubah data. Siswa ditolak saat memanggil action
  simpan/hapus; guru dapat menghapus satu draft atau materi tanpa menghapus
  induk, materi saudara, atau draft revisi lain.
- Browser dengan fixture sementara: isian tetap tersedia setelah gagal simpan;
  simpan tanpa file opsional berhasil; dua penyimpanan menghasilkan tepat satu
  revisi dan mempertahankan materi terbit. Perubahan setelah persetujuan menutup
  pratinjau lama dan mewajibkan tinjauan ulang setelah simpan.
- Browser memeriksa batal konfirmasi hapus, tindakan draft, serta editor materi
  pada lebar 375, 390, 768, 1024, dan 1440 px tanpa overflow horizontal.

Seluruh fixture dan sesi pengujian dibersihkan. Penghapusan melalui browser hanya
diperiksa sampai konfirmasi/batal; penghapusan nyata diuji melalui action pada
fixture database lokal. Materi pengguna tidak diubah maupun dihapus.
