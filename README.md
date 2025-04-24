# VocaMan

VocaMan은 초등학생을 위한 영어 단어 학습 게임 앱입니다. 재미있는 게임 형식을 통해 영어 단어를 학습하고, 학년별 맞춤 단어장을 제공합니다.

## 주요 기능

- 초등학교 1~6학년 영단어 학습 게임
- QWERTY/ABC 키보드 레이아웃 지원
- 학년별 맞춤 단어장 제공
- 게임 진행 상황 저장 기능
- 직관적인 UI/UX 디자인

## 기술 스택

- React Native
- TypeScript
- Expo
- AsyncStorage

## 개발 환경 설정

### 필수 요구사항

- Node.js (LTS 버전)
- npm
- Expo CLI (로컬 설치: `npx expo`)
- VS Code (ESLint, Prettier, React Native Tools 확장 프로그램 권장)
- Android Studio / Xcode (에뮬레이터 사용 시)
- Expo Go (실제 기기에서 테스트 시)

### 개발 환경 설정

1. Expo CLI 설치

```bash
npm uninstall -g expo-cli  # 전역 Expo CLI 제거
npx expo start  # 로컬 Expo CLI 사용
```

2. 프로젝트 의존성 설치

```bash
npm install
```

3. 개발 서버 실행

```bash
npm start
```

- **a**: Android 에뮬레이터 실행
- **i**: iOS 시뮬레이터 실행 (macOS 전용)
- **w**: 웹 브라우저에서 실행
- QR 코드: Expo Go 앱으로 스캔하여 실제 기기에서 실행

## 개발자 릴리즈 노트

### v1.0.1 (2025.04)

- VocaMan 앱 안정성 개선
- 게임 플레이 경험 개선
- 키보드 레이아웃 전환 시 발생하던 버그 수정
- 일부 기기에서 발생하던 화면 깜빡임 현상 수정

### v1.0.0 (2025.04)

- VocaMan 앱 최초 출시
- 초등학교 1~6학년 영단어 학습 게임 기능
- QWERTY/ABC 키보드 레이아웃 지원
- 학년별 맞춤 단어장 제공
- 게임 진행 상황 저장 기능

## 설치 및 실행 방법

1. 저장소 클론

```bash
git clone https://github.com/your-username/VocaMan.git
cd VocaMan
```

2. 의존성 설치

```bash
npm install
```

3. 앱 실행

```bash
npm start
```

## 웹 지원

### 웹 의존성 활성화

```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```

### 웹 지원 비활성화

`app.json`에서 platforms 배열에서 "web" 제거:

```json
{
  "expo": {
    "platforms": ["ios", "android"]
  }
}
```

## 버전 관리 및 배포

- **GitHub**: `.gitignore` 사용, 브랜치 전략 (`main`, `develop`, `feature/*`)
- **Firebase Hosting** (PWA/웹):
  1. `npm install -g firebase-tools`
  2. `firebase login`
  3. `firebase init hosting` (public 폴더를 웹 빌드 출력으로 설정)
  4. `npm run web` → `firebase deploy`

## 개발자 정보

- 개발자: VocaMan Team
- 이메일: hiwony7933@gmail.com

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
