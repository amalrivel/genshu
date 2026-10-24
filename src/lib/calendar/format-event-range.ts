export function formatTokyoEventRange(startsAt: string, endsAt: string, locale = "id") {
  const tokyoDate = new Intl.DateTimeFormat(locale, { timeZone: "Asia/Tokyo", dateStyle: "medium" });
  const tokyoTime = new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const startDate = tokyoDate.format(start);
  const endDate = tokyoDate.format(end);
  return {
    sameDay: startDate === endDate,
    startDate,
    endDate,
    startTime: tokyoTime.format(start).replace(".", ":"),
    endTime: tokyoTime.format(end).replace(".", ":"),
  };
}
