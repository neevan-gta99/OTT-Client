// NotFound.tsx
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{ 
      textAlign: "center", 
      marginTop: "100px",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "3rem", color: "#ff4757" }}>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link 
        to="/" 
        style={{
          display: "inline-block",
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#667eea",
          color: "white",
          textDecoration: "none",
          borderRadius: "5px"
        }}
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;