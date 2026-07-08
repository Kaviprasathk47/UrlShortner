import { useState } from "react";

const TicketResult = ({ shortUrl, alias, expiryLabel }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="ticket" role="status">
      <div className="ticket-main">
        <span className="ticket-label">Your short link</span>
        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="ticket-url"
        >
          {shortUrl}
        </a>
        <span className="ticket-meta">Expires: {expiryLabel}</span>
      </div>
      <div className="ticket-stub">
        <span className="ticket-alias">{alias}</span>
        <button type="button" className="btn-copy" onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
};

export default TicketResult;
