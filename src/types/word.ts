export interface WordType {
  id?: string;
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

export interface WordListType {
  wordList: WordType[];
}
