# VocaHang

> A cross-platform Hangman-style English learning app for elementary to high school students.

## Prerequisites

- Node.js (LTS)
- npm
- Expo CLI (local via `npx expo`)
- VS Code with ESLint, Prettier, React Native Tools
- Android Studio / Xcode for emulators (optional)
- Expo Go on physical device (optional)

## Setup

### 1. Remove global Expo CLI

```bash
npm uninstall -g expo-cli
```

### 2. Use local Expo CLI

```bash
npx expo start
```

### 3. Add npm scripts

In `package.json`, add:

```json
"scripts": {
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "web": "expo start --web"
}
```

## Project Initialization

```bash
expo init VocaHang     # Select "blank (TypeScript)"
cd VocaHang
```

## Running the Development Server

```bash
npx expo start
```

- Press **a** to launch Android emulator
- Press **i** to launch iOS simulator (macOS only)
- Press **w** to launch in web browser
- Or scan the QR code in Expo DevTools with Expo Go on your device

## Offline Data

1. Create `assets/data/words.json` and paste your word list JSON.
2. Import in code:
   ```ts
   import wordsData from './assets/data/words.json';
   ```

## Web Support

### Option 1: Enable Web Dependencies

```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```

### Option 2: Disable Web Support

In `app.json`, remove `"web"` from the platforms array:

```json
{
  "expo": {
    "platforms": ["ios", "android"]
  }
}
```

## Version Control & Deployment

- **GitHub**: Create a repo, use `.gitignore`, branch strategy (`main`, `develop`, `feature/*`).
- **Firebase Hosting** (PWA/web):
  1. `npm install -g firebase-tools`
  2. `firebase login`
  3. `firebase init hosting` (set public folder to your web build output)
  4. `npm run web` → `firebase deploy`

## Next Steps

1. Implement random word selection logic
2. Build core UI components:
   - `<GameScreen/>`, `<Hint/>`, `<Keyboard/>`
3. Add game logic:
   - Remaining chances, wrong-answer handling, answer reveal
