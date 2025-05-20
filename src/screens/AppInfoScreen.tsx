import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import Constants from "expo-constants";

const AppInfoScreen = () => {
  const releaseNotes = [
    {
      version: "1.0.10",
      date: "2025.05",
      notes: ["버그픽스"],
    },
    {
      version: "1.0.9",
      date: "2025.05",
      notes: [
        "새로운 하단 플로팅 메뉴 도입 및 헤더 전역 관리로 앱 탐색 경험 개선",
        "게임 플레이 중 즉각적인 피드백 제공 (글자 선택 시 성공/실패 모달 추가)",
        "게임 데이터 동기화 문제 해결 및 전반적인 앱 안정성 향상",
        "다양한 UI 개선 (풍선 애니메이션, 카드 디자인 업데이트 등) 및 코드 리팩토링",
      ],
    },
    {
      version: "1.0.8",
      date: "2025.04",
      notes: [
        "린트 설정 수정 (d.ts 파일 제외, tsconfig 업데이트)",
        "Expo Doctor 권고 사항 수정 (@types/react-native 제거, yarn.lock 제거)",
        "웹 환경 호환성 개선 (boxShadow 사용, useNativeDriver 조건부 적용)",
        "사용하지 않는 파일 제거 (HangmanDrawing 및 관련 이미지)",
        "게임방법 화면 토글 기능 제거 및 관련 로직 수정",
      ],
    },
    {
      version: "1.0.7",
      date: "2025.04",
      notes: [
        "린트 설정 수정 (d.ts 파일 제외, tsconfig 업데이트)",
        "Expo Doctor 권고 사항 수정 (@types/react-native 제거, yarn.lock 제거)",
        "웹 환경 호환성 개선 (boxShadow 사용, useNativeDriver 조건부 적용)",
        "사용하지 않는 파일 제거 (HangmanDrawing 및 관련 이미지)",
        "게임방법 화면 토글 기능 제거 및 관련 로직 수정",
      ],
    },
    {
      version: "1.0.6",
      date: "2025.04",
      notes: [
        "설정 화면: 초등학생 학년 변경 기능 추가",
        "설정 화면: 통계 시스템 메뉴 순서 변경",
      ],
    },
    {
      version: "1.0.5",
      date: "2025.04",
      notes: [
        "사운드 시스템 개선",
        "게임 효과음 추가",
        "앱 성능 최적화",
        "사운드 재생 딜레이 감소",
      ],
    },
    {
      version: "1.0.4",
      date: "2025.04",
      notes: [
        "화면 전환 애니메이션 개선",
        "앱 성능 최적화",
        "버전 관리 시스템 개선",
      ],
    },
    {
      version: "1.0.3",
      date: "2025.04",
      notes: ["화면 전환 애니메이션 개선", "앱 성능 최적화"],
    },
    {
      version: "1.0.2",
      date: "2025.04",
      notes: [
        "상태 표시줄 보이지 않는 문제 수정",
        "SafeArea 적용 개선",
        "전체 화면 레이아웃 최적화",
        "앱 안정성 향상",
      ],
    },
    {
      version: "1.0.1",
      date: "2025.04",
      notes: [
        "VocaMan 앱 안정성 개선",
        "게임 플레이 경험 개선",
        "키보드 레이아웃 전환 시 발생하던 버그 수정",
        "일부 기기에서 발생하던 화면 깜빡임 현상 수정",
      ],
    },
    {
      version: "1.0.0",
      date: "2025.04",
      notes: [
        "VocaMan 앱 최초 출시",
        "초등학교 1~6학년 영단어 학습 게임 기능",
        "QWERTY/ABC 키보드 레이아웃 지원",
        "학년별 맞춤 단어장 제공",
        "게임 진행 상황 저장 기능",
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Text style={styles.screenTitle}>앱 정보</Text>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>버전 정보</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>현재 버전</Text>
            <Text style={styles.infoValue}>
              {Constants.expoConfig?.version}
            </Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개발자 정보</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>개발자</Text>
            <Text style={styles.infoValue}>VocaMan Team</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>이메일</Text>
            <Text style={styles.infoValue}>hiwony7933@gmail.com</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>릴리즈 노트</Text>
          {releaseNotes.map((release, index) => (
            <View key={index} style={styles.releaseNote}>
              <View style={styles.releaseHeader}>
                <Text style={styles.releaseVersion}>v{release.version}</Text>
                <Text style={styles.releaseDate}>({release.date})</Text>
              </View>
              <View style={styles.releaseNotes}>
                {release.notes.map((note, noteIndex) => (
                  <View key={noteIndex} style={styles.noteItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.releaseNoteText}>{note}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: Colors.text,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  releaseNote: {
    marginBottom: 24,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  releaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  releaseVersion: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginRight: 8,
  },
  releaseDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  releaseNotes: {
    paddingLeft: 8,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: Colors.text,
    marginRight: 8,
  },
  releaseNoteText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
});

export default AppInfoScreen;
