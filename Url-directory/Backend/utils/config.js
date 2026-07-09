export function getBaseUrl() {
  const baseUrl = process.env.BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("BASE_URL environment variable is required");
  }
  return baseUrl;
}
