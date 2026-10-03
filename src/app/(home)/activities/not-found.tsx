import Link from "next/link";

export default function ActivityNotFound() {
  return (
    <section className="space-y-4">
      <h1>Activity not found</h1>
      <p>The requested activity is not available.</p>
      <Link href="/activities" className="underline">
        Back to Activities
      </Link>
    </section>
  );
}
