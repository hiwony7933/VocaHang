// src/components/Keyboard.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors } from "../constants/theme";

interface KeyboardProps {
  onPressLetter: (letter: string) => void;
  disabledLetters: string[]; // 이미 눌렀거나 사용 불가한 글자 목록
  disabled?: boolean; // 애니메이션 등으로 전체 비활성화할 때
}

const ALPHABET = Array.from({ length: 26 }, (_, i) =>
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
          <Pressable
            key={letter}
            onPress={() => !isDisabled && onPressLetter(letter)}
            style={({ pressed }) => [
              styles.key,
              isDisabled
                ? styles.keyDisabled
                : pressed
                ? styles.keyPressed
                : styles.keyEnabled,
            ]}
            disabled={isDisabled}
            android_ripple={{ color: Colors.primaryDark }}
            // 접근성 속성 추가
            accessibilityRole="button"
            accessibilityLabel={`키 ${letter}${
              isDisabled ? " (사용 불가)" : ""
            }`}
          >
            <Text
              style={[styles.keyText, isDisabled && styles.keyTextDisabled]}
            >
              {letter}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap", // 화면 너비에 맞춰 자동 줄바꿈
    justifyContent: "center", // 가운데 정렬
    marginVertical: 16,
  },
  key: {
    width: 36,
    height: 44,
    margin: 6, // 상하좌우 균일한 간격
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  keyEnabled: {
    backgroundColor: Colors.primary,
  },
  keyPressed: {
    backgroundColor: Colors.primaryDark,
  },
  keyDisabled: {
    backgroundColor: Colors.disabled,
  },
  keyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  keyTextDisabled: {
    color: Colors.textDisabled,
  },
});
