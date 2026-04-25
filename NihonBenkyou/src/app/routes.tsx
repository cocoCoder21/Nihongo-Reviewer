// Injected by vite.config.ts via `define`. Defaults to / and can be
// overridden for sub-path deployments. Declared here to satisfy TS.
declare const __ROUTER_BASENAME__: string;

import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { LearnHub } from "./pages/LearnHub";
import { GrammarLesson } from "./pages/GrammarLesson";
import { WritingLesson } from "./pages/WritingLesson";
import { ListeningLesson } from "./pages/ListeningLesson";
import { VocabularyLesson } from "./pages/VocabularyLesson";
import { KanaLesson } from "./pages/KanaLesson";
import { Quiz } from "./pages/Quiz";
import { LevelSelect } from "./pages/LevelSelect";
import { Practice } from "./pages/Practice";
import { Planner } from "./pages/Planner";
import { Profile } from "./pages/Profile";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

export const router = createBrowserRouter([
  // Public routes
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },

  // Protected routes
  {
    Component: ProtectedRoute,
    children: [
      {
        path: "/",
        Component: AppLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "learn", Component: LearnHub },
          { path: "practice", Component: Practice },
          { path: "planner", Component: Planner },
          { path: "profile", Component: Profile },
          { path: "levels", Component: LevelSelect },
          { path: "quiz", Component: Quiz },
        ],
      },
      { path: "/learn/grammar", Component: GrammarLesson },
      { path: "/learn/vocabulary", Component: VocabularyLesson },
      { path: "/learn/writing", Component: WritingLesson },
      { path: "/learn/listening", Component: ListeningLesson },
      { path: "/learn/kana", Component: KanaLesson },
    ],
  },
], {
  basename: __ROUTER_BASENAME__,
});