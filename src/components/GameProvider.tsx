import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
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
  gameStatus: "playing" | "won" | "lost";
  handleNext: () => void;
  pickNewWord: (
    list: WordType[],
    solvedIds: string[],
    gradeOfList: GradeType
  ) => void;
  markWordAsSolved: (solvedWordId: string, gradeOfWord: GradeType) => void;
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
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({
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
  const [currentGrade, setCurrentGradeInternal] = useState<GradeType>(1);
  const [wordList, setWordList] = useState<WordType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mileage, setMileage] = useState(0);
  const [shuffledWordHint, setShuffledWordHint] = useState<
    string[] | undefined
  >(undefined);
  const [displayTries, setDisplayTries] = useState(MAX_TRIES);

  const loadWordList = useCallback(async (grade: GradeType) => {
    console.log(
      "[GameProvider] Loading word list for grade (memoized):",
      grade
    );
    try {
      let newWordList: WordType[] = [];
      if (grade === "all") {
        for (let gradeNum = 1; gradeNum <= 6; gradeNum++) {
          const gradeWords = gradeToWordList[gradeNum]?.wordList || [];
          const wordsWithIds = gradeWords.map((word, index) => ({
            ...word,
            id:
              word.id ||
              `${word.word}_${gradeNum}_${index}_${Math.random()
                .toString(36)
                .substring(2, 11)}`,
          }));
          newWordList = [...newWordList, ...wordsWithIds];
        }
      } else {
        const words = gradeToWordList[grade as number]?.wordList || [];
        newWordList = words.map((word, index) => ({
          ...word,
          id:
            word.id ||
            `${word.word}_${grade}_${index}_${Math.random()
              .toString(36)
              .substring(2, 11)}`,
        }));
      }
      if (newWordList.length === 0) {
        console.warn(`[GameProvider] No words available for grade: ${grade}`);
        return null;
      }
      return newWordList;
    } catch (error) {
      console.error("[GameProvider] Error loading word list:", error);
      return null;
    }
  }, []);

  const pickNewWord = useCallback(
    (list: WordType[], solvedIdsArg: string[], gradeOfList: GradeType) => {
      console.log(
        `[GameProvider] Picking new word for grade ${gradeOfList}. Solved IDs count: ${solvedIdsArg.length}`
      );
      setIsLoading(true);
      setGameStatus("playing");
      setWordForModal(null);

      const availableWords = list.filter(
        (word) => word.id && !solvedIdsArg.includes(word.id)
      );

      if (availableWords.length === 0) {
        const placeholderWord = list.length > 0 ? "ALL_SOLVED" : "NO_WORDS";
        const placeholderMessage =
          list.length > 0
            ? "축하합니다! 모든 단어를 맞췄어요."
            : "단어 데이터가 없습니다.";

        setCurrentWord({
          id: placeholderWord,
          word: placeholderWord,
          hints: { hint1: placeholderMessage, hint2: "" },
          category:
            placeholderWord === "ALL_SOLVED" ? "Congratulations" : "Error",
          education: {
            schoolLevel: "elementary",
            grade: typeof gradeOfList === "number" ? gradeOfList : 1,
          },
        });
        setCurrentHints({ hint1: placeholderMessage, hint2: "" });
        setShuffledWordHint(undefined);
        setDisplayTries(list.length > 0 ? MAX_TRIES : 0);
        setIsLoading(false);
        console.log(
          `[GameProvider] No available words. Setting placeholder: ${placeholderWord}`
        );
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
        console.log(
          `[GameProvider] Picked new word: ${newWordToSet.word} (id: ${newWordToSet.id})`
        );
      } else {
        console.error(
          "[GameProvider] Error picking new word - newWordToSet is invalid."
        );
        setCurrentWord({
          id: "ERROR_PICK",
          word: "PICK_ERROR",
          hints: { hint1: "단어 선택 오류", hint2: "" },
          category: "Error",
          education: {
            schoolLevel: "elementary",
            grade: typeof gradeOfList === "number" ? gradeOfList : 1,
          },
        });
        setCurrentHints({ hint1: "단어 선택 오류", hint2: "" });
        setShuffledWordHint(undefined);
      }
      setDisplayTries(MAX_TRIES);
      setIsLoading(false);
    },
    [
      setIsLoading,
      setGameStatus,
      setWordForModal,
      setCurrentWord,
      setCurrentHints,
      setShuffledWordHint,
      setDisplayTries,
    ]
  );

  const loadSolvedWordIds = useCallback(
    async (grade: GradeType): Promise<string[]> => {
      const key = `solvedWordIds_${grade}`;
      try {
        const savedIdsString = await AsyncStorage.getItem(key);
        const loadedIds = savedIdsString ? JSON.parse(savedIdsString) : [];
        console.log(
          `[GameProvider] Loaded solvedWordIds for grade ${grade} (${key}):`,
          loadedIds.length
        );
        return loadedIds;
      } catch (error) {
        console.error(
          `[GameProvider] Error loading solvedWordIds for grade ${grade} (${key}):`,
          error
        );
        return [];
      }
    },
    []
  );

  const saveSolvedWordIds = useCallback(
    async (grade: GradeType, ids: string[]) => {
      const key = `solvedWordIds_${grade}`;
      try {
        await AsyncStorage.setItem(key, JSON.stringify(ids));
        console.log(
          `[GameProvider] Saved solvedWordIds for grade ${grade} (${key}):`,
          ids.length
        );
      } catch (error) {
        console.error(
          `[GameProvider] Error saving solvedWordIds for grade ${grade} (${key}):`,
          error
        );
      }
    },
    []
  );

  const updateCurrentGrade = useCallback(
    async (newGrade: GradeType) => {
      console.log(
        "[GameProvider] updateCurrentGrade called with newGrade:",
        newGrade
      );
      setIsLoading(true);
      setWordForModal(null);

      setCurrentGradeInternal(newGrade);

      setWins(0);
      setLosses(0);
      setCurrentStreak(0);
      setBestStreak(0);
      setCurrentIndex(0);
      setGameStatus("playing");
      setDisplayTries(MAX_TRIES);

      const newWordList = await loadWordList(newGrade);
      if (!newWordList || newWordList.length === 0) {
        console.warn(
          `[GameProvider] No words available for new grade: ${newGrade}`
        );
        setWordList([]);
        setSolvedWordIds([]);
        setCurrentWord({
          id: "NO_WORDS_FOR_GRADE",
          word: "NO WORDS",
          hints: { hint1: "해당 학년의 단어가 없습니다.", hint2: "" },
          category: "Error",
          education: {
            schoolLevel: "elementary",
            grade: typeof newGrade === "number" ? newGrade : 0,
          },
        });
        setShuffledWordHint(undefined);
        await AsyncStorage.setItem("currentGrade", newGrade.toString());
        setIsLoading(false);
        return;
      }

      setWordList(newWordList);
      const newSolvedIds = await loadSolvedWordIds(newGrade);
      setSolvedWordIds(newSolvedIds);

      pickNewWord(newWordList, newSolvedIds, newGrade);

      await AsyncStorage.setItem("currentGrade", newGrade.toString());
      console.log(
        "[GameProvider] Grade updated in AsyncStorage and state to:",
        newGrade
      );
      setIsLoading(false);
    },
    [
      loadWordList,
      pickNewWord,
      setIsLoading,
      setWordForModal,
      setWins,
      setLosses,
      setCurrentStreak,
      setBestStreak,
      setCurrentIndex,
      setGameStatus,
      setDisplayTries,
      setCurrentGradeInternal,
      setWordList,
      setSolvedWordIds,
      loadSolvedWordIds,
    ]
  );

  const loadGameState = useCallback(async () => {
    console.log("[GameProvider] loadGameState called");
    setIsLoading(true);
    try {
      const savedGradeString = await AsyncStorage.getItem("currentGrade");
      let gradeToLoad: GradeType = 1;
      if (savedGradeString) {
        gradeToLoad =
          savedGradeString === "all"
            ? "all"
            : (parseInt(savedGradeString, 10) as GradeType);
      }
      console.log(
        "[GameProvider] Initial grade to load from AsyncStorage:",
        gradeToLoad
      );
      setCurrentGradeInternal(gradeToLoad);

      const savedStatsString = await AsyncStorage.getItem("gameStats");
      if (savedStatsString) {
        const savedStats = JSON.parse(savedStatsString);
        setWins(savedStats.wins || 0);
        setLosses(savedStats.losses || 0);
        setCurrentStreak(savedStats.currentStreak || 0);
        setBestStreak(savedStats.bestStreak || 0);
      }

      const newWordList = await loadWordList(gradeToLoad);
      if (newWordList && newWordList.length > 0) {
        setWordList(newWordList);
        const loadedSolvedIds = await loadSolvedWordIds(gradeToLoad);
        setSolvedWordIds(loadedSolvedIds);
        pickNewWord(newWordList, loadedSolvedIds, gradeToLoad);
      } else {
        console.warn(
          `[GameProvider] Word list for initial grade ${gradeToLoad} is empty. Trying fallback to grade 1.`
        );
        setCurrentGradeInternal(1);
        await AsyncStorage.setItem("currentGrade", "1");
        const fallbackWordList = await loadWordList(1);
        if (fallbackWordList && fallbackWordList.length > 0) {
          setWordList(fallbackWordList);
          const fallbackSolvedIds = await loadSolvedWordIds(1);
          setSolvedWordIds(fallbackSolvedIds);
          pickNewWord(fallbackWordList, fallbackSolvedIds, 1);
        } else {
          console.error(
            "[GameProvider] Fallback word list (grade 1) also failed to load."
          );
          setCurrentWord({
            id: "FATAL_NO_WORDS",
            word: "ERROR",
            hints: { hint1: "단어 데이터 없음", hint2: "" },
            category: "Error",
            education: { schoolLevel: "elementary", grade: 1 },
          });
          setShuffledWordHint(undefined);
          setSolvedWordIds([]);
        }
      }

      const savedMileage = await AsyncStorage.getItem("userMileage");
      setMileage(savedMileage !== null ? parseInt(savedMileage, 10) : 0);
    } catch (error) {
      console.error("[GameProvider] Error loading game state:", error);
      setCurrentGradeInternal(1);
      await AsyncStorage.setItem("currentGrade", "1");
      setWordList(gradeToWordList[1]?.wordList || []);
      setSolvedWordIds([]);
      pickNewWord(gradeToWordList[1]?.wordList || [], [], 1);
      setMileage(0);
    } finally {
      setIsLoading(false);
      console.log("[GameProvider] loadGameState finished. isLoading:", false);
    }
  }, [
    loadWordList,
    pickNewWord,
    setIsLoading,
    setCurrentGradeInternal,
    setWins,
    setLosses,
    setCurrentStreak,
    setBestStreak,
    setWordList,
    setSolvedWordIds,
    setMileage,
    loadSolvedWordIds,
  ]);

  useEffect(() => {
    console.log(
      "[GameProvider] Initializing game (useEffect calling loadGameState)"
    );
    loadGameState();
  }, [loadGameState]);

  const saveGameStats = useCallback(async () => {
    try {
      const statsToSave = { wins, losses, currentStreak, bestStreak };
      await AsyncStorage.setItem("gameStats", JSON.stringify(statsToSave));
      console.log("[GameProvider] Game stats saved:", statsToSave);
    } catch (error) {
      console.error("[GameProvider] Failed to save game stats:", error);
    }
  }, [wins, losses, currentStreak, bestStreak]);

  useEffect(() => {
    if (!isLoading) {
      saveGameStats();
    }
  }, [wins, losses, currentStreak, bestStreak, isLoading, saveGameStats]);

  const handleNext = useCallback(() => {
    setWordForModal(null);
    if (wordList.length > 0) {
      pickNewWord(wordList, solvedWordIds, currentGrade);
    } else {
      console.warn("[GameProvider] Word list is empty, cannot pick next word.");
    }
  }, [pickNewWord, wordList, solvedWordIds, currentGrade, setWordForModal]);

  const preloadSounds = async () => {
    try {
      console.log("[GameProvider] Preloading sounds...");
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

      console.log("[GameProvider] Sounds preloaded successfully");
    } catch (error) {
      console.error("[GameProvider] Error preloading sounds:", error);
    }
  };
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
      console.log("[GameProvider] Sounds unloaded");
    } catch (error) {
      console.error("[GameProvider] Error unloading sounds:", error);
    }
  };
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
        await soundObjectToPlay.replayAsync();
      }
    } catch (error) {
      console.error(`[GameProvider] Error playing ${soundType} sound:`, error);
    }
  };

  useEffect(() => {
    preloadSounds();
    return () => {
      unloadSounds();
    };
  }, []);

  const markWordAsSolved = useCallback(
    async (solvedWordId: string, gradeOfWord: GradeType) => {
      if (solvedWordId) {
        const newSolvedIdsForStorage = await loadSolvedWordIds(gradeOfWord);
        if (!newSolvedIdsForStorage.includes(solvedWordId)) {
          newSolvedIdsForStorage.push(solvedWordId);
          await saveSolvedWordIds(gradeOfWord, newSolvedIdsForStorage);
        }

        if (gradeOfWord === currentGrade) {
          setSolvedWordIds((prev) => {
            if (!prev.includes(solvedWordId)) {
              return [...prev, solvedWordId];
            }
            return prev;
          });
        }
        console.log(
          `[GameProvider] Word ${solvedWordId} marked as solved for grade ${gradeOfWord}`
        );
      }
    },
    [solvedWordIds, currentGrade, loadSolvedWordIds, saveSolvedWordIds]
  );

  const resetGame = useCallback(async () => {
    console.log(
      "[GameProvider] Resetting game for current grade:",
      currentGrade
    );
    await updateCurrentGrade(currentGrade);
    console.log("[GameProvider] Game reset complete for grade:", currentGrade);
  }, [updateCurrentGrade, currentGrade]);

  const stats = { wins, losses, currentStreak, bestStreak };

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
          "[GameProvider] processUserAnswer called with incorrect word or invalid state"
        );
        return;
      }

      const solution = currentWord.word.toUpperCase();
      const currentWordId = currentWord.id;
      const gradeOfSolvedWord =
        (currentWord.education.grade as GradeType) || currentGrade;

      markWordAsSolved(currentWordId, gradeOfSolvedWord);
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
      currentGrade,
    ]
  );

  const finalizeDefeat = useCallback(() => {
    setLosses((prevLosses) => prevLosses + 1);
    setCurrentStreak(0);
    setGameStatus("lost");
    setWordForModal(currentWord);
    playSound("fail");
  }, [
    currentWord,
    setLosses,
    setCurrentStreak,
    setGameStatus,
    setWordForModal,
    playSound,
  ]);

  console.log(
    `[GameProvider] Rendering. Grade: ${currentGrade}, isLoading: ${isLoading}, Word: ${currentWord?.word}`
  );

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
