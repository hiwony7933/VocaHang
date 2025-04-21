// App.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
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
// Android에서는 명시적으로 활성화 필요
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

  /* inside App() */
  const modalScale = useRef(new Animated.Value(0.8)).current;
  // 모달 등장 스케일 애니메이션
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

  // animation state
  const [isAnimating, setIsAnimating] = useState(false);

  // for balloon display animation
  const [displayTries, setDisplayTries] = useState(MAX_TRIES);
  const prevWrongCount = useRef(0);

  // Load stats from storage
  useEffect(() => {
    AsyncStorage.getItem(STATS_KEY).then((raw) => {
      if (raw) setStats(JSON.parse(raw));
    });
  }, []);

  // Initialize first word
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

    // reset balloons
    setDisplayTries(MAX_TRIES);
    prevWrongCount.current = 0;
  }

  // compute wrong letters and remaining tries
  const wrongLetters = currentWord
    ? guessedLetters.filter((l) => !currentWord.word.toUpperCase().includes(l))
    : [];
  const remainingTries = Math.max(0, MAX_TRIES - wrongLetters.length);

  // animate balloon loss with delay
  useEffect(() => {
    const newWrong = wrongLetters.length;
    const diff = newWrong - prevWrongCount.current;
    if (diff > 0) {
      setIsAnimating(true);
      for (let i = 1; i <= diff; i++) {
        setTimeout(() => {
          setDisplayTries((prev) => Math.max(0, prev - 1));
          if (i === diff) {
            setIsAnimating(false);
          }
        }, 200 * i);
      }
    }
    prevWrongCount.current = newWrong;
  }, [wrongLetters.length]);

  // win/loss detection & stats update
  useEffect(() => {
    if (!currentWord || gameStatus !== "playing") return;

    const letters = currentWord.word.toUpperCase().split("");
    const isWin = letters.every((c) => guessedLetters.includes(c));

    if (isWin) {
      setGameStatus("won");
      const updated = { wins: stats.wins + 1, losses: stats.losses };
      setStats(updated);
      AsyncStorage.setItem(STATS_KEY, JSON.stringify(updated));
    } else if (remainingTries <= 0) {
      setGameStatus("lost");
      const updated = { wins: stats.wins, losses: stats.losses + 1 };
      setStats(updated);
      AsyncStorage.setItem(STATS_KEY, JSON.stringify(updated));
    }
  }, [guessedLetters, remainingTries]);

  // delay showing modal by 1 second
  useEffect(() => {
    if (gameStatus === "playing") return;
    const timer = setTimeout(() => setShowModal(true), 1000);
    return () => clearTimeout(timer);
  }, [gameStatus]);

  const handlePressLetter = (letter: string) => {
    if (gameStatus !== "playing" || isAnimating) return;
    // 배열 변경 애니메이션
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setGuessedLetters((prev) => [...prev, letter]);
  };

  const handleNext = () => {
    pickNewWord();
  };

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
        <Text>🏆 Wins: {stats.wins}</Text>
        <Text>💀 Losses: {stats.losses}</Text>
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

      <Text style={styles.hintText}>힌트1: {currentWord.hints.hint1}</Text>
      <Text style={styles.hintText}>힌트2: {currentWord.hints.hint2}</Text>

      <Text style={styles.infoText}>
        틀린 글자: {wrongLetters.join(", ") || "없음"}
      </Text>

      <Keyboard
        onPressLetter={handlePressLetter}
        disabledLetters={guessedLetters}
        disabled={isAnimating}
      />

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
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 10,
    color: Colors.primary,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 10,
  },
  placeholdersContainer: {
    flexDirection: "row",
    marginVertical: 20,
  },
  letterPlaceholder: {
    fontSize: 40,
    marginHorizontal: 5,
    color: Colors.text,
  },
  hintText: {
    fontSize: 18,
    color: Colors.hint,
    marginVertical: 4,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 2,
    color: Colors.text,
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
    backgroundColor: Colors.modalBackground,
    padding: 24,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: Colors.primary,
  },
  answer: { fontSize: 18, color: "#b00", marginBottom: 20 },
  button: { backgroundColor: Colors.primary, padding: 10, borderRadius: 4 },
  buttonText: { color: "#fff", fontSize: 16 },
});
