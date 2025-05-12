import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// AuthContext에서 정의했던 TOKEN_KEYS와 동일한 값을 사용하거나, 여기서 별도 정의
const TOKEN_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken", // REFRESH_TOKEN 활성화
};

// 실제 배포 환경에서는 환경 변수 등을 통해 baseURL을 설정해야 합니다.
const BASE_URL = "http://182.221.127.172:8080/api/v2"; // TODO: 환경별 URL 설정 필요
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
      originalRequest.url !== "/auth/refresh-token"
    ) {
      originalRequest._retry = true; // 재시도 플래그 설정
      console.log("[ApiClient] Attempting to refresh token...");

      try {
        const refreshToken = await AsyncStorage.getItem(
          TOKEN_KEYS.REFRESH_TOKEN
        );
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken: refreshToken,
          });

          const newAccessToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken; // 백엔드가 새 리프레시 토큰을 줄 수도 있음

          await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, newAccessToken);
          if (newRefreshToken) {
            // 새 리프레시 토큰이 있다면 그것도 저장
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
          // 에러를 반환하여 호출부에서 로그인 페이지로 리다이렉트 등의 처리를 하도록 함
          // 또는 window.location.href = '/login'; 등으로 강제 리다이렉트 (웹의 경우)
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
        return Promise.reject(refreshError); // 원래 에러 또는 refreshError 반환
      }
    }
    return Promise.reject(error); // 그 외 에러는 그대로 반환
  }
);

export default apiClient;
