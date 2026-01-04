import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const CourseDetail = () => {
  const { name } = useParams(); // grabs :name from URL
  const location = useLocation();
  const navigate = useNavigate();
  const transcripts = location.state?.transcripts;
  console.log(transcripts);

  const handleClick = (lecture) => {
    navigate(`/lecture/${lecture.name}`, {
      state: { content: lecture.content },
    });
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Course Detail Page</h1>
      <p>Course Name: {name}</p>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {transcripts.map((item, index) => (
          <div
            onClick={() => handleClick(item)}
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
            <p>{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetail;
