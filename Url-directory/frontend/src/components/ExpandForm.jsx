import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config.js";

const ExpandForm = () => {
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsChecking(true);

    const shortCode = alias.trim();
    if (!shortCode) {
      setError("Please enter a short code.");
      setIsChecking(false);
      return;
    }

    try {
      await axios.get(
        `${API_BASE_URL}/api/resolve/${encodeURIComponent(shortCode)}`,
      );
      window.location.href = `${API_BASE_URL}/${encodeURIComponent(shortCode)}`;
    } catch (err) {
      const status = err.response?.status;
      setError(
        status === 410
          ? "This link has expired."
          : status === 404
            ? "We couldn't find a link with that code."
            : err.response?.data?.message ||
              "Something went wrong while looking that up. Please try again.",
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-eyebrow">Redeem a ticket</div>
      <h2 className="panel-title">Open a short link</h2>
      <form onSubmit={handleSubmit} className="stack">
        <label className="field">
          <span className="field-label">Short code</span>
          <input
            placeholder="e.g. aK92Xf"
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value.trim())}
            required
          />
        </label>
        <button type="submit" className="btn-outline" disabled={isChecking}>
          {isChecking ? "Checking…" : "Take me there"}
        </button>
      </form>
      {error && <p className="error-banner">{error}</p>}
    </div>
  );
};

export default ExpandForm;
