import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Cravory</h2>

      <div style={styles.links}>
        <Link to="/">Home</Link>
        <Link to="/cart">Cart</Link>

        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {user && user.role === "admin" && (
          <Link to="/admin/add-product">Add Product</Link>
        )}

        {user && (
          <button onClick={logoutHandler} style={styles.logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#111",
    color: "#fff",
  },
  logo: {
    margin: 0,
  },
  links: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  logout: {
    background: "red",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer",
  },
};

export default Navbar;
