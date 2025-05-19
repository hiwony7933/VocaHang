import { WordListType } from "./word";

declare module "*.json" {
  const value: WordListType;
  export = value;
}
