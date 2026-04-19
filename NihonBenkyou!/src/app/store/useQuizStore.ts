import { create } from 'zustand';
import { type JLPTLevel, type QuizQuestion, generateQuiz } from '../data/levels';

interface QuizStore {
  questions: QuizQuestion[];
  currentIndex: number;
  selectedAnswer: number | null;
  isSubmitted: boolean;
  score: number;
  isComplete: boolean;
  answers: (number | null)[];
  startQuiz: (level: JLPTLevel, count?: number) => void;
  selectAnswer: (index: number) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  questions: [],
  currentIndex: 0,
  selectedAnswer: null,
  isSubmitted: false,
  score: 0,
  isComplete: false,
  answers: [],

  startQuiz: (level, count = 10) => {
    const questions = generateQuiz(level, count);
    set({
      questions,
      currentIndex: 0,
      selectedAnswer: null,
      isSubmitted: false,
      score: 0,
      isComplete: false,
      answers: new Array(questions.length).fill(null),
    });
  },

  selectAnswer: (index) => {
    if (get().isSubmitted) return;
    set({ selectedAnswer: index });
  },

  submitAnswer: () => {
    const state = get();
    if (state.selectedAnswer === null || state.isSubmitted) return;
    const question = state.questions[state.currentIndex];
    const isCorrect = state.selectedAnswer === question.correctIndex;
    const answers = [...state.answers];
    answers[state.currentIndex] = state.selectedAnswer;

    set({
      isSubmitted: true,
      score: isCorrect ? state.score + 1 : state.score,
      answers,
    });
  },

  nextQuestion: () => {
    const state = get();
    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.questions.length) {
      set({ isComplete: true });
    } else {
      set({
        currentIndex: nextIndex,
        selectedAnswer: null,
        isSubmitted: false,
      });
    }
  },

  resetQuiz: () => set({
    questions: [],
    currentIndex: 0,
    selectedAnswer: null,
    isSubmitted: false,
    score: 0,
    isComplete: false,
    answers: [],
  }),
}));
