import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Text,
  Animated,
  Dimensions,
  Platform,
  // StyleProp, ViewStyle, // StyleProp과 ViewStyle이 필요하면 주석 해제
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import {
  GameIcon,
  BookIcon,
  StatsIcon,
  SettingsIcon,
  InfoIcon,
  // HeartIcon,
  // LoginIcon, // LoginIcon은 아직 없으므로 주석 처리 또는 다른 아이콘으로 대체
} from "./icons";
import { RootStackParamList } from "../../App";
import { useAuth } from "../contexts/AuthContext";

// 아이콘 컴포넌트가 받는 Props 정의
interface IconProps {
  size: number; // size는 필수로 받는 것으로 보임
  color: string; // color도 필수로 받는 것으로 보임
  // style?: StyleProp<ViewStyle>; // 아이콘에 스타일 prop이 필요하다면 추가
}

type IconComponent = React.FC<IconProps>; // IconProps 사용

interface MenuItem {
  name: string;
  icon: IconComponent;
  screen: keyof RootStackParamList;
}

interface GNBProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: keyof RootStackParamList) => void;
}

export const GNB: React.FC<GNBProps> = ({ visible, onClose, onNavigate }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get("window");
  const isWeb = Platform.OS === "web";
  const { isAuthenticated } = useAuth();

  const menuWidth = isWeb ? Math.min(360, width * 0.3) : width * 0.7;

  React.useEffect(() => {
    const useNativeDriver = Platform.OS !== "web";
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: useNativeDriver,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: useNativeDriver,
      }).start();
    }
  }, [visible, fadeAnim]);

  const baseMenuItems: MenuItem[] = [
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
    {
      name: "앱 정보",
      icon: InfoIcon,
      screen: "AppInfo",
    },
  ];

  const menuItems: MenuItem[] = !isAuthenticated
    ? [
        ...baseMenuItems,
        {
          name: "로그인",
          icon: InfoIcon,
          screen: "Login",
        },
      ]
    : baseMenuItems;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay} edges={["top", "left", "right"]}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={onClose}
          />
          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                height: height,
                width: menuWidth,
                right: 0,
              },
              Platform.OS === "web" && styles.containerWeb,
            ]}
          >
            <View style={styles.menuContainer}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.screen}
                  style={styles.menuItem}
                  onPress={() => {
                    onNavigate(item.screen);
                    onClose();
                  }}
                >
                  <item.icon size={24} color={Colors.text} />
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuText}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  overlayTouchable: {
    flex: 1,
  },
  container: {
    position: "absolute",
    top: 0,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
        }
      : {
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }),
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuTextContainer: {
    marginLeft: 16,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text,
  },
  containerWeb: {
    maxWidth: 360,
    margin: "auto",
  },
});
