import React from "react";
import { Link } from "react-router-dom";
import About from "./About";

export default function Home() {
  return (
    <>
      <section id="section-home">
        <div className="text-container">
          <h1>HEART DISEASE</h1>
          <h1>RISK PREDICTION</h1>
          <p>
            Advanced machine learning algorithm to predict potential heart
            disease
          </p>
          <p>based on your behavioural lifestyle</p>
          <Link to="/predict">Get started</Link>
        </div>
        <div className="img-container">
          <img
            src="/background-image.jpg"
            alt="a heart and stethoscope image"
            srcset=""
          />
        </div>
      </section>
      <About />
    </>
  );
}
