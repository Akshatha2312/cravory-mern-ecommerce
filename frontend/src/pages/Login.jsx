<<<<<<< HEAD
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
=======
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // ✅ use common axios instance
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
=======

  const navigate = useNavigate();
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email || !password) {
<<<<<<< HEAD
      setErrorMsg("Please fill all fields");
=======
      alert("Please fill all fields");
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
      return;
    }

    try {
      setLoading(true);
<<<<<<< HEAD
      setErrorMsg("");

      const { data } = await API.post("/auth/login", {
=======

      const { data } = await api.post("/auth/login", {
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
        email,
        password,
      });

<<<<<<< HEAD
      login(data.user, data.token);

=======
      // ✅ save auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful 🎉");

      // ✅ role-based redirect
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
      if (data.user.role === "admin") {
        navigate("/admin/add-product");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
<<<<<<< HEAD
      setErrorMsg(
=======
      alert(
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
        error.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div style={styles.container}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login to Cravory</h2>

      {errorMsg && <div style={styles.error}>{errorMsg}</div>}

      <form onSubmit={submitHandler}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
=======
    <div style={{ maxWidth: "400px", margin: "40px auto" }}>
      <h2>Login</h2>

      <form onSubmit={submitHandler}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
    </div>
  );
}

<<<<<<< HEAD
const styles = {
  container: {
    maxWidth: "400px",
    margin: "40px auto",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    backgroundColor: "#fff",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#1d3557",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "15px",
    textAlign: "center",
  },
};

=======
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
export default Login;
