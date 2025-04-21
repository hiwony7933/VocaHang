// App.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WordItem } from "./src/types";
import wordsData from "./assets/data/words.json";
import { Keyboard } from "./src/components/Keyboard";
import { BalloonLife } from "./src/components/BalloonLife";
import { Colors } from "./src/constants/theme";

type GameStatus = "playing" | "won" | "lost";
interface Stats {
  wins: number;
  losses: number;
}

const STATS_KEY = "VocaHangStats";
const MAX_TRIES = 6;

// Android: LayoutAnimation 활성화
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0 });
  const [showModal, setShowModal] = useState(false);
  const [displayTries, setDisplayTries] = useState(MAX_TRIES);
  const [isAnimating, setIsAnimating] = useState(false);

  const prevWrongCount = useRef(0);
  const modalScale = useRef(new Animated.Value(0.8)).current;

  // Load stats
  useEffect(() => {
    AsyncStorage.getItem(STATS_KEY).then((raw) => {
      if (raw) setStats(JSON.parse(raw));
    });
  }, []);

  // Initial word
  useEffect(() => {
    pickNewWord();
  }, []);

  function pickNewWord() {
    const list: WordItem[] = (wordsData as { wordList: WordItem[] }).wordList;
    const idx = Math.floor(Math.random() * list.length);
    setCurrentWord(list[idx]);
    setGuessedLetters([]);
    setGameStatus("playing");
    setShowModal(false);
    setDisplayTries(MAX_TRIES);
    prevWrongCount.current = 0;
  }

  // Wrong letters & remaining
  const wrongLetters = currentWord
    ? guessedLetters.filter((l) => !currentWord.word.toUpperCase().includes(l))
    : [];
  const remainingTries = Math.max(0, MAX_TRIES - wrongLetters.length);

  // Balloon animation & lock input
  useEffect(() => {
    const newWrong = wrongLetters.length;
    const diff = newWrong - prevWrongCount.current;
    if (diff > 0) {
      setIsAnimating(true);
      for (let i = 1; i <= diff; i++) {
        setTimeout(() => {
          setDisplayTries((prev) => Math.max(0, prev - 1));
          if (i === diff) setIsAnimating(false);
        }, 200 * i);
      }
    }
    prevWrongCount.current = newWrong;
  }, [wrongLetters.length]);

  // Win/Lose detection & update stats
  useEffect(() => {
    if (!currentWord || gameStatus !== "playing") return;
    const letters = currentWord.word.toUpperCase().split("");
    const isWin = letters.every((c) => guessedLetters.includes(c));
    if (isWin) {
      setGameStatus("won");
      const updated = { ...stats, wins: stats.wins + 1 };
      setStats(updated);
      AsyncStorage.setItem(STATS_KEY, JSON.stringify(updated));
    } else if (remainingTries <= 0) {
      setGameStatus("lost");
      const updated = { ...stats, losses: stats.losses + 1 };
      setStats(updated);
      AsyncStorage.setItem(STATS_KEY, JSON.stringify(updated));
    }
  }, [guessedLetters, remainingTries]);

  // Modal scale animation
  useEffect(() => {
    if (showModal) {
      modalScale.setValue(0.8);
      Animated.spring(modalScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 75,
      }).start();
    }
  }, [showModal]);

  // Delay showing modal
  useEffect(() => {
    if (gameStatus === "playing") return;
    const t = setTimeout(() => setShowModal(true), 1000);
    return () => clearTimeout(t);
  }, [gameStatus]);

  // Handle letter press with LayoutAnimation
  const handlePressLetter = (letter: string) => {
    if (gameStatus !== "playing" || isAnimating) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setGuessedLetters((prev) => [...prev, letter]);
  };

  const handleNext = () => pickNewWord();

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>VocaHang 🚀</Text>
      <View style={styles.stats}>
        <Text>🏆 {stats.wins}</Text>
        <Text>💀 {stats.losses}</Text>
      </View>
      <BalloonLife remaining={displayTries} />
      <View style={styles.placeholdersContainer}>
        {currentWord.word
          .toUpperCase()
          .split("")
          .map((char, i) => (
            <Text key={i} style={styles.letterPlaceholder}>
              {guessedLetters.includes(char) ? char : "_"}
            </Text>
          ))}
      </View>
      <View style={styles.hintWrapper}>
        <Text style={styles.hintText}>힌트1: {currentWord.hints.hint1}</Text>
        <Text style={styles.hintText}>힌트2: {currentWord.hints.hint2}</Text>
        <Text style={styles.infoText}>
          틀린 글자: {wrongLetters.join(", ") || "없음"}
        </Text>
      </View>
      <View style={styles.keyboardWrapper}>
        <Keyboard
          onPressLetter={handlePressLetter}
          disabledLetters={guessedLetters}
          disabled={isAnimating}
        />
      </View>
      <Modal visible={showModal} transparent animationType="none">
        <View style={modal.overlay}>
          <Animated.View
            style={[modal.modal, { transform: [{ scale: modalScale }] }]}
          >
            <Text style={modal.title}>
              {gameStatus === "won" ? "🎉 You Win!" : "😢 You Lose"}
            </Text>
            <Text style={modal.answer}>
              Answer: {currentWord.word.toUpperCase()}
            </Text>
            <TouchableOpacity style={modal.button} onPress={handleNext}>
              <Text style={modal.buttonText}>Next</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  placeholdersContainer: {
    flexDirection: "row",
    marginVertical: 20,
  },
  hintWrapper: {
    width: "100%",
    paddingVertical: 12, // 위아래 여유 공간
    alignItems: "center",
  },
  letterPlaceholder: {
    fontSize: 40,
    marginHorizontal: 6,
    color: Colors.text,
  },
  hintText: {
    fontSize: 18,
    color: Colors.hint,
    marginVertical: 6,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text,
    marginVertical: 6,
  },
  keyboardWrapper: {
    width: "100%",
    marginTop: 24, // 키보드 위에 충분한 여백
  },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: Colors.modalBackground,
    padding: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
  },
  answer: {
    fontSize: 18,
    color: "#b00",
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
