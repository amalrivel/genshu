"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HomeError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className="page-stack"><header className="page-header"><h1>Halaman belum dapat dimuat</h1><p>Silakan coba lagi. Data Anda tetap tersimpan.</p></header><Alert variant="destructive"><AlertDescription>Terjadi kendala saat mengambil data. Periksa koneksi Anda atau kembali beberapa saat lagi.</AlertDescription></Alert><div className="flex flex-wrap gap-3"><Button onClick={retry}>Coba lagi</Button><Link href="/" className={buttonVariants({ variant: "outline" })}>Kembali ke beranda</Link></div></section>;
}
