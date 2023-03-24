import { useEffect, useRef, useState } from "react";

export type Word = {
  text: string;
  score: number;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WordRect = {
  word: Word;
  rect: Rect;
  size: number;
};

const intersects = (a: Rect, b: Rect) => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

const isInBounds = (rect: Rect, width: number, height: number) => {
  return (
    rect.x >= 0 &&
    rect.y - rect.height >= 0 &&
    rect.x + rect.width <= width &&
    rect.y + rect.height <= height
  );
};

type WordCloudProps = {
  words: Word[];
  showRects?: boolean;
  onWordClicked: (word: Word) => void;
};

export const WordCloud = (props: WordCloudProps) => {
  const ref = useRef<HTMLCanvasElement>(null);

  const [currentUsedSpace, setCurrentUsedSpace] = useState<WordRect[]>([]);

  // color palette with sharp colors on dark background
  const colors = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#00ffff",
    "#ff00ff",
    "#ff8000",
    "#ff0080",
    "#8000ff",
    "#0080ff",
    "#00ff80",
    "#ff0080",
  ];

  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }

  const preprocessWords = () => {
    const words = props.words.sort((a, b) => b.score - a.score);
    const totalScore = words.reduce((a, b) => a + b.score, 0);
    const normalizedWords = words.map((w) => ({
      ...w,
      score: w.score / totalScore,
    }));
    return normalizedWords;
  };

  const getRectFromScore = (
    ctx: CanvasRenderingContext2D,
    size: number,
    font: string,
    text: string,
    score: number,
    screenWidth: number,
    screenHeight: number
  ) => {
    ctx.font = `${size * score}px ${font}`;

    let metrics = ctx.measureText(text);
    let fontHeight =
      metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    let actualHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    let width = metrics.width;
    let height = actualHeight;
    let x = Math.random() * (screenWidth - width);
    let y = Math.random() * (screenHeight - height);
    let rect: Rect = { x, y, width, height };

    return rect;
  };

  const generateWordRects = (
    ctx: CanvasRenderingContext2D,
    size: number,
    font: string,
    words: Word[],
    screenWidth: number,
    screenHeight: number
  ) => {
    const wordRects: WordRect[] = [];
    const usedSpace: Rect[] = [];

    for (const word of words) {
      let score = word.score;
      let rect = getRectFromScore(
        ctx,
        size,
        font,
        word.text,
        score,
        screenWidth,
        screenHeight
      );

      let tries = 0;
      while (
        !isInBounds(rect, screenWidth, screenHeight) ||
        usedSpace.some((r) => intersects(r, rect))
      ) {
        rect = getRectFromScore(
          ctx,
          size,
          font,
          word.text,
          score,
          screenWidth,
          screenHeight
        );

        if (tries > 1000) {
          score = score * 0.9;
        }

        tries++;
      }

      usedSpace.push(rect);
      wordRects.push({ word, rect, size: size * score });
    }

    return wordRects;
  };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    // Background color
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const screenWidth = canvas.width;
    const screenHeight = canvas.height;

    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    const font = "Arial";
    const words = preprocessWords();
    const wordRects = generateWordRects(
      ctx,
      600,
      font,
      words,
      screenWidth,
      screenHeight
    );

    for (const wordRect of wordRects) {
      ctx.font = `${wordRect.size}px ${font}`;
      ctx.fillStyle = "white";
      ctx.fillText(
        wordRect.word.text,
        wordRect.rect.x,
        wordRect.rect.y + wordRect.rect.height
      );

      if (props.showRects ?? false) {
        ctx.strokeStyle = "white";
        ctx.strokeRect(
          wordRect.rect.x,
          wordRect.rect.y,
          wordRect.rect.width,
          wordRect.rect.height
        );
      }
    }
    setCurrentUsedSpace(wordRects);
  }, []);

  const clickOnRect = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = ref.current?.getBoundingClientRect();
    const x = e.clientX - rect!.left;
    const y = e.clientY - rect!.top;

    const rectToCheck = { x, y, width: 1, height: 1 };

    for (const rect of currentUsedSpace) {
      if (intersects(rect.rect, rectToCheck)) {
        props.onWordClicked(rect.word);
      }
    }
  };

  return (
    <canvas width={800} height={600} ref={ref} onClick={clickOnRect}></canvas>
  );
};
