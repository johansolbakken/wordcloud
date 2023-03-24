import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Word, WordCloud } from "./components/WordCloud";

function App() {
  const [count, setCount] = useState(0);

  const words = [
    { text: "Hello", score: 1 },
    { text: "World", score: 0.9 },
    { text: "Vite", score: 0.8666 },
    { text: "React", score: 0.83333 },
    { text: "TypeScript", score: 0.8 },
    { text: "JavaScript", score: 0.76666 },
    { text: "CSS", score: 0.73333 },
    { text: "HTML", score: 0.7 },
    { text: "Sass", score: 0.66666 },
    { text: "Less", score: 0.63333 },
    { text: "Stylus", score: 0.6 },
    { text: "Vite", score: 0.56666 },
    { text: "React", score: 0.53333 },
    { text: "TypeScript", score: 0.5 },
    { text: "JavaScript", score: 0.46666 },
    { text: "CSS", score: 0.43333 },
    { text: "HTML", score: 0.4 },
    { text: "Sass", score: 0.36666 },
    { text: "Less", score: 0.33333 },
    { text: "Stylus", score: 0.3 },
    { text: "Vite", score: 0.26666 },
    { text: "React", score: 0.23333 },
    { text: "TypeScript", score: 0.2 },
    { text: "JavaScript", score: 0.16666 },
    { text: "CSS", score: 0.13333 },
    { text: "HTML", score: 0.1 },
    { text: "Sass", score: 0.06666 },
    { text: "Less", score: 0.03333 },
  ];

  const [word, setWord] = useState<Word | null>(null);

  const colorScheme = [
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
  ];

  return (
    <div className="App">
      <h1>Wordloucd</h1>
      <p>{word?.text}</p>
      <div style={{ width: 800, height: 600 }}>
        <WordCloud
          words={words}
          onWordClicked={(word) => setWord(word)}
          colorScheme={colorScheme}
        />
      </div>
    </div>
  );
}

export default App;
