// src/components/BalloonLife.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';

// 최대 슬롯 수
const MAX_TRIES = 6;

// 이전 값 저장 훅
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => { ref.current = value }, [value]);
  return ref.current;
}

// 터지는 애니메이션 컴포넌트
function BalloonPop({ size, onComplete }: { size: number; onComplete(): void }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale,    { toValue: 2, duration: 400, useNativeDriver: false }),
      Animated.timing(opacity,  { toValue: 0, duration: 400, useNativeDriver: false }),
    ]).start(onComplete);
  }, []);

  return (
    <Animated.Text
      style={[
        styles.balloon,
        { fontSize: size, position: 'absolute', transform: [{ scale }], opacity }
      ]}
    >
      💥
    </Animated.Text>
  );
}
  interface BalloonLifeProps {
    remaining: number;
    onPopComplete: () => void;  // 추가된 prop
  }
  export function BalloonLife({ remaining, onPopComplete }: BalloonLifeProps) {
  const screenWidth = Dimensions.get('window').width;
  // 한 줄에 최대 3개씩 배치하되 좌우 패딩과 슬롯 간격 반영
  const totalMargin = 32 * 2 + MAX_TRIES * 8;
  const maxSize = (screenWidth - totalMargin) / 3;
  // 기본 크기 계산 후 20% 확대
  const baseSize = Math.max(24, Math.min(48, maxSize));
  const size = baseSize * 1.2;

  const prev = usePrevious(remaining);
  const [showPop, setShowPop] = useState(false);
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (prev != null && remaining < prev) {
      setPoppedIndex(prev - 1);
      setShowPop(true);
    }
  }, [remaining]);

  const handlePopComplete = () => {
    setShowPop(false);
    setPoppedIndex(null);
        setPoppedIndex(null);
    // 여기서 App으로 “애니메이션 끝났다”를 알립니다!
    onPopComplete();
  };

  // 2행×3열 슬롯 인덱스
  const rows = [
    [0,1,2],
    [3,4,5],
  ];

  return (
    <View style={styles.container}>
      {rows.map((row, ridx) => (
        <View style={styles.row} key={ridx}>
          {row.map(i => (
            <View key={i} style={[styles.slot, { width: size, height: size }]}>  
              {i < remaining && (
                <Text style={[styles.balloon, { fontSize: size }]}>
                  🎈
                </Text>
              )}
              {showPop && i === poppedIndex && (
                <BalloonPop size={size} onComplete={handlePopComplete} />
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 32,
    marginVertical: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 4,
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginVertical: 8,
  },
  balloon: {
    margin: 0,
  },
});
