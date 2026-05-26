import type { Category, Recipe, Ingredient, Step } from "./types";

export const categories: Category[] = [
  {
    id: "cat-korean",
    name: "Korean",
    slug: "korean",
    color: "#d4a574",
    bg_color: "#fef3e2",
    created_at: "2024-01-01",
  },
  {
    id: "cat-chinese",
    name: "Chinese",
    slug: "chinese",
    color: "#e07070",
    bg_color: "#fde8e8",
    created_at: "2024-01-01",
  },
  {
    id: "cat-western",
    name: "Western",
    slug: "western",
    color: "#70c4b8",
    bg_color: "#e8f5f3",
    created_at: "2024-01-01",
  },
];

export const recipes: Recipe[] = [
  // Korean
  {
    id: "r1",
    category_id: "cat-korean",
    name: "김치찌개",
    subtitle: "깊은 맛의 김치찌개",
    description: "잘 익은 김치와 돼지고기, 두부가 어우러진 한국의 대표 찌개 요리입니다.",
    thumbnail_url: null,
    youtube_video_id: "T8SfZMAfEOo",
    youtube_start_sec: 0,
    difficulty: "쉬움",
    cook_time_min: 30,
    tags: ["찌개", "매운맛", "집밥"],
    sort_order: 0,
    published: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "r2",
    category_id: "cat-korean",
    name: "불고기",
    subtitle: "달콤한 양념 소고기",
    description: "얇게 썬 소고기를 달콤한 간장 양념에 재워 구운 한국 BBQ의 정수입니다.",
    thumbnail_url: null,
    youtube_video_id: null,
    youtube_start_sec: 0,
    difficulty: "보통",
    cook_time_min: 40,
    tags: ["구이", "소고기"],
    sort_order: 1,
    published: true,
    created_at: "2024-01-02",
    updated_at: "2024-01-02",
  },
  {
    id: "r3",
    category_id: "cat-korean",
    name: "잡채",
    subtitle: "당면 잡채",
    description: "당면과 각종 채소, 소고기를 간장과 참기름으로 볶아낸 명절 대표 요리입니다.",
    thumbnail_url: null,
    youtube_video_id: null,
    youtube_start_sec: 0,
    difficulty: "보통",
    cook_time_min: 35,
    tags: ["면", "명절"],
    sort_order: 2,
    published: true,
    created_at: "2024-01-03",
    updated_at: "2024-01-03",
  },
  {
    id: "r4",
    category_id: "cat-korean",
    name: "떡볶이",
    subtitle: "매콤달콤 떡볶이",
    description: "쫄깃한 떡을 매콤달콤한 고추장 소스에 볶아낸 인기 길거리 음식입니다.",
    thumbnail_url: null,
    youtube_video_id: null,
    youtube_start_sec: 0,
    difficulty: "쉬움",
    cook_time_min: 20,
    tags: ["분식", "매운맛"],
    sort_order: 3,
    published: true,
    created_at: "2024-01-04",
    updated_at: "2024-01-04",
  },
  {
    id: "r12",
    category_id: "cat-korean",
    name: "된장찌개",
    subtitle: "구수한 된장찌개",
    description: "된장과 두부, 호박, 감자를 넣고 끓인 구수하고 깊은 맛의 찌개입니다.",
    thumbnail_url: null,
    youtube_video_id: null,
    youtube_start_sec: 0,
    difficulty: "쉬움",
    cook_time_min: 25,
    tags: ["찌개", "집밥"],
    sort_order: 4,
    published: true,
    created_at: "2024-01-12",
    updated_at: "2024-01-12",
  },
  {
    id: "r13",
    category_id: "cat-korean",
    name: "비빔밥",
    subtitle: "전주 비빔밥",
    description: "각종 나물과 고추장, 계란을 올린 밥 위에 쓱쓱 비벼 먹는 대표 한식입니다.",
    thumbnail_url: null,
    youtube_video_id: null,
    youtube_start_sec: 0,
    difficulty: "보통",
    cook_time_min: 45,
    tags: ["밥", "나물"],
    sort_order: 5,
    published: true,
    created_at: "2024-01-13",
    updated_at: "2024-01-13",
  },
  // Chinese
  {
    id: "r5",
    category_id: "cat-chinese",
    name: "마파두부",
    subtitle: "사천식 매운 두부",
    description: "부드러운 두부를 매콤한 사천식 고추기름 소스에 볶아낸 요리입니다.",
    thumbnail_url: null,
    youtube_video_id: null,
    youtube_start_sec: 0,
    difficulty: "보통",
    cook_time_min: 25,
    tags: ["사천", "매운맛", "두부"],
    sort_order: 0,
    published: true,
    created_at: "2024-01-05",
    updated_at: "2024-01-05",
  },
  {
    id: "r6",
    category_id: "cat-chinese",
    name: "궁보계정",
    subtitle: "매콤한 닭고기 볶음",
    description: "땅콩과 고추, 사천 후추와 함께 볶은 닭고기 요리입니다.",
    thumbnail_url: null,
    youtube_video_id: null,
    youtube_start_sec: 0,
    difficulty: "보통",
    cook_time_min: 30,
    tags: ["닭고기", "볶음"],
    sort_order: 1,
    published: true,
    created_at: "2024-01-06",
    updated_at: "2024-01-06",
  },
  {
    id: "r7",
    category_id: "cat-chinese",
    name: "샤오롱바오",
    subtitle: "상하이 소롱포",
    description: "얇은 피 안에 육즙 가득한 돼지고기와 진한 육수가 들어간 만두입니다.",
    thumbnail_url: null,
    youtube_video_id: null,
    youtube_start_sec: 0,
    difficulty: "어려움",
    cook_time_min: 90,
    tags: ["만두", "찜"],
    sort_order: 2,
    published: true,
    created_at: "2024-01-07",
    updated_at: "2024-01-07",
  },
  // Western
  {
    id: "r8",
    category_id: "cat-western",
    name: "까르보나라",
    subtitle: "로마식 파스타",
    description: "관찰레, 달걀노른자, 페코리노 치즈, 후추로 만든 클래식 로마 파스타입니다.",
    thumbnail_url: null,
    youtube_video_id: null,
    youtube_start_sec: 0,
    difficulty: "보통",
    cook_time_min: 25,
    tags: ["파스타", "이탈리안"],
    sort_order: 0,
    published: true,
    created_at: "2024-01-08",
    updated_at: "2024-01-08",
  },
  {
    id: "r9",
    category_id: "cat-western",
    name: "뵈프 부르기뇽",
    subtitle: "프랑스식 소고기 스튜",
    description: "레드와인에 천천히 끓인 소고기와 버섯, 양파, 당근의 프랑스 대표 스튜입니다.",
    thumbnail_url: null,
    youtube_video_id: null,
    youtube_start_sec: 0,
    difficulty: "어려움",
    cook_time_min: 180,
    tags: ["프랑스", "스튜"],
    sort_order: 1,
    published: true,
    created_at: "2024-01-09",
    updated_at: "2024-01-09",
  },
  {
    id: "r10",
    category_id: "cat-western",
    name: "리조또",
    subtitle: "버섯 리조또",
    description: "포르치니 버섯과 파르메산, 화이트와인으로 만든 크리미한 이탈리안 쌀 요리입니다.",
    thumbnail_url: null,
    youtube_video_id: null,
    youtube_start_sec: 0,
    difficulty: "보통",
    cook_time_min: 40,
    tags: ["이탈리안", "쌀"],
    sort_order: 2,
    published: true,
    created_at: "2024-01-10",
    updated_at: "2024-01-10",
  },
  {
    id: "r11",
    category_id: "cat-western",
    name: "피쉬 앤 칩스",
    subtitle: "영국식 생선튀김",
    description: "맥주 반죽 대구튀김과 두툼한 감자튀김, 타르타르 소스를 곁들인 영국 대표 요리입니다.",
    thumbnail_url: null,
    youtube_video_id: null,
    youtube_start_sec: 0,
    difficulty: "쉬움",
    cook_time_min: 35,
    tags: ["영국", "튀김"],
    sort_order: 3,
    published: true,
    created_at: "2024-01-11",
    updated_at: "2024-01-11",
  },
];

export const ingredients: Ingredient[] = [
  // 김치찌개
  { id: "i1", recipe_id: "r1", name: "묵은지", amount: "2컵", emoji: "🥬", sort_order: 0 },
  { id: "i2", recipe_id: "r1", name: "삼겹살", amount: "200g", emoji: "🥩", sort_order: 1 },
  { id: "i3", recipe_id: "r1", name: "두부", amount: "1모", emoji: "🧈", sort_order: 2 },
  { id: "i4", recipe_id: "r1", name: "고춧가루", amount: "1큰술", emoji: "🌶️", sort_order: 3 },
  { id: "i5", recipe_id: "r1", name: "대파", amount: "2대", emoji: "🧅", sort_order: 4 },
  // 불고기
  { id: "i6", recipe_id: "r2", name: "소고기 등심", amount: "500g", emoji: "🥩", sort_order: 0 },
  { id: "i7", recipe_id: "r2", name: "간장", amount: "4큰술", emoji: "🫗", sort_order: 1 },
  { id: "i8", recipe_id: "r2", name: "배", amount: "1/2개", emoji: "🍐", sort_order: 2 },
  { id: "i9", recipe_id: "r2", name: "마늘", amount: "4쪽", emoji: "🧄", sort_order: 3 },
  { id: "i10", recipe_id: "r2", name: "참기름", amount: "2큰술", emoji: "🫒", sort_order: 4 },
  // 까르보나라
  { id: "i11", recipe_id: "r8", name: "스파게티면", amount: "400g", emoji: "🍝", sort_order: 0 },
  { id: "i12", recipe_id: "r8", name: "관찰레", amount: "150g", emoji: "🥓", sort_order: 1 },
  { id: "i13", recipe_id: "r8", name: "달걀노른자", amount: "4개", emoji: "🥚", sort_order: 2 },
  { id: "i14", recipe_id: "r8", name: "페코리노", amount: "100g", emoji: "🧀", sort_order: 3 },
  { id: "i15", recipe_id: "r8", name: "후추", amount: "적당량", emoji: "🫙", sort_order: 4 },
];

export const steps: Step[] = [
  // 김치찌개
  {
    id: "s1", recipe_id: "r1", step_number: 1,
    title: "돼지고기와 김치 볶기",
    description: "삼겹살을 한입 크기로 썰어 냄비에 넣고 기름이 나올 때까지 볶습니다. 송송 썬 묵은지를 넣고 3-4분 볶아줍니다.",
    tip: "최소 2주 이상 숙성된 묵은지를 사용하면 더 깊은 맛이 납니다.",
    tip_items: ["신 김치가 가장 맛있어요", "김치 국물은 나중에 넣을 거예요"],
  },
  {
    id: "s2", recipe_id: "r1", step_number: 2,
    title: "육수 넣고 끓이기",
    description: "물 3컵 또는 멸치 육수를 붓고 고춧가루와 김치 국물을 넣습니다. 끓어오르면 중불로 줄여 15분간 끓입니다.",
    tip: null, tip_items: [],
  },
  {
    id: "s3", recipe_id: "r1", step_number: 3,
    title: "두부 넣고 마무리",
    description: "두부를 두툼하게 썰어 냄비에 넣고 5분 더 끓입니다. 송송 썬 대파를 올려 밥과 함께 뜨겁게 냅니다.",
    tip: "두부를 넣은 후에는 너무 많이 젓지 마세요. 부서질 수 있습니다.",
    tip_items: [],
  },
  // 까르보나라
  {
    id: "s4", recipe_id: "r8", step_number: 1,
    title: "소스 준비하기",
    description: "달걀노른자에 곱게 간 페코리노 치즈와 후추를 넉넉히 넣고 잘 섞어 둡니다.",
    tip: "실온의 달걀을 사용하면 더 부드럽게 섞입니다.",
    tip_items: ["노른자만 사용하면 더 진해요", "치즈를 곱게 갈아야 잘 녹아요"],
  },
  {
    id: "s5", recipe_id: "r8", step_number: 2,
    title: "관찰레 굽기",
    description: "관찰레를 잘게 썰어 찬 팬에 올리고 중불에서 기름이 천천히 나오도록 바삭하게 구워줍니다.",
    tip: null, tip_items: [],
  },
  {
    id: "s6", recipe_id: "r8", step_number: 3,
    title: "합치고 완성하기",
    description: "스파게티를 알덴테로 삶고 면수 1컵을 남겨둡니다. 불을 끈 상태에서 뜨거운 면에 관찰레를 넣고, 소스를 빠르게 섞어줍니다. 면수로 농도를 조절합니다.",
    tip: "반드시 불을 끈 상태에서 소스를 넣어야 달걀이 익지 않습니다.",
    tip_items: ["빠르게 작업하세요", "소스를 넣으며 계속 비벼주세요"],
  },
];

// Helpers
export function getRecipesByCategory(slug: string): Recipe[] {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return [];
  return recipes.filter((r) => r.category_id === cat.id && r.published);
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}

export function getIngredientsByRecipe(recipeId: string): Ingredient[] {
  return ingredients.filter((i) => i.recipe_id === recipeId);
}

export function getStepsByRecipe(recipeId: string): Step[] {
  return steps.filter((s) => s.recipe_id === recipeId).sort((a, b) => a.step_number - b.step_number);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export const categoryEmoji: Record<string, string> = {
  korean: "🍚",
  chinese: "🥡",
  western: "🍝",
};

export const recipeEmoji: Record<string, string> = {
  r1: "🍲", r2: "🥩", r3: "🍜", r4: "🌶️", r12: "🫕", r13: "🍚",
  r5: "🧆", r6: "🍗", r7: "🥟",
  r8: "🍝", r9: "🥘", r10: "🍚", r11: "🐟",
};

export const categoryDarkBg: Record<string, string> = {
  korean: "#2a1f14",
  chinese: "#1f1414",
  western: "#14201f",
};
