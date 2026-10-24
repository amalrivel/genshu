import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { formatTokyoEventRange } from "@/lib/calendar/format-event-range";

export function EventCard({
  event,
}: {
  event: { title: string; details: string; startsAt: string; endsAt: string; ongoing: boolean };
}) {
  const t = useTranslations("UI");

  const locale = useLocale();
  const range = formatTokyoEventRange(event.startsAt, event.endsAt, locale);
  return (
    <article className="flex flex-col gap-1 py-3">
      <p className="font-semibold tabular-nums">
        {range.sameDay ? (
          <>
            <time dateTime={event.startsAt}>{range.startDate}</time>
            {" · "}
            <time dateTime={event.startsAt}>{range.startTime}</time>
            {"–"}
            <time dateTime={event.endsAt}>{range.endTime}</time>
          </>
        ) : (
          <>
            <time dateTime={event.startsAt}>
              {range.startDate} {range.startTime}
            </time>
            {" – "}
            <time dateTime={event.endsAt}>
              {range.endDate} {range.endTime}
            </time>
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h3 className="break-words font-semibold">{event.title}</h3>
        <Badge variant={event.ongoing ? "success" : "secondary"}>
          {event.ongoing ? t("Berlangsung") : t("Mendatang")}
        </Badge>
      </div>
      <p className="break-words whitespace-pre-wrap text-sm text-muted-foreground">
        {event.details}
      </p>
    </article>
  );
}
