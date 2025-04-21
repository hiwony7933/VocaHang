// src/components/Keyboard.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors } from "../constants/theme";

interface KeyboardProps {
  onPressLetter: (letter: string) => void;
  disabledLetters: string[];
  disabled?: boolean;
}

const ALPHABET = Array.from(Array(26)).map((_, i) =>
  String.fromCharCode(65 + i)
);

// 3줄 레이아웃: 9-9-8
const ROWS = [ALPHABET.slice(0, 9), ALPHABET.slice(9, 18), ALPHABET.slice(18)];

export function Keyboard({
  onPressLetter,
  disabledLetters,
  disabled = false,
}: KeyboardProps) {
  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((letter) => {
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
              >
                <Text
                  style={[
                    styles.keyText,
                    isDisabled ? styles.keyTextDisabled : null,
                  ]}
                >
                  {letter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 4,
  },
  key: {
    width: 36,
    height: 44,
    marginHorizontal: 4,
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
    color: "white",
  },
  keyTextDisabled: {
    color: Colors.textDisabled,
  },
});
