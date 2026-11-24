import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import CourseList from "./pages/CourseList";
import CourseOverview from "./pages/CourseOverview";
import LessonView from "./pages/LessonView";

function backTarget(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "courses" && parts.length >= 4) {
    return `/courses/${parts[1]}`;
  }
  if (parts[0] === "courses" && parts.length >= 2) {
    return "/";
  }
  return null;
}

function Header() {
  const location = useLocation();
  const backTo = backTarget(location.pathname);

  return (
    <header className="site-header">
      {backTo ? (
        <Link to={backTo} className="header-back">
          Back
        </Link>
      ) : null}
      <Link to="/" className="brand">
        <strong>DevilEars Courses</strong>
        <span>Structured lessons from freeCodeCamp videos</span>
      </Link>
    </header>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="site-main">
        <Routes>
          <Route path="/" element={<CourseList />} />
          <Route path="/courses/:courseId" element={<CourseOverview />} />
          <Route
            path="/courses/:courseId/lessons/:lessonId"
            element={<LessonView />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        Videos stay on YouTube. This app does not re-host or download
        freeCodeCamp videos. All course videos are created by freeCodeCamp.org
        and their instructors.
      </footer>
    </div>
  );
}
