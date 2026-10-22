import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function ContentNotFound() {
  return <section className="page-stack"><header className="page-header"><p>404</p><h1>Konten tidak ditemukan</h1><p>Konten ini belum tersedia atau alamatnya sudah berubah.</p></header><div><Link className={buttonVariants({ variant: "outline" })} href="/">Kembali ke beranda</Link></div></section>;
}
