import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";
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
      <div className="site-header-inner">
        {backTo ? (
          <Link to={backTo} className="header-back">
            Back
          </Link>
        ) : null}
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            DE
          </span>
          <span className="brand-text">
            <strong>DevilEars Courses</strong>
            <span>Structured lessons from freeCodeCamp videos</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="site-main" tabIndex={-1}>
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
