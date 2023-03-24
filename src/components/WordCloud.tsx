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
    rect.x + rect.width <= width &&
    rect.y >= 0 &&
    rect.y + rect.height <= height
  );
};

type WordCloudProps = {
  words: Word[];
  showRects?: boolean;
  onWordClicked: (word: Word) => void;
  colorScheme: string[];
  width?: number;
  height?: number;
};

export const WordCloud = (props: WordCloudProps) => {
  const ref = useRef<HTMLCanvasElement>(null);

  const [currentUsedSpace, setCurrentUsedSpace] = useState<WordRect[]>([]);

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

    const padding = 10;
    let width = metrics.width + 2 * padding;
    let height = actualHeight + 2 * padding;
    let x = Math.random() * (screenWidth - width) + padding;
    let y = Math.random() * (screenHeight - height) + padding;
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
        if (tries > 1000) {
          score = score * 0.95;
        }

        tries++;

        rect = getRectFromScore(
          ctx,
          size,
          font,
          word.text,
          score,
          screenWidth,
          screenHeight
        );
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

    canvas.style.width = `${props.width ?? 500}px`;
    canvas.style.height = `${props.height ?? 500}px`;
    canvas.width = (props.width ?? 500) * 2;
    canvas.height = (props.height ?? 500) * 2;

    const screenWidth = canvas.width;
    const screenHeight = canvas.height;

    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    const font = "Arial";
    const words = preprocessWords();
    const wordRects = generateWordRects(
      ctx,
      5000,
      font,
      words,
      screenWidth,
      screenHeight
    );

    const colorScheme = props.colorScheme;
    for (let i = colorScheme.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [colorScheme[i], colorScheme[j]] = [colorScheme[j], colorScheme[i]];
    }

    let colorIndex = 0;
    for (const wordRect of wordRects) {
      ctx.font = `${wordRect.size}px ${font}`;
      ctx.fillStyle = colorScheme[colorIndex % colorScheme.length];
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

      colorIndex++;
    }
    setCurrentUsedSpace(wordRects);

    console.log(wordRects);
  }, [props.words, props.width, props.height]);

  const clickOnRect = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = ref.current?.getBoundingClientRect();
    const x = (e.clientX - rect!.left) * 2;
    const y = (e.clientY - rect!.top) * 2;

    console.log(x, y);

    const rectToCheck = { x, y, width: 1, height: 1 };

    for (const rect of currentUsedSpace) {
      if (intersects(rect.rect, rectToCheck)) {
        props.onWordClicked(rect.word);
      }
    }
  };

  return <canvas ref={ref} onClick={clickOnRect}></canvas>;
};
