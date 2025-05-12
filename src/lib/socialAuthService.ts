import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";
import apiClient from "./apiClient";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { googleAuthConfig, AUTH_ENDPOINTS } from "../config/auth";

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

      if (response.type === "success") {
        // @ts-expect-error - response.params.id_token은 존재하지만 타입 정의에 없음
        const idToken = response.params.id_token;
        if (idToken) {
          return { success: true, idToken };
        }
      }
      return { success: false, error: "구글 로그인에 실패했습니다." };
    } else {
      // 네이티브 환경에서의 구글 로그인
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // @ts-expect-error - userInfo.idToken은 존재하지만 타입 정의에 없음
      const idToken = userInfo.idToken;
      if (idToken) {
        return { success: true, idToken };
      }
      return { success: false, error: "구글 ID 토큰을 받지 못했습니다." };
    }
  } catch (error: unknown) {
    console.error("Google Sign-In Error:", error);

    // GoogleSignInError로 변환 시도
    const googleError = error as GoogleSignInError;

    if (Platform.OS !== "web" && googleError.code) {
      if (googleError.code === statusCodes.SIGN_IN_CANCELLED) {
        return { success: false, error: "구글 로그인이 취소되었습니다." };
      } else if (googleError.code === statusCodes.IN_PROGRESS) {
        return { success: false, error: "구글 로그인이 이미 진행 중입니다." };
      } else if (googleError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          success: false,
          error: "Google Play Services를 사용할 수 없습니다.",
        };
      }
    }

    return { success: false, error: "구글 로그인 중 오류가 발생했습니다." };
  }
};

// 구글 ID 토큰으로 백엔드 인증 요청
export const authenticateWithBackend = async (idToken: string) => {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.GOOGLE, { idToken });
    return response.data;
  } catch (error) {
    console.error("Backend Authentication Error:", error);
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
