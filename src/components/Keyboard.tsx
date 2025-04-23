// src/components/Keyboard.tsx
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Colors } from "../constants/theme";
import { useGame } from "./GameProvider"; // Import useGame hook

interface KeyboardProps {
  onPressLetter: (letter: string) => void;
  disabledKeys?: string[];
  isInputEnabled?: boolean;
}

const ALPHABET = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const QWERTY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export function Keyboard({
  onPressLetter,
  disabledKeys = [],
  isInputEnabled = true,
}: KeyboardProps) {
  const { keyboardLayout } = useGame();
  const screenWidth = Dimensions.get("window").width;
  const isSmallScreen = screenWidth < 380;
  const isWeb = Platform.OS === "web";

  // 키보드 크기 계산
  const containerPadding = 8;
  const maxKeyboardWidth = isWeb ? 600 : screenWidth; // PC에서는 최대 600px로 제한
  const totalWidth = Math.min(
    maxKeyboardWidth - containerPadding * 2,
    screenWidth - containerPadding * 2
  );
  const qwertyKeysInRow = 10; // 첫 번째 줄의 키 개수
  const keyMargin = 2;
  const keyWidth = Math.floor(
    (totalWidth - keyMargin * 2 * qwertyKeysInRow) / qwertyKeysInRow
  );
  const keyHeight = Math.floor(keyWidth * 1.2);
  const keyFontSize = isSmallScreen ? 14 : 16;

  const renderKeys = () => {
    const rows = keyboardLayout === "qwerty" ? QWERTY_ROWS : [ALPHABET];

    return (
      <View style={styles.baseContainer}>
        {rows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={[
              styles.row,
              keyboardLayout === "qwerty"
                ? {
                    paddingHorizontal:
                      rowIndex === 1
                        ? keyWidth * 0.25
                        : rowIndex === 2
                        ? keyWidth * 0.75
                        : 0,
                    flexWrap: "nowrap",
                    width: "100%",
                    maxWidth: maxKeyboardWidth,
                  }
                : {
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    width: "100%",
                    maxWidth: maxKeyboardWidth,
                    paddingHorizontal: 4,
                  },
            ]}
          >
            {row.map((letter) => {
              const isDisabled =
                disabledKeys.includes(letter) || !isInputEnabled;
              return (
                <Pressable
                  key={letter}
                  onPress={() => onPressLetter(letter)}
                  style={({ pressed }) => [
                    styles.key,
                    isDisabled
                      ? styles.keyDisabled
                      : pressed
                      ? styles.keyPressed
                      : styles.keyEnabled,
                    {
                      width: keyWidth,
                      height: keyHeight,
                      margin: keyMargin,
                    },
                  ]}
                  disabled={isDisabled}
                  android_ripple={{ color: Colors.primaryDark }}
                  accessibilityRole="button"
                  accessibilityLabel={`키 ${letter}${
                    isDisabled ? ", 비활성화됨" : ""
                  }`}
                >
                  <Text
                    style={[
                      styles.keyText,
                      isDisabled && styles.keyTextDisabled,
                      { fontSize: keyFontSize },
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
  };

  return (
    <View
      style={[
        styles.keyboardWrapper,
        {
          padding: containerPadding,
          maxWidth: maxKeyboardWidth,
          alignSelf: "center",
          width: "100%",
        },
      ]}
    >
      {renderKeys()}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardWrapper: {
    alignItems: "center",
    marginVertical: 8,
  },
  baseContainer: {
    width: "100%",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
    alignItems: "center",
  },
  key: {
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  keyEnabled: {
    backgroundColor: Colors.primary,
  },
  keyDisabled: {
    backgroundColor: Colors.disabled,
    opacity: 0.6,
  },
  keyPressed: {
    backgroundColor: Colors.primaryDark,
  },
  keyText: {
    fontWeight: "600",
    color: Colors.background,
  },
  keyTextDisabled: {
    color: Colors.textSecondary,
  },
});
