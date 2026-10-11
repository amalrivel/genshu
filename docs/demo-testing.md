# Data demo untuk mencoba behavior Genshu

Jalankan dari branch `fresh` setelah database lokal dikonfigurasi dan schema
Genshu sudah tersedia:

```sh
bun run db:seed:demo
bun run demo:docx
bun run dev
```

Seed menggunakan `DATABASE_URL` dari `.env`. Ia menolak target remote dan
`NODE_ENV=production`, tidak menjalankan migrasi/reset, dan menambahkan data
beserta credential dalam satu transaksi. Seluruh ID demo memakai prefix `demo-`;
judul konten diberi label `[Demo]` atau `[Demo Draft]`. `db:seed` tetap hanya
mengisi kategori practice, tanpa akun atau konten demo.

## Akun pengujian

Password awal seluruh akun di bawah: **`GenshuDemo!2026`**.

| Email | Role | Behavior yang dapat dilihat |
|---|---|---|
| `admin-demo@genshu.local` | admin | Management konten dan akun; satu hasil practice di Home |
| `teacher-demo@genshu.local` | teacher | Management konten tanpa form pengelolaan akun |
| `student-demo@genshu.local` | student | Draft practice dan hasil 100%, 40%, serta 0%; tidak boleh mengakses Management |
| `new-student-demo@genshu.local` | student | Belum ada attempt/hasil pribadi; coba alur dari awal |

Akun `admin-test` dan data lama tidak diubah. Password demo disimpan dengan hash
Better Auth yang sama dengan login aplikasi. Akun/credential yang sudah ada tidak
direset. Jika email demo dimiliki akun lain dengan ID berbeda, seed membatalkan
transaksi daripada mengambil alih akun tersebut. Password di atas berlaku saat
pertama dibuat; setelah Anda menggantinya, seed tidak mengembalikan password lama.
Password ini khusus demo lokal, bukan untuk deployment publik.

## Tombol akun testing di login

Saat `bun run dev`, halaman `/login` otomatis menampilkan empat tombol akun demo.
Tombol mengisi email/password; tekan **Sign in** untuk login lewat autentikasi
normal. Tombol tidak membuat akun dan tidak melewati pemeriksaan role/session.
Jika password demo telah diubah, masukkan password baru secara manual.

Untuk server dengan `NODE_ENV=production`, tombol tidak tersedia secara default.
Pada deployment demo terisolasi yang sudah memiliki akun demo, set environment
server `GENSHU_ENABLE_DEMO_LOGIN=true` lalu restart/redeploy. Flag ini dibaca di
server; saat nonaktif daftar akun/password tidak dikirim sebagai props ke browser.
Tidak ada toggle melalui Inspect atau parameter URL.

Saat flag aktif, semua pengunjung halaman login dapat memakai akun demo, termasuk
admin. Gunakan hanya database demo tanpa data pribadi. Menonaktifkan flag hanya
menghapus pilihan akun dari halaman; akun yang sudah ada tetap dapat login dengan
credential-nya. Seed tetap menolak target production/remote dan tidak diubah untuk
fitur ini.

## Checklist browser

1. **Home:** login sebagai student-demo. Dua pengumuman published, event yang
   belum selesai, dan tiga hasil pribadi muncul. Login new-student-demo untuk
   melihat keadaan kosong pada Recent practice.
2. **Learn:** buka Bahasa Jepang → Kosakata. Periksa furigana/ruby, format teks,
   daftar, tabel, gambar fixture kecil, link, dan anchor untuk heading berulang.
   Buka Sapaan untuk materi kedua. Topic tanpa materi menguji empty state.
   Topic, subject, dan materi draft tidak seharusnya muncul untuk student.
3. **Practice:** buka Latihan True / False sebagai student-demo → Resume draft.
   Jawaban pertama True dan kedua False sudah tersimpan. Ubah jawaban, tunggu
   status saved, reload, lalu submit. Hasil memiliki benar/salah/belum dijawab.
   Buka hasil lama dari Home dan coba Try again. Latihan baru belum punya attempt
   seed. Latihan draft/latihan kosong hanya tersedia di Management.
4. **Management:** teacher-demo bisa mengelola konten; hanya admin-demo melihat
   form akun. Student-demo yang membuka `/admin` seharusnya kembali ke Home.
   Coba Publish latihan tanpa soal untuk memeriksa penolakan. Periksa perubahan
   published versus draft lewat akun student lain, bukan hanya menu admin.
5. **Word:** gunakan `tests/fixtures/demo-lesson.docx` pada form Import a Word
   lesson. Pilih subject Kosakata atau Sapaan. Periksa preview furigana, tabel,
   gambar dan warnings, centang review, lalu publish. Publikasi mengganti materi
   demo subject tersebut. Draft revisi dengan warning contoh sudah disediakan
   juga untuk mencoba review tanpa upload.
6. **Announcements:** buka pengumuman published sampai detail; draft hanya terlihat
   di Management. Publish draft untuk melihatnya muncul di halaman student/Home.
7. **Recordings:** buka video contoh eksternal; provider mengontrol akses video.
   Video ini bukan rekaman pelajaran Genshu. Draft harus tersembunyi dari student.
8. **Calendar:** waktu ditampilkan dalam Asia/Tokyo. Event mendatang dan yang sedang
   berlangsung muncul; event lampau dan draft tidak masuk daftar upcoming.
9. **Mobile dan logout:** coba lebar 390 px, menu navigasi, lalu logout. Halaman
   terlindungi mengarahkan ke login. Signup publik tetap ditolak.

## Menjalankan ulang dan batas pengujian

Record yang sudah ada dipertahankan, termasuk jawaban, hasil, hash password,
judul, dan status publikasi yang Anda ubah. Data yang hilang dapat ditambahkan
kembali; seed bukan reset. Soal demo lama tidak ditambahkan ke latihan yang telah
diganti soalnya lewat Management. Draft yang dipublikasikan tidak ditambahkan
kembali selama materi masih menggunakan judul revisi demo tersebut.

Waktu event dihitung relatif saat **pertama** dimasukkan. Rerun tidak memajukan
tanggal event lama; ubah tanggal melalui Management bila fixture sudah kedaluwarsa.
Fixture tidak membuat session login dan tidak mengaktifkan exam/assignment/mock exam.

```sh
bun run test
bun run tsc --noEmit
bun run lint
```

Known issues dari review sebelumnya tetap perlu diperbaiki: validasi admin dapat
menghasilkan error halaman, batas upload Server Action belum diselaraskan dengan
10 MiB, dan akses materi/attempt setelah perubahan publikasi perlu diverifikasi.
Seed sengaja tidak memperbaiki atau menyamarkan behavior tersebut.
