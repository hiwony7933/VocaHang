import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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

// MAX_TRIES export 추가
export const MAX_TRIES = 6; // 최대 시도 횟수 정의

// 새로운 타입 정의
export interface LetterPickFeedbackInfo {
  type: "letterPickFeedback";
  message: string;
  feedbackType: "correct" | "incorrect";
  remainingTries: number;
}

interface GameContextType {
  currentWord: WordType;
  currentHints: { hint1: string; hint2?: string };
  solvedWordIds: string[];
  currentIndex: number;
  displayTries: number;
  stats: {
    wins: number;
    losses: number;
    currentStreak: number;
    bestStreak: number;
  };
  gameStatus: "playing" | "won" | "lost"; // 'lost_pending_modal_close' 같은 중간 상태는 일단 제외
  handleNext: () => void;
  pickNewWord: (list: WordType[], solvedIds: string[]) => void;
  markWordAsSolved: (solvedWordId: string) => void;
  resetGame: () => void;
  currentGrade: GradeType;
  setCurrentGrade: (grade: GradeType) => Promise<void>;
  isLoading: boolean;
  mileage: number;
  addMileage: (points: number) => Promise<void>;
  shuffledWordHint?: string[];
  processUserAnswer: (attemptedWord: string) => void;
  handleIncorrectLetterPick: () => void;
  wordForModal: WordType | LetterPickFeedbackInfo | null;
  setWordForModal: React.Dispatch<
    React.SetStateAction<WordType | LetterPickFeedbackInfo | null>
  >;
  handleCorrectLetterPickFeedback: () => void;
  finalizeDefeat: () => void;
  loadGameState?: () => Promise<void>;
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

// Fisher-Yates (aka Knuth) Shuffle 함수
const shuffleArray = (array: string[]) => {
  let currentIndex = array.length,
    randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentWord, setCurrentWord] = useState<WordType>({
    id: "INITIAL_PLACEHOLDER",
    word: "",
    hints: { hint1: "", hint2: "" },
    category: "",
    education: { schoolLevel: "elementary", grade: 1 },
  });
  const [wordForModal, setWordForModal] = useState<
    WordType | LetterPickFeedbackInfo | null
  >(null);
  const [currentHints, setCurrentHints] = useState<{
    hint1: string;
    hint2?: string;
  }>({ hint1: "" });
  const [solvedWordIds, setSolvedWordIds] = useState<string[]>([]);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing"
  );
  const [currentGrade, setCurrentGrade] = useState<GradeType>(1);
  const [wordList, setWordList] = useState<WordType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mileage, setMileage] = useState(0);
  const [shuffledWordHint, setShuffledWordHint] = useState<
    string[] | undefined
  >(undefined);
  const [displayTries, setDisplayTries] = useState(MAX_TRIES);

  const loadWordList = useCallback(async (grade: GradeType) => {
    console.log("Loading word list for grade (memoized):", grade);
    try {
      let newWordList: WordType[] = [];
      if (grade === "all") {
        for (let gradeNum = 1; gradeNum <= 6; gradeNum++) {
          const gradeWords = gradeToWordList[gradeNum]?.wordList || [];
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
      } else {
        const words = gradeToWordList[grade as number]?.wordList || [];
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
      return newWordList;
    } catch (error) {
      console.error("Error loading word list:", error);
      return null;
    }
  }, []);

  const pickNewWord = useCallback(
    (list: WordType[], solvedIdsArg: string[]) => {
      console.log("Picking new word (memoized - revised dependencies)");
      setIsLoading(true);
      setGameStatus("playing");
      setWordForModal(null);
      setCurrentWord((prev) => ({
        id: prev?.id || "loading...",
        word: "",
        hints: { hint1: "", hint2: "" },
        category: prev?.category || "",
        education: prev?.education || { schoolLevel: "elementary", grade: 1 },
      }));
      setCurrentHints({ hint1: "" });
      const availableWords = list.filter(
        (word) => word.id && !solvedIdsArg.includes(word.id)
      );
      if (availableWords.length === 0) {
        if (list.length > 0) {
          setCurrentWord({
            id: "ALL_SOLVED_PLACEHOLDER",
            word: "ALL SOLVED!",
            hints: { hint1: "축하합니다! 다음 학년에 도전하세요.", hint2: "" },
            category: "Congratulations",
            education: {
              schoolLevel: "elementary",
              grade: typeof currentGrade === "number" ? currentGrade : 1,
            },
          });
          setCurrentHints({
            hint1: "축하합니다! 다음 학년에 도전하세요.",
            hint2: "",
          });
        } else {
          setCurrentWord({
            id: "NODATA",
            word: "NODATA",
            hints: { hint1: "데이터 없음", hint2: "" },
            category: "",
            education: { schoolLevel: "elementary", grade: 1 },
          });
          setCurrentHints({ hint1: "데이터 없음", hint2: "" });
          setDisplayTries(0);
        }
        setShuffledWordHint(undefined);
        setIsLoading(false);
        return;
      }
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      const newWordToSet = availableWords[randomIndex];
      if (newWordToSet && newWordToSet.word && newWordToSet.id) {
        setCurrentWord(newWordToSet);
        setCurrentHints({
          hint1: newWordToSet.hints.hint1,
          hint2: newWordToSet.hints.hint2,
        });
        const wordChars = newWordToSet.word.toUpperCase().split("");
        setShuffledWordHint(shuffleArray(wordChars));
      } else {
        setCurrentWord({
          id: "ERROR_PICK",
          word: "PICK_ERROR",
          hints: { hint1: "단어 선택 오류", hint2: "" },
          category: "",
          education: { schoolLevel: "elementary", grade: 1 },
        });
        setCurrentHints({ hint1: "단어 선택 오류", hint2: "" });
        setShuffledWordHint(undefined);
      }
      setDisplayTries(MAX_TRIES);
      setIsLoading(false);
    },
    [
      currentGrade,
      setIsLoading,
      setGameStatus,
      setWordForModal,
      setCurrentWord,
      setCurrentHints,
      setShuffledWordHint,
      setDisplayTries,
    ]
  );

  const loadGameState = useCallback(async () => {
    console.log("Loading game state (memoized)");
    setIsLoading(true);
    try {
      const savedGrade = (await AsyncStorage.getItem(
        "currentGrade"
      )) as GradeType;
      const currentGradeToLoad = savedGrade || (1 as GradeType);
      setCurrentGrade(currentGradeToLoad);

      const savedGameStateString = await AsyncStorage.getItem("gameState");
      let loadedSolvedIds: string[] = [];
      if (savedGameStateString) {
        const savedGameData = JSON.parse(savedGameStateString);
        if (savedGameData) {
          if (savedGameData.wins !== undefined) setWins(savedGameData.wins);
          if (savedGameData.losses !== undefined)
            setLosses(savedGameData.losses);
          if (savedGameData.currentStreak !== undefined)
            setCurrentStreak(savedGameData.currentStreak);
          if (savedGameData.bestStreak !== undefined)
            setBestStreak(savedGameData.bestStreak);
          if (savedGameData.currentIndex !== undefined)
            setCurrentIndex(savedGameData.currentIndex);
          if (savedGameData.solvedWordIds !== undefined)
            loadedSolvedIds = savedGameData.solvedWordIds;
        }
      }
      setSolvedWordIds(loadedSolvedIds);

      const newWordList = await loadWordList(currentGradeToLoad);
      if (newWordList && newWordList.length > 0) {
        setWordList(newWordList);
        pickNewWord(newWordList, loadedSolvedIds);
      } else if (currentGradeToLoad) {
        const fallbackWordList = await loadWordList(1);
        if (fallbackWordList && fallbackWordList.length > 0) {
          setWordList(fallbackWordList);
          pickNewWord(fallbackWordList, []);
        } else {
          console.error("Fallback word list also failed to load.");
        }
      }

      const savedMileage = await AsyncStorage.getItem("userMileage");
      if (savedMileage !== null) setMileage(parseInt(savedMileage, 10));
      else setMileage(0);
    } catch (error) {
      console.error("Error loading game state:", error);
      setMileage(0);
      const fallbackWordList = await loadWordList(1);
      if (fallbackWordList && fallbackWordList.length > 0) {
        setWordList(fallbackWordList);
        pickNewWord(fallbackWordList, []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    loadWordList,
    pickNewWord,
    setIsLoading,
    setCurrentGrade,
    setWins,
    setLosses,
    setCurrentStreak,
    setBestStreak,
    setCurrentIndex,
    setSolvedWordIds,
    setWordList,
    setMileage,
  ]);

  const initializeGame = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadGameState();
    } catch (error) {
      console.error("Error initializing game:", error);
    } finally {
      setIsLoading(false);
    }
  }, [loadGameState, setIsLoading]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const updateCurrentGrade = useCallback(
    async (grade: GradeType) => {
      setIsLoading(true);
      setWordForModal(null);
      setSolvedWordIds([]);
      setWins(0);
      setLosses(0);
      setCurrentStreak(0);
      setCurrentIndex(0);
      setGameStatus("playing");
      setDisplayTries(MAX_TRIES);

      const newWordList = await loadWordList(grade);
      if (!newWordList || newWordList.length === 0) {
        console.error("No words available for grade:", grade);
        setIsLoading(false);
        return;
      }
      setCurrentGrade(grade);
      setWordList(newWordList);
      pickNewWord(newWordList, []);
      await AsyncStorage.setItem("currentGrade", grade.toString());
      setIsLoading(false);
    },
    [
      loadWordList,
      pickNewWord,
      setIsLoading,
      setWordForModal,
      setSolvedWordIds,
      setWins,
      setLosses,
      setCurrentStreak,
      setCurrentIndex,
      setGameStatus,
      setDisplayTries,
      setCurrentGrade,
      setWordList,
    ]
  );

  const saveGameState = useCallback(async () => {
    try {
      const gameStateToSave = {
        solvedWordIds,
        wins,
        losses,
        currentStreak,
        bestStreak,
        currentIndex,
        currentGrade,
      };
      await AsyncStorage.setItem("gameState", JSON.stringify(gameStateToSave));
    } catch (error) {
      console.error("Failed to save game state:", error);
    }
  }, [
    solvedWordIds,
    wins,
    losses,
    currentStreak,
    bestStreak,
    currentIndex,
    currentGrade,
  ]);

  useEffect(() => {
    if (
      currentWord &&
      currentWord.id !== "INITIAL_PLACEHOLDER" &&
      currentWord.id !== "loading..."
    ) {
      saveGameState();
    }
  }, [
    wins,
    losses,
    currentStreak,
    bestStreak,
    solvedWordIds,
    currentGrade,
    currentWord,
    saveGameState,
  ]);

  const handleNext = useCallback(() => {
    setWordForModal(null);
    if (wordList.length > 0) {
      pickNewWord(wordList, solvedWordIds);
    } else {
      console.warn("Word list is empty, cannot pick next word.");
    }
  }, [pickNewWord, wordList, solvedWordIds, setWordForModal]);

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
      let soundObjectToPlay: Audio.Sound | null = null;

      switch (soundType) {
        case "wrong":
          if (!wrongSoundObject) {
            wrongSoundObject = new Audio.Sound();
            await wrongSoundObject.loadAsync(wrongSound);
          }
          soundObjectToPlay = wrongSoundObject;
          break;
        case "correct":
          if (!correctSoundObject) {
            correctSoundObject = new Audio.Sound();
            await correctSoundObject.loadAsync(correctSound);
          }
          soundObjectToPlay = correctSoundObject;
          break;
        case "success":
          if (!completeSuccessSoundObject) {
            completeSuccessSoundObject = new Audio.Sound();
            await completeSuccessSoundObject.loadAsync(completeSuccessSound);
          }
          soundObjectToPlay = completeSuccessSoundObject;
          break;
        case "fail":
          if (!completeFailSoundObject) {
            completeFailSoundObject = new Audio.Sound();
            await completeFailSoundObject.loadAsync(completeFailSound);
          }
          soundObjectToPlay = completeFailSoundObject;
          break;
      }

      if (soundObjectToPlay) {
        await soundObjectToPlay.replayAsync(); // 기존 재생 중이면 중지하고 처음부터 재생
      }
    } catch (error) {
      console.error(`Error playing ${soundType} sound:`, error);
    }
  };

  // 컴포넌트 마운트/언마운트 시 사운드 로드/해제
  useEffect(() => {
    preloadSounds();
    return () => {
      unloadSounds();
    };
  }, []);

  const markWordAsSolved = useCallback(
    (solvedWordId: string) => {
      if (solvedWordId) {
        setSolvedWordIds((prev) => [...prev, solvedWordId]);
      }
    },
    [setSolvedWordIds]
  );

  const resetGame = useCallback(() => {
    console.log("Resetting game...");
    setIsLoading(true);
    setWordForModal(null);
    updateCurrentGrade(currentGrade)
      .then(() => {
        console.log("Game reset complete for grade:", currentGrade);
      })
      .catch((error) => {
        console.error("Error resetting game:", error);
      })
      .then(
        () => {
          setIsLoading(false);
        },
        () => {
          setIsLoading(false);
        }
      );
  }, [updateCurrentGrade, currentGrade, setIsLoading, setWordForModal]);

  const stats = {
    wins,
    losses,
    currentStreak,
    bestStreak,
  };

  // 마일리지 추가 함수 구현
  const addMileage = useCallback(
    async (points: number) => {
      setMileage((prevMileage) => {
        const newMileage = prevMileage + points;
        AsyncStorage.setItem("userMileage", newMileage.toString());
        return newMileage;
      });
    },
    [setMileage]
  );

  const handleIncorrectLetterPick = useCallback(() => {
    playSound("wrong");
    const newTries = displayTries - 1;
    setDisplayTries(newTries);

    setWordForModal({
      type: "letterPickFeedback",
      message: "틀렸어요!",
      feedbackType: "incorrect",
      remainingTries: newTries,
    });
  }, [displayTries, setDisplayTries, setWordForModal, playSound]);

  const handleCorrectLetterPickFeedback = useCallback(() => {
    playSound("correct");
    setWordForModal({
      type: "letterPickFeedback",
      message: "맞았어요!",
      feedbackType: "correct",
      remainingTries: displayTries,
    });
  }, [displayTries, setDisplayTries, setWordForModal, playSound]);

  const processUserAnswer = useCallback(
    (attemptedWord: string) => {
      if (
        !currentWord ||
        !currentWord.word ||
        !currentWord.id ||
        attemptedWord.toUpperCase() !== currentWord.word.toUpperCase()
      ) {
        console.warn(
          "processUserAnswer called with incorrect word or invalid state"
        );
        return;
      }

      const solution = currentWord.word.toUpperCase();
      const currentWordId = currentWord.id;

      markWordAsSolved(currentWordId);
      const pointsEarned = solution.length >= 5 ? 20 : 10;
      addMileage(pointsEarned);
      setWins((prev) => prev + 1);
      setCurrentStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        return newStreak;
      });

      setGameStatus("won");
      setWordForModal(currentWord);
      setShuffledWordHint(undefined);
      playSound("success");

      saveGameState();
    },
    [
      currentWord,
      markWordAsSolved,
      addMileage,
      setWins,
      setCurrentStreak,
      setBestStreak,
      setGameStatus,
      setWordForModal,
      setShuffledWordHint,
      playSound,
      saveGameState,
    ]
  );

  const finalizeDefeat = useCallback(() => {
    setLosses((prevLosses) => prevLosses + 1);
    setCurrentStreak(0);
    setGameStatus("lost");
    setWordForModal(currentWord);
    playSound("fail");
    saveGameState();
  }, [
    currentWord,
    setLosses,
    setCurrentStreak,
    setGameStatus,
    setWordForModal,
    playSound,
    saveGameState,
  ]);

  const contextValue: GameContextType = {
    currentWord,
    currentHints,
    solvedWordIds,
    currentIndex,
    displayTries,
    stats,
    gameStatus,
    handleNext,
    pickNewWord,
    markWordAsSolved,
    resetGame,
    currentGrade,
    setCurrentGrade: updateCurrentGrade,
    isLoading,
    mileage,
    addMileage,
    shuffledWordHint,
    processUserAnswer,
    handleIncorrectLetterPick,
    wordForModal,
    setWordForModal,
    handleCorrectLetterPickFeedback,
    finalizeDefeat,
    loadGameState,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
