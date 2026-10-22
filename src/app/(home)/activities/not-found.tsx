// NOTE: 404 dipakai untuk ID/jenis yang tidak tersedia. Jangan menangkap semua
// kegagalan query lalu memanggil notFound: gangguan database perlu error.tsx.

import Link from "next/link";

export default function ActivityNotFound() {
  return (
    <section className="flex flex-col gap-4">
      <h1>Latihan tidak ditemukan</h1>
      <p>Latihan ini tidak tersedia. Periksa alamat atau pilih latihan lainnya.</p>
      <Link href="/activities" className="underline">
        Kembali ke latihan
      </Link>
    </section>
  );
}
