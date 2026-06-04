import { Outlet, Link, ScrollRestoration } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

export default function Layout() {
  const date = new Date();
  const year = date.getFullYear();

  return (
    <main className="layout">
      <header>
        <h3>Heart</h3>
        <nav>
          {/* Changed back to HashLink so smooth scrolling works */}
          <HashLink smooth to="/">
            Home
          </HashLink>

          {/* Standard Link is perfect for normal page routing */}
          <Link to="/predict">Predict</Link>

          {/* Changed back to HashLink so it jumps to the specific section */}
          <HashLink smooth to="/#section-about">
            About
          </HashLink>
        </nav>
      </header>

      <Outlet />

      <footer>
        &copy; {year} Heart Disease Risk Prediction System. For educational
        purposes only. Not a substitute for professional medical advice.
      </footer>

      {/* This handles the page-to-page scroll resetting perfectly */}
      <ScrollRestoration />
    </main>
  );
}
