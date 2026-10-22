import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-5 p-6"><p className="text-sm text-muted-foreground">Genshu · 404</p><h1>Halaman tidak ditemukan</h1><p>Periksa kembali alamat halaman atau mulai dari beranda.</p><div><Link className={buttonVariants()} href="/">Kembali ke beranda</Link></div></main>;
}
