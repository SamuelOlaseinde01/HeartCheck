import React from "react";
import { Outlet, Link, ScrollRestoration } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

export default function Layout() {
  const date = new Date();
  const year = date.getFullYear();
  const [hamburgerOpen, setHamburgerOpen] = React.useState(false);

  function handleClick() {
    setHamburgerOpen(!hamburgerOpen);
  }

  return (
    <main className="layout">
      <header>
        <h3>
          <HashLink
            smooth
            to="/"
            style={{ color: "black", textDecoration: "none" }}
          >
            HeartCheck
          </HashLink>
        </h3>

        <div className="hamburger" onClick={handleClick}>
          <span className={hamburgerOpen ? "span1 active" : "span1"}></span>
          <span className={hamburgerOpen ? "span2 active" : "span2"}></span>
          <span className={hamburgerOpen ? "span3 active" : "span3"}></span>
        </div>

        <nav className={hamburgerOpen ? "active" : ""}>
          <HashLink smooth to="/" onClick={handleClick}>
            Home
          </HashLink>

          <Link to="/predict" onClick={handleClick}>
            Predict
          </Link>

          <HashLink smooth to="/#section-about" onClick={handleClick}>
            About
          </HashLink>
        </nav>
      </header>

      <Outlet />

      <footer>
        &copy; {year} Heart Disease Risk Prediction System. For educational
        purposes only. Not a substitute for professional medical advice.
      </footer>

      <ScrollRestoration />
    </main>
  );
}
