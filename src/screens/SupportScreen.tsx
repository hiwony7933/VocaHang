import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { Header } from "../components/Header";
import { GNB } from "../components/GNB";
import { useNavigation } from "@react-navigation/native";

export const SupportScreen = () => {
  const [isGNBVisible, setIsGNBVisible] = useState(false);
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Header onMenuPress={() => setIsGNBVisible(true)} />
      <View style={styles.content}>
        <Text style={styles.title}>후원하기</Text>
        <Text style={styles.comingSoon}>준비 중입니다...</Text>
      </View>
      <GNB
        visible={isGNBVisible}
        onClose={() => setIsGNBVisible(false)}
        onNavigate={(screen) => {
          navigation.navigate(screen as never);
          setIsGNBVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 20,
  },
  comingSoon: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
