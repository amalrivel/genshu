
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";

import { getMaterial } from "@/lib/learn/queries";

export default async function Material({
  params,
}: {
  params: Promise<{
    topic: string;
    subject: string;
  }>;
}) {
  const { topic, subject } = await params;

  const material = getMaterial(topic, subject);

  if (!material) {
    notFound();
  }

  return (
    <>
      <section>
        <h1>Topic: {topic}</h1>
        <h2>Subject: {subject}</h2>
      </section>

      {/* NOTE: isi dari materi yang disampaikan ada disini
      rencana awalnya itu menggunakan markdown, tapi saya masih
      kurang tau gimana bagusnya.
      karena terdapat furigana untuk kanji juga
      dan beberapa penyesuaian lainnya juga.
      tapi saya juga kepikiran, kalau admin bisa membuat
      materi atau soal dulu di ms word. lalu export
      ke bentuk tertentu, lalu update ke app ini,
      dan app ini menjadikannya markdown atau bentuk
      yang dapat dibaca oleh website ini.
      */}
      <section className="grid  grid-cols-4 gap-4">
        {/* NOTE: Konten dari materi */}
        <div className="flex flex-col gap-2 col-span-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {/* NOTE: ini aside, mungkin lebih baik membuatnya
        menjadi aside ya. ini berguna sebagai quick move
        menuju header dari konten materi yang ingin dibaca
        mungkin bias h1, h2, h3 dan sejenisnya
        buat juga ini sticky kali ya bagusnya. */}
        <Card className="p-4">
          <p>Chapter</p>
          <ul className="gap-2 flex flex-col">
            <li>
              <Skeleton className="h-4 w-full" />
            </li>
            <li>
              <Skeleton className="h-4 w-full" />
            </li>
            <li>
              <Skeleton className="h-4 w-full" />
            </li>
          </ul>
        </Card>
      </section>
    </>
  );
}
