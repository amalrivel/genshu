import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { EventCard } from "@/components/calendar/event-card";
import { CollectionEmpty } from "@/components/layouts/collection-empty";

type Announcement = { id: string; title: string; summary: string; publishedAt: string | null };
type Event = { id: string; title: string; details: string; startsAt: string; endsAt: string; ongoing: boolean };
type RecentPractice = { id: string; activityId: string; activityTitle: string; result: unknown; submittedAt: string | null };
type OpenAttempt = { id: string; activityId: string; title: string; savedAt: string };

export function HomeDashboard({ name, announcements, events, recentPractice, openAttempt }: { name: string; announcements: Announcement[]; events: Event[]; recentPractice: RecentPractice[]; openAttempt: OpenAttempt | null }) {
  return <div className="page-stack">
    <header className="page-header"><p>Ruang belajar Anda</p><h1>Halo, {name.split(" ")[0]}.</h1><p>Mari lanjutkan langkah kecil Anda hari ini.</p></header>
    {openAttempt ? <Card><CardHeader><CardDescription><Badge variant="secondary">Latihan tersimpan</Badge></CardDescription><CardTitle><h2>{openAttempt.title}</h2></CardTitle><CardDescription>Jawaban Anda sudah tersimpan. Lanjutkan dari latihan terakhir.</CardDescription></CardHeader><CardContent><Link className={buttonVariants()} href={`/activities/${openAttempt.activityId}?attempt=${encodeURIComponent(openAttempt.id)}`}>Lanjutkan latihan<ArrowRight aria-hidden="true" data-icon="inline-end" /></Link></CardContent></Card> : <Card><CardHeader><CardTitle><h2>Mulai dari satu materi</h2></CardTitle><CardDescription>Pilih topik yang ingin Anda pelajari, lalu coba latihan untuk menguatkan pemahaman.</CardDescription></CardHeader><CardContent><Link className={buttonVariants()} href="/learn">Mulai belajar<ArrowRight aria-hidden="true" data-icon="inline-end" /></Link></CardContent></Card>}
    <div className="grid gap-4 sm:grid-cols-2">
      {[{ href: "/learn", label: "Jelajahi materi", text: "Baca dan pahami, sesuai langkah Anda.", icon: BookOpen }, { href: "/activities", label: "Asah pemahaman", text: "Latihan singkat dengan ulasan jawaban.", icon: ClipboardCheck }].map(({ href, label, text, icon: Icon }) => <Link key={href} href={href} className="group flex min-h-24 items-center gap-4 rounded-xl border bg-card p-5 transition-colors hover:bg-muted"><span className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted"><Icon aria-hidden="true" className="size-5" /></span><span className="min-w-0 flex-1"><span className="block font-semibold">{label}</span><span className="block text-sm text-muted-foreground">{text}</span></span><ChevronRight aria-hidden="true" className="size-4 shrink-0" /></Link>)}
    </div>
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <Card><CardHeader><CardTitle><h2>Jadwal terdekat</h2></CardTitle><CardDescription>Waktu Jepang · Asia/Tokyo (JST)</CardDescription><CardAction><Link href="/calendar" className={buttonVariants({ variant: "ghost", size: "sm" })}>Lihat semua</Link></CardAction></CardHeader><CardContent>{events.length ? <ol className="divide-y">{events.map((event) => <li key={event.id}><EventCard event={event} /></li>)}</ol> : <CollectionEmpty title="Belum ada jadwal" description="Kelas dan kegiatan mendatang akan muncul di sini." />}</CardContent></Card>
      <Card><CardHeader><CardTitle><h2>Kabar kelas</h2></CardTitle><CardDescription>Informasi terbaru dari guru Anda.</CardDescription><CardAction><Link href="/announcements" className={buttonVariants({ variant: "ghost", size: "sm" })}>Lihat semua</Link></CardAction></CardHeader><CardContent>{announcements.length ? <ul className="divide-y">{announcements.map((item) => <li key={item.id}><AnnouncementCard announcement={item} /></li>)}</ul> : <CollectionEmpty title="Belum ada pengumuman" description="Kabar terbaru dari guru akan muncul di sini." />}</CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle><h2>Latihan terakhir</h2></CardTitle><CardDescription>Lihat kembali hasil dan jawaban Anda.</CardDescription></CardHeader><CardContent>
      {recentPractice.length ? <ul className="divide-y">{recentPractice.map((attempt) => {
        const score = attempt.result && typeof attempt.result === "object" && "score" in attempt.result && typeof attempt.result.score === "number" ? attempt.result.score : null;
        return <li key={attempt.id}><Link href={`/activities/${attempt.activityId}?attempt=${encodeURIComponent(attempt.id)}`} className="flex min-h-20 items-center gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-muted"><span className="min-w-0 flex-1"><span className="block break-words font-medium">{attempt.activityTitle}</span>{attempt.submittedAt ? <time dateTime={attempt.submittedAt} className="text-sm text-muted-foreground">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Tokyo" }).format(new Date(attempt.submittedAt))}</time> : null}</span><Badge variant="secondary">{score === null ? "Tersimpan" : `${score}/100`}</Badge><ChevronRight aria-hidden="true" className="size-4 shrink-0" /><span className="sr-only">Lihat hasil</span></Link></li>;
      })}</ul> : <CollectionEmpty title="Belum ada hasil latihan" description="Selesaikan satu latihan untuk melihat hasil Anda di sini." />}
    </CardContent></Card>
  </div>;
}
