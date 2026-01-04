import React from "react";
import { useParams } from "react-router-dom";

const CourseDetail = () => {
  const { name } = useParams(); // grabs :name from URL
  return (
    <div style={{ padding: 30 }}>
      <h1>Course Detail Page</h1>
      <p>Course Name: {name}</p>
    </div>
  );
};

export default CourseDetail;
