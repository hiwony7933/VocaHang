// App.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Modal,
  TouchableOpacity,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WordItem } from "./src/types";
import wordsData from "./assets/data/words.json";
import { Keyboard } from "./src/components/Keyboard";
import { BalloonLife } from "./src/components/BalloonLife";
import { Colors } from "./src/constants/theme";

// 게임 상태 타입 정의
type GameStatus = "playing" | "won" | "lost";
// 통계 인터페이스
type Stats = {
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
};

const STATS_KEY = "VocaManStats";
const HISTORY_KEY = "VocaManSolvedWords"; // 푼 단어 이력 키
const MAX_TRIES = 6;

// Android 에서 LayoutAnimation 활성화
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  // 네트워크 상태
  const [isConnected, setIsConnected] = useState(true);

  // 단어 이력 (푼 문제 ID 목록)
  const [solvedWords, setSolvedWords] = useState<string[]>([]);

  // 게임 상태
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // 순서 제한용 인덱스
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]); // 틀린 글자만 저장
  const [displayTries, setDisplayTries] = useState(MAX_TRIES); // 풍선 수
  const [isAnimating, setIsAnimating] = useState(false); // 애니메이션 잠금
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [showModal, setShowModal] = useState(false);

  // 통계 상태
  const [stats, setStats] = useState<Stats>({
    wins: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  // 레퍼런스: 이전 틀린 횟수, 모달 스케일, 글자별 애니메이션
  const prevWrongCount = useRef(0);
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const letterAnims = useRef<Animated.Value[]>([]);

  // 네트워크 상태 구독
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });
    return unsubscribe;
  }, []);

  // AsyncStorage에서 통계 & 이력 로드
  useEffect(() => {
    AsyncStorage.getItem(STATS_KEY).then((raw) => {
      if (raw) setStats(JSON.parse(raw));
    });
    AsyncStorage.getItem(HISTORY_KEY).then((raw) => {
      if (raw) setSolvedWords(JSON.parse(raw));
    });
  }, []);

  // 첫 단어 선택 — 마운트 시 단 한 번만 실행
  useEffect(() => {
    pickNewWord();
  }, []);

  // 단어 변경 시 글자 애니메이션 초기화
  useEffect(() => {
    if (!currentWord) return;
    letterAnims.current = currentWord.word
      .toUpperCase()
      .split("")
      .map(() => new Animated.Value(0));
  }, [currentWord]);

  // 새로운 단어 선택 및 상태 초기화
  function pickNewWord() {
    const allList = (wordsData as { wordList: WordItem[] }).wordList;
    // 아직 안 푼 문제만 필터
    let pool = allList.filter((w) => !solvedWords.includes(w.id));
    if (pool.length === 0) {
      // 모두 풀었으면 이력 초기화
      pool = allList;
      AsyncStorage.removeItem(HISTORY_KEY);
      setSolvedWords([]);
    }
    // 무작위로 하나 선택
    const next = pool[Math.floor(Math.random() * pool.length)];

    // 글자별 애니메이션 값 초기화
    letterAnims.current = next.word
      .toUpperCase()
      .split("")
      .map(() => new Animated.Value(0));

    setCurrentWord(next);
    setCurrentIndex(0);
    setWrongGuesses([]);
    setDisplayTries(MAX_TRIES);
    prevWrongCount.current = 0;
    setGameStatus("playing");
    setShowModal(false);
  }

  // 답안 및 남은 글자 계산
  const answer = currentWord?.word.toUpperCase() || "";
  const wrongCount = wrongGuesses.length;
  const remainingTries = Math.max(0, MAX_TRIES - wrongCount);

  // 풍선 애니메이션 및 입력 잠금 (틀린 글자 증가 시)
  useEffect(() => {
    const newWrong = wrongCount;
    const diff = newWrong - prevWrongCount.current;
    if (diff > 0) {
      setIsAnimating(true);
      for (let i = 1; i <= diff; i++) {
        setTimeout(() => {
          setDisplayTries((t) => Math.max(0, t - 1));
        }, 200 * i);
      }
    }
    prevWrongCount.current = newWrong;
  }, [wrongCount]);

  // 승패 감지 및 통계, 이력 업데이트
  useEffect(() => {
    if (!currentWord || gameStatus !== "playing") return;

    if (currentIndex === answer.length) {
      // 승리
      setGameStatus("won");
      // 통계: 승리&연승
      const newCurrent = stats.currentStreak + 1;
      const newBest = Math.max(stats.bestStreak, newCurrent);
      const updated: Stats = {
        ...stats,
        wins: stats.wins + 1,
        currentStreak: newCurrent,
        bestStreak: newBest,
      };
      setStats(updated);
      AsyncStorage.setItem(STATS_KEY, JSON.stringify(updated));
      // 이력 추가
      const newSolved = [...solvedWords, currentWord.id];
      setSolvedWords(newSolved);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newSolved));
    } else if (remainingTries <= 0) {
      // 패배
      setGameStatus("lost");
      const updated: Stats = {
        ...stats,
        losses: stats.losses + 1,
        currentStreak: 0,
      };
      setStats(updated);
      AsyncStorage.setItem(STATS_KEY, JSON.stringify(updated));
    }
  }, [currentIndex, remainingTries]);

  // 결과 모달 스케일 애니메이션
  useEffect(() => {
    if (showModal) {
      modalScale.setValue(0.8);
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 6,
        tension: 75,
        useNativeDriver: false,
      }).start(() => setIsAnimating(false));
    }
  }, [showModal]);

  // 게임 종료 후 1초 뒤 모달 표시
  useEffect(() => {
    if (gameStatus !== "playing") {
      setTimeout(() => setShowModal(true), 1000);
    }
  }, [gameStatus]);

  // 정답 글자 스펠 빈도 계산
  const freq: Record<string, number> = {};
  answer.split("").forEach((c) => {
    freq[c] = (freq[c] || 0) + 1;
  });
  // 사용된 글자 빈도
  const used: Record<string, number> = {};
  answer
    .split("")
    .slice(0, currentIndex)
    .forEach((c) => {
      used[c] = (used[c] || 0) + 1;
    });
  // 빈도 초과된 글자
  const overUsed = Object.entries(used)
    .filter(([c, cnt]) => cnt >= (freq[c] || 0))
    .map(([c]) => c);
  // 비활성화할 글자: 오답 중 정답에 남아있지 않은 + 빈도 초과
  const disabledLetters = [
    ...wrongGuesses.filter((l) => !answer.slice(currentIndex).includes(l)),
    ...overUsed,
  ];

  // 글자 선택 핸들러 (순서 제한)
  const handlePressLetter = (letter: string) => {
    if (gameStatus !== "playing" || isAnimating || !currentWord) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (letter === answer[currentIndex]) {
      // 맞힌 글자 스케일 애니
      const anim = letterAnims.current[currentIndex];
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: false,
      }).start();
      setCurrentIndex((idx) => idx + 1);
    } else {
      setWrongGuesses((prev) => [...prev, letter]);
    }
  };

  // 다음 문제로 이동
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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* 스크롤 가능한 부분 */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 오프라인 배너 */}
          {!isConnected && (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineText}>
                ⚠️ 오프라인 모드 — 인터넷 연결 없음
              </Text>
            </View>
          )}
          {/* 타이틀 */}
          <Text style={styles.title}>VocaMan 🚀</Text>
          {/* 통계 카드 */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statNumber}>{stats.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>💀</Text>
              <Text style={styles.statNumber}>{stats.losses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statNumber}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>🏅</Text>
              <Text style={styles.statNumber}>{stats.bestStreak}</Text>
              <Text style={styles.statLabel}>Best</Text>
            </View>
          </View>
          {/* 풍선 생명력 */}
          <BalloonLife
            remaining={displayTries}
            onPopComplete={() => setIsAnimating(false)}
          />
          {/* 밑줄+글자 (순서 제한) */}
          <View style={styles.placeholdersContainer}>
            {answer.split("").map((char, i) => {
              const revealed = i < currentIndex;
              const anim = letterAnims.current[i];
              if (!anim) {
                return (
                  <Text key={i} style={styles.letterPlaceholder}>
                    {revealed ? char : "_"}
                  </Text>
                );
              }
              const scale = anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1.5, 1],
              });
              const color = anim.interpolate({
                inputRange: [0, 1],
                outputRange: [Colors.primary, Colors.text],
              });
              return (
                <Animated.Text
                  key={i}
                  style={[
                    styles.letterPlaceholder,
                    revealed && { transform: [{ scale }], color },
                  ]}
                >
                  {revealed ? char : "_"}
                </Animated.Text>
              );
            })}
          </View>
          {/* 힌트 & 틀린 글자 */}
          <View style={styles.hintWrapper}>
            <Text style={styles.hintText}>
              힌트1: {currentWord.hints.hint1}
            </Text>
            <Text style={styles.hintText}>
              힌트2: {currentWord.hints.hint2}
            </Text>
            <Text style={styles.infoText}>
              틀린 글자: {wrongGuesses.join(", ") || "없음"}
            </Text>
          </View>
        </ScrollView>
        {/* 키보드 */}
        <View style={styles.keyboardWrapper}>
          <Keyboard
            onPressLetter={handlePressLetter}
            disabledLetters={disabledLetters}
            disabled={isAnimating}
          />
        </View>
      </KeyboardAvoidingView>
      {/* 결과 모달 */}
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        accessibilityViewIsModal
      >
        <View style={modalStyles.overlay}>
          <Animated.View
            style={[modalStyles.modal, { transform: [{ scale: modalScale }] }]}
          >
            <Text style={modalStyles.modalTitle} accessibilityRole="header">
              {gameStatus === "won" ? "🎉 You Win!" : "😢 You Lose"}
            </Text>
            <Text style={modalStyles.modalAnswer}>Answer: {answer}</Text>
            <TouchableOpacity
              style={modalStyles.modalButton}
              onPress={handleNext}
              accessibilityRole="button"
              accessibilityLabel="다음 문제"
            >
              <Text style={modalStyles.modalButtonText}>Next</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    // paddingVertical: 20,
    // paddingHorizontal: 32,
    // alignItems: "center",
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  offlineBanner: {
    width: "100%",
    backgroundColor: "#ffcc00",
    padding: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  offlineText: { color: "#333", fontSize: 14 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: { fontSize: 20 },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textDisabled,
    marginTop: 2,
    textTransform: "uppercase",
  },
  placeholdersContainer: { flexDirection: "row", marginVertical: 20 },
  letterPlaceholder: { fontSize: 40, marginHorizontal: 6, color: Colors.text },
  hintWrapper: { width: "100%", paddingVertical: 12, alignItems: "center" },
  hintText: { fontSize: 18, color: Colors.hint, marginVertical: 6 },
  infoText: { fontSize: 16, color: Colors.text, marginVertical: 6 },
  keyboardWrapper: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    backgroundColor: "#fafafa",
    alignItems: "center",
  },
});

const modalStyles = StyleSheet.create({
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
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
  },
  modalAnswer: { fontSize: 18, color: "#b00", marginBottom: 20 },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  modalButtonText: { color: "#fff", fontSize: 16 },
});
