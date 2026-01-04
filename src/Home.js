import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate(); // hook to navigate programmatically

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:8000/courses");
        setCourses(response.data);
      } catch (e) {
        console.log(e);
      }
    };
    fetchCourses();
  }, []);

  const handleClick = (name) => {
    navigate(`/course/${name}`); // go to route
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Select Courses</h1>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {courses.map((item) => (
          <div
            key={item._id}
            onClick={() => handleClick(item.name)}
            style={{
              cursor: "pointer",
              border: "solid",
              borderColor: "black",
              borderWidth: 1,
              width: 200,
              height: 200,
              boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h2>{item.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
