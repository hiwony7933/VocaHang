import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";
import apiClient from "./apiClient";
import axios from "axios";
import {
  GoogleSignin,
  statusCodes,
  User as GoogleUser,
} from "@react-native-google-signin/google-signin";
import {
  googleAuthConfig,
  AUTH_ENDPOINTS,
  AUTH_ERROR_MESSAGES,
} from "../config/auth";

// 웹 인증 완료 시 리소스 해제
WebBrowser.maybeCompleteAuthSession();

// Google 인증 결과 응답 인터페이스
interface GoogleAuthResult {
  success: boolean;
  idToken?: string;
  error?: string;
}

// 구글 로그인 에러 타입 정의
interface GoogleSignInError extends Error {
  code?: string;
}

// 구글 사용자 정보 확장 타입 (idToken 포함)
interface ExtendedGoogleUser extends GoogleUser {
  idToken: string | null;
}

// 백엔드 인증 응답 타입
interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    userId: string;
    email: string;
    nickname: string;
    role: string;
  };
}

// 네이티브 환경에서 구글 로그인을 위한 초기화 함수
export const initGoogleSignIn = async () => {
  if (Platform.OS !== "web") {
    GoogleSignin.configure({
      webClientId: googleAuthConfig.webClientId,
      iosClientId: googleAuthConfig.iosClientId,
      offlineAccess: false,
      scopes: ["profile", "email"],
    });
  }
};

// 구글 로그인 함수
export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    if (Platform.OS === "web") {
      // 웹 환경에서의 구글 로그인
      const redirectUri = AuthSession.makeRedirectUri({
        // 개발 환경에 맞는 리디렉션 URI 사용
        // production 환경에서는 googleAuthConfig.redirectUri.prod로 변경
        native: googleAuthConfig.redirectUri.dev,
      });

      const authRequest = new AuthSession.AuthRequest({
        clientId: googleAuthConfig.webClientId,
        responseType: AuthSession.ResponseType.IdToken,
        scopes: ["openid", "profile", "email"],
        redirectUri,
      });

      const discovery = {
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
        revocationEndpoint: "https://oauth2.googleapis.com/revoke",
      };

      const response = await authRequest.promptAsync(discovery);

      if (response.type === "success" && response.params) {
        // response.params의 id_token 프로퍼티 접근
        const idToken = response.params.id_token as string | undefined;
        if (idToken) {
          return { success: true, idToken };
        }
      }
      return { success: false, error: AUTH_ERROR_MESSAGES.GOOGLE_LOGIN_FAILED };
    } else {
      // 네이티브 환경에서의 구글 로그인
      await GoogleSignin.hasPlayServices();

      // GoogleSignin.signIn()을 호출하고 반환 값의 타입을 안전하게 처리
      const signInResult = await GoogleSignin.signIn();

      // idToken이 있는지 확인하고 타입스크립트가 알 수 없는 속성에 접근하기 때문에 any로 단언
      const idToken = (signInResult as any).idToken;

      if (idToken) {
        return { success: true, idToken };
      }
      return { success: false, error: AUTH_ERROR_MESSAGES.ID_TOKEN_MISSING };
    }
  } catch (error: unknown) {
    console.error("Google Sign-In Error:", error);

    // GoogleSignInError로 변환 시도
    const googleError = error as GoogleSignInError;

    if (Platform.OS !== "web" && googleError.code) {
      if (googleError.code === statusCodes.SIGN_IN_CANCELLED) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES.GOOGLE_LOGIN_CANCELLED,
        };
      } else if (googleError.code === statusCodes.IN_PROGRESS) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES.GOOGLE_LOGIN_IN_PROGRESS,
        };
      } else if (googleError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES.GOOGLE_PLAY_SERVICES_UNAVAILABLE,
        };
      }
    }

    return { success: false, error: AUTH_ERROR_MESSAGES.UNKNOWN_ERROR };
  }
};

// 구글 ID 토큰으로 백엔드 인증 요청
export const authenticateWithBackend = async (
  idToken: string
): Promise<AuthResponse> => {
  try {
    // 명세에 맞게 토큰을 전달
    const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.GOOGLE, {
      idToken,
    });

    // 응답 로깅 (디버깅 용도)
    console.log("Backend Authentication Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Backend Authentication Error:", error);

    // 에러 상태 코드에 따른 적절한 오류 처리
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 400) {
        // 400: ID 토큰 누락 또는 이메일 정보 누락
        throw new Error(
          error.response?.data?.message || AUTH_ERROR_MESSAGES.ID_TOKEN_MISSING
        );
      } else if (status === 401) {
        // 401: 유효하지 않은 ID 토큰
        throw new Error(
          error.response?.data?.message || AUTH_ERROR_MESSAGES.INVALID_TOKEN
        );
      } else if (status === 500) {
        // 500: 서버 오류
        throw new Error(AUTH_ERROR_MESSAGES.SERVER_ERROR);
      } else if (!error.response) {
        // 네트워크 오류
        throw new Error(AUTH_ERROR_MESSAGES.NETWORK_ERROR);
      }
    }

    throw error;
  }
};

// 구글 로그아웃 함수
export const signOutFromGoogle = async () => {
  if (Platform.OS !== "web") {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error("Google Sign-Out Error:", error);
    }
  }
  // 웹 환경에서는 별도 로그아웃 처리 필요 없음
};
