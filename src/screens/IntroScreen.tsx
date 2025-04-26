import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useGame, GradeType } from "../components/GameProvider";
import { LoadingScreen } from "../components/LoadingScreen";

export type RootStackParamList = {
  Intro: undefined;
  VocaMan: undefined;
  HowToPlay: undefined;
  // 필요한 다른 스크린들...
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export const IntroScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const { setCurrentGrade, isLoading, showHowToPlayOnStart } = useGame();
  const [isGradeModalVisible, setIsGradeModalVisible] = useState(false);

  const gradeOptions: { label: string; value: GradeType }[] = [
    { label: "초등학교 1학년", value: 1 },
    { label: "초등학교 2학년", value: 2 },
    { label: "초등학교 3학년", value: 3 },
    { label: "초등학교 4학년", value: 4 },
    { label: "초등학교 5학년", value: 5 },
    { label: "초등학교 6학년", value: 6 },
    { label: "초등학교 전체", value: "all" },
  ];

  const handleStartGame = () => {
    setIsGradeModalVisible(true);
  };

  const handleSelectGrade = async (grade: GradeType) => {
    setIsGradeModalVisible(false);
    await setCurrentGrade(grade);
    if (showHowToPlayOnStart) {
      navigation.navigate("HowToPlay");
    } else {
      navigation.navigate("VocaMan");
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>
          영어 단어를 맞춰보세요!{"\n"}재미있는 게임으로 영어 실력을 키워보세요.
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
          <Text style={styles.startButtonText}>시작하기</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isGradeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsGradeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>몇 학년이에요?</Text>
            <View style={styles.gradeContainer}>
              {gradeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.gradeButton}
                  onPress={() => handleSelectGrade(option.value)}
                >
                  <Text style={styles.gradeButtonText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF3E6",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 30,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 24,
    textAlign: "center",
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
  gradeButtonText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
  },
});
