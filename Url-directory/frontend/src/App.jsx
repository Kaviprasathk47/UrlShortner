import ShortenForm from "./components/ShortenForm.jsx";
import ExpandForm from "./components/ExpandForm.jsx";
import "./App.css";

function App() {
  return (
    <div className="page">
      <header className="hero">
        <span className="hero-eyebrow">Claim Ticket Links</span>
        <h1 className="hero-title">Snipit</h1>
        <p className="hero-subtitle">
          Turn long, unwieldy URLs into short claim tickets you can share
          anywhere — and redeem them just as easily.
        </p>
      </header>

      <main className="grid">
        <ShortenForm />
        <ExpandForm />
      </main>

      <footer className="footer">Built with Express &amp; MongoDB.</footer>
    </div>
  );
}

export default App;
