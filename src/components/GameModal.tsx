import React, { useEffect, useRef } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "./GameProvider";
import { Colors } from "../constants/theme";

export const GameModal: React.FC = () => {
  const { gameStatus, currentWord, handleNext } = useGame();
  const [showModal, setShowModal] = React.useState(false);
  const modalScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (gameStatus !== "playing") {
      setTimeout(() => setShowModal(true), 500);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (showModal) {
      modalScale.setValue(0.8);
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 6,
        tension: 75,
        useNativeDriver: true,
      }).start();
    }
  }, [showModal]);

  if (!currentWord) return null;

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowModal(false)}
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
            {gameStatus === "won" ? "🎉 You Win!" : "😢 You Lose"}
          </Text>
          <Text style={styles.modalAnswer}>Answer: {currentWord.word}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setShowModal(false);
              setTimeout(() => {
                handleNext();
              }, 200);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.modalButtonText}>Next</Text>
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
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
  },
  modalAnswer: {
    fontSize: 18,
    color: "#b00",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalContentWeb: {
    maxWidth: 400,
    margin: "auto",
  },
});
