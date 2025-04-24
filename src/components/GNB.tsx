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
} from "./icons";

interface GNBProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

export const GNB: React.FC<GNBProps> = ({ visible, onClose, onNavigate }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get("window");
  const isWeb = Platform.OS === "web";

  // PC 환경에서는 더 작은 너비 사용
  const menuWidth = isWeb ? Math.min(360, width * 0.3) : width * 0.7;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const menuItems = [
    {
      name: "게임",
      icon: GameIcon,
      screen: "VocaMan",
    },
    {
      name: "튜토리얼",
      icon: BookIcon,
      screen: "Tutorial",
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
    // {
    //   name: "후원하기",
    //   icon: HeartIcon,
    //   screen: "Support",
    // },
  ];

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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
