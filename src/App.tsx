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
    { text: "Vite", score: 0.8 },
    { text: "React", score: 0.7 },
    { text: "TypeScript", score: 0.6 },
    { text: "JavaScript", score: 0.5 },
    { text: "CSS", score: 0.4 },
    { text: "HTML", score: 0.3 },
    { text: "Sass", score: 0.2 },
    { text: "Less", score: 0.1 },
  ];

  const [word, setWord] = useState<Word | null>(null);

  return (
    <div className="App">
      <h1>Wordloucd</h1>
      <p>{word?.text}</p>
      <WordCloud words={words} onWordClicked={(word) => setWord(word)} />
    </div>
  );
}

export default App;
