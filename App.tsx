// App.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WordItem } from './src/types';
import wordsData from './assets/data/words.json';
import { Keyboard } from './src/components/Keyboard';

export default function App() {
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);

  useEffect(() => {
    const wordList: WordItem[] = (wordsData as any).wordList;
    const randomIndex = Math.floor(Math.random() * wordList.length);
    setCurrentWord(wordList[randomIndex]);
  }, []);

  const handlePressLetter = (letter: string) => {
    setGuessedLetters(prev => [...prev, letter]);
  };

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text>Loading…</Text>
      </View>
    );
  }

  // placeholder rendering (단어 미완성 상태)
  const renderPlaceholders = () => {
    return currentWord.word
      .toUpperCase()
      .split('')
      .map((char, i) => {
        const show = guessedLetters.includes(char);
        return (
          <Text key={i} style={styles.letterPlaceholder}>
            {show ? char : '_'}
          </Text>
        );
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VocaHang 🚀</Text>

      {/* 밑줄 + 맞춘 글자 렌더링 */}
      <View style={styles.placeholdersContainer}>
        {renderPlaceholders()}
      </View>

      {/* 힌트1 · 힌트2 */}
      <Text style={styles.hintText}>힌트1: {currentWord.hints.hint1}</Text>
      <Text style={styles.hintText}>힌트2: {currentWord.hints.hint2}</Text>

      {/* 1단계: 가상 키보드 */}
      <Keyboard
        onPressLetter={handlePressLetter}
        disabledLetters={guessedLetters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  placeholdersContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  letterPlaceholder: {
    fontSize: 40,
    marginHorizontal: 5,
  },
  hintText: {
    fontSize: 18,
    color: '#555',
    marginTop: 8,
  },
});
