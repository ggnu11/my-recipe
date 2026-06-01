export type Locale = "ko" | "ja";

const translations = {
  ko: {
    siteTitle: "MY RECIPE",
    siteDesc: "전 세계의 요리 예술을 만나보세요",
    searchPlaceholder: "레시피 검색...",
    recipes: "개 레시피",
    explore: "탐색",
    categoryNotFound: "카테고리를 찾을 수 없습니다",
    noIngredients: "재료 없음",
    noSteps: "조리 단계가 없습니다",
    videoComingSoon: "영상 준비 중",
    scrollHint: "스크롤하여 메뉴 변경",
    step: "단계",
    categoryLabel: {
      korean: "한식",
      chinese: "중식",
      western: "양식",
    },
    categoryDesc: {
      korean: "대대로 전해 내려오는 전통의 맛",
      chinese: "강렬하고 향긋한 동양의 요리",
      western: "클래식 유럽 요리의 정수",
    },
  },
  ja: {
    siteTitle: "MY RECIPE",
    siteDesc: "世界中の料理芸術を発見しよう",
    searchPlaceholder: "レシピを検索...",
    recipes: "つのレシピ",
    explore: "探索",
    categoryNotFound: "カテゴリが見つかりません",
    noIngredients: "材料なし",
    noSteps: "調理手順がありません",
    videoComingSoon: "動画準備中",
    scrollHint: "スクロールでメニュー変更",
    step: "ステップ",
    categoryLabel: {
      korean: "韓国料理",
      chinese: "中華料理",
      western: "洋食",
    },
    categoryDesc: {
      korean: "代々受け継がれてきた伝統の味",
      chinese: "大胆で香り豊かな東洋の料理",
      western: "クラシックなヨーロッパ料理の真髄",
    },
  },
} as const;

export type Translations = typeof translations.ko;

export function t(locale: Locale): Translations {
  return translations[locale];
}

// === Recipe data translations (ja) ===
// Korean is the default in mock-data, so only ja overrides are needed.

type RecipeI18n = {
  name: string;
  subtitle: string;
  description: string;
  difficulty: string;
};

type IngredientI18n = {
  name: string;
  amount: string;
};

type StepI18n = {
  title: string;
  description: string;
  tip: string | null;
};

const recipeJa: Record<string, RecipeI18n> = {
  r1: {
    name: "キムチチゲ",
    subtitle: "深い味わいのキムチチゲ",
    description: "よく漬かったキムチと豚肉、豆腐が調和した韓国の代表的なチゲ料理です。",
    difficulty: "簡単",
  },
  r2: {
    name: "プルコギ",
    subtitle: "甘い味付けの牛肉",
    description: "薄切り牛肉を甘い醤油ダレに漬けて焼いた韓国BBQの真髄です。",
    difficulty: "普通",
  },
  r3: {
    name: "チャプチェ",
    subtitle: "春雨チャプチェ",
    description: "春雨と各種野菜、牛肉を醤油とごま油で炒めた韓国の祝日料理です。",
    difficulty: "普通",
  },
  r4: {
    name: "トッポッキ",
    subtitle: "甘辛トッポッキ",
    description: "もちもちの餅を甘辛いコチュジャンソースで炒めた人気の屋台料理です。",
    difficulty: "簡単",
  },
  r12: {
    name: "テンジャンチゲ",
    subtitle: "香ばしい味噌チゲ",
    description: "味噌と豆腐、かぼちゃ、じゃがいもを入れて煮込んだ香ばしく深い味わいのチゲです。",
    difficulty: "簡単",
  },
  r13: {
    name: "ビビンバ",
    subtitle: "全州ビビンバ",
    description: "各種ナムルとコチュジャン、卵をのせたご飯をよく混ぜて食べる代表的な韓国料理です。",
    difficulty: "普通",
  },
  r5: {
    name: "麻婆豆腐",
    subtitle: "四川風辛い豆腐",
    description: "柔らかい豆腐を辛い四川風ラー油ソースで炒めた料理です。",
    difficulty: "普通",
  },
  r6: {
    name: "宮保鶏丁",
    subtitle: "辛い鶏肉炒め",
    description: "ピーナッツと唐辛子、山椒と一緒に炒めた鶏肉料理です。",
    difficulty: "普通",
  },
  r7: {
    name: "小籠包",
    subtitle: "上海小籠包",
    description: "薄い皮の中に肉汁たっぷりの豚肉と濃厚なスープが入った点心です。",
    difficulty: "難しい",
  },
  r8: {
    name: "カルボナーラ",
    subtitle: "ローマ風パスタ",
    description: "グアンチャーレ、卵黄、ペコリーノチーズ、胡椒で作るクラシックなローマパスタです。",
    difficulty: "普通",
  },
  r9: {
    name: "ブフ・ブルギニョン",
    subtitle: "フランス風牛肉シチュー",
    description: "赤ワインでじっくり煮込んだ牛肉とキノコ、玉ねぎ、人参のフランス代表シチューです。",
    difficulty: "難しい",
  },
  r10: {
    name: "リゾット",
    subtitle: "キノコリゾット",
    description: "ポルチーニ茸とパルメザン、白ワインで作るクリーミーなイタリアン米料理です。",
    difficulty: "普通",
  },
  r11: {
    name: "フィッシュ＆チップス",
    subtitle: "英国風魚のフライ",
    description: "ビール衣のタラフライと厚切りフライドポテト、タルタルソースを添えたイギリスの代表料理です。",
    difficulty: "簡単",
  },
};

const ingredientJa: Record<string, IngredientI18n> = {
  // キムチチゲ
  i1: { name: "熟成キムチ", amount: "2カップ" },
  i2: { name: "豚バラ肉", amount: "200g" },
  i3: { name: "豆腐", amount: "1丁" },
  i4: { name: "粉唐辛子", amount: "大さじ1" },
  i5: { name: "長ネギ", amount: "2本" },
  // プルコギ
  i6: { name: "牛ロース", amount: "500g" },
  i7: { name: "醤油", amount: "大さじ4" },
  i8: { name: "梨", amount: "1/2個" },
  i9: { name: "ニンニク", amount: "4片" },
  i10: { name: "ごま油", amount: "大さじ2" },
  // カルボナーラ
  i11: { name: "スパゲッティ", amount: "400g" },
  i12: { name: "グアンチャーレ", amount: "150g" },
  i13: { name: "卵黄", amount: "4個" },
  i14: { name: "ペコリーノ", amount: "100g" },
  i15: { name: "黒胡椒", amount: "適量" },
};

const stepJa: Record<string, StepI18n> = {
  // キムチチゲ
  s1: {
    title: "豚肉とキムチを炒める",
    description: "豚バラ肉を一口大に切って鍋に入れ、脂が出るまで炒めます。刻んだ熟成キムチを入れて3〜4分炒めます。",
    tip: "2週間以上熟成させたキムチを使うとより深い味になります。",
  },
  s2: {
    title: "出汁を入れて煮込む",
    description: "水3カップまたは煮干し出汁を注ぎ、粉唐辛子とキムチの汁を入れます。沸騰したら中火にして15分間煮込みます。",
    tip: null,
  },
  s3: {
    title: "豆腐を入れて仕上げ",
    description: "豆腐を厚めに切って鍋に入れ、さらに5分煮込みます。刻んだ長ネギをのせてご飯と一緒に熱々で召し上がれ。",
    tip: "豆腐を入れた後はかき混ぜすぎないでください。崩れることがあります。",
  },
  // カルボナーラ
  s4: {
    title: "ソースを準備する",
    description: "卵黄に細かくすりおろしたペコリーノチーズと胡椒をたっぷり入れてよく混ぜておきます。",
    tip: "常温の卵を使うとより滑らかに混ざります。",
  },
  s5: {
    title: "グアンチャーレを焼く",
    description: "グアンチャーレを細かく切り、冷たいフライパンに置いて中火でゆっくり脂を出しながらカリカリに焼きます。",
    tip: null,
  },
  s6: {
    title: "合わせて完成",
    description: "スパゲッティをアルデンテに茹で、茹で汁1カップを残します。火を止めた状態で熱い麺にグアンチャーレを入れ、ソースを素早く混ぜます。茹で汁で濃度を調整します。",
    tip: "必ず火を止めた状態でソースを入れてください。卵が固まってしまいます。",
  },
};

export function getRecipeI18n(id: string, locale: Locale) {
  if (locale === "ko") return null;
  return recipeJa[id] ?? null;
}

export function getIngredientI18n(id: string, locale: Locale) {
  if (locale === "ko") return null;
  return ingredientJa[id] ?? null;
}

export function getStepI18n(id: string, locale: Locale) {
  if (locale === "ko") return null;
  return stepJa[id] ?? null;
}
