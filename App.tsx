// App.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WordItem } from './src/types';
import wordsData from './assets/data/words.json';
import { Keyboard } from './src/components/Keyboard';
import { HangmanDrawing } from './src/components/HangmanDrawing';

type GameStatus = 'playing' | 'won' | 'lost';
interface Stats {
  wins: number;
  losses: number;
}
const STATS_KEY = 'VocaHangStats';

export default function App() {
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0 });
  const maxTries = 6;

  // -- 통계 로드
  useEffect(() => {
    AsyncStorage.getItem(STATS_KEY).then((raw) => {
      if (raw) setStats(JSON.parse(raw));
    });
  }, []);

  // -- 단어 초기화
  useEffect(pickNewWord, []);

  function pickNewWord() {
    const list: WordItem[] = (wordsData as any).wordList;
    const idx = Math.floor(Math.random() * list.length);
    setCurrentWord(list[idx]);
    setGuessedLetters([]);
    setGameStatus('playing');
  }

  // -- 틀린 글자 & 남은 기회
  const wrongLetters = currentWord
    ? guessedLetters.filter((l) =>
        currentWord.word.toUpperCase().includes(l) ? false : true
      )
    : [];
  const remainingTries = Math.max(0, maxTries - wrongLetters.length);
  const wrongCount = wrongLetters.length;

  // -- 승패 감지 & 통계 갱신
  useEffect(() => {
    if (!currentWord || gameStatus !== 'playing') return;

    const letters = currentWord.word.toUpperCase().split('');
    const isWin = letters.every((c) => guessedLetters.includes(c));

    if (isWin) {
      setGameStatus('won');
      const updated = { ...stats, wins: stats.wins + 1 };
      setStats(updated);
      AsyncStorage.setItem(STATS_KEY, JSON.stringify(updated));
    } else if (remainingTries <= 0) {
      setGameStatus('lost');
      const updated = { ...stats, losses: stats.losses + 1 };
      setStats(updated);
      AsyncStorage.setItem(STATS_KEY, JSON.stringify(updated));
    }
  }, [guessedLetters, remainingTries]);

  const handlePressLetter = (letter: string) => {
    if (gameStatus !== 'playing') return;
    setGuessedLetters((p) => [...p, letter]);
  };

  const handleNext = () => pickNewWord();

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>VocaHang 🚀</Text>

      {/* 통계 표시 */}
      <View style={styles.stats}>
        <Text>🏆 Wins: {stats.wins}</Text>
        <Text>💀 Losses: {stats.losses}</Text>
      </View>

      {/* 행맨 그림 */}
      <HangmanDrawing wrongCount={wrongCount} />

      {/* 단어 자리 표시 */}
      <View style={styles.placeholdersContainer}>
        {currentWord.word
          .toUpperCase()
          .split('')
          .map((char, i) => (
            <Text key={i} style={styles.letterPlaceholder}>
              {guessedLetters.includes(char) ? char : '_'}
            </Text>
          ))}
      </View>

      {/* 힌트 */}
      <Text style={styles.hintText}>힌트1: {currentWord.hints.hint1}</Text>
      <Text style={styles.hintText}>힌트2: {currentWord.hints.hint2}</Text>

      {/* 상태 표시 */}
      <Text style={styles.infoText}>남은 기회: {remainingTries}</Text>
      <Text style={styles.infoText}>
        틀린 글자: {wrongLetters.join(', ') || '없음'}
      </Text>

      {/* 키보드 */}
      <Keyboard
        onPressLetter={handlePressLetter}
        disabledLetters={guessedLetters}
      />

      {/* 결과 모달 */}
      <Modal visible={gameStatus !== 'playing'} transparent animationType="fade">
        <View style={modal.overlay}>
          <View style={modal.modal}>
            <Text style={modal.title}>
              {gameStatus === 'won' ? '🎉 You Win!' : '😢 You Lose'}
            </Text>
            {gameStatus === 'lost' && (
              <Text style={modal.answer}>
                Answer: {currentWord.word.toUpperCase()}
              </Text>
            )}
            <TouchableOpacity style={modal.button} onPress={handleNext}>
              <Text style={modal.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginVertical: 10 },
  stats: { flexDirection: 'row', gap: 20, marginBottom: 10 },
  placeholdersContainer: { flexDirection: 'row', marginVertical: 20 },
  letterPlaceholder: { fontSize: 40, marginHorizontal: 5 },
  hintText: { fontSize: 18, color: '#555', marginVertical: 4 },
  infoText: { fontSize: 16, marginVertical: 2 },
});
  
const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000099', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', padding: 24, borderRadius: 8, width: '80%', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  answer: { fontSize: 18, color: '#b00', marginBottom: 20 },
  button: { backgroundColor: '#0066cc', padding: 10, borderRadius: 4 },
  buttonText: { color: '#fff', fontSize: 16 },
});
