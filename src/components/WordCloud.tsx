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
  opacity: number;
};

/**
 * intersects checks if two rectangles intersect
 * @param a rectangle a
 * @param b rectangle b
 * @returns
 */
const intersects = (a: Rect, b: Rect) => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

/**
 * isInBounds checks if a rectangle is within the bounds of the screen
 * @param rect rectangle to check
 * @param width width of the screen
 * @param height height of the screen
 * @returns
 */
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
  padding?: number;
  font?: string;
};

export const WordCloud = (props: WordCloudProps) => {
  const ref = useRef<HTMLCanvasElement>(null);

  const [currentUsedSpace, setCurrentUsedSpace] = useState<WordRect[]>([]);
  const [colroScheme, setColorScheme] = useState<string[]>([]);

  const padding = props.padding ?? 20;
  const font = props.font ?? "Arial";

  /**
   * preprocessWords sorts the words by score and normalizes the scores
   * @returns
   */
  const preprocessWords = () => {
    const words = props.words.sort((a, b) => b.score - a.score);
    const totalScore = words.reduce((a, b) => a + b.score, 0);
    const normalizedWords = words.map((w) => ({
      ...w,
      score: w.score / totalScore,
    }));
    return normalizedWords;
  };

  /**
   * getRectFromScore gets a rectangle from a score
   * @param ctx
   * @param size
   * @param text
   * @param score
   * @param screenWidth
   * @param screenHeight
   * @returns
   */
  const getRectFromScore = (
    ctx: CanvasRenderingContext2D,
    size: number,
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

    let width = metrics.width + 2 * padding;
    let height = actualHeight + 2 * padding;
    let x = Math.random() * (screenWidth - width) + padding;
    let y = Math.random() * (screenHeight - height) + padding;
    let rect: Rect = { x, y, width, height };

    return rect;
  };

  /**
   * generateWordRects generates rectangles for each word
   * it tries to place the words in a way that they don't overlap
   * @param ctx
   * @param size
   * @param words
   * @param screenWidth
   * @param screenHeight
   * @returns
   */
  const generateWordRects = (
    ctx: CanvasRenderingContext2D,
    size: number,
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
          word.text,
          score,
          screenWidth,
          screenHeight
        );
      }

      usedSpace.push(rect);
      wordRects.push({ word, rect, size: size * score, opacity: 1 });
    }

    return wordRects;
  };

  /**
   * setup sets up the canvas and generates the rectangles and colors
   * @returns
   */
  const setup = () => {
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

    const words = preprocessWords();
    const wordRects = generateWordRects(
      ctx,
      5000,
      words,
      screenWidth,
      screenHeight
    );

    const colorScheme = props.colorScheme;
    for (let i = colorScheme.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [colorScheme[i], colorScheme[j]] = [colorScheme[j], colorScheme[i]];
    }
    setColorScheme(colorScheme);

    setCurrentUsedSpace(wordRects);
  };
  useEffect(setup, [props.words, props.width, props.height]);

  /**
   * render renders the canvas with the rectangles and words
   * @returns
   */
  const render = () => {
    const canvas = ref.current;
    if (!canvas) return;

    // Background color
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const screenWidth = canvas.width;
    const screenHeight = canvas.height;

    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    let colorIndex = 0;
    for (const wordRect of currentUsedSpace) {
      ctx.font = `${wordRect.size}px ${font}`;
      ctx.fillStyle = colroScheme[colorIndex % colroScheme.length];
      ctx.globalAlpha = wordRect.opacity;
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
  };
  useEffect(render, [currentUsedSpace]);

  /**
   * clickOnRect checks if a word was clicked
   * @param e
   */
  const clickOnRect = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = ref.current?.getBoundingClientRect();
    const x = (e.clientX - rect!.left) * 2;
    const y = (e.clientY - rect!.top) * 2;

    const rectToCheck = { x, y, width: 1, height: 1 };

    for (const rect of currentUsedSpace) {
      if (intersects(rect.rect, rectToCheck)) {
        props.onWordClicked(rect.word);
      }
    }
  };

  /**
   * mouseMove checks if the mouse is over a word
   * @param e
   */
  const mouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = ref.current?.getBoundingClientRect();

    const x = (e.clientX - rect!.left) * 2;
    const y = (e.clientY - rect!.top) * 2;

    const rectToCheck = { x, y, width: 1, height: 1 };
    let foundRect: WordRect | null = null;
    for (const rect of currentUsedSpace) {
      if (intersects(rect.rect, rectToCheck)) {
        foundRect = rect;
        break;
      }
    }
  };

  return (
    <canvas ref={ref} onClick={clickOnRect} onMouseMove={mouseMove}></canvas>
  );
};
