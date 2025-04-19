// src/components/HangmanDrawing.tsx
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface HangmanDrawingProps {
  wrongCount: number; // 틀린 횟수 (0~6)
}

export function HangmanDrawing({ wrongCount }: HangmanDrawingProps) {
  // 이미지 파일을 단계별로 import/require
  const images = [
    require('../../assets/images/hangman-0.png'),
    require('../../assets/images/hangman-1.png'),
    require('../../assets/images/hangman-2.png'),
    require('../../assets/images/hangman-3.png'),
    require('../../assets/images/hangman-4.png'),
    require('../../assets/images/hangman-5.png'),
    require('../../assets/images/hangman-6.png'),
  ];

  // wrongCount가 0~6 범위를 넘어갈 경우 안전하게 clamp
  const index = Math.min(Math.max(wrongCount, 0), images.length - 1);

  return (
    <View style={styles.container}>
      <Image source={images[index]} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    width: '80%',
    height: 200,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
