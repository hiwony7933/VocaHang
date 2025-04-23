import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
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
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[styles.modalContent, { transform: [{ scale: modalScale }] }]}
        >
          <Text style={styles.modalTitle}>
            {gameStatus === "won" ? "🎉 You Win!" : "😢 You Lose"}
          </Text>
          <Text style={styles.modalAnswer}>Answer: {currentWord.word}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setShowModal(false);
              handleNext();
            }}
            accessibilityRole="button"
          >
            <Text style={styles.modalButtonText}>Next</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
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
});
