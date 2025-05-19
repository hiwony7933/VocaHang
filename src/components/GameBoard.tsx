import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Modal,
  Button,
} from "react-native";
import { useGame, MAX_TRIES } from "./GameProvider";
import { Colors } from "../constants/theme";
import { BalloonLife } from "./BalloonLife";

export const GameBoard: React.FC = () => {
  const {
    currentWord,
    displayTries,
    shuffledWordHint,
    currentHints,
    processUserAnswer,
    handleIncorrectLetterPick,
    wordForModal,
    setWordForModal,
    handleCorrectLetterPickFeedback,
    finalizeDefeat,
  } = useGame();

  const [userInput, setUserInput] = React.useState<string[]>([]);
  const [flipAnimations, setFlipAnimations] = React.useState<Animated.Value[]>(
    []
  );

  // Hint card flip states and animations
  const [isCategoryFlipped, setIsCategoryFlipped] = useState(false);
  const [isHint1Flipped, setIsHint1Flipped] = useState(false);
  const categoryFlipAnimation = useRef(new Animated.Value(0)).current;
  const hint1FlipAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setUserInput([]);
    // Reset hint card states and animations when word changes
    if (isCategoryFlipped) {
      categoryFlipAnimation.setValue(0);
      setIsCategoryFlipped(false);
    }
    if (isHint1Flipped) {
      hint1FlipAnimation.setValue(0);
      setIsHint1Flipped(false);
    }

    if (currentWord && currentWord.word) {
      const newAnimations = currentWord.word
        .split("")
        .map(() => new Animated.Value(0));
      setFlipAnimations(newAnimations);
    } else {
      setFlipAnimations([]);
    }
    // currentWord.id 변경 시 모달도 닫히도록 (새 단어 시작 시)
    // setWordForModal(null); // GameProvider의 pickNewWord에서 이미 처리
  }, [currentWord.id, currentWord.word]);

  if (!currentWord || !currentWord.word) return null;

  const answer = currentWord.word.toUpperCase();
  const screenWidth = Dimensions.get("window").width;
  const letterCount = answer.length;

  // Calculate BalloonLife width (mirroring logic from BalloonLife.tsx)
  const MAX_TRIES_FOR_BALLOON = 6;
  const SPACING_FOR_BALLOON = 8;
  const PADDING_HORIZONTAL_FOR_BALLOON = 20; // As defined in BalloonLife styles
  const balloonAvailableWidth =
    screenWidth - PADDING_HORIZONTAL_FOR_BALLOON * 2;
  const balloonContentAreaWidth =
    balloonAvailableWidth - (MAX_TRIES_FOR_BALLOON - 1) * SPACING_FOR_BALLOON;
  const balloonBaseSize = balloonContentAreaWidth / MAX_TRIES_FOR_BALLOON;
  const balloonCalculatedSize = Math.max(24, Math.min(48, balloonBaseSize));
  const balloonDisplaySize = balloonCalculatedSize * 1.2;
  const balloonIconsWidth =
    MAX_TRIES_FOR_BALLOON * balloonDisplaySize +
    (MAX_TRIES_FOR_BALLOON - 1) * SPACING_FOR_BALLOON;
  const finalBalloonLifeWidth =
    balloonIconsWidth + PADDING_HORIZONTAL_FOR_BALLOON * 2;

  // Apply maxWidth for cardContainer based on finalBalloonLifeWidth
  const actualCardContainerWidth = Math.min(finalBalloonLifeWidth, 390);

  const maxWidth = screenWidth - 40;
  const letterWidth = Math.min(40, Math.floor(maxWidth / letterCount) - 8);
  const rawAnswerFontSize = letterWidth - 4;
  const fontSize = Math.max(8, Math.min(24, rawAnswerFontSize));

  // New calculation for hint cards
  const cardContainerPadding = styles.cardContainer.paddingHorizontal || 0;
  const hintCardMargin = styles.card.margin || 0;
  const numberOfHintCardsPerRow = 5;
  const targetHintContainerWidth =
    actualCardContainerWidth - cardContainerPadding * 2;
  const hintCardWidth =
    (targetHintContainerWidth - hintCardMargin * 2 * numberOfHintCardsPerRow) /
    numberOfHintCardsPerRow;
  const hintCardHeight = hintCardWidth + 10;
  const rawHintCardFontSize = hintCardWidth - 10;
  const hintCardFontSize = Math.max(8, Math.min(20, rawHintCardFontSize));

  const handlePopComplete = () => {
    // 풍선이 터진 후 추가 작업이 필요한 경우 여기에 구현
  };

  const flipHintCard = (
    isFlipped: boolean,
    setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>,
    animation: Animated.Value
  ) => {
    setIsFlipped(!isFlipped);
    Animated.spring(animation, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPress = (char: string) => {
    if (!currentWord || !currentWord.word || userInput.length >= letterCount) {
      return;
    }

    const expectedChar = answer[userInput.length];

    if (char.toUpperCase() === expectedChar) {
      const indexToFlip = userInput.length;

      if (flipAnimations[indexToFlip]) {
        Animated.spring(flipAnimations[indexToFlip], {
          toValue: 1,
          friction: 8,
          tension: 10,
          useNativeDriver: true,
        }).start();
      }

      const newUserInput = [...userInput, char.toUpperCase()];

      setUserInput(newUserInput);

      if (newUserInput.length === letterCount) {
        processUserAnswer(newUserInput.join(""));
      } else {
        handleCorrectLetterPickFeedback();
      }
    } else {
      handleIncorrectLetterPick();
    }
  };

  const renderModalContent = () => {
    // GameBoard 모달은 오직 LetterPickFeedbackInfo 타입일 때만 렌더링
    if (
      wordForModal &&
      "type" in wordForModal &&
      wordForModal.type === "letterPickFeedback"
    ) {
      const feedbackData = wordForModal; // 타입이 이미 LetterPickFeedbackInfo로 좁혀짐
      return (
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{feedbackData.message}</Text>
          <Text style={styles.modalText}>
            남은 기회: {feedbackData.remainingTries} / {MAX_TRIES}
          </Text>
          <Button
            title="OK"
            onPress={() => {
              setWordForModal(null); // GameBoard의 피드백 모달만 닫음
              if (
                feedbackData.feedbackType === "incorrect" &&
                feedbackData.remainingTries <= 0
              ) {
                // 기회가 모두 소진된 경우, GameProvider의 finalizeDefeat를 호출하여
                // gameStatus를 'lost'로 변경하고, wordForModal을 WordType으로 설정하여
                // GameModal이 결과 모달을 띄우도록 유도함.
                finalizeDefeat();
              }
            }}
            color={Colors.primary}
          />
        </View>
      );
    }
    // WordType이거나 gameStatus가 won/lost인 경우는 GameModal에서 처리하므로 여기서는 null 반환
    return null;
  };

  return (
    <View style={styles.container}>
      <BalloonLife remaining={displayTries} onPopComplete={handlePopComplete} />
      <View style={styles.wordContainer}>
        {answer.split("").map((actualLetter, index) => {
          const animatedValue = flipAnimations[index] || new Animated.Value(0);

          const frontAnimatedStyle = {
            transform: [
              {
                rotateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"],
                }),
              },
            ],
          };
          const backAnimatedStyle = {
            transform: [
              {
                rotateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["180deg", "360deg"],
                }),
              },
            ],
          };

          return (
            <View
              key={index}
              style={[
                styles.individualCardWrapper,
                { width: letterWidth, height: letterWidth + 10 },
              ]}
            >
              <Animated.View style={[styles.cardFace, frontAnimatedStyle]}>
                <Text style={[styles.letterAnswer, { fontSize }]}>?</Text>
              </Animated.View>
              <Animated.View style={[styles.cardFace, backAnimatedStyle]}>
                <Text style={[styles.letter, { fontSize }]}>
                  {actualLetter.toUpperCase()}
                </Text>
              </Animated.View>
            </View>
          );
        })}
      </View>

      <View style={[styles.cardContainer, { width: actualCardContainerWidth }]}>
        {shuffledWordHint?.map((char, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              { width: hintCardWidth, height: hintCardHeight },
            ]}
            onPress={() => handleCardPress(char)}
            disabled={userInput.length >= letterCount}
          >
            <Text style={[styles.cardText, { fontSize: hintCardFontSize }]}>
              {char}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.hintWrapper}>
        {/* Category Hint Card */}
        <TouchableOpacity
          style={styles.hintClickableArea}
          onPress={() =>
            flipHintCard(
              isCategoryFlipped,
              setIsCategoryFlipped,
              categoryFlipAnimation
            )
          }
        >
          <View
            style={[
              styles.hintCard,
              { width: screenWidth * 0.8, maxWidth: 390, height: 60 },
            ]}
          >
            <Animated.View
              style={[
                styles.hintCardFace,
                {
                  transform: [
                    {
                      rotateY: categoryFlipAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "180deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.hintCardTextLabel}>힌트1</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.hintCardFace,
                styles.hintCardBack,
                {
                  transform: [
                    {
                      rotateY: categoryFlipAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["180deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.hintCardTextValue}>
                {currentWord.category}
              </Text>
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* Hint 1 Card */}
        {currentHints?.hint1 && (
          <TouchableOpacity
            style={styles.hintClickableArea}
            onPress={() =>
              flipHintCard(
                isHint1Flipped,
                setIsHint1Flipped,
                hint1FlipAnimation
              )
            }
          >
            <View
              style={[
                styles.hintCard,
                { width: screenWidth * 0.8, maxWidth: 390, height: 60 },
              ]}
            >
              <Animated.View
                style={[
                  styles.hintCardFace,
                  {
                    transform: [
                      {
                        rotateY: hint1FlipAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "180deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.hintCardTextLabel}>힌트 2</Text>
              </Animated.View>
              <Animated.View
                style={[
                  styles.hintCardFace,
                  styles.hintCardBack,
                  {
                    transform: [
                      {
                        rotateY: hint1FlipAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["180deg", "360deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.hintCardTextValue}>
                  {currentHints.hint1}
                </Text>
              </Animated.View>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        transparent={true}
        // GameBoard 모달은 wordForModal이 LetterPickFeedbackInfo 타입일 때만 보이도록 visible 조건 수정
        visible={
          wordForModal !== null &&
          "type" in wordForModal &&
          wordForModal.type === "letterPickFeedback"
        }
        animationType="fade"
        onRequestClose={() => {
          // OK 버튼으로만 _닫도록 유도. 필요시 LetterPickFeedbackInfo에 한해 setWordForModal(null) 처리 가능
          if (
            wordForModal &&
            "type" in wordForModal &&
            wordForModal.type === "letterPickFeedback"
          ) {
            setWordForModal(null);
            if (
              wordForModal.feedbackType === "incorrect" &&
              wordForModal.remainingTries <= 0
            ) {
              finalizeDefeat();
            }
          }
        }}
      >
        <View style={styles.modalOverlay}>{renderModalContent()}</View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
  },
  wordContainer: {
    flexDirection: "row",
    marginVertical: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  individualCardWrapper: {
    marginHorizontal: 4,
  },
  cardFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.lightGray,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backfaceVisibility: "hidden",
  },
  letterAnswer: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  letter: {
    fontWeight: "bold",
    color: Colors.text,
  },
  hintWrapper: {
    width: "100%",
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  hintText: {
    fontSize: 16,
    color: Colors.hint,
    marginVertical: 4,
    textAlign: "left",
  },
  hintClickableArea: {
    marginBottom: 10,
  },
  hintCard: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  hintCardFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    paddingHorizontal: 10,
  },
  hintCardBack: {
    backgroundColor: Colors.primary,
  },
  hintCardTextLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  hintCardTextValue: {
    fontSize: 20,
    color: Colors.white,
    textAlign: "center",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 40,
    marginHorizontal: 20,
    paddingHorizontal: 0,
  },
  card: {
    backgroundColor: Colors.primary,
    padding: 5,
    margin: 5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  cardText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  cardTextUsed: {
    color: Colors.lightGray,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: Colors.text,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    color: Colors.textSecondary,
  },
});
