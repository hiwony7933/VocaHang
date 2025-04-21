// src/components/Keyboard.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface KeyboardProps {
  onPressLetter: (letter: string) => void;
  disabledLetters: string[]; // 이미 눌렀거나 사용 불가한 글자 목록
  disabled?: boolean; // 애니메이션 중 전체 비활성화용
}

const ALPHABET = Array.from(Array(26)).map((_, i) =>
  String.fromCharCode(65 + i)
);

export function Keyboard({
  onPressLetter,
  disabledLetters,
  disabled = false,
}: KeyboardProps) {
  return (
    <View style={styles.container}>
      {ALPHABET.map((letter) => {
        const isDisabled = disabled || disabledLetters.includes(letter);
        return (
          <TouchableOpacity
            key={letter}
            style={[styles.key, isDisabled && styles.keyDisabled]}
            onPress={() => !isDisabled && onPressLetter(letter)}
            activeOpacity={0.6}
            disabled={isDisabled}
          >
            <Text
              style={[styles.keyText, isDisabled && styles.keyTextDisabled]}
            >
              {letter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 20,
  },
  key: {
    width: 32,
    height: 32,
    margin: 4,
    borderRadius: 4,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  keyDisabled: {
    backgroundColor: "#ccc",
  },
  keyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  keyTextDisabled: {
    color: "#888",
  },
});
