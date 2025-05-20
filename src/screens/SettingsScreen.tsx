import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { useGame, GradeType } from "../components/GameProvider";
import { useNavigation, NavigationProp } from "@react-navigation/native";

type RootStackParamList = {
  VocaMan: undefined;
  Settings: undefined;
  Support: undefined;
  Dashboard: undefined;
  AppInfo: undefined;
};

export const SettingsScreen = () => {
  const { currentGrade, setCurrentGrade } = useGame();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const gradeOptions: { label: string; value: GradeType }[] = [
    { label: "초등학교 1학년", value: 1 },
    { label: "초등학교 2학년", value: 2 },
    { label: "초등학교 3학년", value: 3 },
    { label: "초등학교 4학년", value: 4 },
    { label: "초등학교 5학년", value: 5 },
    { label: "초등학교 6학년", value: 6 },
    { label: "초등학교 전체", value: "all" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Text style={styles.screenTitle}>설정</Text>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>학년 설정</Text>
          <View style={styles.gradeContainer}>
            {gradeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.gradeButton,
                  currentGrade === option.value && styles.gradeButtonSelected,
                ]}
                onPress={() => setCurrentGrade(option.value)}
              >
                <Text
                  style={[
                    styles.gradeButtonText,
                    currentGrade === option.value &&
                      styles.gradeButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.backToGameButton}
          onPress={() => navigation.navigate("VocaMan")}
        >
          <Text style={styles.backToGameText}>게임으로 돌아가기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.appInfoButton}
          onPress={() => navigation.navigate("AppInfo")}
        >
          <Text style={styles.appInfoButtonText}>앱 정보 보기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingText: {
    fontSize: 16,
    color: Colors.text,
  },
  toggleButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  toggleText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: "500",
  },
  gradeContainer: {
    gap: 8,
  },
  gradeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gradeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  gradeButtonText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
  },
  gradeButtonTextSelected: {
    color: Colors.white,
    fontWeight: "bold",
  },
  backToGameButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  backToGameText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  appInfoButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  appInfoButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: "underline",
  },
});
