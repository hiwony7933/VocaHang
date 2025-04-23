import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useGame, GradeType } from "./GameProvider";

interface HeaderProps {
  onMenuPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuPress }) => {
  const { currentGrade } = useGame();

  const getGradeName = (grade: GradeType) => {
    if (grade === "all") return "초등학교 전체";
    return `초등${grade}학년`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        VocaMan
        <Text style={styles.gradeName}> {getGradeName(currentGrade)}</Text>
      </Text>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel="메뉴"
      >
        <Ionicons name="menu" size={24} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.primary,
  },
  gradeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  menuButton: {
    padding: 8,
  },
});
