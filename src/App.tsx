import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import JapaneseQuiz from "./pages/JapaneseQuiz.tsx";
import Starter from "./pages/Starter.tsx";
import JLPTKanji from "./pages/JLPTKanji.tsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/vocabulary" element={<JLPTKanji />} />
        <Route path="/home" element={<JapaneseQuiz />} />
        <Route path="/" element={<Starter />} />
      </Routes>
    </Router>
  );
};

export default App;
