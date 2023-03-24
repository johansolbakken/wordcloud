import { useEffect, useRef, useState } from "react";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
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

export const WordCloud = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  const words = [
    { text: "Hello", percentage: 2.0 },
    { text: "World", percentage: 1.7 },
    { text: "This", percentage: 1.5 },
    { text: "Is", percentage: 0.9 },
    { text: "A", percentage: 0.8 },
    { text: "Word", percentage: 0.7 },
    { text: "Cloud", percentage: 0.6 },
    { text: "Example", percentage: 0.5 },
    { text: "With", percentage: 0.4 },
    { text: "Vite", percentage: 0.3 },
    { text: "And", percentage: 0.2 },
    { text: "React", percentage: 0.1 },
  ];

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

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(0, 0, 800, 600);

    const usedSpace: Rect[] = [];

    const ratio = 0.5;
    let size = 100;
    let i = 0;
    for (const word of words) {
      let height = size * word.percentage;
      let width = height * ratio * word.text.length;

      let x = Math.random() * (800 - width);
      let y = Math.random() * (600 - height);

      let rect = { x, y, width, height };

      while (!isInBounds(rect) || usedSpace.some((r) => intersects(r, rect))) {
        height = size * word.percentage;
        width = height * ratio * word.text.length;
        x = Math.random() * (800 - width);
        y = Math.random() * (600 - height);
        rect = { x, y, width, height };
        size -= 1;
      }

      ctx.fillStyle = colors[i];
      ctx.font = `${height * 0.85}px Monospace`;
      ctx.fillText(word.text, x, y + height);

      usedSpace.push(rect);
      i = (i + 1) % colors.length;
    }
  }, []);

  return <canvas width={800} height={600} ref={ref}></canvas>;
};
