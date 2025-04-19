// App.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { WordItem } from './src/types';
import wordsData from './assets/data/words.json';
import { Keyboard } from './src/components/Keyboard';

export default function App() {
  // 1) Hook들은 무조건 최상단에
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);

  const maxTries = 6;

  // 2) 초기 단어 로드
  useEffect(() => {
    const list: WordItem[] = (wordsData as any).wordList;
    const idx = Math.floor(Math.random() * list.length);
    setCurrentWord(list[idx]);
  }, []);

  // 3) 승패 감지도 항상 Hook으로 호출 (조건 검사는 내부에서)
  useEffect(() => {
    if (!currentWord) return;      // 로드 전엔 건너뛰기

    // 맞춘 글자 검사
    const isWin = currentWord.word
      .toUpperCase()
      .split('')
      .every((c) => guessedLetters.includes(c));

    // 틀린 글자 수로 남은 기회 계산
    const wrongs = guessedLetters.filter(
      (l) => !currentWord.word.toUpperCase().includes(l)
    );
    const remaining = maxTries - wrongs.length;

    if (isWin) {
      Alert.alert('🎉 축하합니다!', '단어를 모두 맞추셨어요!', [
        { text: '다시하기', onPress: resetGame },
      ]);
    } else if (remaining <= 0) {
      Alert.alert(
        '😢 실패했습니다',
        `정답은 "${currentWord.word.toUpperCase()}"입니다.`,
        [{ text: '다시하기', onPress: resetGame }]
      );
    }
  }, [guessedLetters, currentWord]); // currentWord도 의존성에 포함

  // 4) 게임 초기화 함수
  const resetGame = () => {
    const list: WordItem[] = (wordsData as any).wordList;
    const idx = Math.floor(Math.random() * list.length);
    setCurrentWord(list[idx]);
    setGuessedLetters([]);
  };

  // 5) 렌더링 전에 남은 기회·틀린 글자 계산
  const wrongLetters = currentWord
    ? guessedLetters.filter(
        (l) => !currentWord.word.toUpperCase().includes(l)
      )
    : [];
  const remainingTries = maxTries - wrongLetters.length;

  // 6) 로드 전엔 간단히 표시
  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text>Loading…</Text>
      </View>
    );
  }

  // 7) UI 렌더링
  return (
    <View style={styles.container}>
      <Text style={styles.title}>VocaHang 🚀</Text>

      {/* 밑줄 + 맞춘 글자 */}
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
        onPressLetter={(l) => setGuessedLetters((p) => [...p, l])}
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
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 30 },
  placeholdersContainer: { flexDirection: 'row', marginBottom: 20 },
  letterPlaceholder: { fontSize: 40, marginHorizontal: 5 },
  hintText: { fontSize: 18, color: '#555', marginTop: 8 },
  infoText: { marginTop: 12, fontSize: 16, color: '#333' },
});
