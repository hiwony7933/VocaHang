import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { useGame } from "../components/GameProvider";
import { useFocusEffect } from "@react-navigation/native";

export const DashboardScreen = () => {
  const { stats, loadGameState } = useGame();

  useFocusEffect(
    useCallback(() => {
      console.log("DashboardScreen focused. Attempting to load game state.");
      if (loadGameState) {
        loadGameState().then(() => {
          console.log(
            "Game state loaded in DashboardScreen. Current stats:",
            stats
          );
        });
      }
      return () => {
        console.log("DashboardScreen unfocused");
      };
    }, [loadGameState])
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.content}>
        <Text style={styles.title}>통계</Text>

        <View style={styles.statsDisplayContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>🏆 총 승리</Text>
            <Text style={styles.statValue}>{stats.wins}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>💀 총 패배</Text>
            <Text style={styles.statValue}>{stats.losses}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>🔥 현재 연승</Text>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>🏅 최고 연승</Text>
            <Text style={styles.statValue}>{stats.bestStreak}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 30,
  },
  statsDisplayContainer: {
    width: "80%",
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  statItemLast: {
    borderBottomWidth: 0,
  },
  statLabel: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
});
