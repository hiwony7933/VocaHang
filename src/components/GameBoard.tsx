import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useGame } from "./GameProvider";
import { Colors } from "../constants/theme";
import { Keyboard } from "./Keyboard";
import { BalloonLife } from "./BalloonLife";

export const GameBoard: React.FC = () => {
  const {
    currentWord,
    currentIndex,
    // wrongGuesses,
    displayTries,
    handlePressLetter,
    stats,
    keyboardLayout,
  } = useGame();

  if (!currentWord) return null;

  const answer = currentWord.word.toUpperCase();

  const handlePopComplete = () => {
    // 풍선이 터진 후 추가 작업이 필요한 경우 여기에 구현
  };

  return (
    <View style={styles.container}>
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

      <BalloonLife remaining={displayTries} onPopComplete={handlePopComplete} />

      <View style={styles.wordContainer}>
        {answer.split("").map((letter, index) => (
          <View key={index} style={styles.letterContainer}>
            <Text style={styles.letter}>
              {index < currentIndex ? letter : " "}
            </Text>
            <View style={styles.underline} />
          </View>
        ))}
      </View>

      <View style={styles.hintWrapper}>
        <Text style={styles.hintText}>힌트1: {currentWord.hints.hint1}</Text>
        <Text style={styles.hintText}>힌트2: {currentWord.hints.hint2}</Text>
        {/* <Text style={styles.infoText}>
          틀린 글자: {wrongGuesses.join(", ") || "없음"}
        </Text> */}
      </View>

      <Keyboard onPressLetter={handlePressLetter} layout={keyboardLayout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
  },
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
  wordContainer: {
    flexDirection: "row",
    marginBottom: 20,
    marginTop: 20,
  },
  letterContainer: {
    alignItems: "center",
    marginHorizontal: 2,
  },
  letter: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.text,
  },
  underline: {
    width: 26,
    height: 2,
    backgroundColor: Colors.text,
    marginTop: 5,
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
});
