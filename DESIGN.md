# Genshu

Ruang belajar bahasa Jepang untuk remaja dan dewasa. Bahasa antarmuka Indonesia (bawaan) dan Jepang;
judul dan isi materi milik guru tetap sebagaimana ditulis.

- Gunakan shadcn `base-nova`, Base UI, dan Lucide. Komposisikan komponen yang ada.
- Warna netral zinc; seluruh warna memakai token semantik di `globals.css`.
  Warna sukses, peringatan, dan kesalahan selalu disertai label teks.
- Tema terang, gelap, atau sistem. Kontras teks minimum 4,5:1; kontrol 3:1.
- Font sistem dengan fallback Jepang; teks isi 16 px, materi 17 px/1,9,
  lebar baca 68ch. Judul maksimal 36 px; hierarki heading berurutan.
- Ritme jarak 4/8 px. Kontrol utama 44 px; kartu 24 px dengan radius 12 px.
  Hindari gradasi, ilustrasi dekoratif, dan bayangan berlebihan.
- HP: navigasi bawah Beranda/Latihan/Rekaman kelas/Lainnya. Desktop mulai 768 px:
  Sidebar. Sisakan ruang safe area dan fokus yang tidak tertutup elemen tetap.
- Satu tindakan utama per konteks. Tindakan sekunder outline/ghost.
  Setiap tindakan menyediakan fokus, pending, sukses, dan kesalahan yang relevan.
- Formulir memakai FieldGroup/Field/FieldLabel/FieldError. Pertahankan input
  ketika gagal; tandai field invalid dan fokuskan ringkasan kesalahan.
- Pencarian pengelolaan memakai navigasi client Next.js tanpa reload dokumen.
  Pertahankan bagian/status di URL, kembalikan paginasi ke awal saat mencari,
  dan tampilkan tombol Cari dengan keadaan Mencari saat pending.
- Akun siswa/guru menyediakan Ubah akun, Hapus, dan Ganti kata sandi sebagai
  tindakan terpisah. Perubahan akun langsung berlaku, tanpa draft/publikasi.
  Perubahan email/peran mengakhiri sesi akun target. Akun administrator dan akun
  yang sedang digunakan dilindungi dari perubahan profil/peran dan penghapusan;
  akun dengan riwayat latihan tidak dapat dihapus. Jelaskan alasan di antarmuka.
- Formulir pengelolaan terbuka dalam editor layar penuh tanpa mengganti URL.
  Daftar dan navigasi di belakangnya tidak dapat dijangkau selama mengedit.
  Batasi lebar isian ke 56rem; gunakan satu area gulir yang mengikuti safe area.
  Sediakan tombol kembali dan konfirmasi jika isian belum disimpan; Escape atau
  klik di luar tidak menutup editor. Kembalikan fokus dan posisi daftar saat tutup.
- Pengelolaan materi menyediakan pilihan Materi terbit dan Draft. Tampilkan
  lokasi Belajar → Topik → Subjek dan tautan untuk membuka materi yang tersedia.
- Setiap materi dan draft menyediakan Ubah/Hapus. Perubahan judul/deskripsi
  mempertahankan isi; Word pengganti harus ditinjau kembali. Revisi materi terbit
  disimpan sebagai draft sampai dipublikasikan. Hapus memerlukan konfirmasi yang
  menjelaskan dampaknya dan mempertahankan topik, subjek, serta draft lain.
- Topik, subjek, latihan, pengumuman, rekaman, dan jadwal menyediakan Hapus pada
  daftar draft maupun terbit. Konfirmasi menyebut judul, dampak, dan penghapusan
  permanen; fokus awal berada pada Batal. Kegagalan tetap tampil dalam dialog.
- Topik yang masih memiliki subjek dan subjek yang masih memiliki materi/draft
  tidak dapat dihapus. Jelaskan bagian yang perlu dikelola terlebih dahulu.
  Latihan yang sudah memiliki pengerjaan/hasil siswa tidak dapat dihapus agar
  riwayat tetap tersedia; latihan kosong dari pengerjaan dihapus beserta soalnya.
  Menghapus rekaman hanya menghapus tautan Genshu, bukan video eksternal.
- Materi mempertahankan ruby/furigana dan tabel yang bergulir dalam konten.
- Loading memakai Skeleton; koleksi kosong memakai Empty; kegagalan memakai
  Alert dan coba lagi. Jangan menyamarkan kegagalan sebagai koleksi kosong.
- Gerak singkat hanya untuk umpan balik; hormati prefers-reduced-motion.

- Sementara, Belajar dan Jadwal disembunyikan dari navigasi serta Beranda.
  Halaman langsung dan pengelolaan tetap tersedia; data tidak dihapus.

- Menu Pengelolaan sementara hanya menampilkan Latihan, Pengumuman, Rekaman,
  serta Akun untuk admin. Halaman awalnya Latihan; pengelolaan Materi, Topik,
  Subjek, dan Jadwal tetap dapat diakses lewat URL langsung.

- Pilihan bahasa ada pada login dan menu akun, tersimpan di cookie browser.
  Terjemahkan label, status, validasi, metadata dan tanggal tampilan; judul, isi,
  pertanyaan dan jawaban dari database tetap sebagaimana ditulis. URL tetap sama.
