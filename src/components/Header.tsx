import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../constants/theme";
import { useGame, GradeType } from "./GameProvider";
import { useNavigation, NavigationProp } from "@react-navigation/native";

type RootStackParamList = {
  VocaMan: undefined;
};

export const Header: React.FC = () => {
  const { currentGrade } = useGame();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const getGradeName = (grade: GradeType) => {
    if (grade === "all") return "초등학교 전체";
    return `초등${grade}학년`;
  };

  const navigateToGameScreen = () => {
    navigation.navigate("VocaMan");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={navigateToGameScreen} activeOpacity={0.7}>
        <Text style={styles.title}>
          VocaMan
          <Text style={styles.gradeName}> {getGradeName(currentGrade)}</Text>
        </Text>
      </TouchableOpacity>
      {/* <View style={styles.rightContainer}>
        <View style={styles.mileageContainer}>
          <Text style={styles.mileageIcon}>💰</Text>
          <Text style={styles.mileageText}>{mileage} M</Text>
        </View>
      </View> */}
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
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mileageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  mileageIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  mileageText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  menuButton: {
    padding: 8,
  },
});
