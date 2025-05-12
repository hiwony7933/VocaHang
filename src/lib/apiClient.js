import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TOKEN_KEYS, AUTH_ENDPOINTS } from "../config/auth";

// 실제 배포 환경에서는 환경 변수 등을 통해 baseURL을 설정해야 합니다.
const BASE_URL = "http://182.221.127.172:8080"; // TODO: 환경별 URL 설정 필요
const TIMEOUT = 10000; // 10초

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 추가
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      // AsyncStorage 접근 오류 처리 (선택 사항)
      console.error(
        "[ApiClient] Error reading accessToken from AsyncStorage",
        error
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 활성화 및 수정
apiClient.interceptors.response.use(
  (response) => {
    return response; // 성공한 응답은 그대로 반환
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 아직 재시도하지 않았으며, 토큰 갱신 요청 자체가 아니라면
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== AUTH_ENDPOINTS.REFRESH_TOKEN
    ) {
      originalRequest._retry = true; // 재시도 플래그 설정
      console.log("[ApiClient] Attempting to refresh token...");

      try {
        const refreshToken = await AsyncStorage.getItem(
          TOKEN_KEYS.REFRESH_TOKEN
        );
        if (refreshToken) {
          // 새 엔드포인트로 토큰 갱신 요청
          const response = await axios.post(
            `${BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`,
            { refreshToken }
          );

          // 백엔드 응답 형식에 맞게 토큰 추출
          const newAccessToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken; // 새 리프레시 토큰이 있을 경우

          await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, newAccessToken);
          if (newRefreshToken) {
            await AsyncStorage.setItem(
              TOKEN_KEYS.REFRESH_TOKEN,
              newRefreshToken
            );
            console.log(
              "[ApiClient] New access and refresh tokens obtained and stored."
            );
          } else {
            console.log("[ApiClient] New access token obtained and stored.");
          }

          // apiClient의 기본 헤더 및 현재 실패한 요청의 헤더 업데이트
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          return apiClient(originalRequest); // 원래 요청 재시도
        } else {
          console.log(
            "[ApiClient] No refresh token found. Clearing tokens and rejecting."
          );
          // 리프레시 토큰이 없으면, 모든 토큰 삭제 (강제 로그아웃 유도)
          await AsyncStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
          await AsyncStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
          await AsyncStorage.removeItem(TOKEN_KEYS.USER_INFO);
          // 에러를 반환하여 호출부에서 로그인 페이지로 리다이렉트 등의 처리를 하도록 함
          return Promise.reject(
            new Error("No refresh token available. User logged out.")
          );
        }
      } catch (refreshError) {
        console.error(
          "[ApiClient] Token refresh failed:",
          refreshError.response?.data || refreshError.message
        );
        // 리프레시 실패 시에도 모든 토큰 삭제
        await AsyncStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
        await AsyncStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
        await AsyncStorage.removeItem(TOKEN_KEYS.USER_INFO);
        return Promise.reject(refreshError); // 원래 에러 또는 refreshError 반환
      }
    }
    return Promise.reject(error); // 그 외 에러는 그대로 반환
  }
);

export default apiClient;
