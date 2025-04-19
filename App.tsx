// App.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WordItem } from './src/types';
import wordsData from './assets/data/words.json';

export default function App() {
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);

  useEffect(() => {
    const wordList: WordItem[] = (wordsData as any).wordList;
    const randomIndex = Math.floor(Math.random() * wordList.length);
    setCurrentWord(wordList[randomIndex]);
  }, []);

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text>Loading…</Text>
      </View>
    );
  }

  const renderPlaceholders = (length: number) => {
    return Array.from({ length }).map((_, i) => (
      <Text key={i} style={styles.letterPlaceholder}>
        _
      </Text>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VocaHang 🚀</Text>

      {/* 밑줄 표시 */}
      <View style={styles.placeholdersContainer}>
        {renderPlaceholders(currentWord.word.length)}
      </View>

      {/* 힌트1, 힌트2 노출 */}
      <Text style={styles.hintText}>힌트1: {currentWord.hints.hint1}</Text>
      <Text style={styles.hintText}>힌트2: {currentWord.hints.hint2}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
