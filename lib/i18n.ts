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

export type Translations = (typeof translations)[Locale];

export function t(locale: Locale): Translations {
  return translations[locale];
}
