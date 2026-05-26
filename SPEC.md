# MY RECIPE — Development Specification v2.0

> Cinematic UI/UX Interactions Included

**Purpose:** Build a portfolio site that organizes personally cooked recipes by category, presenting ingredients, cooking steps, and videos as one seamless cinematic interaction.

**UI Keywords:** `cinematic` · `luxury cooking showcase` · `shared element transition` · `premium dark UI` · `Apple keynote style motion`

---

## 1. Project Overview

| Item           | Detail                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------- |
| Project Name   | MY RECIPE — Personal Recipe Portfolio                                                     |
| Purpose        | Portfolio site to organize and showcase personally cooked recipes by category             |
| UI/UX Goal     | Netflix documentary-style transitions + Apple product page-level shared layout transition |
| Target Users   | General visitors + Admin (owner) managing content                                         |
| Deployment     | Vercel (frontend) + Supabase (DB, Storage, Auth) — free tier                              |
| Admin Features | Email/password login, recipe CRUD, image upload, YouTube URL linking                      |
| Priority Order | Layout + cinematic animations → DB integration → Admin panel                              |

---

## 2. UI Design Philosophy & Core Principles

> **The goal is NOT "a new screen appearing" — it should feel like "existing objects naturally morphing and moving into new positions."**

### 2-1. Core Animation Principles

| Principle      | Description                                                                                                            | Violation   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------- |
| Continuity     | All UI elements must appear as connected motion. Nothing disappears and reappears — position, scale, or shape changes. | Prohibited  |
| Shared Layout  | Use Framer Motion `layoutId` + `AnimatePresence`. Same element in two screens → shared element transition mandatory.   | Prohibited  |
| Stagger        | Multiple elements must not enter simultaneously. Use 0.08–0.12s stagger intervals.                                     | Recommended |
| Unified Easing | Use `cubic-bezier(0.22, 1, 0.36, 1)` or `cubic-bezier(0.4, 0, 0.2, 1)`. `linear`/`ease` is prohibited.                 | Prohibited  |
| 60fps          | Animate only `transform` and `opacity`. Apply `will-change: transform, opacity`.                                       | Prohibited  |

### 2-2. Strictly Prohibited Patterns

| Prohibited                                    | Required Alternative                           |
| --------------------------------------------- | ---------------------------------------------- |
| Hard cut / instant screen swap                | `AnimatePresence` with exit + enter animations |
| `display: none` to hide elements              | `opacity: 0` + `pointer-events: none`          |
| Simple fade replacement (new element fade in) | `layoutId`-based shared element transition     |
| Animating `width`/`height` directly           | Use `transform: scale()`                       |
| Animating `top`/`left` directly               | Use `transform: translate()`                   |
| State change with no transition               | Every state change must include a transition   |

---

## 3. Tech Stack

| Category       | Technology                   | Reason                                                   |
| -------------- | ---------------------------- | -------------------------------------------------------- |
| Framework      | Next.js 14 (App Router)      | SSR/SSG, Vercel optimized, file-based routing            |
| Language       | TypeScript                   | Type safety, maintainability                             |
| Styling        | Tailwind CSS                 | Utility classes, rapid UI development                    |
| Animation      | **Framer Motion** (required) | `layoutId`, `AnimatePresence`, shared element transition |
| Scroll         | **Lenis** (added)            | Smooth inertia scrolling for cinematic scroll feel       |
| Adv. Animation | GSAP (optional)              | Complex timeline animations — circular orbit movement    |
| DB / Auth      | Supabase                     | PostgreSQL + Row Level Security + Auth on free tier      |
| Storage        | Supabase Storage             | Thumbnail image storage (videos via YouTube embed)       |
| Deployment     | Vercel                       | GitHub-linked auto deploy, free tier                     |
| State          | Zustand                      | Global category / selected menu / animation state        |
| Forms          | React Hook Form + Zod        | Admin form validation                                    |

### 3-1. Advanced CSS Techniques

| Technique               | Usage                                                             |
| ----------------------- | ----------------------------------------------------------------- |
| `CSS mask-image`        | Semi-circular Carousel — crop circle extending beyond screen edge |
| `clip-path: circle()`   | Circular reveal effect on click transition                        |
| `backdrop-filter`       | Blur overlay for background depth                                 |
| `CSS Custom Properties` | Sync dynamic color/size changes with JS during animations         |
| `mix-blend-mode`        | Advanced blending when circles overlap                            |

### 3-2. Terminal Setup

```bash
# 1. Create project
npx create-next-app@latest my-recipe \
  --typescript --tailwind --eslint --app \
  --src-dir=false --import-alias "@/*"
cd my-recipe

# 2. Install packages
npm install framer-motion lenis zustand
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form zod @hookform/resolvers

# 3. Create env file
touch .env.local

# 4. Run dev server
npm run dev
```

---

## 4. Screens & Routing

| Path                       | Screen                 | Description                                                       |
| -------------------------- | ---------------------- | ----------------------------------------------------------------- |
| `/`                        | Home (Category Select) | 3 category cards: Korean / Chinese / Western                      |
| `/[category]`              | Menu Showcase          | Left menu list + right Circular Carousel. Two states on same URL. |
| `/admin`                   | Admin Dashboard        | Protected route. Recipe list + CRUD.                              |
| `/admin/login`             | Admin Login            | Email/password authentication                                     |
| `/admin/recipes/new`       | Create Recipe          | Category, ingredients, steps, YouTube URL                         |
| `/admin/recipes/[id]/edit` | Edit Recipe            | Prefilled form with existing data                                 |

> **Note:** Detail view has no separate route. Uses state transitions within `/[category]`. URL uses `?recipe=id` query string for shareability.

---

## 5. Screen Specifications

### 5-1. Home Screen (`/`)

| Area         | Specification                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| Background   | Dark base `#0d0d0d` with subtle noise texture overlay                                                         |
| Header       | Left: Logo "MY RECIPE" (serif font, gold `#c8a96e`). Right: search + bookmark icons                           |
| Card Grid    | 3-column equal grid (gap: 16px). Each card: `border-radius: 20px`, `border: 1px solid rgba(255,255,255,0.08)` |
| Card Content | Circular icon (52px) + category name (serif) + recipe count                                                   |
| Card BG      | Korean: `#2a1f14` / Chinese: `#1f1414` / Western: `#14201f`                                                   |
| Card Hover   | `border-color` → `#c8a96e` + `translateY(-4px)`. duration: 0.3s                                               |

#### Home → Category Entry Interaction

> ⚠️ Not a simple page navigation. Card background circle and category page circle **share the same `layoutId`**.

| Step           | Action                                                         | Framer Motion                                          |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| 1. Card click  | Card scales `1 → 1.06`                                         | `whileTap: { scale: 0.98 }`, then trigger animate      |
| 2. Overlay     | Dark overlay `rgba(0,0,0,0.6)` + blur fades in                 | `motion.div` opacity `0→1`, `backdropFilter blur(4px)` |
| 3. Circle move | Card bg circle moves to large circle position in category view | Share `layoutId="category-circle-[slug]"`              |
| 4. Page in     | Category view slides from `translateX(100%) → 0`               | `AnimatePresence` + exit/enter                         |

```
duration: 0.6–0.8s
easing:   cubic-bezier(0.22, 1, 0.36, 1)
stagger:  0.06s between each card on initial load
```

---

### 5-2. Menu Showcase Screen (`/[category]`)

This screen has **2 states**. No separate routing — state transitions on the same URL.

#### Overall Layout

| Column        | Width       | Content                                                                            |
| ------------- | ----------- | ---------------------------------------------------------------------------------- |
| Left Sidebar  | 200px fixed | Scrollable menu list. Circular thumbnail + name. Active item has left gold border. |
| Right Content | remaining   | State 1 (Circle Carousel) **or** State 2 (3-column Detail) — via `AnimatePresence` |

---

#### State 1 — Circular Carousel (Default)

> Refer to **Image 1** — right area shows circles of different sizes in a semi-circular Carousel.

**Carousel Elements:**

| Element               | Description                               | Style                                               |
| --------------------- | ----------------------------------------- | --------------------------------------------------- |
| Main Circle (current) | Largest circle. Current menu image/emoji. | Diameter 280px, opacity 1, z-index 10, no blur      |
| Sub Circle (adjacent) | Smaller, positioned behind main.          | Diameter 160px, opacity 0.5, `blur(2px)`, z-index 5 |
| Deco Circles          | 3–4 small circles for depth.              | Diameter 40–80px, opacity 0.2–0.3                   |
| Dashed Ring           | Wraps main circle, slowly rotating.       | Diameter: main + 40px, dashed border, slow rotation |
| Glow                  | Subtle light behind main circle.          | `box-shadow: 0 0 60px rgba(category-color, 0.3)`    |

**Z-depth Rules:**

| Property | Main Circle | Sub Circle  |
| -------- | ----------- | ----------- |
| scale    | 1.0 (base)  | 0.6–0.7     |
| opacity  | 1.0         | 0.4–0.5     |
| blur     | none        | `blur(2px)` |
| z-index  | 10          | 5 or lower  |

**Position Rules:**

| Item           | Specification                                                                             |
| -------------- | ----------------------------------------------------------------------------------------- |
| Main Circle    | Center-right of content area. Extends ~20% beyond right edge (cropped with `mask-image`). |
| Sub Circle     | Lower-left / upper diagonal from main. Positioned behind.                                 |
| Text area      | Left half — large menu name (serif), description, 2 buttons (ghost + primary)             |
| Visual divider | Vertical dashed line: `border-left: 1px dashed rgba(255,255,255,0.1)`                     |

---

#### Menu Transition Animation (Scroll or Sidebar Click)

> ⚠️ Simple fade replacement is **prohibited**. Framer Motion `layoutId`-based shared element transition is **required**.

| Step       | Current Menu                          | Next Menu                            |
| ---------- | ------------------------------------- | ------------------------------------ |
| 1. Start   | `scale 1.0 → 0.6`                     | `scale 0.6 → 1.0` (front from back)  |
| 2. Move    | `x: 0 → +120%`, `opacity 1 → 0`       | `x: -30% → 0`, `opacity 0.4 → 1`     |
| 3. Blur    | `blur 0 → 4px`                        | `blur 2px → 0`                       |
| 4. Text    | `opacity 1 → 0` (50ms before circle)  | `opacity 0 → 1` (100ms after circle) |
| 5. Sidebar | Active indicator moves via `layoutId` | —                                    |

```
duration:         0.45s
easing:           cubic-bezier(0.4, 0, 0.2, 1)
scroll threshold: trigger on wheel delta > 50px (debounce 500ms)
lock during anim: ignore scroll while isAnimating === true
```

---

#### State 2 — 3-Column Detail Layout (After Menu Click)

> Refer to **Image 2** — Left: ingredient panel | Center: cooking steps | Right: YouTube video fills full height.

> ⚠️ Elements must NOT appear as "new content fading in." It must feel like **"the same object moving to a new position."**

**Circle → Detail Transition (Critical):**

| Step               | Description                                                                                                                          | Framer Motion                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| STEP 1 Background  | Remove radial gradient → pure dark `#0d0d0d` + cinematic vignette.                                                                   | `motion.div` background-color transition, 1s                                                                           |
| STEP 2 Image Move  | Food image inside main circle moves to top-left hero position. Circle shrinks/disappears — image appears to **move, not duplicate**. | Share `layoutId="food-image-[id]"`. Framer Motion auto-interpolates.                                                   |
| STEP 3 Ingredients | Circular icons orbit along their path then settle into a vertical list on left.                                                      | GSAP or Framer Motion stagger. Per-item delay: `i * 0.06s`                                                             |
| STEP 4 Content     | Center Step text → Right YouTube video, staggered fade+slide.                                                                        | `initial: { opacity: 0, y: 20 }` → `animate: { opacity: 1, y: 0 }`. Delays: ingredients(0.1s), text(0.2s), video(0.3s) |

**3-Column Layout:**

| Column             | Width       | Content                                                                                                                                                                  |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Left — Ingredients | 200px fixed | Top: food image (hero, `layoutId` connected) · Middle: menu name (serif) · Bottom: ingredient list — circular icon (36px) + name + amount · Lowest: step dot navigation  |
| Center — Steps     | 1fr         | `"Step N"` label (gold, `letter-spacing: 0.15em`) · Step title (serif, 18px) · Description (14px, `line-height: 1.8`) · TIP box (left gold border 4px) · TIP bullet list |
| Right — YouTube    | 1fr         | YouTube `iframe` filling full column height · Initially muted autoplay · Controls on hover · Skeleton UI while loading · Bottom: "Watch on YouTube" link                 |

**Return Interaction:**

| Trigger                       | Behavior                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| Click background or press ESC | Reverse playback. STEP 4 → 3 → 2 → 1.                                                |
| `layoutId` reverse            | Framer Motion auto-handles reverse interpolation. No separate exit animation needed. |

---

## 6. Background Design

> Background is not a simple color — each state conveys a distinct atmosphere.

| State                   | Background Composition                                                                         | Implementation                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Home cards              | `#0d0d0d` + noise texture (5% opacity) + optional floating particles                           | CSS + SVG noise filter                                                                              |
| Menu Carousel (State 1) | `#0d0d0d` + radial gradient (category color radiating from behind right circle) + noise + glow | CSS `radial-gradient` center-right. Color via CSS variable per category. Transition on menu change. |
| Recipe Detail (State 2) | `#0d0d0d` (pure dark) + cinematic vignette (darker at edges) + blur overlay + depth shadow     | CSS `radial-gradient` brighter center, darker edges. `backdrop-filter` for depth.                   |

---

## 7. YouTube Video Integration

### Storage Rule

- Store only `video_id` in DB — **never store the full URL**
- Admin inputs full URL; frontend parses and saves only `video_id`

### URL Parsing

```ts
export function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match?.[1] ?? null;
}
```

### Embed URL

```ts
const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${startSec}&rel=0&mute=1&autoplay=1`;
```

### YoutubePlayer Component UX

| Item          | Specification                                                     |
| ------------- | ----------------------------------------------------------------- |
| Initial state | `autoplay` + `muted`. Video starts immediately on entry.          |
| On hover      | Show controls (YouTube iframe API or custom overlay).             |
| Loading state | Skeleton UI — dark background with shimmer.                       |
| Poster image  | Preload: `https://img.youtube.com/vi/{videoId}/maxresdefault.jpg` |
| Admin notice  | "Private videos cannot be embedded. Set to Public or Unlisted."   |

---

## 8. Supabase DB Schema

### categories

| Column     | Type        | Constraint              | Description                   |
| ---------- | ----------- | ----------------------- | ----------------------------- |
| id         | uuid        | PK, `gen_random_uuid()` | Unique ID                     |
| name       | text        | NOT NULL                | e.g. Korean, Chinese, Western |
| slug       | text        | NOT NULL, UNIQUE        | e.g. korean, chinese, western |
| color      | text        |                         | Accent color (glow, gradient) |
| bg_color   | text        |                         | Card/circle background hex    |
| created_at | timestamptz | default now()           | Created timestamp             |

### recipes

| Column            | Type        | Constraint         | Description                   |
| ----------------- | ----------- | ------------------ | ----------------------------- |
| id                | uuid        | PK                 | Unique ID                     |
| category_id       | uuid        | FK → categories.id | Category reference            |
| name              | text        | NOT NULL           | Recipe name                   |
| subtitle          | text        |                    | Subtitle                      |
| description       | text        |                    | Introduction text             |
| thumbnail_url     | text        |                    | Supabase Storage URL          |
| youtube_video_id  | text        |                    | YouTube video ID only         |
| youtube_start_sec | integer     | default 0          | Video start time (sec)        |
| difficulty        | text        |                    | Easy / Medium / Hard          |
| cook_time_min     | integer     |                    | Cook time (minutes)           |
| tags              | text[]      |                    | Tag array                     |
| sort_order        | integer     | default 0          | Display order within category |
| published         | boolean     | default false      | Public visibility             |
| created_at        | timestamptz | default now()      |                               |
| updated_at        | timestamptz | default now()      |                               |

### ingredients

| Column     | Type    | Constraint               | Description      |
| ---------- | ------- | ------------------------ | ---------------- |
| id         | uuid    | PK                       | Unique ID        |
| recipe_id  | uuid    | FK → recipes.id, CASCADE | Recipe reference |
| name       | text    | NOT NULL                 | Ingredient name  |
| amount     | text    |                          | Quantity         |
| emoji      | text    |                          | Ingredient emoji |
| sort_order | integer | default 0                | Display order    |

### steps

| Column      | Type    | Constraint               | Description           |
| ----------- | ------- | ------------------------ | --------------------- |
| id          | uuid    | PK                       | Unique ID             |
| recipe_id   | uuid    | FK → recipes.id, CASCADE | Recipe reference      |
| step_number | integer | NOT NULL                 | Step number           |
| title       | text    | NOT NULL                 | Step title            |
| description | text    | NOT NULL                 | Step description      |
| tip         | text    |                          | Optional TIP text     |
| tip_items   | text[]  |                          | TIP bullet list items |

---

## 9. Admin Features

### Authentication

| Item            | Specification                                                         |
| --------------- | --------------------------------------------------------------------- |
| Method          | Supabase Auth — email/password                                        |
| Account         | Single account (owner only). Create in Supabase dashboard.            |
| Protected paths | `middleware.ts` redirects `/admin/**` to `/admin/login` if no session |
| Session         | Supabase default session (persists after browser close)               |
| Logout          | Button in admin header                                                |

### Recipe CRUD

| Feature | Description                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------------- |
| List    | Category filter tabs + recipe card grid. Published status badge.                                                     |
| Create  | Category → Basic info → Dynamic ingredient add → Dynamic step add → YouTube URL (with preview) → Image upload → Save |
| Edit    | Same form as Create, prefilled with existing data.                                                                   |
| Delete  | Confirmation modal → delete (CASCADE removes ingredients and steps).                                                 |
| Publish | Toggle switch for instant `published` status change.                                                                 |
| Sort    | Numeric `sort_order` input to control display position.                                                              |

### Image Upload

| Item     | Specification                                |
| -------- | -------------------------------------------- |
| Bucket   | `recipe-thumbnails`                          |
| Filename | `{recipe_id}/{timestamp}.webp`               |
| Formats  | jpg, png, webp                               |
| Max size | 5MB                                          |
| URL      | Storage public URL → `recipes.thumbnail_url` |

---

## 10. Performance Optimization

> Cinematic UI is prone to performance issues. All items below are **mandatory**.

| Item             | Requirement                    | Implementation                                                 |
| ---------------- | ------------------------------ | -------------------------------------------------------------- |
| GPU Acceleration | All animated elements          | `transform: translateZ(0)` · `will-change: transform, opacity` |
| Anim. Properties | Only `transform` and `opacity` | Never directly animate `width`/`height`/`top`/`left`           |
| Image Preload    | Preload next menu image        | `link rel="preload"` or `Image` with `priority` prop           |
| Framer Optimize  | Minimize bundle                | `LazyMotion` + `domAnimation`                                  |
| Scroll Optimize  | Lenis + RAF-based updates      | Lenis `onScroll` callback instead of native scroll             |
| Route Cache      | Next.js App Router cache       | `next: { revalidate: 3600 }` on fetch                          |
| Video Preload    | YouTube poster before iframe   | `img.youtube.com/vi/{id}/maxresdefault.jpg`                    |
| Reduced Motion   | Respect user preference        | Simplify transitions if `prefers-reduced-motion`               |

---

## 11. Project Folder Structure

```
my-recipe/
├── app/
│   ├── page.tsx                        # Home (category selection)
│   ├── [category]/
│   │   └── page.tsx                    # Menu Showcase (State 1 & 2)
│   └── admin/
│       ├── login/page.tsx
│       ├── page.tsx                    # Dashboard
│       └── recipes/
│           ├── new/page.tsx
│           └── [id]/edit/page.tsx
├── components/
│   ├── ui/                             # Shared Button, Badge, Input etc.
│   ├── home/
│   │   └── CategoryCard.tsx            # Includes layoutId
│   ├── showcase/
│   │   ├── ShowcaseLayout.tsx          # Manages State 1 & 2
│   │   ├── CircleCarousel.tsx          # Semi-circular Carousel (State 1)
│   │   ├── MenuText.tsx                # Left text area
│   │   ├── DecorativeCircles.tsx       # Sub circles + dashed ring
│   │   ├── RecipeDetail.tsx            # 3-column layout (State 2)
│   │   ├── IngredientPanel.tsx         # Left ingredient panel
│   │   ├── StepPanel.tsx               # Center step panel
│   │   └── YoutubePlayer.tsx           # Right YouTube + skeleton
│   └── admin/
│       ├── RecipeForm.tsx
│       └── IngredientEditor.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── youtube.ts                      # extractVideoId util
│   ├── animation.ts                    # Shared animation variants
│   └── types.ts
├── store/
│   └── showcaseStore.ts                # Selected menu, state(1/2), isAnimating
├── middleware.ts
└── .env.local
```

### animation.ts — Shared Variants

> All animation variants are centrally managed here. **Hardcoding values inside components is prohibited.**

```ts
export const EASE_CINEMATIC = [0.22, 1, 0.36, 1];
export const EASE_STANDARD = [0.4, 0, 0.2, 1];

export const circleEnter = {
  initial: { x: "120%", opacity: 0, scale: 0.8 },
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: EASE_STANDARD },
  },
  exit: {
    x: "120%",
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.45, ease: EASE_STANDARD },
  },
};

export const detailEnter = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: EASE_CINEMATIC },
  },
});
```

---

## 12. Environment Variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Server-side only. Never expose publicly.
```

---

## 13. Development Phases

| Phase   | Work                        | Done When                                                                                 |
| ------- | --------------------------- | ----------------------------------------------------------------------------------------- |
| Phase 1 | Project setup               | Next.js 14 + TypeScript + Tailwind + Framer Motion + Lenis installed. Basic routing done. |
| Phase 2 | Home + entry animation      | 3 cards rendered. Click triggers shared layout transition into category page.             |
| Phase 3 | Circular Carousel (State 1) | Semi-circular layout done. Scroll/click triggers circle slide animation.                  |
| Phase 4 | 3-column detail (State 2)   | Circle click → shared element transition → 3-column layout. YouTube embed working.        |
| Phase 5 | Supabase integration        | DB schema created. Recipe data fetched. Verified with dummy data.                         |
| Phase 6 | Admin panel                 | Login, CRUD, image upload, YouTube linking all working.                                   |
| Phase 7 | Deploy + polish             | Deployed to Vercel. Mobile responsive checked. Performance verified.                      |

---

## 14. Non-Functional Requirements

| Item          | Requirement                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Responsive    | Mobile (375px+). 3-column → tab layout on mobile. Carousel → swipe on mobile.                                  |
| Performance   | Lighthouse 80+. LCP under 2.5s.                                                                                |
| SEO           | `generateMetadata` for `og:title`, `og:description`, `og:image` per recipe page.                               |
| Security      | Supabase RLS — only `authenticated` users can INSERT/UPDATE/DELETE. Public users SELECT `published=true` only. |
| Accessibility | Image `alt`, button `aria-label`, keyboard nav, `prefers-reduced-motion` support.                              |
