// NOTE: 404 dipakai untuk ID/jenis yang tidak tersedia. Jangan menangkap semua
// kegagalan query lalu memanggil notFound: gangguan database perlu error.tsx.

import Link from "next/link";

export default function ActivityNotFound() {
  return (
    <section className="space-y-4">
      <h1>Activity content not found</h1>
      <p>The requested activity or activity type is not available. Check the URL or choose another activity.</p>
      <Link href="/activities" className="underline">
        Back to Activities
      </Link>
    </section>
  );
}
