// src/components/Keyboard.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Colors } from "../constants/theme";

interface KeyboardProps {
  onPressLetter: (letter: string) => void;
  layout: "alphabet" | "qwerty";
}

const ALPHABET = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const QWERTY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export function Keyboard({ onPressLetter, layout }: KeyboardProps) {
  const screenWidth = Dimensions.get("window").width;
  const isSmallScreen = screenWidth < 380;

  // 키 크기 계산
  const keySize = isSmallScreen ? 32 : 32;
  const keyMargin = 2;
  const keyFontSize = isSmallScreen ? 16 : 18;

  const renderKeys = () => {
    if (layout === "alphabet") {
      return (
        <View style={styles.row}>
          {ALPHABET.map((letter) => (
            <Pressable
              key={letter}
              onPress={() => onPressLetter(letter)}
              style={({ pressed }) => [
                styles.key,
                pressed ? styles.keyPressed : styles.keyEnabled,
                { width: keySize, height: keySize * 1.2, margin: keyMargin },
              ]}
              android_ripple={{ color: Colors.primaryDark }}
              accessibilityRole="button"
              accessibilityLabel={`키 ${letter}`}
            >
              <Text style={[styles.keyText, { fontSize: keyFontSize }]}>
                {letter}
              </Text>
            </Pressable>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.qwertyContainer}>
        {QWERTY_ROWS.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={[
              styles.qwertyRow,
              rowIndex === 1 && { paddingHorizontal: keySize * 0.25 },
              rowIndex === 2 && { paddingHorizontal: keySize * 0.75 },
            ]}
          >
            {row.map((letter) => (
              <Pressable
                key={letter}
                onPress={() => onPressLetter(letter)}
                style={({ pressed }) => [
                  styles.key,
                  pressed ? styles.keyPressed : styles.keyEnabled,
                  { width: keySize, height: keySize * 1.2, margin: keyMargin },
                ]}
                android_ripple={{ color: Colors.primaryDark }}
                accessibilityRole="button"
                accessibilityLabel={`키 ${letter}`}
              >
                <Text style={[styles.keyText, { fontSize: keyFontSize }]}>
                  {letter}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return <View style={styles.container}>{renderKeys()}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 8,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  qwertyContainer: {
    width: "100%",
    paddingHorizontal: 4,
  },
  qwertyRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
  },
  key: {
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  keyEnabled: {
    backgroundColor: Colors.primary,
  },
  keyPressed: {
    backgroundColor: Colors.primaryDark,
  },
  keyText: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
