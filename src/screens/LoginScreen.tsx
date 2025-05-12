import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import apiClient from "../lib/apiClient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {
  signInWithGoogle,
  authenticateWithBackend,
  initGoogleSignIn,
} from "../lib/socialAuthService";
import { AUTH_ERROR_MESSAGES } from "../config/auth";

// AuthContext에서 정의한 User 타입을 가져오거나, 여기서도 동일하게 정의할 수 있습니다.
// interface User { userId: string; email: string; nickname: string; role: string; }
interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: {
    // AuthContext의 User 타입과 일치하도록
    userId: string;
    email: string;
    nickname: string;
    role: string;
  };
  message?: string; // 로그인 성공/실패 메시지
}

// 네비게이터 파라미터 리스트 정의 (RegisterScreen과 동일하게 유지 또는 공유 타입 사용)
type AuthStackParamList = {
  Register: undefined;
  Login: undefined;
  // 여기에 다른 인증 관련 스크린 라우트 추가
};

// LoginScreen에 대한 Props 타입 정의
type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn, isLoading: isAuthLoading } = useAuth();

  // 비밀번호 입력 TextInput에 대한 ref 생성
  const passwordInputRef = useRef<TextInput>(null);

  // 컴포넌트 마운트 시 구글 로그인 초기화
  useEffect(() => {
    initGoogleSignIn();
  }, []);

  const handleLogin = async () => {
    setErrorText("");
    if (!email || !password) {
      setErrorText("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    console.log("[LoginScreen] handleLogin: Attempting login...");

    try {
      const response = await apiClient.post<LoginResponseData>("/auth/login", {
        email,
        password,
      });

      console.log(
        "[LoginScreen] handleLogin: API Response Status:",
        response.status
      ); // API 응답 상태 로그

      if (
        response.status === 200 &&
        response.data.accessToken &&
        response.data.user
      ) {
        console.log(
          "[LoginScreen] handleLogin: Login success, calling signIn context function..."
        ); // signIn 호출 전 로그
        await signIn({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          user: response.data.user,
        });
        console.log(
          "[LoginScreen] handleLogin: signIn context function finished."
        ); // signIn 호출 후 로그
      } else {
        // response.data.message가 있을 경우 활용
        const message =
          response.data?.message || `서버 응답: ${response.status}`;
        setErrorText(message);
      }
    } catch (err) {
      console.error("Login Error Object:", err);
      let errorMessage = AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;

      if (axios.isAxiosError(err) && err.response) {
        errorMessage =
          err.response.data?.message ||
          (err.response.status === 401
            ? "이메일 또는 비밀번호가 올바르지 않습니다."
            : err.message) ||
          "로그인 요청 중 오류가 발생했습니다.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setErrorText(errorMessage);
    }
  };

  // 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    try {
      setErrorText("");
      setIsGoogleLoading(true);
      console.log(
        "[LoginScreen] handleGoogleLogin: Attempting Google login..."
      );

      // 구글 로그인 시도
      const googleResult = await signInWithGoogle();

      if (!googleResult.success || !googleResult.idToken) {
        setErrorText(
          googleResult.error || AUTH_ERROR_MESSAGES.GOOGLE_LOGIN_FAILED
        );
        setIsGoogleLoading(false);
        return;
      }

      console.log(
        "[LoginScreen] handleGoogleLogin: Google login successful, authenticating with backend..."
      );

      // 백엔드 인증
      const backendResponse = await authenticateWithBackend(
        googleResult.idToken
      );

      if (backendResponse.accessToken && backendResponse.user) {
        console.log(
          "[LoginScreen] handleGoogleLogin: Backend authentication successful, calling signIn context function..."
        );

        await signIn({
          accessToken: backendResponse.accessToken,
          refreshToken: backendResponse.refreshToken,
          user: backendResponse.user,
        });

        console.log(
          "[LoginScreen] handleGoogleLogin: signIn context function finished."
        );
      } else {
        setErrorText("백엔드 인증에 실패했습니다.");
      }
    } catch (err) {
      console.error("Google Login Error:", err);

      // 오류 처리 개선
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 400) {
          setErrorText(
            err.response?.data?.message || AUTH_ERROR_MESSAGES.ID_TOKEN_MISSING
          );
        } else if (status === 401) {
          setErrorText(
            err.response?.data?.message || AUTH_ERROR_MESSAGES.INVALID_TOKEN
          );
        } else if (status === 500) {
          setErrorText(AUTH_ERROR_MESSAGES.SERVER_ERROR);
        } else if (!err.response) {
          setErrorText(AUTH_ERROR_MESSAGES.NETWORK_ERROR);
        } else {
          setErrorText(
            err.response?.data?.message || AUTH_ERROR_MESSAGES.UNKNOWN_ERROR
          );
        }
      } else if (err instanceof Error) {
        setErrorText(err.message);
      } else {
        setErrorText(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // RegisterScreen.tsx의 handleRegister 성공 시 Login으로 이동하는 로직에서
  // navigation.navigate('Login')을 호출하므로, LoginScreen에서는 회원가입 화면으로
  // 돌아가는 버튼을 추가할 수 있습니다.
  const goToRegister = () => {
    if (!isAuthLoading && !isGoogleLoading) {
      // 로딩 중 아닐 때만 네비게이션 허용
      navigation.navigate("Register");
    }
  };

  const isLoading = isAuthLoading || isGoogleLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
        returnKeyType="next"
        onSubmitEditing={() => {
          passwordInputRef.current?.focus();
        }}
      />
      <TextInput
        ref={passwordInputRef}
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
        returnKeyType="done"
        onSubmitEditing={handleLogin}
      />
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isAuthLoading ? "처리 중..." : "로그인"}
        </Text>
      </TouchableOpacity>

      {/* 구분선 */}
      <View style={styles.separator}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>또는</Text>
        <View style={styles.separatorLine} />
      </View>

      {/* 구글 로그인 버튼 */}
      <TouchableOpacity
        style={[styles.googleButton, isLoading && styles.buttonDisabled]}
        onPress={handleGoogleLogin}
        disabled={isLoading}
      >
        <View style={styles.googleButtonContent}>
          {isGoogleLoading ? (
            <ActivityIndicator
              size="small"
              color="#4285F4"
              style={styles.googleIcon}
            />
          ) : (
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
              }}
              style={styles.googleIcon}
            />
          )}
          <Text style={styles.googleButtonText}>
            {isGoogleLoading ? "처리 중..." : "Google로 로그인"}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={goToRegister}
        disabled={isLoading}
      >
        <Text style={styles.linkButtonText}>계정이 없으신가요? 회원가입</Text>
      </TouchableOpacity>
    </View>
  );
};

// RegisterScreen.tsx의 스타일과 유사하게 정의
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
    width: "100%",
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
  linkButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  linkButtonText: {
    fontSize: 16,
    color: "#007bff",
    textDecorationLine: "underline",
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  separatorText: {
    paddingHorizontal: 10,
    color: "#888",
  },
  googleButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default LoginScreen;
