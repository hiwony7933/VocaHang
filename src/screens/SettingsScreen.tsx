import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { useGame, GradeType } from "../components/GameProvider";
import { Header } from "../components/Header";
import { GNB } from "../components/GNB";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "../../App";

type NavigationProps = NavigationProp<RootStackParamList, "Settings">;

export const SettingsScreen = () => {
  const {
    keyboardLayout,
    toggleKeyboardLayout,
    currentGrade,
    setCurrentGrade,
  } = useGame();
  const { signOut, isLoading: isAuthLoading, user } = useAuth();
  const [isGNBVisible, setIsGNBVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  console.log("[SettingsScreen] Rendering. isAuthLoading:", isAuthLoading);

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

  const handleSignOutPress = () => {
    console.log(
      "[SettingsScreen] handleSignOutPress: Opening logout confirmation modal. isAuthLoading:",
      isAuthLoading
    );
    if (!isAuthLoading) {
      setIsLogoutModalVisible(true);
    }
  };

  const confirmSignOut = async () => {
    console.log("[SettingsScreen] confirmSignOut: Attempting signOut...");
    setIsLogoutModalVisible(false);
    try {
      await signOut();
      console.log("[SettingsScreen] signOut successful (from modal)");
    } catch (error) {
      console.error("[SettingsScreen] signOut failed (from modal):", error);
      let message = "알 수 없는 오류가 발생했습니다.";
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      }
      Alert.alert("로그아웃 실패", message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Header onMenuPress={() => setIsGNBVisible(true)} />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>키보드 레이아웃</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>
              현재 레이아웃: {displayLayout}
            </Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleKeyboardLayout}
              disabled={isAuthLoading}
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
                  isAuthLoading && styles.buttonDisabled,
                ]}
                onPress={() => !isAuthLoading && setCurrentGrade(option.value)}
                disabled={isAuthLoading}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              isAuthLoading && styles.buttonDisabled,
            ]}
            onPress={handleSignOutPress}
            disabled={isAuthLoading}
          >
            <Text style={styles.logoutButtonText}>
              {isAuthLoading ? "로그아웃 중..." : "로그아웃"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.backToGameButton,
            isAuthLoading && styles.buttonDisabled,
          ]}
          onPress={() => !isAuthLoading && navigation.navigate("VocaMan")}
          disabled={isAuthLoading}
        >
          <Text style={styles.backToGameText}>게임으로 돌아가기</Text>
        </TouchableOpacity>
      </ScrollView>
      <GNB
        visible={isGNBVisible}
        onClose={() => setIsGNBVisible(false)}
        onNavigate={(screen) => {
          navigation.navigate(screen as keyof RootStackParamList);
          setIsGNBVisible(false);
        }}
      />

      <Modal
        visible={isLogoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>로그아웃 확인</Text>
            <Text style={styles.modalMessage}>
              {`${user?.nickname || "사용자"}님, 정말 로그아웃 하시겠습니까?`}
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsLogoutModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmSignOut}
              >
                <Text
                  style={[styles.modalButtonText, styles.confirmButtonText]}
                >
                  로그아웃
                </Text>
              </TouchableOpacity>
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
  logoutButton: {
    backgroundColor: Colors.danger,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  backToGameButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  backToGameText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.background,
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 24,
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: Colors.danger,
  },
  confirmButtonText: {
    color: Colors.background,
  },
});
