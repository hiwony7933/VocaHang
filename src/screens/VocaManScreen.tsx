import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GameProvider, useGame } from "../components/GameProvider";
import { GameBoard } from "../components/GameBoard";
import { GameModal } from "../components/GameModal";
import { Colors } from "../constants/theme";
import { LoadingScreen } from "../components/LoadingScreen";

const VocaManContent = () => {
  const { isLoading } = useGame();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <GameBoard />
      </ScrollView>
      <GameModal />
    </SafeAreaView>
  );
};

export const VocaManScreen: React.FC = () => {
  return (
    <GameProvider>
      <VocaManContent />
    </GameProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 10,
  },
});
