// App.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { WordItem } from './src/types';
import wordsData from './assets/data/words.json';
import { Keyboard } from './src/components/Keyboard';
import { HangmanDrawing } from './src/components/HangmanDrawing';

type GameStatus = 'playing' | 'won' | 'lost';

export default function App() {
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const maxTries = 6;

  // 1) 랜덤 단어 로드
  useEffect(() => {
    pickNewWord();
  }, []);

  const pickNewWord = () => {
    const list: WordItem[] = (wordsData as any).wordList;
    const idx = Math.floor(Math.random() * list.length);
    setCurrentWord(list[idx]);
    setGuessedLetters([]);
    setGameStatus('playing');
  };

  // 2) 틀린 글자·남은 기회 계산
  const wrongLetters = currentWord
    ? guessedLetters.filter(
        (l) => !currentWord.word.toUpperCase().includes(l)
      )
    : [];
  const remainingTries = Math.max(0, maxTries - wrongLetters.length);
  const wrongCount = wrongLetters.length;

  // 3) 승패 감지
  useEffect(() => {
    if (!currentWord || gameStatus !== 'playing') return;

    const chars = currentWord.word.toUpperCase().split('');
    const isWin = chars.every((c) => guessedLetters.includes(c));

    if (isWin) {
      setGameStatus('won');
    } else if (remainingTries <= 0) {
      setGameStatus('lost');
    }
  }, [guessedLetters, currentWord, remainingTries, gameStatus]);

  // 4) 키보드 입력 핸들러
  const handlePressLetter = (letter: string) => {
    if (gameStatus !== 'playing') return; // 게임 중이 아닐 땐 무시
    setGuessedLetters((prev) => [...prev, letter]);
  };

  // 5) 모달에서 다음 문제 버튼 눌렀을 때
  const handleNext = () => {
    pickNewWord();
  };

  // 6) 로딩 처리
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

      {/* 가상 키보드 */}
      <Keyboard
        onPressLetter={handlePressLetter}
        disabledLetters={guessedLetters}
      />

      {/* 승패 모달 */}
      <Modal visible={gameStatus !== 'playing'} transparent animationType="fade">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modal}>
            <Text style={modalStyles.modalTitle}>
              {gameStatus === 'won' ? '🎉 정답!' : '😢 아쉽네요'}
            </Text>
            {gameStatus === 'lost' && (
              <Text style={modalStyles.correctAnswer}>
                정답: {currentWord.word.toUpperCase()}
              </Text>
            )}
            <TouchableOpacity style={modalStyles.button} onPress={handleNext}>
              <Text style={modalStyles.buttonText}>다음 문제</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  placeholdersContainer: { flexDirection: 'row', marginBottom: 20 },
  letterPlaceholder: { fontSize: 40, marginHorizontal: 5 },
  hintText: { fontSize: 18, color: '#555', marginTop: 8 },
  infoText: { marginTop: 12, fontSize: 16, color: '#333' },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000077',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  correctAnswer: {
    fontSize: 18,
    marginBottom: 20,
    color: '#b00',
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
