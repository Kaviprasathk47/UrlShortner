import { execSync } from "child_process";

if (process.env.RENDER) {
  console.log("Render environment detected. Skipping nodemon execution for build.");
  process.exit(0);
}

try {
  console.log("Starting local development server with nodemon...");
  execSync("npx nodemon server.js", { stdio: "inherit" });
} catch (err) {
  // Gracefully handle local interruptions like Ctrl+C
  process.exit(0);
}
