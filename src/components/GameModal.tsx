import React, { useEffect, useRef } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "./GameProvider";
import type { WordType } from "../types/word";
import { Colors } from "../constants/theme";

export const GameModal: React.FC = () => {
  const { gameStatus, wordForModal, stats, handleNext } = useGame();
  const [showModal, setShowModal] = React.useState(false);
  const modalScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (
      wordForModal &&
      !("type" in wordForModal) &&
      (gameStatus === "won" || gameStatus === "lost")
    ) {
      setTimeout(() => {
        setShowModal(true);
      }, 500);
    } else {
      setShowModal(false);
    }
  }, [gameStatus, wordForModal]);

  useEffect(() => {
    if (showModal) {
      modalScale.setValue(0.8);
      const useNativeDriver = Platform.OS !== "web";
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 6,
        tension: 75,
        useNativeDriver: useNativeDriver,
      }).start();
    } else {
      modalScale.setValue(0.8);
    }
  }, [showModal, modalScale]);

  if (
    !wordForModal ||
    ("type" in wordForModal && wordForModal.type === "letterPickFeedback")
  ) {
    return null;
  }

  const currentWordInfo = wordForModal as WordType;

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="fade"
      onRequestClose={() => {
        setShowModal(false);
        if (gameStatus === "won" || gameStatus === "lost") {
          handleNext();
        }
      }}
    >
      <SafeAreaView
        style={styles.modalOverlay}
        edges={["top", "left", "right"]}
      >
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ scale: modalScale }] },
            Platform.OS === "web" && styles.modalContentWeb,
          ]}
        >
          <Text style={styles.modalTitle}>
            {gameStatus === "won" ? "🎉 정답입니다!" : "😢 실패했습니다."}
          </Text>
          <Text style={styles.modalAnswer}>
            정답: {currentWordInfo?.word || ""}
          </Text>
          {currentWordInfo?.category && (
            <Text style={styles.modalAnswer}>
              카테고리: {currentWordInfo.category}
            </Text>
          )}

          {currentWordInfo?.hints?.hint1 && (
            <Text style={styles.modalAnswer}>
              뜻: {currentWordInfo.hints.hint1}
            </Text>
          )}

          {stats && (
            <View style={styles.statsContainerInModal}>
              <View style={styles.statItemInModal}>
                <Text style={styles.statLabelInModal}>🏆 총 승리</Text>
                <Text style={styles.statValueInModal}>{stats.wins}</Text>
              </View>
              <View style={styles.statItemInModal}>
                <Text style={styles.statLabelInModal}>💀 총 패배</Text>
                <Text style={styles.statValueInModal}>{stats.losses}</Text>
              </View>
              <View style={styles.statItemInModal}>
                <Text style={styles.statLabelInModal}>🔥 현재 연승</Text>
                <Text style={styles.statValueInModal}>
                  {stats.currentStreak}
                </Text>
              </View>
              <View style={styles.statItemInModal}>
                <Text style={styles.statLabelInModal}>🏅 최고 연승</Text>
                <Text style={styles.statValueInModal}>{stats.bestStreak}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setShowModal(false);
              handleNext();
            }}
            accessibilityRole="button"
          >
            <Text style={styles.modalButtonText}>다음 문제</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.background,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 16,
  },
  modalAnswer: {
    fontSize: 20,
    color: Colors.textSecondary,
    marginBottom: 24,
    fontWeight: "500",
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContentWeb: {
    maxWidth: 450,
    margin: "auto",
  },
  statsContainerInModal: {
    width: "100%",
    paddingVertical: 10,
    marginTop: 5,
    marginBottom: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.lightGray,
  },
  statItemInModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  statLabelInModal: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statValueInModal: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
});
