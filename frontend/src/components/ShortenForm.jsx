import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config.js";
import TicketResult from "./TicketResult.jsx";

const EXPIRY_OPTIONS = [
  { label: "No expiry", minutes: "" },
  { label: "5 minutes", minutes: 5 },
  { label: "30 minutes", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "24 hours", minutes: 60 * 24 },
  { label: "7 days", minutes: 60 * 24 * 7 },
];

const ShortenForm = () => {
  const [longUrl, setLongUrl] = useState("");
  const [expiry, setExpiry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTicket(null);
    setIsSubmitting(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/`, {
        longUrl,
        expiresAt: expiry || undefined,
      });
      setTicket({
        shortUrl: data.output,
        alias: data.alias || data.output.split("/").pop(),
        expiryLabel:
          EXPIRY_OPTIONS.find((o) => String(o.minutes) === String(expiry))
            ?.label || "No expiry",
      });
      setLongUrl("");
      setExpiry("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while shortening that link. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-eyebrow">Issue a ticket</div>
      <h2 className="panel-title">Shorten a link</h2>
      <form onSubmit={handleSubmit} className="stack">
        <label className="field">
          <span className="field-label">Long URL</span>
          <input
            placeholder="https://example.com/a/very/long/path"
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Expires in</span>
          <select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
            {EXPIRY_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.minutes}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="btn-stamp" disabled={isSubmitting}>
          {isSubmitting ? "Issuing…" : "Shorten link"}
        </button>
      </form>

      {error && <p className="error-banner">{error}</p>}
      {ticket && <TicketResult {...ticket} />}
    </div>
  );
};

export default ShortenForm;
