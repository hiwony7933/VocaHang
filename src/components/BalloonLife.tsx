// src/components/BalloonLife.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Animated, Text, StyleSheet, Dimensions } from "react-native";

// 최대 슬롯 수
const MAX_TRIES = 6;

// 이전 값 저장 훅
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// 터지는 애니메이션 컴포넌트
function BalloonPop({
  size,
  onComplete,
}: {
  size: number;
  onComplete(): void;
}) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 2,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start(onComplete);
  }, []);

  return (
    <Animated.Text
      style={[
        styles.balloon,
        {
          position: "absolute",
          transform: [{ scale }],
          opacity,
          fontSize: size,
        },
      ]}
    >
      💥
    </Animated.Text>
  );
}

interface BalloonLifeProps {
  remaining: number; // 남은 기회 수
  onPopComplete: () => void; // 팡 애니메이션 완료 콜백
}

export function BalloonLife({ remaining, onPopComplete }: BalloonLifeProps) {
  const prevRemaining = usePrevious(remaining);
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);

  // remaining 감소 시 poppedIndex 설정
  useEffect(() => {
    if (prevRemaining != null && remaining < prevRemaining) {
      setPoppedIndex(prevRemaining - 1);
    }
  }, [remaining]);

  // 팡 애니메이션 완료 핸들러
  const handlePopComplete = () => {
    setPoppedIndex(null);
    onPopComplete();
  };

  // 화면 크기 기반 슬롯 크기 및 컨테이너 계산
  const screenWidth = Dimensions.get("window").width;
  const spacing = 8; // 슬롯 간격
  const horizontalPadding = 32 * 2; // 좌우 패딩
  const totalMargin = horizontalPadding + (MAX_TRIES - 1) * spacing;
  const baseSize = (screenWidth - totalMargin) / MAX_TRIES;
  const size = Math.max(24, Math.min(48, baseSize));
  const containerWidth = MAX_TRIES * size + (MAX_TRIES - 1) * spacing;

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      {Array.from({ length: MAX_TRIES }).map((_, i) => (
        <View key={i} style={[styles.slot, { width: size, height: size }]}>
          {/* 남은 기회만큼만 풍선 표시 */}
          {i < remaining && (
            <Text style={[styles.balloon, { fontSize: size }]}>🎈</Text>
          )}
          {/* 팡 애니메이션 */}
          {poppedIndex === i && (
            <BalloonPop size={size} onComplete={handlePopComplete} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // 한 줄 레이아웃
    justifyContent: "space-between", // 슬롯 간 균등 간격
    alignSelf: "center", // 중앙 정렬
    marginTop: 12,
    marginBottom: 12,
  },
  slot: {
    alignItems: "center",
    justifyContent: "center", // 슬롯 내부 중앙 정렬
  },
  balloon: {
    margin: 0,
  },
});
