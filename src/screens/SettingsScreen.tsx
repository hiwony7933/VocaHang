import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../constants/theme";
import { useGame, GradeType } from "../components/GameProvider";
import { Header } from "../components/Header";
import { GNB } from "../components/GNB";
import { useNavigation, NavigationProp } from "@react-navigation/native";

type RootStackParamList = {
  VocaMan: undefined;
  Settings: undefined;
  Support: undefined;
  Dashboard: undefined;
};

type NavigationProps = NavigationProp<RootStackParamList>;

export const SettingsScreen = () => {
  const {
    keyboardLayout,
    toggleKeyboardLayout,
    currentGrade,
    setCurrentGrade,
  } = useGame();
  const [isGNBVisible, setIsGNBVisible] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  const displayLayout = keyboardLayout === "qwerty" ? "QWERTY" : "ABC";

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
    <View style={styles.container}>
      <Header onMenuPress={() => setIsGNBVisible(true)} />
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>키보드 레이아웃</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>
              현재 레이아웃: {displayLayout}
            </Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleKeyboardLayout}
            >
              <Text style={styles.toggleText}>변경</Text>
            </TouchableOpacity>
          </View>
        </View>

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
      </View>
      <GNB
        visible={isGNBVisible}
        onClose={() => setIsGNBVisible(false)}
        onNavigate={(screen) => {
          navigation.navigate(screen as never);
          setIsGNBVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.background,
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
    color: Colors.background,
    fontWeight: "bold",
  },
  backToGameButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: "auto",
    marginBottom: 16,
  },
  backToGameText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
