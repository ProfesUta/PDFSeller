import { Link } from "react-router-dom";

export function Header({ active }) {
  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">
        Doc<span>Vault</span>
      </Link>
      <div className="nav-links">
        <Link to="/" className={active === "browse" ? "active" : ""}>
          Browse
        </Link>
        <Link to="/admin" className={active === "upload" ? "active" : ""}>
          Upload
        </Link>
      </div>
    </nav>
  );
}
