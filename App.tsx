// App.tsx
import React, { useState } from "react";
import { NavigationContainer, NavigationState } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Platform, UIManager, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Colors } from "./src/constants/theme";
import { GameProvider } from "./src/components/GameProvider";
import {
  FloatingGameMenu,
  FLOATING_MENU_HEIGHT,
} from "./src/components/FloatingGameMenu";
import { Header } from "./src/components/Header";

// 스크린 import
import { IntroScreen } from "./src/screens/IntroScreen";
import { VocaManScreen } from "./src/screens/VocaManScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SupportScreen } from "./src/screens/SupportScreen";
import { HowToPlayScreen } from "./src/screens/HowToPlayScreen";
import AppInfoScreen from "./src/screens/AppInfoScreen";

// Android에서 LayoutAnimation 활성화
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Stack = createNativeStackNavigator();

// 플로팅 메뉴를 표시하지 않을 화면 목록
const SCREENS_WITHOUT_FLOATING_MENU = ["Intro"];
const SCREENS_WITHOUT_HEADER = ["Intro"];

export default function App() {
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>(
    "Intro"
  );

  const handleNavigationStateChange = (state: NavigationState | undefined) => {
    if (state) {
      const route = state.routes[state.index];
      setCurrentRouteName(route.name);
      // console.log("Current Route:", route.name); // 개발 중 확인용 로그
    }
  };

  const showFloatingMenu =
    currentRouteName &&
    !SCREENS_WITHOUT_FLOATING_MENU.includes(currentRouteName);
  const showHeader =
    currentRouteName && !SCREENS_WITHOUT_HEADER.includes(currentRouteName);

  return (
    <>
      <StatusBar style="dark" backgroundColor="#fff" translucent={false} />
      <SafeAreaProvider>
        <NavigationContainer onStateChange={handleNavigationStateChange}>
          <GameProvider>
            <View style={styles.appRootContainer}>
              <SafeAreaView
                style={[
                  styles.navigatorContainer,
                  showFloatingMenu && { paddingBottom: FLOATING_MENU_HEIGHT },
                ]}
                edges={
                  showFloatingMenu
                    ? ["top", "left", "right"]
                    : ["top", "left", "right", "bottom"]
                }
              >
                {showHeader && <Header />}
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
                  <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
                  <Stack.Screen name="AppInfo" component={AppInfoScreen} />
                </Stack.Navigator>
              </SafeAreaView>
              {showFloatingMenu && <FloatingGameMenu />}
            </View>
          </GameProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </>
  );
}

const styles = StyleSheet.create({
  appRootContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navigatorContainer: {
    flex: 1,
  },
});
