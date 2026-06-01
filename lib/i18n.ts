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
  },
} as const;

export type Translations = (typeof translations)[Locale];

export function t(locale: Locale): Translations {
  return translations[locale];
}
