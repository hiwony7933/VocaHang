// App.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WordItem } from "./src/types";
import wordsData from "./assets/data/words.json";
import { Keyboard } from "./src/components/Keyboard";
import { BalloonLife } from "./src/components/BalloonLife";

type GameStatus = "playing" | "won" | "lost";

interface Stats {
  wins: number;
  losses: number;
}

const STATS_KEY = "VocaHangStats";
const MAX_TRIES = 6;

export default function App() {
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0 });
  const [showModal, setShowModal] = useState(false);

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

      <Modal visible={showModal} transparent animationType="fade">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modal}>
            <Text style={modalStyles.modalTitle}>
              {gameStatus === "won" ? "🎉 You Win!" : "😢 You Lose"}
            </Text>
            <Text style={modalStyles.modalAnswer}>
              Answer: {currentWord.word.toUpperCase()}
            </Text>
            <TouchableOpacity style={modalStyles.button} onPress={handleNext}>
              <Text style={modalStyles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 20 },
  title: { fontSize: 32, fontWeight: "bold", marginVertical: 10 },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    marginBottom: 10,
  },
  placeholdersContainer: { flexDirection: "row", marginVertical: 20 },
  letterPlaceholder: { fontSize: 40, marginHorizontal: 5 },
  hintText: { fontSize: 18, color: "#555", marginVertical: 4 },
  infoText: { fontSize: 16, marginVertical: 2 },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  modalAnswer: { fontSize: 18, color: "#b00", marginBottom: 20 },
  button: { backgroundColor: "#0066cc", padding: 10, borderRadius: 4 },
  buttonText: { color: "#fff", fontSize: 16 },
});
