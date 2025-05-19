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

// 개별 풍선 애니메이션 컴포넌트
const FloatingBalloon = ({ size, delay }: { size: number; delay: number }) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -5, // 위로 이동
          duration: 500,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 5, // 아래로 이동
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0, // 원래 위치로
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateY, delay]);

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      <Text style={[styles.balloon, { fontSize: size }]}>🎈</Text>
    </Animated.View>
  );
};

export function BalloonLife({ remaining, onPopComplete }: BalloonLifeProps) {
  const prevRemaining = usePrevious(remaining);
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);

  // remaining 감소 시 poppedIndex 설정
  useEffect(() => {
    if (prevRemaining != null && remaining < prevRemaining) {
      setPoppedIndex(prevRemaining - 1);
    }
  }, [remaining, prevRemaining]);

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
  const calculatedSize = Math.max(24, Math.min(48, baseSize));
  const displaySize = calculatedSize * 1.2; // 풍선 크기 20% 증가

  const containerWidth = MAX_TRIES * displaySize + (MAX_TRIES - 1) * spacing; // 컨테이너 너비도 새 크기 반영

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      {Array.from({ length: MAX_TRIES }).map((_, i) => (
        <View
          key={i}
          style={[styles.slot, { width: displaySize, height: displaySize }]} // 슬롯 크기도 새 크기 반영
        >
          {/* 남은 기회만큼만 풍선 표시 */}
          {i < remaining && (
            <FloatingBalloon size={displaySize} delay={i * 200} /> // 각 풍선에 애니메이션과 delay 적용
          )}
          {/* 팡 애니메이션 */}
          {poppedIndex === i && (
            <BalloonPop size={displaySize} onComplete={handlePopComplete} /> // Pop 애니메이션에도 새 크기 적용
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
    alignItems: "center", // 슬롯들을 수직 중앙 정렬
    alignSelf: "center", // 중앙 정렬
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  slot: {
    alignItems: "center",
    justifyContent: "center", // 슬롯 내부 중앙 정렬
  },
  balloon: {
    margin: 0,
    textAlign: "center", // 이모지가 중앙에 오도록
  },
});
