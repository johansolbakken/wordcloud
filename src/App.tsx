import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { WordCloud } from "./components/WordCloud";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <h1>Wordloucd</h1>
      <WordCloud />
    </div>
  );
}

export default App;
