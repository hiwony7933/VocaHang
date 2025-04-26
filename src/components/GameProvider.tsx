import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

// 학년별 데이터 import
import type { WordType } from "../types/word";
import words1 from "../../assets/data/words_gelementary_1.json";
import words2 from "../../assets/data/words_gelementary_2.json";
import words3 from "../../assets/data/words_gelementary_3.json";
import words4 from "../../assets/data/words_gelementary_4.json";
import words5 from "../../assets/data/words_gelementary_5.json";
import words6 from "../../assets/data/words_gelementary_6.json";

// 사운드 파일 import
import wrongSound from "../../assets/sounds/jia_fail_shot_1.m4a";
import correctSound from "../../assets/sounds/jiho_good_shot_1.m4a";
import completeSuccessSound from "../../assets/sounds/jiho_jia_complete_1.m4a";
import completeFailSound from "../../assets/sounds/jia_fail_2.m4a";

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
  showHowToPlayOnStart: boolean;
  setShowHowToPlayOnStart: (show: boolean) => void;
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

// 사운드 객체를 저장할 변수들
let wrongSoundObject: Audio.Sound | null = null;
let correctSoundObject: Audio.Sound | null = null;
let completeSuccessSoundObject: Audio.Sound | null = null;
let completeFailSoundObject: Audio.Sound | null = null;

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
  const [showHowToPlayOnStart, setShowHowToPlayState] = useState(true);
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

  const initializeGame = async () => {
    setIsLoading(true);
    try {
      await loadGameState(); // 게임 상태 로드
      // 저장된 키보드 레이아웃 불러오기
      const savedLayout = await AsyncStorage.getItem("keyboardLayout");
      if (savedLayout === "alphabet" || savedLayout === "qwerty") {
        setKeyboardLayout(savedLayout);
      }

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
    } catch (error) {
      console.error("Error initializing game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGameState = async () => {
    try {
      const savedData = await AsyncStorage.getItem("gameState");
      if (savedData) {
        const {
          solvedWordIds = [],
          wins = 0,
          losses = 0,
          currentStreak = 0,
          bestStreak = 0,
          currentIndex = 0,
          keyboardLayout = "qwerty",
          currentGrade = 1,
          showHowToPlayOnStart = true,
        } = JSON.parse(savedData);

        setSolvedWordIds(solvedWordIds);
        setWins(wins);
        setLosses(losses);
        setCurrentStreak(currentStreak);
        setBestStreak(bestStreak);
        setCurrentIndex(currentIndex);
        setKeyboardLayout(keyboardLayout);
        setCurrentGrade(currentGrade);
        setShowHowToPlayState(showHowToPlayOnStart);

        // 현재 등급에 맞는 단어 목록 로드
        const newWordList = await loadWordList(currentGrade);
        if (newWordList && newWordList.length > 0) {
          setWordList(newWordList);
          pickNewWord();
        }
      }
    } catch (error) {
      console.error("Failed to load game state:", error);
    }
  };

  const saveGameState = async () => {
    try {
      const gameState = {
        solvedWordIds,
        wins,
        losses,
        currentStreak,
        bestStreak,
        currentIndex,
        keyboardLayout,
        currentGrade,
        showHowToPlayOnStart,
      };
      await AsyncStorage.setItem("gameState", JSON.stringify(gameState));
    } catch (error) {
      console.error("Failed to save game state:", error);
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

  // 사운드 파일 미리 로드
  const preloadSounds = async () => {
    try {
      console.log("Preloading sounds...");
      const { sound: wrong } = await Audio.Sound.createAsync(wrongSound);
      const { sound: correct } = await Audio.Sound.createAsync(correctSound);
      const { sound: success } = await Audio.Sound.createAsync(
        completeSuccessSound
      );
      const { sound: fail } = await Audio.Sound.createAsync(completeFailSound);

      wrongSoundObject = wrong;
      correctSoundObject = correct;
      completeSuccessSoundObject = success;
      completeFailSoundObject = fail;

      console.log("Sounds preloaded successfully");
    } catch (error) {
      console.error("Error preloading sounds:", error);
    }
  };

  // 컴포넌트 언마운트 시 사운드 객체 해제
  const unloadSounds = async () => {
    try {
      if (wrongSoundObject) await wrongSoundObject.unloadAsync();
      if (correctSoundObject) await correctSoundObject.unloadAsync();
      if (completeSuccessSoundObject)
        await completeSuccessSoundObject.unloadAsync();
      if (completeFailSoundObject) await completeFailSoundObject.unloadAsync();

      wrongSoundObject = null;
      correctSoundObject = null;
      completeSuccessSoundObject = null;
      completeFailSoundObject = null;
    } catch (error) {
      console.error("Error unloading sounds:", error);
    }
  };

  // 사운드 재생 함수 수정
  const playSound = async (
    soundType: "wrong" | "correct" | "success" | "fail"
  ) => {
    try {
      let soundObject = null;
      switch (soundType) {
        case "wrong":
          soundObject = wrongSoundObject;
          break;
        case "correct":
          soundObject = correctSoundObject;
          break;
        case "success":
          soundObject = completeSuccessSoundObject;
          break;
        case "fail":
          soundObject = completeFailSoundObject;
          break;
      }

      if (soundObject) {
        await soundObject.setPositionAsync(0); // 재생 위치 초기화
        await soundObject.playAsync();
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // 컴포넌트 마운트/언마운트 시 사운드 로드/해제
  useEffect(() => {
    preloadSounds();
    return () => {
      unloadSounds();
    };
  }, []);

  const handlePressLetter = async (letter: string) => {
    if (gameStatus !== "playing") return;

    const currentTime = Date.now();
    if (currentTime - lastInputTime < INPUT_DELAY) return;
    setLastInputTime(currentTime);

    const correctLetter = currentWord.word.toUpperCase()[currentIndex];

    if (letter === correctLetter) {
      setCurrentIndex((prev) => prev + 1);
      if (currentIndex + 1 === currentWord.word.length) {
        setGameStatus("won");
        await playSound("success");
        await new Promise((resolve) => setTimeout(resolve, MODAL_DELAY));
        markWordAsSolved();
      } else {
        await playSound("correct");
      }
    } else {
      setWrongGuesses((prev) => [...prev, letter]);
      if (wrongGuesses.length + 1 >= 6) {
        setGameStatus("lost");
        await playSound("fail");
        await new Promise((resolve) => setTimeout(resolve, MODAL_DELAY));
        incrementLosses();
      } else if (currentIndex + 1 < currentWord.word.length) {
        await playSound("wrong");
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

  const toggleKeyboardLayout = async () => {
    const newLayout = keyboardLayout === "qwerty" ? "alphabet" : "qwerty";
    setKeyboardLayout(newLayout);
    await saveGameState();
  };

  const setShowHowToPlayOnStart = async (show: boolean) => {
    setShowHowToPlayState(show);
    await saveGameState();
  };

  const stats = {
    wins,
    losses,
    currentStreak,
    bestStreak,
  };

  const displayTries = 6 - wrongGuesses.length;

  // 게임 상태 변경 시 저장
  useEffect(() => {
    saveGameState();
  }, [
    wins,
    losses,
    currentStreak,
    bestStreak,
    solvedWordIds,
    currentIndex,
    keyboardLayout,
    currentGrade,
    showHowToPlayOnStart,
  ]);

  // 최초 렌더링 시 게임 초기화
  useEffect(() => {
    initializeGame();
  }, []);

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
        showHowToPlayOnStart,
        setShowHowToPlayOnStart,
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
