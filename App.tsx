// App.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WordItem } from "./src/types";
import wordsData from "./assets/data/words.json";
import { Keyboard } from "./src/components/Keyboard";
import { BalloonLife } from "./src/components/BalloonLife";
import { Colors } from "./src/constants/theme";
import NetInfo from "@react-native-community/netinfo";

type GameStatus = "playing" | "won" | "lost";

interface Stats {
  wins: number;
  losses: number;
  bestStreak: number;
  currentStreak: number;
}

const STATS_KEY = "VocaHangStats";
const MAX_TRIES = 6;

// Android에서 LayoutAnimation 사용을 위해 설정
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // 현재 단어 정보
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  // 사용자가 추측한 글자 목록
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  // 게임 상태: 진행 중, 승리, 패배
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  // 통계: 승리/패배 횟수
  const [stats, setStats] = useState<Stats>({
    wins: 0,
    losses: 0,
    bestStreak: 0,
    currentStreak: 0,
  });
  // 결과 모달 표시 여부
  const [showModal, setShowModal] = useState(false);
  // 풍선 생명력 표시용 남은 기회
  const [displayTries, setDisplayTries] = useState(MAX_TRIES);
  // 풍선 애니메이션 중 입력 차단 플래그
  const [isAnimating, setIsAnimating] = useState(false);
   const handleBalloonPopComplete = () => {
       setIsAnimating(false);
     };

  // 이전 틀린 횟수 저장용 ref
  const prevWrongCount = useRef(0);
  // 모달 등장 스케일 애니메이션 값
  const modalScale = useRef(new Animated.Value(0.8)).current;
  // 각 글자별 스케일 애니메이션 값 배열
  const letterAnims = useRef<Animated.Value[]>([]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected === true);
    });
    return unsubscribe;
  }, []);

  // AsyncStorage에서 통계 로드
  useEffect(() => {
    AsyncStorage.getItem(STATS_KEY).then((raw) => {
      if (raw) {
        const saved: Stats = JSON.parse(raw);
        setStats(saved);
      }
    });
  }, []);

  // 앱 시작 시 첫 단어 선택
  useEffect(() => {
    pickNewWord();
  }, []);

  // 단어가 바뀔 때마다 글자 애니메이션 값 초기화
  useEffect(() => {
    if (!currentWord) return;
    letterAnims.current = currentWord.word
      .toUpperCase()
      .split("")
      .map(() => new Animated.Value(0));
  }, [currentWord]);

  // 새 단어 선택 및 상태 초기화
  function pickNewWord() {
    const list = (wordsData as { wordList: WordItem[] }).wordList;
    const idx = Math.floor(Math.random() * list.length);
    setCurrentWord(list[idx]);
    setGuessedLetters([]);
    setGameStatus("playing");
    setShowModal(false);
    setDisplayTries(MAX_TRIES);
    prevWrongCount.current = 0;
  }

  // 틀린 글자 목록 계산
  const wrongLetters = currentWord
    ? guessedLetters.filter((l) => !currentWord.word.toUpperCase().includes(l))
    : [];
  // 남은 기회 계산
  const remainingTries = Math.max(0, MAX_TRIES - wrongLetters.length);

  // 풍선(`displayTries`) 애니메이션 및 입력 잠금 처리
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

  // 승패 감지 및 통계 업데이트
  useEffect(() => {
    if (!currentWord || gameStatus !== "playing") return;
    const letters = currentWord.word.toUpperCase().split("");
    const isWin = letters.every((c) => guessedLetters.includes(c));
    if (isWin) {
      setGameStatus("won");
      // 연승 갱신
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
    } else if (remainingTries <= 0) {
      setGameStatus("lost");
      // 연승 리셋
      const updated: Stats = {
        ...stats,
        losses: stats.losses + 1,
        currentStreak: 0,
      };
      setStats(updated);
      AsyncStorage.setItem(STATS_KEY, JSON.stringify(updated));
    }
  }, [guessedLetters, remainingTries]);

  // 모달 등장 시 스케일 애니메이션 실행
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

  // 게임 종료 직후 1초 뒤에 모달 표시
  useEffect(() => {
    if (gameStatus === "playing") return;
    const t = setTimeout(() => setShowModal(true), 1000);
    return () => clearTimeout(t);
  }, [gameStatus]);

  // 글자 선택 핸들러: LayoutAnimation과 글자 스케일 애니메이션 실행
  const handlePressLetter = (letter: string) => {
    if (gameStatus !== "playing" || isAnimating) return;

    // 레이아웃 전환 애니메이션
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // 맞춘 글자만 스케일 애니메이션
    if (currentWord) {
      currentWord.word
        .toUpperCase()
        .split("")
        .forEach((c, i) => {
          if (c === letter) {
            const anim = letterAnims.current[i];
            anim.setValue(0);
            Animated.spring(anim, {
              toValue: 1,
              useNativeDriver: true,
              friction: 4,
              tension: 50,
            }).start();
          }
        });
    }

    setGuessedLetters((prev) => [...prev, letter]);
  };

  // 다음 문제 버튼 핸들러
  const handleNext = () => pickNewWord();

  // 단어 로딩 전 로딩 화면
  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 타이틀 */}
      <Text style={styles.title}>VocaMan 🚀</Text>

      {/* 통계 표시 (카드 형태) */}
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

           {/* onPopComplete 전달 */}
     <BalloonLife
       remaining={displayTries}
       onPopComplete={handleBalloonPopComplete}
     />

      {/* 단어 밑줄 & 맞춘 글자 */}
      <View style={styles.placeholdersContainer}>
        {currentWord.word
          .toUpperCase()
          .split("")
          .map((char, i) => {
            const revealed = guessedLetters.includes(char);
            const anim = letterAnims.current[i];
            // 애니메이션 값이 준비되지 않았으면 기본 텍스트
            if (!anim) {
              return (
                <Text key={i} style={styles.letterPlaceholder}>
                  {revealed ? char : "_"}
                </Text>
              );
            }
            // 1) 크기 보간: 1.5배 → 1배
            const scale = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [1.5, 1],
            });
            // 2) 색상 보간: 강조색(primary) → 기본색(text)
            const color = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [Colors.primary, Colors.text],
            });
            return (
              <Animated.Text
                key={i}
                style={[
                  styles.letterPlaceholder,
                  revealed && {
                    transform: [{ scale }],
                    color, // interpolate된 컬러 적용
                  },
                ]}
              >
                {revealed ? char : "_"}
              </Animated.Text>
            );
          })}
      </View>

      {/* 힌트 및 틀린 글자 */}
      <View style={styles.hintWrapper}>
        <Text style={styles.hintText} accessibilityLiveRegion="polite">
          힌트1: {currentWord.hints.hint1}
        </Text>
        <Text style={styles.hintText} accessibilityLiveRegion="polite">
          힌트2: {currentWord.hints.hint2}
        </Text>
        <Text style={styles.infoText} accessibilityLiveRegion="polite">
          틀린 글자: {wrongLetters.join(", ") || "없음"}
        </Text>
      </View>

      {/* 키보드 */}
      <View style={styles.keyboardWrapper}>
        <Keyboard
          onPressLetter={handlePressLetter}
          disabledLetters={guessedLetters}
          disabled={isAnimating}
        />
      </View>

      {/* 결과 모달 */}
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        accessibilityViewIsModal={true}
      >
        <View style={modalStyles.overlay}>
          <Animated.View
            style={[modalStyles.modal, { transform: [{ scale: modalScale }] }]}
          >
            <Text style={modalStyles.modalTitle} accessibilityRole="header">
              {gameStatus === "won" ? "🎉 You Win!" : "😢 You Lose"}
            </Text>
            <Text style={modalStyles.modalAnswer}>
              Answer: {currentWord.word.toUpperCase()}
            </Text>
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
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            ⚠️ 오프라인 모드 — 인터넷 연결이 없습니다
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// 스타일 정의
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
  letterPlaceholder: {
    fontSize: 40,
    marginHorizontal: 6,
    color: Colors.text,
  },
  hintWrapper: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
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
    // marginTop: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
    // iOS 그림자
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android 그림자
    elevation: 2,
  },
  statIcon: {
    fontSize: 20,
  },
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
  offlineBanner: {
    width: "100%",
    backgroundColor: "#ffcc00",
    padding: 8,
    alignItems: "center",
  },
  offlineText: {
    color: "#333",
    fontSize: 14,
  },
});

// 모달 스타일 정의
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
  modalAnswer: {
    fontSize: 18,
    color: "#b00",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
