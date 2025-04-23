import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { GameProvider, useGame } from "../components/GameProvider";
import { GameBoard } from "../components/GameBoard";
import { GameModal } from "../components/GameModal";
import { Header } from "../components/Header";
import { GNB } from "../components/GNB";
import { Colors } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { LoadingScreen } from "../components/LoadingScreen";

const VocaManContent = () => {
  const [isGNBVisible, setIsGNBVisible] = useState(false);
  const navigation = useNavigation();
  const { isLoading } = useGame();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <Header onMenuPress={() => setIsGNBVisible(true)} />
      <GameBoard />
      <GameModal />
      <GNB
        visible={isGNBVisible}
        onClose={() => setIsGNBVisible(false)}
        onNavigate={(screen) => {
          navigation.navigate(screen as never);
          setIsGNBVisible(false);
        }}
      />
    </View>
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
});
