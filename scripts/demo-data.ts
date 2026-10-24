import { gradeActivity } from "../src/lib/activities/grading";

export { demoPassword, demoUsers } from "../src/lib/demo-accounts";

export function createDemoData(now = new Date()) {
  const at = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
  const topics = [
    {
      id: "demo-japanese",
      title: "[Demo] Bahasa Jepang",
      description: "Materi contoh untuk menguji navigasi dan furigana; bukan kurikulum resmi.",
      published: true,
    },
    {
      id: "demo-empty-topic",
      title: "[Demo] Topic tanpa materi",
      description: "Buka untuk melihat keadaan kosong pada daftar subject.",
      published: true,
    },
    {
      id: "demo-draft-topic",
      title: "[Demo Draft] Topic tersembunyi",
      description: "Hanya terlihat di Management sebelum dipublikasikan.",
      published: false,
    },
  ];
  const subjects = [
    {
      id: "demo-vocabulary",
      topicId: "demo-japanese",
      title: "[Demo] Kosakata",
      description: "Furigana, heading, daftar, tabel, gambar, dan tautan.",
      published: true,
    },
    {
      id: "demo-greetings",
      topicId: "demo-japanese",
      title: "[Demo] Sapaan",
      description: "Materi kedua untuk mencoba navigasi antar-subject.",
      published: true,
    },
    {
      id: "demo-draft-subject",
      topicId: "demo-japanese",
      title: "[Demo Draft] Subject belum published",
      description: "Contoh subject yang belum tersedia untuk student.",
      published: false,
    },
  ];
  const lesson = `<h1>Materi demo</h1>
    <p>Konten ini untuk menguji aplikasi, bukan bahan ujian resmi.</p>
    <h2>Kosakata dengan furigana</h2>
    <p><ruby>日本語<rt>にほんご</rt></ruby> dan <ruby>学校<rt>がっこう</rt></ruby>.</p>
    <h2>Daftar dan format</h2><ul><li><strong>Teks tebal</strong></li><li><em>Teks miring</em></li></ul>
    <h2>Tabel</h2><table><thead><tr><th>Kata</th><th>Arti</th></tr></thead><tbody><tr><td>学校</td><td>Sekolah</td></tr></tbody></table>
    <h2>Gambar dan tautan</h2><p>Gambar kecil ini hanya fixture pengujian.</p>
    <img alt="Fixture gambar demo" width="32" height="32" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3l0AAAAASUVORK5CYII=" />
    <p><a href="https://example.com">Tautan contoh</a></p>
    <h2>Tabel</h2><p>Heading berulang menguji anchor chapter yang berbeda.</p>`;
  const materials = [
    {
      id: "demo-material-vocabulary",
      subjectId: "demo-vocabulary",
      title: "[Demo] Kosakata dan furigana",
      description: "Periksa ruby, gambar, tabel, chapter, dan tampilan mobile.",
      contentHtml: lesson,
      warnings: [],
      published: true,
    },
    {
      id: "demo-material-greetings",
      subjectId: "demo-greetings",
      title: "[Demo] Sapaan sehari-hari",
      description: "Materi contoh kedua.",
      contentHtml:
        "<h1>Sapaan</h1><h2>Contoh</h2><p>おはようございます。</p><h2>Latihan membaca</h2><p><ruby>先生<rt>せんせい</rt></ruby></p>",
      warnings: [],
      published: true,
    },
    {
      id: "demo-material-hidden",
      subjectId: "demo-draft-subject",
      title: "[Demo Draft] Materi tersembunyi",
      description: "Belum published.",
      contentHtml: "<h1>Materi draft</h1><p>Belum tersedia bagi student.</p>",
      warnings: [],
      published: false,
    },
  ];
  const materialDrafts = [
    {
      id: "demo-material-draft-review",
      subjectId: "demo-vocabulary",
      title: "[Demo Draft] Preview revisi materi",
      description: "Publikasi draft ini mengganti materi kosakata demo yang lama.",
      contentHtml: lesson,
      warnings: [
        "Peringatan contoh: periksa format tabel dan furigana sebelum publikasi. Ini fixture, bukan hasil konversi Word.",
      ],
    },
  ];
  const activities = [
    {
      id: "demo-practice-basics",
      type: "practice",
      title: "[Demo] Latihan True / False",
      description: "Lima soal contoh untuk melihat jawaban benar, salah, dan belum dijawab.",
      published: true,
    },
    {
      id: "demo-practice-new",
      type: "practice",
      title: "[Demo] Latihan baru",
      description:
        "Belum memiliki attempt seed; gunakan untuk mulai, simpan draft, submit, dan retry.",
      published: true,
    },
    {
      id: "demo-practice-draft",
      type: "practice",
      title: "[Demo Draft] Latihan tersembunyi",
      description: "Hanya Management sebelum dipublikasikan.",
      published: false,
    },
    {
      id: "demo-practice-empty",
      type: "practice",
      title: "[Demo Draft] Latihan tanpa soal",
      description: "Coba Publish untuk menguji penolakan latihan kosong.",
      published: false,
    },
  ];
  const questions = [
    {
      id: "demo-question-1",
      activityId: "demo-practice-basics",
      position: 0,
      question: "Untuk demo ini, 1 + 1 = 2.",
      correctAnswer: true,
    },
    {
      id: "demo-question-2",
      activityId: "demo-practice-basics",
      position: 1,
      question: "Untuk demo ini, 2 + 2 = 5.",
      correctAnswer: false,
    },
    {
      id: "demo-question-3",
      activityId: "demo-practice-basics",
      position: 2,
      question: "Kata '学校' pada tabel demo berarti sekolah.",
      correctAnswer: true,
    },
    {
      id: "demo-question-4",
      activityId: "demo-practice-basics",
      position: 3,
      question: "Materi demo ini adalah soal ujian resmi.",
      correctAnswer: false,
    },
    {
      id: "demo-question-5",
      activityId: "demo-practice-basics",
      position: 4,
      question: "Kalimat ini adalah soal nomor lima.",
      correctAnswer: true,
    },
    {
      id: "demo-question-new-1",
      activityId: "demo-practice-new",
      position: 0,
      question: "1 + 2 = 3.",
      correctAnswer: true,
    },
    {
      id: "demo-question-new-2",
      activityId: "demo-practice-new",
      position: 1,
      question: "3 + 3 = 7.",
      correctAnswer: false,
    },
    {
      id: "demo-question-draft-1",
      activityId: "demo-practice-draft",
      position: 0,
      question: "Soal contoh draft.",
      correctAnswer: true,
    },
  ];
  const snapshot = questions.filter((question) => question.activityId === "demo-practice-basics");
  const complete = Object.fromEntries(
    snapshot.map((question) => [question.id, question.correctAnswer]),
  );
  const mixed = {
    "demo-question-1": true,
    "demo-question-2": true,
    "demo-question-3": true,
    "demo-question-4": true,
  };
  const incorrect = Object.fromEntries(
    snapshot.map((question) => [question.id, !question.correctAnswer]),
  );
  const attempts = [
    {
      id: "demo-attempt-draft",
      userId: "demo-user-student",
      status: "in_progress",
      answers: { "demo-question-1": true, "demo-question-2": false },
      result: null,
      submittedAt: null,
      startedAt: at(-2),
      savedAt: at(-1),
    },
    {
      id: "demo-attempt-perfect",
      userId: "demo-user-student",
      status: "submitted",
      answers: complete,
      result: gradeActivity("demo-practice-basics", snapshot, complete),
      submittedAt: at(-24),
      startedAt: at(-25),
      savedAt: at(-24),
    },
    {
      id: "demo-attempt-mixed",
      userId: "demo-user-student",
      status: "submitted",
      answers: mixed,
      result: gradeActivity("demo-practice-basics", snapshot, mixed),
      submittedAt: at(-48),
      startedAt: at(-49),
      savedAt: at(-48),
    },
    {
      id: "demo-attempt-incorrect",
      userId: "demo-user-student",
      status: "submitted",
      answers: incorrect,
      result: gradeActivity("demo-practice-basics", snapshot, incorrect),
      submittedAt: at(-72),
      startedAt: at(-73),
      savedAt: at(-72),
    },
    {
      id: "demo-attempt-admin",
      userId: "demo-user-admin",
      status: "submitted",
      answers: complete,
      result: gradeActivity("demo-practice-basics", snapshot, complete),
      submittedAt: at(-3),
      startedAt: at(-4),
      savedAt: at(-3),
    },
  ].map((attempt) => ({
    ...attempt,
    activityId: "demo-practice-basics",
    questionsSnapshot: snapshot,
  }));
  const announcements = [
    {
      id: "demo-announcement-welcome",
      title: "[Demo] Selamat datang",
      summary: "Data pengujian sudah tersedia untuk menjelajahi Genshu.",
      content:
        "Buka Learn, Practice, Class recordings, dan Calendar. Data ini hanya contoh untuk pengujian.\nGunakan akun student untuk melihat akses siswa.",
      published: true,
      publishedAt: at(-1),
    },
    {
      id: "demo-announcement-study",
      title: "[Demo] Jadwal belajar",
      summary: "Lihat event mendatang di Calendar.",
      content: "Waktu event ditampilkan dalam Asia/Tokyo. Cobalah juga tampilan mobile.",
      published: true,
      publishedAt: at(-24),
    },
    {
      id: "demo-announcement-draft",
      title: "[Demo Draft] Pengumuman tersembunyi",
      summary: "Belum boleh muncul di Home atau halaman student.",
      content: "Contoh draft untuk mencoba publikasi dari Management.",
      published: false,
      publishedAt: null,
    },
  ];
  const recordings = [
    {
      id: "demo-recording-published",
      title: "[Demo] Video contoh",
      description:
        "Video eksternal Big Buck Bunny untuk menguji tautan provider; bukan rekaman pelajaran Genshu.",
      lessonDate: at(-24),
      url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      published: true,
    },
    {
      id: "demo-recording-draft",
      title: "[Demo Draft] Rekaman tersembunyi",
      description: "Fixture tautan; belum tersedia di halaman student.",
      lessonDate: at(-48),
      url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      published: false,
    },
  ];
  // shortcut: event dates stay fixed after first insertion; create fresh fixtures when they expire.
  const events = [
    {
      id: "demo-event-upcoming",
      title: "[Demo] Belajar besok",
      details: "Event mendatang: periksa waktu JST di Home dan Calendar.",
      startsAt: at(24),
      endsAt: at(25),
      published: true,
    },
    {
      id: "demo-event-next-week",
      title: "[Demo] Review pekan depan",
      details: "Event kedua untuk memeriksa urutan agenda.",
      startsAt: at(168),
      endsAt: at(169),
      published: true,
    },
    {
      id: "demo-event-ongoing",
      title: "[Demo] Sesi sedang berlangsung",
      details: "Masih muncul selama waktu selesai belum lewat.",
      startsAt: at(-1),
      endsAt: at(1),
      published: true,
    },
    {
      id: "demo-event-past",
      title: "[Demo] Event lampau",
      details: "Tidak seharusnya masuk daftar upcoming.",
      startsAt: at(-48),
      endsAt: at(-47),
      published: true,
    },
    {
      id: "demo-event-draft",
      title: "[Demo Draft] Event tersembunyi",
      details: "Tidak terlihat untuk student sebelum dipublikasikan.",
      startsAt: at(72),
      endsAt: at(73),
      published: false,
    },
  ];
  return {
    topics,
    subjects,
    materials,
    materialDrafts,
    activities,
    questions,
    attempts,
    announcements,
    recordings,
    events,
  };
}

export function assertDemoDatabase(databaseUrl: string | undefined, nodeEnv: string | undefined) {
  if (!databaseUrl)
    throw new Error("DATABASE_URL is required; configure the local database first.");
  const url = new URL(databaseUrl);
  if (
    nodeEnv === "production" ||
    !["localhost", "127.0.0.1", "[::1]", "db"].includes(url.hostname)
  ) {
    throw new Error(
      "Demo seed is restricted to a local development database and cannot run in production.",
    );
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new Error("A PostgreSQL database is required.");
  return url;
}
