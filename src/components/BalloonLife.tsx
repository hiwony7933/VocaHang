// src/components/BalloonLife.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface BalloonLifeProps {
  remaining: number; // 남은 기회 (0~6)
}

export function BalloonLife({ remaining }: BalloonLifeProps) {
  // 🎈 이모지를 remaining 개수만큼 표시
  const balloons = Array.from({ length: remaining }).map((_, i) => (
    <Text key={i} style={styles.balloon}>
      🎈
    </Text>
  ));

  return (
    <View style={styles.container}>
      {balloons}
      {/* 모두 날아가면 팡! 아이콘으로 대체 */}
      {remaining === 0 && <Text style={styles.pop}>💥</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 24, // 위아래 여백 살짝 더
    justifyContent: "center",
  },
  balloon: {
    fontSize: 48, // 크기를 32→48로 키움
    marginHorizontal: 6,
  },
  pop: {
    fontSize: 48, // 팡! 아이콘도 동일 크기
    marginHorizontal: 6,
  },
});
