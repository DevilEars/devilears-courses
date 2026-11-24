# DevilEars Courses

A mobile-first web app that turns freeCodeCamp YouTube videos into structured courses: modules, lessons, timestamps, summaries, quizzes, and exercises.

The original videos are **embedded or linked from YouTube**. This project does not re-host or download freeCodeCamp video files. Every course and lesson page credits freeCodeCamp and links back to the original video.

## How to run

You need Node.js 24 or newer.

```bash
cd devilears-courses
npm install
npm run dev
```

Then open the URL Vite prints (usually http://127.0.0.1:5173).

To check a production build:

```bash
npm run build
npm run preview
```

Progress (completed lessons and quiz scores) is stored in your browser’s `localStorage` under the key `devilears-courses-progress`. Clearing site data will reset it.

## Sample courses

These courses are based on freeCodeCamp.org YouTube videos. Each lesson page says whether its summary was written from a transcript or from public chapter titles and the official description.

1. **Learn JavaScript - Full Course for Beginners** by Beau Carnes  
   https://www.youtube.com/watch?v=PkZNo7MFNFg  
   The 100 public chapter timestamps from the video’s course contents are grouped into modules and lessons.

2. **System Design Concepts Course and Interview Prep** by Hayk Simonyan  
   https://www.youtube.com/watch?v=F2FmTdLtb_4  
   All 11 official YouTube chapters are included as lessons, grouped into modules.

3. **System Design Course – APIs, Databases, Caching, CDNs, Load Balancing & Production Infra** by Hayk Simonyan  
   https://www.youtube.com/watch?v=C842vFY5kRo  
   All 15 public course-contents chapters are included as lessons, grouped into modules.

4. **Design Software Systems Like a Senior Engineer – Complete Course** by Hayk Simonyan  
   https://www.youtube.com/watch?v=soTfFFIQQ8U  
   All 28 public description timestamps are included as lessons, grouped into modules.

## How to add a course

1. Create a new JSON file in `public/courses/`, for example `public/courses/my-course-id.json`.
2. Add the course id to `public/courses/index.json`:

   ```json
   {
     "courses": ["learn-javascript-beginners", "my-course-id"]
   }
   ```

3. Use the same shape as `learn-javascript-beginners.json`. The important fields are:

   - `id` — must match the filename (without `.json`)
   - `title`, `description`, `level`, `thumbnailUrl`
   - `summarySource` — `chapters-and-description` or `transcript`
   - `source` — freeCodeCamp credit and YouTube metadata (`name`, `channelUrl`, `creator`, `videoTitle`, `videoId`, `videoUrl`, `duration`, `durationSeconds`)
   - `modules[]` — each with `id`, `title`, and `lessons[]`
   - each lesson: `id`, `title`, `startSeconds`, `endSeconds`, `chapters`, `summary`, `quiz`, and `exercise`

The lesson player starts at `startSeconds` and stops at `endSeconds` using the YouTube embed `start` and `end` parameters. Link the original video with `https://www.youtube.com/watch?v=VIDEO_ID&t=SECONDSs`.

Do not download or check in video files. Only store metadata, text, and YouTube ids.

## Appearance

The interface uses a small design system (CSS variables for color, spacing, and type) and follows your system light or dark preference. A toggle in the header can pin light or dark mode; that choice is stored in `localStorage` under `devilears-courses-theme`. Motion is reduced when `prefers-reduced-motion` is set.

Course cards use the official YouTube thumbnail (`https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg`), plus level and duration badges and a progress bar from `localStorage`.

## Security

This repository has Dependabot alerts and Dependabot security updates enabled, plus GitHub secret scanning with push protection. Weekly Dependabot version updates for npm (grouped minor and patch) and GitHub Actions are configured in `.github/dependabot.yml`.

CI runs `npm audit --audit-level=high` on the lockfile, including devDependencies, and fails the build on high or critical findings. Do not use `npm audit fix --force`. Upgrade the offending package on its own branch and review breaking changes first. Gitleaks also runs on pushes and pull requests as a secret-scanning fallback.

See [SECURITY.md](SECURITY.md) for how to report a vulnerability. The project is licensed under the MIT License (copyright De Villiers Neethling, 2026). Do not commit secrets, `.env` files, or private keys.

