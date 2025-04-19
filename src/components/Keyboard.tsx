// src/components/Keyboard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface KeyboardProps {
  onPressLetter: (letter: string) => void;
  disabledLetters: string[];           // 이미 눌렀거나 사용 불가한 글자 목록
}

const ALPHABET = Array.from(Array(26)).map((_, i) =>
  String.fromCharCode(65 + i)
);

export function Keyboard({ onPressLetter, disabledLetters }: KeyboardProps) {
  return (
    <View style={styles.container}>
      {ALPHABET.map(letter => {
        const disabled = disabledLetters.includes(letter);
        return (
          <TouchableOpacity
            key={letter}
            style={[styles.key, disabled && styles.keyDisabled]}
            onPress={() => !disabled && onPressLetter(letter)}
            activeOpacity={0.6}
            disabled={disabled}
          >
            <Text style={[styles.keyText, disabled && styles.keyTextDisabled]}>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20,
  },
  key: {
    width: 32,
    height: 32,
    margin: 4,
    borderRadius: 4,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDisabled: {
    backgroundColor: '#ccc',
  },
  keyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  keyTextDisabled: {
    color: '#888',
  },
});
