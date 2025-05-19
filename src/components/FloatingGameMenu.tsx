import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../constants/theme";
import { GameIcon, BookIcon, StatsIcon, SettingsIcon } from "./icons"; // InfoIcon 제거

const MENU_HEIGHT = Platform.OS === "ios" ? 80 : 60; // iOS는 하단 인디케이터 고려, Android는 60

const menuItems = [
  {
    name: "게임",
    icon: GameIcon,
    screen: "VocaMan",
  },
  {
    name: "게임방법",
    icon: BookIcon,
    screen: "HowToPlay",
  },
  {
    name: "통계",
    icon: StatsIcon,
    screen: "Dashboard",
  },
  {
    name: "설정",
    icon: SettingsIcon,
    screen: "Settings",
  },
  // "앱 정보" 메뉴 항목 제거
  // {
  //   name: "앱 정보",
  //   icon: InfoIcon,
  //   screen: "AppInfo",
  // },
];

export const FloatingGameMenu: React.FC = () => {
  const navigation = useNavigation();

  const handleNavigate = (screen: string) => {
    // @ts-expect-error navigation.navigate의 타입이 제대로 추론되지 않음
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={styles.menuItem}
          onPress={() => handleNavigate(item.screen)}
          activeOpacity={0.7}
        >
          <item.icon size={24} color={Colors.textSecondary} />
          <Text style={styles.menuText}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: MENU_HEIGHT,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start", // 아이콘과 텍스트를 위쪽으로 정렬
    paddingTop: 10, // 아이콘/텍스트 상단 여백
    backgroundColor: Colors.background, // 또는 Colors.white 등 원하는 배경색
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2, // 위쪽으로 그림자
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  menuItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // 내부 아이템들 중앙 정렬 (아이콘/텍스트 그룹)
  },
  menuText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4, // 아이콘과 텍스트 사이 간격
  },
});

// 이 컴포넌트에서 사용할 MENU_HEIGHT를 export하여 다른 파일에서 참조할 수 있도록 합니다.
export { MENU_HEIGHT as FLOATING_MENU_HEIGHT };
