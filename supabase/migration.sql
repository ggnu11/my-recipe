-- =============================================
-- MY RECIPE - Database Schema & Seed Data
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT '#c8a96e',
  bg_color TEXT NOT NULL DEFAULT '#ffffff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ja TEXT,
  subtitle TEXT,
  subtitle_ja TEXT,
  description TEXT,
  description_ja TEXT,
  thumbnail_url TEXT,
  youtube_video_id TEXT,
  youtube_start_sec INT NOT NULL DEFAULT 0,
  difficulty TEXT,
  difficulty_ja TEXT,
  cook_time_min INT,
  emoji TEXT,
  tags TEXT[] DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ja TEXT,
  amount TEXT,
  amount_ja TEXT,
  emoji TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

-- 4. Steps
CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  title TEXT NOT NULL,
  title_ja TEXT,
  description TEXT NOT NULL,
  description_ja TEXT,
  tip TEXT,
  tip_ja TEXT,
  tip_items TEXT[] DEFAULT '{}'
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe ON ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_steps_recipe ON steps(recipe_id);

-- 6. RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read recipes" ON recipes FOR SELECT USING (published = true);
CREATE POLICY "Public read ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Public read steps" ON steps FOR SELECT USING (true);

-- Admin write access (authenticated users)
CREATE POLICY "Admin insert categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update categories" ON categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete categories" ON categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert recipes" ON recipes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update recipes" ON recipes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete recipes" ON recipes FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admin read all recipes" ON recipes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin insert ingredients" ON ingredients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update ingredients" ON ingredients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete ingredients" ON ingredients FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert steps" ON steps FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update steps" ON steps FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete steps" ON steps FOR DELETE TO authenticated USING (true);

-- =============================================
-- SEED DATA
-- =============================================

-- Categories
INSERT INTO categories (id, name, slug, color, bg_color) VALUES
  ('cat-korean', 'Korean', 'korean', '#d4a574', '#fef3e2'),
  ('cat-chinese', 'Chinese', 'chinese', '#e07070', '#fde8e8'),
  ('cat-western', 'Western', 'western', '#70c4b8', '#e8f5f3')
ON CONFLICT (id) DO NOTHING;

-- Recipes
INSERT INTO recipes (id, category_id, name, name_ja, subtitle, subtitle_ja, description, description_ja, thumbnail_url, youtube_video_id, youtube_start_sec, difficulty, difficulty_ja, cook_time_min, emoji, tags, sort_order, published) VALUES
  ('r1', 'cat-korean', '김치찌개', 'キムチチゲ', '깊은 맛의 김치찌개', '深い味わいのキムチチゲ', '잘 익은 김치와 돼지고기, 두부가 어우러진 한국의 대표 찌개 요리입니다.', 'よく漬かったキムチと豚肉、豆腐が調和した韓国の代表的なチゲ料理です。', NULL, 'T8SfZMAfEOo', 0, '쉬움', '簡単', 30, '🍲', ARRAY['찌개','매운맛','집밥'], 0, true),
  ('r2', 'cat-korean', '불고기', 'プルコギ', '달콤한 양념 소고기', '甘い味付けの牛肉', '얇게 썬 소고기를 달콤한 간장 양념에 재워 구운 한국 BBQ의 정수입니다.', '薄切り牛肉を甘い醤油ダレに漬けて焼いた韓国BBQの真髄です。', NULL, NULL, 0, '보통', '普通', 40, '🥩', ARRAY['구이','소고기'], 1, true),
  ('r3', 'cat-korean', '잡채', 'チャプチェ', '당면 잡채', '春雨チャプチェ', '당면과 각종 채소, 소고기를 간장과 참기름으로 볶아낸 명절 대표 요리입니다.', '春雨と各種野菜、牛肉を醤油とごま油で炒めた韓国の祝日料理です。', NULL, NULL, 0, '보통', '普通', 35, '🍜', ARRAY['면','명절'], 2, true),
  ('r4', 'cat-korean', '떡볶이', 'トッポッキ', '매콤달콤 떡볶이', '甘辛トッポッキ', '쫄깃한 떡을 매콤달콤한 고추장 소스에 볶아낸 인기 길거리 음식입니다.', 'もちもちの餅を甘辛いコチュジャンソースで炒めた人気の屋台料理です。', NULL, NULL, 0, '쉬움', '簡単', 20, '🌶️', ARRAY['분식','매운맛'], 3, true),
  ('r12', 'cat-korean', '된장찌개', 'テンジャンチゲ', '구수한 된장찌개', '香ばしい味噌チゲ', '된장과 두부, 호박, 감자를 넣고 끓인 구수하고 깊은 맛의 찌개입니다.', '味噌と豆腐、かぼちゃ、じゃがいもを入れて煮込んだ香ばしく深い味わいのチゲです。', NULL, NULL, 0, '쉬움', '簡単', 25, '🫕', ARRAY['찌개','집밥'], 4, true),
  ('r13', 'cat-korean', '비빔밥', 'ビビンバ', '전주 비빔밥', '全州ビビンバ', '각종 나물과 고추장, 계란을 올린 밥 위에 쓱쓱 비벼 먹는 대표 한식입니다.', '各種ナムルとコチュジャン、卵をのせたご飯をよく混ぜて食べる代表的な韓国料理です。', NULL, NULL, 0, '보통', '普通', 45, '🍚', ARRAY['밥','나물'], 5, true),
  ('r5', 'cat-chinese', '마파두부', '麻婆豆腐', '사천식 매운 두부', '四川風辛い豆腐', '부드러운 두부를 매콤한 사천식 고추기름 소스에 볶아낸 요리입니다.', '柔らかい豆腐を辛い四川風ラー油ソースで炒めた料理です。', NULL, NULL, 0, '보통', '普通', 25, '🧆', ARRAY['사천','매운맛','두부'], 0, true),
  ('r6', 'cat-chinese', '궁보계정', '宮保鶏丁', '매콤한 닭고기 볶음', '辛い鶏肉炒め', '땅콩과 고추, 사천 후추와 함께 볶은 닭고기 요리입니다.', 'ピーナッツと唐辛子、山椒と一緒に炒めた鶏肉料理です。', NULL, NULL, 0, '보통', '普通', 30, '🍗', ARRAY['닭고기','볶음'], 1, true),
  ('r7', 'cat-chinese', '샤오롱바오', '小籠包', '상하이 소롱포', '上海小籠包', '얇은 피 안에 육즙 가득한 돼지고기와 진한 육수가 들어간 만두입니다.', '薄い皮の中に肉汁たっぷりの豚肉と濃厚なスープが入った点心です。', NULL, NULL, 0, '어려움', '難しい', 90, '🥟', ARRAY['만두','찜'], 2, true),
  ('r8', 'cat-western', '까르보나라', 'カルボナーラ', '로마식 파스타', 'ローマ風パスタ', '관찰레, 달걀노른자, 페코리노 치즈, 후추로 만든 클래식 로마 파스타입니다.', 'グアンチャーレ、卵黄、ペコリーノチーズ、胡椒で作るクラシックなローマパスタです。', NULL, NULL, 0, '보통', '普通', 25, '🍝', ARRAY['파스타','이탈리안'], 0, true),
  ('r9', 'cat-western', '뵈프 부르기뇽', 'ブフ・ブルギニョン', '프랑스식 소고기 스튜', 'フランス風牛肉シチュー', '레드와인에 천천히 끓인 소고기와 버섯, 양파, 당근의 프랑스 대표 스튜입니다.', '赤ワインでじっくり煮込んだ牛肉とキノコ、玉ねぎ、人参のフランス代表シチューです。', NULL, NULL, 0, '어려움', '難しい', 180, '🥘', ARRAY['프랑스','스튜'], 1, true),
  ('r10', 'cat-western', '리조또', 'リゾット', '버섯 리조또', 'キノコリゾット', '포르치니 버섯과 파르메산, 화이트와인으로 만든 크리미한 이탈리안 쌀 요리입니다.', 'ポルチーニ茸とパルメザン、白ワインで作るクリーミーなイタリアン米料理です。', NULL, NULL, 0, '보통', '普通', 40, '🍚', ARRAY['이탈리안','쌀'], 2, true),
  ('r11', 'cat-western', '피쉬 앤 칩스', 'フィッシュ＆チップス', '영국식 생선튀김', '英国風魚のフライ', '맥주 반죽 대구튀김과 두툼한 감자튀김, 타르타르 소스를 곁들인 영국 대표 요리입니다.', 'ビール衣のタラフライと厚切りフライドポテト、タルタルソースを添えたイギリスの代表料理です。', NULL, NULL, 0, '쉬움', '簡単', 35, '🐟', ARRAY['영국','튀김'], 3, true)
ON CONFLICT (id) DO NOTHING;

-- Ingredients
INSERT INTO ingredients (id, recipe_id, name, name_ja, amount, amount_ja, emoji, sort_order) VALUES
  -- 김치찌개
  ('i1', 'r1', '묵은지', '熟成キムチ', '2컵', '2カップ', '🥬', 0),
  ('i2', 'r1', '삼겹살', '豚バラ肉', '200g', '200g', '🥩', 1),
  ('i3', 'r1', '두부', '豆腐', '1모', '1丁', '🧈', 2),
  ('i4', 'r1', '고춧가루', '粉唐辛子', '1큰술', '大さじ1', '🌶️', 3),
  ('i5', 'r1', '대파', '長ネギ', '2대', '2本', '🧅', 4),
  -- 불고기
  ('i6', 'r2', '소고기 등심', '牛ロース', '500g', '500g', '🥩', 0),
  ('i7', 'r2', '간장', '醤油', '4큰술', '大さじ4', '🫗', 1),
  ('i8', 'r2', '배', '梨', '1/2개', '1/2個', '🍐', 2),
  ('i9', 'r2', '마늘', 'ニンニク', '4쪽', '4片', '🧄', 3),
  ('i10', 'r2', '참기름', 'ごま油', '2큰술', '大さじ2', '🫒', 4),
  -- 까르보나라
  ('i11', 'r8', '스파게티면', 'スパゲッティ', '400g', '400g', '🍝', 0),
  ('i12', 'r8', '관찰레', 'グアンチャーレ', '150g', '150g', '🥓', 1),
  ('i13', 'r8', '달걀노른자', '卵黄', '4개', '4個', '🥚', 2),
  ('i14', 'r8', '페코리노', 'ペコリーノ', '100g', '100g', '🧀', 3),
  ('i15', 'r8', '후추', '黒胡椒', '적당량', '適量', '🫙', 4)
ON CONFLICT (id) DO NOTHING;

-- Steps
INSERT INTO steps (id, recipe_id, step_number, title, title_ja, description, description_ja, tip, tip_ja, tip_items) VALUES
  -- 김치찌개
  ('s1', 'r1', 1, '돼지고기와 김치 볶기', '豚肉とキムチを炒める', '삼겹살을 한입 크기로 썰어 냄비에 넣고 기름이 나올 때까지 볶습니다. 송송 썬 묵은지를 넣고 3-4분 볶아줍니다.', '豚バラ肉を一口大に切って鍋に入れ、脂が出るまで炒めます。刻んだ熟成キムチを入れて3〜4分炒めます。', '최소 2주 이상 숙성된 묵은지를 사용하면 더 깊은 맛이 납니다.', '2週間以上熟成させたキムチを使うとより深い味になります。', ARRAY['신 김치가 가장 맛있어요','김치 국물은 나중에 넣을 거예요']),
  ('s2', 'r1', 2, '육수 넣고 끓이기', '出汁を入れて煮込む', '물 3컵 또는 멸치 육수를 붓고 고춧가루와 김치 국물을 넣습니다. 끓어오르면 중불로 줄여 15분간 끓입니다.', '水3カップまたは煮干し出汁を注ぎ、粉唐辛子とキムチの汁を入れます。沸騰したら中火にして15分間煮込みます。', NULL, NULL, '{}'),
  ('s3', 'r1', 3, '두부 넣고 마무리', '豆腐を入れて仕上げ', '두부를 두툼하게 썰어 냄비에 넣고 5분 더 끓입니다. 송송 썬 대파를 올려 밥과 함께 뜨겁게 냅니다.', '豆腐を厚めに切って鍋に入れ、さらに5分煮込みます。刻んだ長ネギをのせてご飯と一緒に熱々で召し上がれ。', '두부를 넣은 후에는 너무 많이 젓지 마세요. 부서질 수 있습니다.', '豆腐を入れた後はかき混ぜすぎないでください。崩れることがあります。', '{}'),
  -- 까르보나라
  ('s4', 'r8', 1, '소스 준비하기', 'ソースを準備する', '달걀노른자에 곱게 간 페코리노 치즈와 후추를 넉넉히 넣고 잘 섞어 둡니다.', '卵黄に細かくすりおろしたペコリーノチーズと胡椒をたっぷり入れてよく混ぜておきます。', '실온의 달걀을 사용하면 더 부드럽게 섞입니다.', '常温の卵を使うとより滑らかに混ざります。', ARRAY['노른자만 사용하면 더 진해요','치즈를 곱게 갈아야 잘 녹아요']),
  ('s5', 'r8', 2, '관찰레 굽기', 'グアンチャーレを焼く', '관찰레를 잘게 썰어 찬 팬에 올리고 중불에서 기름이 천천히 나오도록 바삭하게 구워줍니다.', 'グアンチャーレを細かく切り、冷たいフライパンに置いて中火でゆっくり脂を出しながらカリカリに焼きます。', NULL, NULL, '{}'),
  ('s6', 'r8', 3, '합치고 완성하기', '合わせて完成', '스파게티를 알덴테로 삶고 면수 1컵을 남겨둡니다. 불을 끈 상태에서 뜨거운 면에 관찰레를 넣고, 소스를 빠르게 섞어줍니다. 면수로 농도를 조절합니다.', 'スパゲッティをアルデンテに茹で、茹で汁1カップを残します。火を止めた状態で熱い麺にグアンチャーレを入れ、ソースを素早く混ぜます。茹で汁で濃度を調整します。', '반드시 불을 끈 상태에서 소스를 넣어야 달걀이 익지 않습니다.', '必ず火を止めた状態でソースを入れてください。卵が固まってしまいます。', ARRAY['빠르게 작업하세요','소스를 넣으며 계속 비벼주세요'])
ON CONFLICT (id) DO NOTHING;
