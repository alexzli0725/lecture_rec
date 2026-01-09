import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CourseDetail from "./pages/CourseDetail.js";
import Home from "./pages/Home.js";
import Lecture from "./pages/Lecture.js";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course/:name" element={<CourseDetail />} />
        <Route path="/lecture/:name" element={<Lecture />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
