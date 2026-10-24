import Link from "next/link";

export default function HomeHeader() {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center gap-2.5 rounded-md font-semibold tracking-tight"
    >
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"
      >
        源
      </span>
      <span className="text-lg">Genshu</span>
    </Link>
  );
}
