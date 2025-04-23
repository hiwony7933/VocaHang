import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { Colors } from "../constants/theme";

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>단어를 불러오는 중...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
  },
});
