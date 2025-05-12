import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  // Button, // 사용되지 않으므로 주석 처리 또는 삭제 (린터 경고 제거용)
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import apiClient from "../lib/apiClient";
import { NativeStackScreenProps } from "@react-navigation/native-stack"; // 수정된 임포트
import axios from "axios";

// Optional: Import theme constants if they exist
// import { Colors } from '../constants/theme';

// 네비게이터 파라미터 리스트 정의
type AuthStackParamList = {
  Register: undefined;
  Login: undefined; // 로그인 스크린이 있다면
  // 여기에 다른 스크린 라우트 추가
};

// RegisterScreen에 대한 Props 타입 정의
type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const RegisterScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !nickname) {
      Alert.alert("입력 오류", "이메일, 비밀번호, 닉네임을 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/register", {
        email,
        password,
        nickname,
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert(
          "회원가입 성공!",
          "회원가입이 완료되었습니다. 로그인해주세요."
        );
        navigation.navigate("Login"); // 네비게이션 사용
      } else {
        Alert.alert("회원가입 실패", `서버 응답: ${response.status}`);
      }
    } catch (err) {
      // 원본 에러 로깅 (개발자 확인용)
      console.error("Registration Error Object:", err);

      let errorMessage = "알 수 없는 오류가 발생했습니다.";
      // 구체적인 에러 정보 로깅은 타입 가드 이후에 수행
      // 예: if (axios.isAxiosError(err)) { console.error("Axios Error Details:", err.toJSON()); }

      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.message ||
          err.message ||
          "서버 요청 중 오류가 발생했습니다.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        // 문자열화 시도 (최후의 수단)
        try {
          errorMessage = String(err);
        } catch (_e) {
          // String(err) 실패 시 기본 메시지 유지
        }
      }
      Alert.alert("회원가입 실패", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="닉네임"
        value={nickname}
        onChangeText={setNickname}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "가입 처리 중..." : "가입하기"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007bff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
