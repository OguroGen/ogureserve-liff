// src/App.jsx
import { useState, useEffect } from 'react';
import { initLiff } from './liff';

function App() {
  const [selected, setSelected] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const fruits = ["りんご", "バナナ", "ぶどう", "みかん"];

  const handleSubmit = () => {
    setSubmitted(true);
  };

  useEffect(() => {
    initLiff();
  }, []);

  if (submitted) return <div>ご回答ありがとうございました！</div>;

  return (
    <div>
      <h1>好きな果物は？</h1>
      <ul>
        {fruits.map(fruit => (
          <li key={fruit}>
            <label>
              <input
                type="radio"
                name="fruit"
                value={fruit}
                onChange={() => setSelected(fruit)}
              />
              {fruit}
            </label>
          </li>
        ))}
      </ul>
      <button disabled={!selected} onClick={handleSubmit}>
        送信
      </button>
    </div>
  );
}

export default App;
