import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { LearnHub } from "./pages/LearnHub";
import { GrammarLesson } from "./pages/GrammarLesson";
import { WritingLesson } from "./pages/WritingLesson";
import { ListeningLesson } from "./pages/ListeningLesson";
import { SpeakingLesson } from "./pages/SpeakingLesson";
import { VocabularyLesson } from "./pages/VocabularyLesson";
import { Quiz } from "./pages/Quiz";
import { LevelSelect } from "./pages/LevelSelect";
import { Practice } from "./pages/Practice";
import { Planner } from "./pages/Planner";
import { Profile } from "./pages/Profile";

export const router = createBrowserRouter([
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
  { path: "/learn/speaking", Component: SpeakingLesson },
]);