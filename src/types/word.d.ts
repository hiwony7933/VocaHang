export interface WordType {
  id: string;
  word: string;
  hints: {
    hint1: string;
    hint2: string;
  };
  category: string;
  education: {
    schoolLevel: string;
    grade: number;
  };
}
