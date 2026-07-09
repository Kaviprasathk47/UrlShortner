# Snipit — URL Shortener

A full-stack URL shortener: paste a long link in, get a short "claim ticket"
code back, and redeem that code to get redirected to the original URL.

- **Backend:** Node.js, Express, MongoDB (via Mongoose)
- **Frontend:** React + Vite

## Project structure

```
Url-directory/
  Backend/    Express API (short-code generation, redirects, click counts)
  frontend/   React UI
```

## Prerequisites

- Node.js 18+
- A MongoDB connection string (local `mongod` or a MongoDB Atlas cluster)

## Backend setup

```bash
cd Url-directory/Backend
npm install
cp .env.example .env   # then set MONGODB_URI to your own connection string
npm run dev             # nodemon, auto-restarts on changes
# or
npm start
```

Mongoose creates the `urls` collection automatically the first time a link
is saved — there's no schema/migration step to run.

The API listens on `PORT` from `.env` (defaults to `8000`).

## Frontend setup

```bash
cd Url-directory/frontend
npm install
cp .env.example .env   # points the UI at your backend, defaults to localhost:8000
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`) in your browser.

## How it works

1. Submit a long URL (and optional expiry) on the "Shorten a link" panel.
2. The backend generates a short random code and stores the mapping as a
   document in MongoDB.
3. Visiting `http://localhost:8000/<code>` (or using the "Open a short link"
   panel) redirects to the original URL and increments its click count.
4. Links with an expiry stop working once that time has passed.

## Security note

If you're re-using this project after a demo/tutorial, rotate any database
credentials that were ever committed to `.env` or shared outside your own
machine — treat them as compromised.
