/**
 * 인증 관련 설정을 관리하는 파일
 * 소셜 로그인을 위한 클라이언트 ID 및 기타 설정을 포함
 */

// 구글 인증 관련 설정
export const googleAuthConfig = {
  // Google Developer Console에서 생성한 클라이언트 ID
  // 각 플랫폼별 클라이언트 ID를 별도로 설정
  webClientId: "YOUR_WEB_CLIENT_ID", // 실제 값으로 변경 필요
  iosClientId: "YOUR_IOS_CLIENT_ID", // 실제 값으로 변경 필요
  androidClientId: "YOUR_ANDROID_CLIENT_ID", // 실제 값으로 변경 필요

  // 웹 브라우저에서 소셜 로그인 후 리디렉션 처리를 위한 설정
  redirectUri: {
    // 각 환경별 리디렉션 URI (개발/테스트/운영)
    dev: "http://localhost:19006", // 개발 환경 (웹)
    prod: "https://vocaman.app", // 운영 환경 (웹)
  },
};

// 이후 다른 소셜 로그인 설정 추가 가능
// export const facebookAuthConfig = { ... };
// export const appleAuthConfig = { ... };

// 토큰 저장 키
export const TOKEN_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_INFO: "userInfo",
};

// API 엔드포인트
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  GOOGLE: "/auth/google",
  REFRESH_TOKEN: "/auth/refresh-token",
  LOGOUT: "/auth/logout",
};
