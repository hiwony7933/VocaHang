export interface WordItem {
  id: string;
  word: string;
  hints: {
    hint1: string;
    hint2: string;
  };
  category: string;
  education: {
    schoolLevel: "elementary" | "middle" | "high";
    grade: number;
  };
}
