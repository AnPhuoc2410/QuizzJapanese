import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import JapaneseQuiz from './pages/JapaneseQuiz.tsx';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JapaneseQuiz />} />
      </Routes>
    </Router>
  );
};

export default App;
