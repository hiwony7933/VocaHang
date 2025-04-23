// App.tsx
import React, { useState } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView, StyleSheet, Platform, UIManager } from "react-native";
import { Colors } from "./src/constants/theme";
import { GNB } from "./src/components/GNB";
import { GameProvider } from "./src/components/GameProvider";

// 스크린 import
import { IntroScreen } from "./src/screens/IntroScreen";
import { VocaManScreen } from "./src/screens/VocaManScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SupportScreen } from "./src/screens/SupportScreen";
import { TutorialScreen } from "./src/screens/TutorialScreen";

// Android에서 LayoutAnimation 활성화
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Stack = createNativeStackNavigator();

function NavigationWrapper() {
  const navigation = useNavigation();
  const [isGNBVisible, setIsGNBVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Navigator
        id={undefined}
        initialRouteName="Intro"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="VocaMan" component={VocaManScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="Tutorial" component={TutorialScreen} />
      </Stack.Navigator>
      <GNB
        visible={isGNBVisible}
        onClose={() => setIsGNBVisible(false)}
        onNavigate={(screen) => {
          // @ts-expect-error navigation.navigate의 타입이 제대로 추론되지 않음
          navigation.navigate(screen);
          setIsGNBVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <GameProvider>
        <NavigationWrapper />
      </GameProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
