export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  bg_color: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  category_id: string;
  name: string;
  name_ja: string | null;
  subtitle: string | null;
  subtitle_ja: string | null;
  description: string | null;
  description_ja: string | null;
  thumbnail_url: string | null;
  youtube_video_id: string | null;
  youtube_start_sec: number;
  difficulty: string | null;
  difficulty_ja: string | null;
  cook_time_min: number | null;
  emoji: string | null;
  tags: string[];
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  recipe_id: string;
  name: string;
  name_ja: string | null;
  amount: string | null;
  amount_ja: string | null;
  emoji: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface Step {
  id: string;
  recipe_id: string;
  step_number: number;
  title: string;
  title_ja: string | null;
  description: string;
  description_ja: string | null;
  tip: string | null;
  tip_ja: string | null;
  tip_items: string[];
}

export type CategorySlug = "korean" | "chinese" | "western";
