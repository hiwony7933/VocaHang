import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { Header } from "../components/Header";
import { GNB } from "../components/GNB";
import { useNavigation } from "@react-navigation/native";
import { useGame } from "../components/GameProvider";

export const HowToPlayScreen: React.FC = () => {
  const [isGNBVisible, setIsGNBVisible] = useState(false);
  const navigation = useNavigation();
  const { showHowToPlayOnStart, setShowHowToPlayOnStart } = useGame();

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      <Header onMenuPress={() => setIsGNBVisible(true)} />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>게임 방법</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 게임 목표</Text>
          <Text style={styles.description}>
            • 주어진 힌트를 보고 영단어를 맞추는 게임입니다.{"\n"}• 틀린 글자를
            입력할 때마다 풍선이 하나씩 터집니다.{"\n"}• 모든 풍선이 터지기 전에
            단어를 맞춰보세요!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 게임 진행</Text>
          <Text style={styles.description}>
            • 두 개의 힌트가 제공됩니다.{"\n"}• 키보드에서 알맞은 알파벳을
            선택하세요.{"\n"}• 틀린 글자는 화면에 표시됩니다.{"\n"}• 6번의
            기회가 있습니다. (풍선 6개)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 키보드 설정</Text>
          <Text style={styles.description}>
            • 설정에서 키보드 배열을 변경할 수 있습니다.{"\n"}• QWERTY: 일반
            키보드 배열{"\n"}• ABC: 알파벳 순서 배열
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 통계 시스템</Text>
          <View style={styles.statItem}>
            <Text style={styles.statTitle}>🏆 승리 (Wins)</Text>
            <Text style={styles.description}>
              • 지금까지 성공적으로 맞춘 단어의 총 개수입니다.{"\n"}• 제한된
              기회 안에 단어를 맞출 때마다 증가합니다.
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statTitle}>💀 패배 (Losses)</Text>
            <Text style={styles.description}>
              • 단어를 맞추지 못한 총 횟수입니다.{"\n"}• 모든 풍선이 터져서
              실패할 때마다 증가합니다.
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statTitle}>🔥 연승 (Streak)</Text>
            <Text style={styles.description}>
              • 현재 연속으로 단어를 맞춘 횟수입니다.{"\n"}• 게임에 실패하면
              0으로 초기화됩니다.{"\n"}• 연승을 이어가면서 실력 향상을
              확인해보세요!
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statTitle}>🏅 최고 기록 (Best)</Text>
            <Text style={styles.description}>
              • 가장 길게 이어간 연승 기록입니다.{"\n"}• 현재 연승이 이전 기록을
              넘으면 자동으로 갱신됩니다.{"\n"}• 자신의 최고 기록에
              도전해보세요!
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>도전해보세요!</Text>
          <Text style={styles.description}>
            영단어를 학습하면서 재미있게 게임을 즐겨보세요.{"\n"}
            매번 새로운 단어가 제공됩니다.
          </Text>
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>
            다음에 시작할 때 이 화면 보여주기
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: Colors.primary }}
            thumbColor={showHowToPlayOnStart ? Colors.primary : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setShowHowToPlayOnStart}
            value={showHowToPlayOnStart}
          />
        </View>

        <TouchableOpacity
          style={styles.backToGameButton}
          onPress={() => navigation.navigate("VocaMan" as never)}
        >
          <Text style={styles.backToGameText}>게임 시작하기</Text>
        </TouchableOpacity>
      </ScrollView>
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
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  statItem: {
    marginBottom: 16,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  backToGameButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 32,
  },
  backToGameText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  toggleLabel: {
    fontSize: 16,
    color: Colors.text,
  },
});
