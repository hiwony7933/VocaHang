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
  container: { flexDirection: "row", marginVertical: 16 },
  balloon: { fontSize: 32, marginHorizontal: 4 },
  pop: { fontSize: 32, marginHorizontal: 4 },
});
