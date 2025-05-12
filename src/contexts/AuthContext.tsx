import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 사용자 정보 타입 (백엔드 응답에 맞춰 조정)
interface User {
  userId: string;
  email: string;
  nickname: string;
  role: string;
  // 기타 필요한 사용자 정보
}

// API 응답에서 토큰 및 사용자 정보를 포함하는 타입 (백엔드 응답에 맞춰 조정)
interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (data: AuthResponseData) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean; // 앱 로딩 (초기 토큰 확인) 또는 인증 처리 중 상태
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_INFO: "userInfo", // 사용자 정보도 저장 (선택 사항)
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let accessToken: string | null = null;
      let storedUser: User | null = null;
      try {
        // AsyncStorage에서 토큰 및 사용자 정보 가져오기
        accessToken = await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
        const userJson = await AsyncStorage.getItem(TOKEN_KEYS.USER_INFO);
        if (userJson) {
          storedUser = JSON.parse(userJson);
        }

        // TODO: accessToken 유효성 검사 (예: 만료 시간 확인 또는 서버에 간단한 검증 요청)
        // 여기서는 단순히 토큰 존재 여부와 사용자 정보 유무로 인증 상태 결정
        if (accessToken && storedUser) {
          setIsAuthenticated(true);
          setUser(storedUser);
          // apiClient에 토큰 설정 (요청 인터셉터 구현 전 임시)
          // apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } else {
          // 토큰이 없거나 유효하지 않으면 로그아웃 상태로 초기화 (필요시 토큰 모두 삭제)
          await AsyncStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
          await AsyncStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
          await AsyncStorage.removeItem(TOKEN_KEYS.USER_INFO);
        }
      } catch (e) {
        // 토큰 복원 중 에러 발생
        console.error(
          "[AuthContext] bootstrapAsync: Failed to load auth state from storage",
          e
        );
        // 안전하게 로그아웃 상태로 처리
        await AsyncStorage.multiRemove(Object.values(TOKEN_KEYS));
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log(
          "[AuthContext] bootstrapAsync: Finished. isLoading:",
          false,
          "isAuthenticated:",
          isAuthenticated
        ); // 부트스트랩 완료 시점 로그 추가
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = async (data: AuthResponseData) => {
    setIsLoading(true);
    console.log(
      "[AuthContext] signIn: Started. Data received:",
      JSON.stringify(data, null, 2)
    ); // signIn 시작 및 데이터 로그
    try {
      await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, data.accessToken);
      await AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, data.refreshToken);
      await AsyncStorage.setItem(
        TOKEN_KEYS.USER_INFO,
        JSON.stringify(data.user)
      );
      console.log(
        "[AuthContext] signIn: Tokens and user info saved to AsyncStorage."
      ); // 저장 성공 로그

      setUser(data.user);
      setIsAuthenticated(true);
      console.log(
        "[AuthContext] signIn: User state set. isAuthenticated: true, User:",
        JSON.stringify(data.user, null, 2)
      ); // 상태 변경 로그
    } catch (error) {
      console.error(
        "[AuthContext] signIn: Failed to save auth state to storage",
        error
      ); // 에러 로그
      // 에러 처리 (예: 사용자에게 알림)
      throw error; // 로그인 화면에서 처리할 수 있도록 에러 다시 던지기
    } finally {
      setIsLoading(false);
      console.log("[AuthContext] signIn: Finished. isLoading: false"); // 종료 및 isLoading 상태 로그
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    console.log("[AuthContext] signOut: Started."); // signOut 시작 로그
    try {
      await AsyncStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      await AsyncStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      await AsyncStorage.removeItem(TOKEN_KEYS.USER_INFO);
      console.log(
        "[AuthContext] signOut: Tokens and user info removed from AsyncStorage."
      ); // 제거 성공 로그

      setUser(null);
      setIsAuthenticated(false);
      console.log(
        "[AuthContext] signOut: User state cleared. isAuthenticated: false, User: null"
      ); // 상태 변경 로그
    } catch (error) {
      console.error(
        "[AuthContext] signOut: Failed to clear auth state from storage",
        error
      ); // 에러 로그
      // 에러 처리
    } finally {
      setIsLoading(false);
      console.log("[AuthContext] signOut: Finished. isLoading: false"); // 종료 및 isLoading 상태 로그
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, signIn, signOut, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
