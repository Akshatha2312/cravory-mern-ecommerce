<<<<<<< HEAD
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
=======
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
=======
  const navigate = useNavigate();
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

  const handleSubmit = async (e) => {
    e.preventDefault();

<<<<<<< HEAD
    if (!name || !email || !password) {
      setErrorMsg("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const { data } = await API.post("/auth/register", {
=======
    try {
      await axios.post("http://127.0.0.1:4000/api/auth/register", {
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
        name,
        email,
        password,
      });

<<<<<<< HEAD
      if (data.token && data.user) {
        login(data.user, data.token);
        alert("Registration successful 🎉");
        navigate("/");
      } else {
        alert("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
=======
      alert("Registration successful");
      navigate("/login");
    } catch (error) {
      alert("Registration failed");
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
    }
  };

  return (
<<<<<<< HEAD
    <div style={styles.container}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Create Cravory Account</h2>

      {errorMsg && <div style={styles.error}>{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />
        </div>

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
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
=======
    <div>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Register</button>
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
    backgroundColor: "#e63946",
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

export default Register;
=======
export default Register; // ✅ MUST MATCH FUNCTION NAME
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
