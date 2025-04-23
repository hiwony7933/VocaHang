const fs = require("fs");
const path = require("path");

function shuffleString(str) {
  return str
    .split("")
    .sort(() => Math.random() - 0.5)
    .join(" ");
}

function processFile(filePath) {
  // 파일 읽기
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // 각 단어의 hint2를 수정
  const modifiedData = data.map((item) => ({
    ...item,
    hints: {
      ...item.hints,
      hint2: shuffleString(item.word.toUpperCase()),
    },
  }));

  // 파일 쓰기
  fs.writeFileSync(filePath, JSON.stringify(modifiedData, null, 2));
  console.log(`Processed ${filePath}`);
}

// 처리할 파일들
const files = [
  "../assets/data/words_gelementary_2.json",
  "../assets/data/words_gelementary_3.json",
  "../assets/data/words_gelementary_4.json",
  "../assets/data/words_gelementary_5.json",
  "../assets/data/words_gelementary_6.json",
];

// 각 파일 처리
files.forEach((file) => {
  const filePath = path.join(__dirname, file);
  processFile(filePath);
});
