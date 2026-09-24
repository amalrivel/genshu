insert into learning_materials
  (slug, title_ja, title_id, summary_ja, summary_id, level, topic, sections, is_published, published_at, sort_order)
values
  ('aisatsu-basics', 'あいさつの基本', 'Salam dasar dalam bahasa Jepang', 'よく使う日本語のあいさつを学びます。', 'Ungkapan salam yang sering dipakai di kelas, rumah, dan tempat umum.', 'N5', '表現',
   '[
     {"headingJa":"朝と昼のあいさつ","headingId":"Salam pagi dan siang","bodyJa":"朝は「{おはよう|おはよう}ございます」、昼は「こんにちは」と言います。先生や初めて会う人には、ていねいな言い方を使いましょう。","bodyId":"Pagi hari gunakan {おはよう|おはようございます} (selamat pagi), sedangkan siang hari gunakan こんにちは. Gunakan bentuk sopan kepada guru dan orang yang baru ditemui."},
     {"headingJa":"別れるとき","headingId":"Saat berpisah","bodyJa":"その日にまた会う人には「また{後|あと}で」、一日の終わりには「さようなら」と言えます。家に帰るときは「お{先|さき}に{失礼|しつれい}します」もよく使います。","bodyId":"Kepada orang yang akan ditemui lagi hari itu, katakan また後で (sampai nanti). Pada akhir hari gunakan さようなら. Saat pulang lebih dulu, ungkapan sopan お先に失礼します juga sering digunakan."}
   ]'::jsonb, true, '2026-09-01T00:00:00Z', 10),
  ('station-vocabulary', '駅で使うことば', 'Kosakata yang digunakan di stasiun', '駅でホームを探し、電車に乗るための基本語彙です。', 'Kenali kosakata dasar untuk mencari peron dan naik kereta.', 'N5', '語彙',
   '[
     {"headingJa":"駅の場所","headingId":"Tempat di stasiun","bodyJa":"{駅|えき}は電車に乗る場所です。電車を待つ場所は{ホーム|ホーム}、電車が止まる場所は{番線|ばんせん}で案内されます。","bodyId":"駅 (stasiun) adalah tempat untuk naik kereta. Kita menunggu kereta di ホーム (peron), dan lokasi kereta berhenti ditunjukkan dengan 番線 (nomor jalur)."},
     {"headingJa":"切符を買う","headingId":"Membeli tiket","bodyJa":"切符を買うときは、行き先と料金を確認します。{改札|かいさつ}を通る前に切符を用意しておきましょう。","bodyId":"Saat membeli tiket, periksa tujuan dan tarifnya. Siapkan tiket sebelum melewati 改札 (gerbang tiket)."}
   ]'::jsonb, true, '2026-09-02T00:00:00Z', 20),
  ('draft-hidden-example', '非公開教材', 'Contoh materi belum terbit', 'まだ公開されていない教材です。', 'Baris contoh ini harus tetap tersembunyi dari siswa.', 'N5', '文法',
   '[{"headingJa":"下書き","headingId":"Draf","bodyJa":"まだ公開されていません。","bodyId":"Belum diterbitkan."}]'::jsonb, false, null, 999)
on conflict (slug) do update set
  title_ja = excluded.title_ja,
  title_id = excluded.title_id,
  summary_ja = excluded.summary_ja,
  summary_id = excluded.summary_id,
  level = excluded.level,
  topic = excluded.topic,
  sections = excluded.sections,
  is_published = excluded.is_published,
  published_at = excluded.published_at,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into practice_sets (id, title, title_id, description, description_id, target_level, topic, is_published, published_at)
values
  ('station-vocabulary-n5', '駅の基本語彙', 'Kosakata dasar di stasiun', '駅でよく見る言葉の意味を選びましょう。', 'Pilih arti kata yang sering ditemui di stasiun.', 'N5', '語彙', true, '2026-09-03T00:00:00Z'),
  ('greetings-n5', 'あいさつを選ぼう', 'Pilih salam yang tepat', '場面に合ったあいさつを練習します。', 'Latih salam yang sesuai dengan situasi.', 'N5', '文法', true, '2026-09-04T00:00:00Z'),
  ('draft-hidden-practice', '非公開練習', 'Latihan belum terbit', 'この練習は公開されていません。', 'Latihan ini belum diterbitkan.', 'N5', '語彙', false, null)
on conflict (id) do update set
  title = excluded.title,
  title_id = excluded.title_id,
  description = excluded.description,
  description_id = excluded.description_id,
  target_level = excluded.target_level,
  topic = excluded.topic,
  is_published = excluded.is_published,
  published_at = excluded.published_at,
  updated_at = now();

insert into practice_questions
  (id, practice_set_id, position, question_type, prompt, prompt_plain, translation_id, options, correct_answer_index, explanation_ja, explanation_id)
values
  ('station-vocabulary-n5-q1', 'station-vocabulary-n5', 0, 'MULTIPLE_CHOICE', '{駅|えき}で電車を待つ場所はどこですか。', '駅で電車を待つ場所はどこですか。', 'Di mana kita menunggu kereta di stasiun?', '["ホーム", "改札", "切符", "出口"]'::jsonb, 0, '電車を待つ場所は「ホーム」です。', 'Tempat untuk menunggu kereta adalah peron (ホーム).'),
  ('station-vocabulary-n5-q2', 'station-vocabulary-n5', 1, 'MULTIPLE_CHOICE', '電車が出る時間を何で確認しますか。', '電車が出る時間を何で確認しますか。', 'Di mana kita memeriksa waktu keberangkatan kereta?', '["時刻表", "改札", "階段", "切符"]'::jsonb, 0, '「時刻表」で電車の時間を確認できます。', 'Jadwal (時刻表) menunjukkan waktu kereta.'),
  ('greetings-n5-q1', 'greetings-n5', 0, 'MULTIPLE_CHOICE', '朝、先生に会ったとき、何と言いますか。', '朝、先生に会ったとき、何と言いますか。', 'Apa yang diucapkan saat bertemu guru pada pagi hari?', '["おはようございます", "こんばんは", "おやすみなさい", "いただきます"]'::jsonb, 0, '朝のていねいなあいさつは「おはようございます」です。', 'Salam pagi yang sopan adalah おはようございます.'),
  ('greetings-n5-q2', 'greetings-n5', 1, 'MULTIPLE_CHOICE', '昼、人に会ったときのあいさつはどれですか。', '昼、人に会ったときのあいさつはどれですか。', 'Salam apa yang digunakan saat bertemu orang pada siang hari?', '["こんにちは", "おやすみなさい", "おかえりなさい", "ごちそうさま"]'::jsonb, 0, '昼のあいさつは「こんにちは」です。', 'こんにちは adalah salam yang digunakan pada siang hari.'),
  ('draft-hidden-practice-q1', 'draft-hidden-practice', 0, 'MULTIPLE_CHOICE', 'この問題は非公開です。', 'この問題は非公開です。', 'Soal ini belum diterbitkan.', '["A", "B"]'::jsonb, 0, '非公開の説明です。', 'Penjelasan belum diterbitkan.')
on conflict (id) do update set
  practice_set_id = excluded.practice_set_id,
  position = excluded.position,
  question_type = excluded.question_type,
  prompt = excluded.prompt,
  prompt_plain = excluded.prompt_plain,
  translation_id = excluded.translation_id,
  options = excluded.options,
  correct_answer_index = excluded.correct_answer_index,
  explanation_ja = excluded.explanation_ja,
  explanation_id = excluded.explanation_id;
