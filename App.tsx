// App.tsx
import React, { useState, useEffect } from "react";
import {
  NavigationContainer,
  useNavigation,
  DefaultTheme,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import {
  StyleSheet,
  Platform,
  UIManager,
  ActivityIndicator,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Colors } from "./src/constants/theme";
import { GNB } from "./src/components/GNB";
import { GameProvider } from "./src/components/GameProvider";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { initGoogleSignIn } from "./src/lib/socialAuthService";

// 스크린 import
import { IntroScreen } from "./src/screens/IntroScreen";
import { VocaManScreen } from "./src/screens/VocaManScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SupportScreen } from "./src/screens/SupportScreen";
import { HowToPlayScreen } from "./src/screens/HowToPlayScreen";
import AppInfoScreen from "./src/screens/AppInfoScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import LoginScreen from "./src/screens/LoginScreen";

// Android에서 LayoutAnimation 활성화
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 네비게이션 스택 파라미터 리스트 정의
export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  // Main App Stack
  Intro: undefined;
  VocaMan: undefined;
  Dashboard: undefined;
  Settings: undefined;
  Support: undefined;
  HowToPlay: undefined;
  AppInfo: undefined;
  // 새로운 스크린 추가 시 여기에 정의
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// 인증 관련 스크린들을 위한 네비게이터
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// 로그인 후 보여줄 메인 앱 스크린들을 위한 네비게이터 (기존 NavigationWrapper 역할)
function MainAppNavigator() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isGNBVisible, setIsGNBVisible] = useState(false);

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <Stack.Navigator
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
      <GNB
        visible={isGNBVisible}
        onClose={() => setIsGNBVisible(false)}
        onNavigate={(screenName: keyof RootStackParamList) => {
          navigation.navigate(screenName);
          setIsGNBVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

// 앱의 루트 네비게이션 로직
function AppNavigation() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // 로딩 중에는 스플래시 화면이나 로딩 인디케이터를 보여줄 수 있습니다.
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: Colors.background },
      }}
    >
      {isAuthenticated ? <MainAppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  // 앱 시작 시 구글 로그인 초기화
  useEffect(() => {
    const setupGoogleSignIn = async () => {
      try {
        await initGoogleSignIn();
        console.log("Google Sign-In initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Google Sign-In:", error);
      }
    };

    setupGoogleSignIn();
  }, []);

  return (
    <>
      <StatusBar style="dark" backgroundColor="#fff" translucent={false} />
      <SafeAreaProvider>
        <AuthProvider>
          <GameProvider>
            <AppNavigation />
          </GameProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});
