export default function About() {
  return (
    <section id="section-about">
      <h1>About the system</h1>
      <div className="card-container">
        <div className="card">
          <img src="/ai.png" alt="" srcset="" />
          <h4>Predictive AI Engine</h4>
          <p>
            Powered by an advanced XGBoost machine learning model trained on
            thousands of behavioral health records to identify early
            cardiovascular risks.
          </p>
        </div>
        <div className="card">
          <img src="/brain.png" alt="" />
          <h4>Actionable Explainability</h4>
          <p>
            Integrates generative AI to instantly translate complex medical
            probabilities into simple, personalized, and low-cost daily
            lifestyle advice.
          </p>
        </div>
        <div className="card">
          <img src="/shield.png" alt="" srcset="" />
          <h4>Privacy First</h4>
          <p>
            Your personal health metrics and lifestyle inputs are processed
            securely in real-time to generate your assessment and are never
            permanently stored.
          </p>
        </div>
      </div>
    </section>
  );
}
