# DevilEars Courses

A mobile-first web app that turns freeCodeCamp YouTube videos into structured courses: modules, lessons, timestamps, summaries, quizzes, and exercises.

The original videos are **embedded or linked from YouTube**. This project does not re-host or download freeCodeCamp video files. Every course and lesson page credits freeCodeCamp and links back to the original video.

## How to run

You need Node.js 20 or newer.

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

## Sample course

The first course is built from:

- **Title:** Learn JavaScript - Full Course for Beginners
- **Creator:** Beau Carnes
- **Publisher:** [freeCodeCamp.org](https://www.youtube.com/@freecodecamp)
- **Video:** https://www.youtube.com/watch?v=PkZNo7MFNFg

The 100 public chapter timestamps from the video’s course contents are grouped into modules and lessons. Lesson summaries are written from those chapter titles and the official video description, not from a transcript.

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
   - `source` — freeCodeCamp credit and YouTube metadata (`name`, `channelUrl`, `creator`, `videoTitle`, `videoId`, `videoUrl`, `duration`, `durationSeconds`)
   - `modules[]` — each with `id`, `title`, and `lessons[]`
   - each lesson: `id`, `title`, `startSeconds`, `endSeconds`, `chapters`, `summary`, `quiz`, and `exercise`

The lesson player starts at `startSeconds` and stops at `endSeconds` using the YouTube embed `start` and `end` parameters. Link the original video with `https://www.youtube.com/watch?v=VIDEO_ID&t=SECONDSs`.

Do not download or check in video files. Only store metadata, text, and YouTube ids.
