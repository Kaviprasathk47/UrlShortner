const formatMeta = (meta) =>
  meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";

export const log = {
  info(message, meta = {}) {
    console.log(`[INFO] ${message}${formatMeta(meta)}`);
  },
  warn(message, meta = {}) {
    console.warn(`[WARN] ${message}${formatMeta(meta)}`);
  },
  error(message, meta = {}) {
    console.error(`[ERROR] ${message}${formatMeta(meta)}`);
  },
};
