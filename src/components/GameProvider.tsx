import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 학년별 데이터 import
import type { WordType } from "../types/word";
import words1 from "../../assets/data/words_gelementary_1.json";
import words2 from "../../assets/data/words_gelementary_2.json";
import words3 from "../../assets/data/words_gelementary_3.json";
import words4 from "../../assets/data/words_gelementary_4.json";
import words5 from "../../assets/data/words_gelementary_5.json";
import words6 from "../../assets/data/words_gelementary_6.json";

export type GradeType = 1 | 2 | 3 | 4 | 5 | 6 | "all";

interface GameContextType {
  currentWord: WordType;
  currentHints: { hint1: string; hint2: string };
  solvedWordIds: string[];
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  currentIndex: number;
  wrongGuesses: string[];
  displayTries: number;
  handlePressLetter: (letter: string) => void;
  stats: {
    wins: number;
    losses: number;
    currentStreak: number;
    bestStreak: number;
  };
  keyboardLayout: "qwerty" | "alphabet";
  toggleKeyboardLayout: () => void;
  gameStatus: "playing" | "won" | "lost";
  handleNext: () => void;
  pickNewWord: () => void;
  markWordAsSolved: () => void;
  resetGame: () => void;
  incrementLosses: () => void;
  currentGrade: GradeType;
  setCurrentGrade: (grade: GradeType) => Promise<void>;
  isLoading: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const gradeToWordList: Record<number, { wordList: WordType[] }> = {
  1: { wordList: words1 as unknown as WordType[] },
  2: { wordList: words2 as unknown as WordType[] },
  3: { wordList: words3 as unknown as WordType[] },
  4: { wordList: words4 as unknown as WordType[] },
  5: { wordList: words5 as unknown as WordType[] },
  6: { wordList: words6 as unknown as WordType[] },
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentWord, setCurrentWord] = useState<WordType>({
    id: "",
    word: "",
    hints: { hint1: "", hint2: "" },
    category: "",
    education: { schoolLevel: "", grade: 1 },
  });
  const [currentHints, setCurrentHints] = useState({ hint1: "", hint2: "" });
  const [solvedWordIds, setSolvedWordIds] = useState<string[]>([]);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [keyboardLayout, setKeyboardLayout] = useState<"qwerty" | "alphabet">(
    "qwerty"
  );
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing"
  );
  const [currentGrade, setCurrentGrade] = useState<GradeType>(1);
  const [wordList, setWordList] = useState<WordType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastInputTime, setLastInputTime] = useState(0);
  const INPUT_DELAY = 300; // 입력 딜레이 (ms)
  const MODAL_DELAY = 500; // 모달 표시 딜레이 (ms)

  const loadWordList = async (grade: GradeType) => {
    console.log("Loading word list for grade:", grade);
    try {
      let newWordList: WordType[] = [];

      // 단어 데이터 확인
      console.log("Available word lists:", Object.keys(gradeToWordList));
      console.log(
        "Grade 1 word list sample:",
        gradeToWordList[1]?.wordList?.[0]
      );

      if (grade === "all") {
        console.log("Loading all grades...");
        // 1~6학년 데이터를 모두 합침
        for (let gradeNum = 1; gradeNum <= 6; gradeNum++) {
          const gradeWords = gradeToWordList[gradeNum]?.wordList || [];
          console.log(`Grade ${gradeNum} words:`, gradeWords.length);
          if (gradeWords.length > 0) {
            console.log(`Sample word from grade ${gradeNum}:`, gradeWords[0]);
          }
          const wordsWithIds = gradeWords.map((word) => ({
            ...word,
            id:
              word.id ||
              `${word.word}_${gradeNum}_${Math.random()
                .toString(36)
                .substring(2, 11)}`,
          }));
          newWordList = [...newWordList, ...wordsWithIds];
        }
        console.log("Total words loaded for all grades:", newWordList.length);
      } else {
        console.log(`Loading grade ${grade}...`);
        const words = gradeToWordList[grade as number]?.wordList || [];
        console.log(`Grade ${grade} words:`, words.length);
        if (words.length > 0) {
          console.log(`Sample word from grade ${grade}:`, words[0]);
        }
        newWordList = words.map((word) => ({
          ...word,
          id:
            word.id ||
            `${word.word}_${grade}_${Math.random()
              .toString(36)
              .substring(2, 11)}`,
        }));
      }

      if (newWordList.length === 0) {
        console.error(`No words available for grade: ${grade}`);
        return null;
      }

      // 단어 목록 샘플 출력
      if (newWordList.length > 0) {
        console.log("Sample from final word list:", {
          firstWord: newWordList[0],
          totalWords: newWordList.length,
        });
      }

      return newWordList;
    } catch (error) {
      console.error("Error loading word list:", error);
      return null;
    }
  };

  const updateCurrentGrade = async (grade: GradeType) => {
    try {
      console.log("Starting grade update process...");
      setIsLoading(true);

      // 게임 상태 초기화
      setSolvedWordIds([]);
      setWins(0);
      setLosses(0);
      setCurrentStreak(0);
      setBestStreak(0);
      setWrongGuesses([]);
      setCurrentIndex(0);
      setGameStatus("playing");

      // 단어 목록 로드
      console.log("Loading word list...");
      const newWordList = await loadWordList(grade);

      if (!newWordList || newWordList.length === 0) {
        console.error("No words available for grade:", grade);
        return;
      }

      // 현재 등급 설정
      console.log("Setting current grade...");
      setCurrentGrade(grade);

      // 단어 목록 설정
      console.log("Setting word list...");
      setWordList(newWordList);

      // 새 단어 선택
      const randomWord =
        newWordList[Math.floor(Math.random() * newWordList.length)];
      console.log("Selected word details:", {
        word: randomWord.word,
        hints: randomWord.hints,
        id: randomWord.id,
      });

      // 상태 업데이트를 동기적으로 처리
      setCurrentWord(randomWord);
      setCurrentHints(randomWord.hints);

      // AsyncStorage 업데이트
      console.log("Updating AsyncStorage...");
      await Promise.all([
        AsyncStorage.setItem("currentGrade", grade.toString()),
        saveGameState(),
      ]);

      // 개발 단계에서 로딩 화면을 확인하기 위한 2초 지연
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Final state check:", {
        currentWord: currentWord,
        currentHints: currentHints,
        grade: currentGrade,
      });
    } catch (error) {
      console.error("Error updating grade:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeGame = async () => {
      try {
        setIsLoading(true);
        console.log("Initializing game...");

        // 데이터 사전 로드
        console.log("Pre-loading word data...");
        for (let grade = 1; grade <= 6; grade++) {
          const words = gradeToWordList[grade]?.wordList || [];
          console.log(`Pre-loaded grade ${grade} words:`, words.length);
          if (words.length === 0) {
            console.error(`No words available for grade ${grade}`);
          }
        }

        const savedGrade = await AsyncStorage.getItem("currentGrade");
        let grade: GradeType = 1; // 기본값을 1학년으로 설정

        if (savedGrade) {
          if (savedGrade === "all") {
            grade = "all";
          } else {
            const parsedGrade = parseInt(savedGrade);
            if (!isNaN(parsedGrade) && parsedGrade >= 1 && parsedGrade <= 6) {
              grade = parsedGrade as GradeType;
            }
          }
        }

        console.log("Loading initial grade:", grade);
        const initialWordList = await loadWordList(grade);

        if (initialWordList && initialWordList.length > 0) {
          const randomWord =
            initialWordList[Math.floor(Math.random() * initialWordList.length)];
          console.log("Setting initial word:", randomWord.word);

          setCurrentGrade(grade);
          setWordList(initialWordList);
          setCurrentWord(randomWord);
          setCurrentHints(randomWord.hints);
        } else {
          console.error("Failed to load initial word list");
        }

        await loadGameState();
      } catch (error) {
        console.error("Error initializing game:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, []);

  const loadGameState = async () => {
    try {
      const savedState = await AsyncStorage.getItem("gameState");
      if (savedState) {
        const state = JSON.parse(savedState);
        setSolvedWordIds(state.solvedWordIds || []);
        setWins(state.wins || 0);
        setLosses(state.losses || 0);
        setCurrentStreak(state.currentStreak || 0);
        setBestStreak(state.bestStreak || 0);
      }
    } catch (error) {
      console.error("Error loading game state:", error);
    }
  };

  const saveGameState = async () => {
    try {
      const state = {
        solvedWordIds,
        wins,
        losses,
        currentStreak,
        bestStreak,
      };
      await AsyncStorage.setItem("gameState", JSON.stringify(state));
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  };

  const pickNewWord = () => {
    if (wordList.length === 0) {
      console.error("No words available");
      return;
    }

    const availableWords = wordList.filter(
      (word) => word.id && !solvedWordIds.includes(word.id)
    );

    if (availableWords.length === 0) {
      // 모든 단어를 다 풀었을 때, 가장 오래된 50%의 단어들을 다시 풀 수 있게 함
      const halfLength = Math.floor(solvedWordIds.length / 2);
      const oldestSolvedWords = solvedWordIds.slice(0, halfLength);
      setSolvedWordIds(solvedWordIds.slice(halfLength));
      const resetWords = wordList.filter(
        (word) => word.id && oldestSolvedWords.includes(word.id)
      );
      if (resetWords.length > 0) {
        const randomWord =
          resetWords[Math.floor(Math.random() * resetWords.length)];
        setCurrentWord(randomWord);
        setCurrentHints(randomWord.hints);
        setWrongGuesses([]);
        setCurrentIndex(0);
        setGameStatus("playing");
      }
    } else {
      const randomWord =
        availableWords[Math.floor(Math.random() * availableWords.length)];
      setCurrentWord(randomWord);
      setCurrentHints(randomWord.hints);
      setWrongGuesses([]);
      setCurrentIndex(0);
      setGameStatus("playing");
    }
  };

  const handleNext = () => {
    setGameStatus("playing");
    setCurrentIndex(0);
    setWrongGuesses([]);
    pickNewWord();
  };

  const handlePressLetter = async (letter: string) => {
    // 게임이 끝난 상태면 입력 무시
    if (gameStatus !== "playing") {
      return;
    }

    const currentTime = Date.now();
    if (currentTime - lastInputTime < INPUT_DELAY) {
      return; // 입력 딜레이 시간이 지나지 않았으면 무시
    }
    setLastInputTime(currentTime);

    // 현재 단어의 currentIndex 위치에 있는 글자와 입력된 글자가 일치하는지 확인
    const correctLetter = currentWord.word.toUpperCase()[currentIndex];

    if (letter === correctLetter) {
      setCurrentIndex((prev) => prev + 1);
      if (currentIndex + 1 === currentWord.word.length) {
        // 승리 처리를 약간 지연
        setGameStatus("won"); // 즉시 상태 변경하여 입력 막기
        await new Promise((resolve) => setTimeout(resolve, MODAL_DELAY));
        markWordAsSolved();
      }
    } else {
      setWrongGuesses((prev) => [...prev, letter]);
      if (wrongGuesses.length + 1 >= 6) {
        // 패배 처리를 약간 지연
        setGameStatus("lost"); // 즉시 상태 변경하여 입력 막기
        await new Promise((resolve) => setTimeout(resolve, MODAL_DELAY));
        incrementLosses();
      }
    }
  };

  const markWordAsSolved = () => {
    if (currentWord && currentWord.id) {
      setSolvedWordIds((prev) => [...prev, currentWord.id as string]);
      setWins((prev) => prev + 1);
      setCurrentStreak((prev) => prev + 1);
      setBestStreak((prev) => Math.max(prev, currentStreak + 1));
      saveGameState();
    }
  };

  const incrementLosses = () => {
    setLosses((prev) => prev + 1);
    setCurrentStreak(0);
    saveGameState();
  };

  const resetGame = () => {
    setSolvedWordIds([]);
    setWins(0);
    setLosses(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setWrongGuesses([]);
    setCurrentIndex(0);
    setGameStatus("playing");
    saveGameState();

    // wordList가 있을 때만 새 단어 선택
    if (wordList.length > 0) {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      setCurrentWord(randomWord);
      setCurrentHints(randomWord.hints);
    }
  };

  const toggleKeyboardLayout = () => {
    setKeyboardLayout((prev) => (prev === "qwerty" ? "alphabet" : "qwerty"));
  };

  const stats = {
    wins,
    losses,
    currentStreak,
    bestStreak,
  };

  const displayTries = 6 - wrongGuesses.length;

  return (
    <GameContext.Provider
      value={{
        currentWord,
        currentHints,
        solvedWordIds,
        wins,
        losses,
        currentStreak,
        bestStreak,
        currentIndex,
        wrongGuesses,
        displayTries,
        handlePressLetter,
        stats,
        keyboardLayout,
        toggleKeyboardLayout,
        gameStatus,
        handleNext,
        pickNewWord,
        markWordAsSolved,
        resetGame,
        incrementLosses,
        currentGrade,
        setCurrentGrade: updateCurrentGrade,
        isLoading,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
