import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import JapaneseQuiz from "./pages/JapaneseQuiz.tsx";
import Starter from "./pages/Starter.tsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<JapaneseQuiz />} />
        <Route path="/" element={<Starter />} />
      </Routes>
    </Router>
  );
};

export default App;
