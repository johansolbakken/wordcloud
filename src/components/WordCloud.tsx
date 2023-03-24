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
};

const intersects = (a: Rect, b: Rect) => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

const isInBounds = (rect: Rect) => {
  return (
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.x + rect.width <= 800 &&
    rect.y + rect.height <= 600
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

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    // Background color
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(0, 0, 800, 600);

    const words = preprocessWords();

    const wordRects: WordRect[] = [];
    const usedSpace: Rect[] = [];

    const ratio = 0.5;
    let size = 1000;
    let i = 0;
    const minHeight = 40;

    for (const word of words) {
      let height = size * word.score;
      if (height < minHeight) {
        height = minHeight;
      }
      let width = height * ratio * word.text.length;
      let x = Math.random() * (800 - width);
      let y = Math.random() * (600 - height);
      let rect: Rect = { x, y, width, height };

      let tries = 0;
      while (!isInBounds(rect) || usedSpace.some((r) => intersects(r, rect))) {
        height = size * word.score;
        if (height < minHeight) {
          height = minHeight;
        }
        width = height * ratio * word.text.length;
        x = Math.random() * (800 - width);
        y = Math.random() * (600 - height);
        rect = { x, y, width, height };
        if (tries > 1000) {
          size -= 1;
          tries = 0;
        }
        tries++;
      }

      ctx.fillStyle = colors[i];
      ctx.font = `${height * 0.85}px Monospace`;
      ctx.fillText(word.text, x, y + height);

      if (props.showRects ?? false) {
        ctx.strokeStyle = "white";
        ctx.strokeRect(x, y, width, height);
      }

      usedSpace.push(rect);
      wordRects.push({ word, rect });
      i = (i + 1) % colors.length;
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
