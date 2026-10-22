export function AnnouncementContent({ content }: { content: string }) {
  return <div className="reading-content whitespace-pre-wrap rounded-xl border bg-card px-5 py-6 sm:px-9 sm:py-9">{content}</div>;
}
