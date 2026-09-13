import { db } from "../prisma/db.ts";

export const demoTopics = ["[DEMO] Basic Japanese", "[DEMO] Road Words"];
export const demoPracticeSetTitle = "[DEMO] Gentsuki Basic Practice";

export const demoQuestions = [
  [0, "「止まる」はインドネシア語で「berhenti」です。", "Kata Jepang ‘tomaru’ berarti ‘berhenti’.", "とまる", true, "「止まる」は、動きをやめるという意味です。", "‘Tomaru’ berarti berhenti bergerak."],
  [0, "「赤」は日本語で「あお」です。", "‘Aka’ dibaca ‘ao’ dalam bahasa Jepang.", "あか", false, "「赤」は「あか」と読みます。「あお」は青です。", "‘Aka’ berarti merah. ‘Ao’ berarti biru."],
  [0, "「右」は「みぎ」と読みます。", "Kanji ‘kanan’ dibaca ‘migi’.", "みぎ", true, "「右」の読み方は「みぎ」です。", "‘Migi’ adalah cara membaca 右, yaitu kanan."],
  [0, "「左」は「みぎ」と読みます。", "Kanji ‘kiri’ dibaca ‘migi’.", "ひだり", false, "「左」は「ひだり」と読みます。", "右 dibaca ‘migi’, sedangkan 左 dibaca ‘hidari’."],
  [0, "この問題はデモ用です。", "Pertanyaan ini dibuat untuk demo.", null, true, "この問題は、アプリの練習用に作られました。", "Pertanyaan ini dibuat untuk latihan penggunaan aplikasi."],
  [0, "「安全」は「きけん」と同じ意味です。", "‘Anzen’ memiliki arti yang sama dengan ‘kiken’.", "あんぜん", false, "「安全」は safe、「危険」は danger の意味です。", "‘Anzen’ berarti aman, sedangkan ‘kiken’ berarti berbahaya."],
  [1, "「ゆっくり」は「perlahan-lahan」の意味です。", "‘Yukkuri’ berarti ‘perlahan-lahan’.", null, true, "「ゆっくり」は、急がないで行うときの言葉です。", "‘Yukkuri’ digunakan saat melakukan sesuatu dengan pelan."],
  [1, "「見る」は「みる」と読みます。", "Kanji ‘melihat’ dibaca ‘miru’.", "みる", true, "「見る」の読み方は「みる」です。", "‘Miru’ adalah cara membaca 見る, yaitu melihat."],
  [1, "「一」は「に」と読みます。", "Kanji ‘satu’ dibaca ‘ni’.", "いち", false, "「一」は「いち」です。「に」は二です。", "一 dibaca ‘ichi’. 二 dibaca ‘ni’."],
  [1, "「はい」は英語の no と同じ意味です。", "‘Hai’ memiliki arti yang sama dengan ‘no’ dalam bahasa Inggris.", null, false, "「はい」は yes、「いいえ」は no の意味です。", "‘Hai’ berarti ya. ‘Iie’ berarti tidak."],
  [1, "「車」は「くるま」と読みます。", "Kanji ‘mobil’ dibaca ‘kuruma’.", "くるま", true, "「車」の読み方は「くるま」です。", "‘Kuruma’ adalah cara membaca 車, yaitu mobil."],
  [1, "「道路」は「どうろ」と読みます。", "Kanji ‘jalan’ dibaca ‘douro’.", "どうろ", true, "「道路」の読み方は「どうろ」です。", "‘Douro’ adalah cara membaca 道路, yaitu jalan."],
] as const;

export async function seedDemo() {
  const topics = [] as { id: number; title: string }[];
  for (const title of demoTopics) {
    const topic =
      (await db.orm.public.Topic.where({ title }).first()) ??
      (await db.orm.public.Topic.create({ title }));
    topics.push(topic);
  }

  const questions = [] as { id: number }[];
  for (const [topicIndex, japaneseText, indonesianTranslation, furigana, correctAnswer, japaneseExplanation, indonesianExplanation] of demoQuestions) {
    const topicId = topics[topicIndex].id;
    const existing = (await db.orm.public.Question.where({ topicId }).all()).find(
      (question) => question.japaneseText === japaneseText,
    );
    const data = { japaneseText, indonesianTranslation, furigana, correctAnswer, japaneseExplanation, indonesianExplanation, topicId };
    const question = existing
      ? (await db.orm.public.Question.where({ id: existing.id }).update(data))!
      : await db.orm.public.Question.create(data);
    questions.push(question);
  }

  const practiceSet = await db.transaction(async (tx) => {
    const description = "[DEMO] Synthetic development content only. Not authoritative driving instruction.";
    const set =
      (await tx.orm.public.PracticeSet.where({ title: demoPracticeSetTitle }).first()) ??
      (await tx.orm.public.PracticeSet.create({ title: demoPracticeSetTitle, description }));
    if (set.description !== description)
      await tx.orm.public.PracticeSet.where({ id: set.id }).update({ description });
    await tx.execute(
      tx.sql.public.practiceSetQuestion.delete().where((link, fns) => fns.eq(link.practiceSetId, set.id)).build(),
    );
    for (const [position, question] of questions.entries())
      await tx.orm.public.PracticeSetQuestion.create({ practiceSetId: set.id, questionId: question.id, position });
    return set;
  });
  return { topics, questions, practiceSet };
}

if (import.meta.main) {
  const result = await seedDemo();
  console.log(`Demo seeded: ${result.topics.length} topics, ${result.questions.length} questions, Practice Set #${result.practiceSet.id}.`);
  await db.close();
}
