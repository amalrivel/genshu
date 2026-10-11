import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ContentPublishControls } from "@/components/admin/content-publish-controls";
import { saveAnnouncement, saveEvent, savePractice, saveRecording, saveSubject, saveTopic } from "@/lib/admin/actions";

function dateOnly(instant: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(instant));
}

function dateTimeLocal(instant: string) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(instant)).replace(" ", "T");
}

export function ContentManager({ content }: { content: Awaited<ReturnType<typeof import("@/lib/admin/queries").getManagementContent>> }) {
  return <div className="space-y-8">
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Topics and subjects</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Topics</CardTitle></CardHeader><CardContent className="space-y-4">
          <form action={saveTopic} className="space-y-3">
            <h3 className="font-medium">Create topic</h3>
            <FieldGroup><Field><FieldLabel htmlFor="new-topic-id">ID</FieldLabel><Input id="new-topic-id" name="id" required placeholder="traffic-signs" /></Field><Field><FieldLabel htmlFor="new-topic-title">Title</FieldLabel><Input id="new-topic-title" name="title" required maxLength={160} /></Field><Field><FieldLabel htmlFor="new-topic-description">Description</FieldLabel><Input id="new-topic-description" name="description" required maxLength={500} /></Field><Button type="submit">Save as draft</Button></FieldGroup>
          </form>
          {content.topics.map((topic) => <form key={topic.id} action={saveTopic} className="space-y-2 border-t pt-3">
            <input type="hidden" name="originalId" value={topic.id} /><input type="hidden" name="id" value={topic.id} />
            <p className="font-medium">{topic.title} — {topic.published ? "Published" : "Draft"}</p>
            <label className="sr-only" htmlFor={`topic-title-${topic.id}`}>Topic title</label><Input id={`topic-title-${topic.id}`} name="title" required defaultValue={topic.title} maxLength={160} />
            <label className="sr-only" htmlFor={`topic-desc-${topic.id}`}>Topic description</label><Input id={`topic-desc-${topic.id}`} name="description" required defaultValue={topic.description} maxLength={500} />
            <Button type="submit" variant="outline" size="sm">Save topic draft</Button>
            {!topic.published ? <ContentPublishControls kind="topic" id={topic.id} title={topic.title} /> : null}
          </form>)}
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Subjects</CardTitle></CardHeader><CardContent className="space-y-4">
          <form action={saveSubject} className="space-y-3">
            <h3 className="font-medium">Create subject</h3>
            <FieldGroup><Field><FieldLabel htmlFor="new-subject-topic">Topic</FieldLabel><select id="new-subject-topic" name="topicId" required className="h-9 rounded-md border bg-background px-3"><option value="">Choose topic</option>{content.topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}</select></Field><Field><FieldLabel htmlFor="new-subject-id">ID</FieldLabel><Input id="new-subject-id" name="id" required placeholder="prohibition-signs" /></Field><Field><FieldLabel htmlFor="new-subject-title">Title</FieldLabel><Input id="new-subject-title" name="title" required maxLength={160} /></Field><Field><FieldLabel htmlFor="new-subject-description">Description</FieldLabel><Input id="new-subject-description" name="description" required maxLength={500} /></Field><Button type="submit">Save as draft</Button></FieldGroup>
          </form>
          {content.subjects.map((subject) => <form key={subject.id} action={saveSubject} className="space-y-2 border-t pt-3">
            <input type="hidden" name="originalId" value={subject.id} /><input type="hidden" name="id" value={subject.id} />
            <p className="font-medium">{subject.topic?.title} / {subject.title} — {subject.published ? "Published" : "Draft"}</p>
            <label className="sr-only" htmlFor={`subject-topic-${subject.id}`}>Topic</label><select id={`subject-topic-${subject.id}`} name="topicId" defaultValue={subject.topicId} className="h-9 w-full rounded-md border bg-background px-3">{content.topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}</select>
            <label className="sr-only" htmlFor={`subject-title-${subject.id}`}>Subject title</label><Input id={`subject-title-${subject.id}`} name="title" required defaultValue={subject.title} maxLength={160} />
            <label className="sr-only" htmlFor={`subject-desc-${subject.id}`}>Subject description</label><Input id={`subject-desc-${subject.id}`} name="description" required defaultValue={subject.description} maxLength={500} />
            <Button type="submit" variant="outline" size="sm">Save subject draft</Button>
            {!subject.published ? <ContentPublishControls kind="subject" id={subject.id} title={subject.title} /> : null}
          </form>)}
        </CardContent></Card>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Practice</h2>
      <Card><CardHeader><CardTitle>Create practice or replace its questions</CardTitle><p className="text-sm text-muted-foreground">One question per line: true|Question text or false|Question text. Existing attempts keep their question snapshots.</p></CardHeader><CardContent>
        <form action={savePractice}><FieldGroup>
          <Field><FieldLabel htmlFor="practice-title">Title</FieldLabel><Input id="practice-title" name="title" required maxLength={160} /></Field>
          <Field><FieldLabel htmlFor="practice-description">Description</FieldLabel><Input id="practice-description" name="description" required maxLength={500} /></Field>
          <Field><FieldLabel htmlFor="practice-questions">Questions and answer key</FieldLabel><textarea id="practice-questions" name="questions" required rows={8} className="rounded-md border bg-background p-3 font-mono text-sm" placeholder={'true|A red light means stop.\nfalse|A blue sign is a warning.'} /></Field>
          <Button type="submit">Save practice draft</Button>
        </FieldGroup></form>
        <div className="mt-5 space-y-5">{content.activities.map((activity) => <form key={activity.id} action={savePractice} className="space-y-2 border-t pt-3">
          <input type="hidden" name="id" value={activity.id} /><p className="font-medium">{activity.title} · {activity.published ? "Published" : "Draft"}</p>
          <label className="sr-only" htmlFor={`practice-title-${activity.id}`}>Practice title</label><Input id={`practice-title-${activity.id}`} name="title" required defaultValue={activity.title} maxLength={160} />
          <label className="sr-only" htmlFor={`practice-description-${activity.id}`}>Practice description</label><Input id={`practice-description-${activity.id}`} name="description" required defaultValue={activity.description} maxLength={500} />
          <label className="sr-only" htmlFor={`practice-questions-${activity.id}`}>Questions and answer key</label><textarea id={`practice-questions-${activity.id}`} name="questions" required rows={6} className="w-full rounded-md border bg-background p-3 font-mono text-sm" defaultValue={activity.questions.map((question) => `${question.correctAnswer ? "true" : "false"}|${question.question}`).join("\n")} />
          <Button type="submit" variant="outline" size="sm">Save practice draft</Button>{!activity.published ? <ContentPublishControls kind="activity" id={activity.id} title={activity.title} /> : null}
        </form>)}</div>
      </CardContent></Card>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Announcements</h2>
      <Card><CardHeader><CardTitle>Create or edit an announcement</CardTitle></CardHeader><CardContent className="space-y-4">
        <form action={saveAnnouncement}><FieldGroup><Field><FieldLabel htmlFor="announcement-title">Title</FieldLabel><Input id="announcement-title" name="title" required maxLength={160} /></Field><Field><FieldLabel htmlFor="announcement-summary">Summary</FieldLabel><Input id="announcement-summary" name="summary" required maxLength={400} /></Field><Field><FieldLabel htmlFor="announcement-content">Full content</FieldLabel><textarea id="announcement-content" name="content" required rows={5} maxLength={20000} className="rounded-md border bg-background p-3" /></Field><Button type="submit">Save as draft</Button></FieldGroup></form>
        <div className="space-y-4">{content.announcements.map((a) => <form key={a.id} action={saveAnnouncement} className="space-y-2 border-t pt-3"><input type="hidden" name="id" value={a.id} /><p className="font-medium">{a.title} · {a.published ? "Published" : "Draft"}</p><label className="sr-only" htmlFor={`announcement-title-${a.id}`}>Announcement title</label><Input id={`announcement-title-${a.id}`} name="title" required defaultValue={a.title} maxLength={160} /><label className="sr-only" htmlFor={`announcement-summary-${a.id}`}>Announcement summary</label><Input id={`announcement-summary-${a.id}`} name="summary" required defaultValue={a.summary} maxLength={400} /><label className="sr-only" htmlFor={`announcement-content-${a.id}`}>Announcement content</label><textarea id={`announcement-content-${a.id}`} name="content" required rows={5} maxLength={20000} className="w-full rounded-md border bg-background p-3" defaultValue={a.content} /><Button type="submit" variant="outline" size="sm">Save as draft</Button>{!a.published ? <ContentPublishControls kind="announcement" id={a.id} title={a.title} /> : null}</form>)}</div>
      </CardContent></Card>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Class recordings</h2>
      <Card><CardHeader><CardTitle>Create or edit a recording link</CardTitle><p className="text-sm text-muted-foreground">Only HTTPS links are accepted. Date is interpreted in Asia/Tokyo.</p></CardHeader><CardContent className="space-y-4">
        <form action={saveRecording}><FieldGroup><Field><FieldLabel htmlFor="recording-title">Title</FieldLabel><Input id="recording-title" name="title" required maxLength={160} /></Field><Field><FieldLabel htmlFor="recording-description">Description</FieldLabel><Input id="recording-description" name="description" required maxLength={1000} /></Field><Field><FieldLabel htmlFor="recording-date">Lesson date (Asia/Tokyo)</FieldLabel><Input id="recording-date" name="lessonDate" type="date" required /></Field><Field><FieldLabel htmlFor="recording-url">HTTPS video URL</FieldLabel><Input id="recording-url" name="url" type="url" required maxLength={2048} placeholder="https://…" /></Field><Button type="submit">Save as draft</Button></FieldGroup></form>
        <div className="space-y-4">{content.recordings.map((r) => <form key={r.id} action={saveRecording} className="space-y-2 border-t pt-3"><input type="hidden" name="id" value={r.id} /><p className="font-medium">{r.title} · {r.published ? "Published" : "Draft"}</p><label className="sr-only" htmlFor={`recording-title-${r.id}`}>Recording title</label><Input id={`recording-title-${r.id}`} name="title" required defaultValue={r.title} maxLength={160} /><label className="sr-only" htmlFor={`recording-description-${r.id}`}>Recording description</label><Input id={`recording-description-${r.id}`} name="description" required defaultValue={r.description} maxLength={1000} /><label className="sr-only" htmlFor={`recording-date-${r.id}`}>Lesson date (Asia/Tokyo)</label><Input id={`recording-date-${r.id}`} name="lessonDate" type="date" required defaultValue={dateOnly(r.lessonDate)} /><label className="sr-only" htmlFor={`recording-url-${r.id}`}>HTTPS video URL</label><Input id={`recording-url-${r.id}`} name="url" type="url" required defaultValue={r.url} maxLength={2048} /><Button type="submit" variant="outline" size="sm">Save as draft</Button>{!r.published ? <ContentPublishControls kind="recording" id={r.id} title={r.title} /> : null}</form>)}</div>
      </CardContent></Card>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Lessons and events</h2>
      <Card><CardHeader><CardTitle>Create or edit an event</CardTitle><p className="text-sm text-muted-foreground">Both date and time fields use Asia/Tokyo.</p></CardHeader><CardContent className="space-y-4">
        <form action={saveEvent}><FieldGroup><Field><FieldLabel htmlFor="event-title">Title</FieldLabel><Input id="event-title" name="title" required maxLength={160} /></Field><Field><FieldLabel htmlFor="event-details">Details</FieldLabel><textarea id="event-details" name="details" required rows={4} maxLength={4000} className="rounded-md border bg-background p-3" /></Field><Field><FieldLabel htmlFor="event-start">Starts (Asia/Tokyo)</FieldLabel><Input id="event-start" name="startsAt" type="datetime-local" required /></Field><Field><FieldLabel htmlFor="event-end">Ends (Asia/Tokyo)</FieldLabel><Input id="event-end" name="endsAt" type="datetime-local" required /></Field><Button type="submit">Save as draft</Button></FieldGroup></form>
        <div className="space-y-4">{content.events.map((e) => <form key={e.id} action={saveEvent} className="space-y-2 border-t pt-3"><input type="hidden" name="id" value={e.id} /><p className="font-medium">{e.title} · {e.published ? "Published" : "Draft"}</p><label className="sr-only" htmlFor={`event-title-${e.id}`}>Event title</label><Input id={`event-title-${e.id}`} name="title" required defaultValue={e.title} maxLength={160} /><label className="sr-only" htmlFor={`event-details-${e.id}`}>Event details</label><textarea id={`event-details-${e.id}`} name="details" required rows={4} maxLength={4000} className="w-full rounded-md border bg-background p-3" defaultValue={e.details} /><label className="sr-only" htmlFor={`event-start-${e.id}`}>Starts (Asia/Tokyo)</label><Input id={`event-start-${e.id}`} name="startsAt" type="datetime-local" required defaultValue={dateTimeLocal(e.startsAt)} /><label className="sr-only" htmlFor={`event-end-${e.id}`}>Ends (Asia/Tokyo)</label><Input id={`event-end-${e.id}`} name="endsAt" type="datetime-local" required defaultValue={dateTimeLocal(e.endsAt)} /><Button type="submit" variant="outline" size="sm">Save as draft</Button>{!e.published ? <ContentPublishControls kind="event" id={e.id} title={e.title} /> : null}</form>)}</div>
      </CardContent></Card>
    </section>
  </div>;
}
