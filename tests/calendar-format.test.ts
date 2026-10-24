import { describe, expect, test } from "bun:test";
import { formatTokyoEventRange } from "../src/lib/calendar/format-event-range";

describe("formatTokyoEventRange", () => {
  test("uses one date for events on the same Tokyo calendar day", () => {
    const range = formatTokyoEventRange("2026-10-10T23:30:00Z", "2026-10-11T01:00:00Z");
    expect(range).toMatchObject({
      sameDay: true,
      startDate: "11 Okt 2026",
      endDate: "11 Okt 2026",
    });
    expect(range.startTime).toContain("08:30");
    expect(range.endTime).toContain("10:00");
  });

  test("shows both dates when an event spans Tokyo calendar days", () => {
    const range = formatTokyoEventRange("2026-10-11T14:30:00Z", "2026-10-11T16:15:00Z");
    expect(range).toMatchObject({
      sameDay: false,
      startDate: "11 Okt 2026",
      endDate: "12 Okt 2026",
    });
    expect(range.startTime).toContain("23:30");
    expect(range.endTime).toContain("01:15");
  });
});
