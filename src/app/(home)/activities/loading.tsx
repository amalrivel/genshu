// NOTE: Loading memberi umpan balik selama konten server diambil; bukan pesan
// kegagalan. role=status mengumumkan status tanpa memindahkan fokus pengguna.

export default function ActivitiesLoading() {
  return <p role="status">Loading activity content...</p>;
}
