import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import {
  useGame,
  GradeType,
  IndividualGradeStats,
} from "../components/GameProvider";

export const DashboardScreen = () => {
  const { statsByGrade, currentGrade } = useGame();

  const playedGrades = Object.keys(statsByGrade).filter(
    (grade) => statsByGrade[grade as GradeType] !== undefined
  ) as GradeType[];

  const getGradeStats = (
    grade: GradeType
  ): IndividualGradeStats | undefined => {
    return statsByGrade[grade];
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>학년별 통계</Text>

        {playedGrades.length === 0 ? (
          <Text style={styles.noStatsText}>아직 플레이 기록이 없습니다.</Text>
        ) : (
          playedGrades.map((grade) => {
            const gradeStats = getGradeStats(grade);
            if (!gradeStats) return null;

            const displayGrade = grade === "all" ? "종합" : `${grade}학년`;

            return (
              <View key={grade} style={styles.statsDisplayContainer}>
                <Text style={styles.gradeTitle}>{displayGrade} 통계</Text>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>🏆 총 승리</Text>
                  <Text style={styles.statValue}>{gradeStats.wins}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>💀 총 패배</Text>
                  <Text style={styles.statValue}>{gradeStats.losses}</Text>
                </View>
                {/* 현재 연승은 현재 플레이 중인 학년에만 의미가 있을 수 있어 currentGrade와 비교하여 표시하거나, 항상 표시할 수 있습니다. */}
                {/* 여기서는 최고 연승만 표시하겠습니다. */}
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>🏅 최고 연승</Text>
                  <Text style={styles.statValue}>{gradeStats.bestStreak}</Text>
                </View>
                {grade === currentGrade && ( // 현재 선택된 학년의 현재 연승 표시
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>🔥 현재 연승</Text>
                    <Text style={styles.statValue}>
                      {gradeStats.currentStreak}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 20,
  },
  gradeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  statsDisplayContainer: {
    width: "90%",
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  statItemLast: {
    borderBottomWidth: 0,
  },
  statLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  noStatsText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 50,
  },
});
