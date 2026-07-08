import pool from "../db.js";
import redisClient from "../redis/redis.js";
import { generateUniqueAlias } from "../utils/shortcode.js";
import { getBaseUrl } from "../utils/config.js";
import { log } from "../utils/logger.js";

const DEFAULT_CACHE_TTL_SECONDS = 3600;

function toDate(mysqlDateTime) {
  return new Date(mysqlDateTime.replace(" ", "T"));
}

function serializeCacheEntry({ urlId, longUrl, expiresAt }) {
  return JSON.stringify({
    urlId,
    longUrl,
    expiresAt: expiresAt ? toDate(expiresAt).toISOString() : null,
  });
}

function parseCacheEntry(raw) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.longUrl) {
      return {
        urlId: parsed.urlId,
        longUrl: parsed.longUrl,
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
      };
    }
  } catch {
    // Backward compatibility for legacy plain-string cache values.
    return { urlId: null, longUrl: raw, expiresAt: null };
  }

  return null;
}

function assertNotExpired(expiresAt) {
  if (expiresAt && expiresAt < new Date()) {
    const err = new Error("This link has expired");
    err.statusCode = 410;
    throw err;
  }
}

function getCacheTtlSeconds(expiresAt) {
  if (!expiresAt) return DEFAULT_CACHE_TTL_SECONDS;
  return Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
}

const LINK_LOOKUP_SQL = `
  SELECT
    u.id AS url_id,
    lu.long_url,
    ue.expires_at
  FROM alias a
  INNER JOIN url u ON a.url_id = u.id
  INNER JOIN long_url lu ON u.long_url_id = lu.id
  LEFT JOIN urlexpiry ue ON ue.url_id = u.id
  WHERE a.alias = ?
  LIMIT 1
`;

async function incrementClickCount(connection, urlId) {
  if (!urlId) return;

  await connection.query(
    "UPDATE url SET click_count = click_count + 1 WHERE id = ?",
    [urlId],
  );
}

async function fetchLinkFromDatabase(connection, alias) {
  const [rows] = await connection.query(LINK_LOOKUP_SQL, [alias]);

  if (rows.length === 0) {
    const err = new Error("Alias not found");
    err.statusCode = 404;
    throw err;
  }

  const row = rows[0];
  if (!row.long_url) {
    const err = new Error("Long URL not found");
    err.statusCode = 404;
    throw err;
  }

  const expiresAt = row.expires_at ? toDate(row.expires_at) : null;
  assertNotExpired(expiresAt);

  return {
    urlId: row.url_id,
    longUrl: row.long_url,
    expiresAt,
  };
}

async function lookupAlias({ alias, incrementClick = false }) {
  const normalizedAlias = alias?.trim();
  if (!normalizedAlias) {
    const err = new Error("Alias is required");
    err.statusCode = 400;
    throw err;
  }

  const cached = parseCacheEntry(await redisClient.get(normalizedAlias));
  if (cached) {
    log.info("Redis cache hit", { alias: normalizedAlias });
    assertNotExpired(cached.expiresAt);

    if (incrementClick && cached.urlId) {
      const connection = await pool.getConnection();
      try {
        await incrementClickCount(connection, cached.urlId);
        log.info("Click count incremented", {
          alias: normalizedAlias,
          urlId: cached.urlId,
          source: "cache",
        });
      } finally {
        connection.release();
      }
    }

    return {
      alias: normalizedAlias,
      longUrl: cached.longUrl,
      urlId: cached.urlId,
      expiresAt: cached.expiresAt,
    };
  }

  log.info("Redis cache miss", { alias: normalizedAlias });

  const connection = await pool.getConnection();
  try {
    const link = await fetchLinkFromDatabase(connection, normalizedAlias);

    if (incrementClick) {
      await incrementClickCount(connection, link.urlId);
      log.info("Click count incremented", {
        alias: normalizedAlias,
        urlId: link.urlId,
        source: "database",
      });
    }

    await redisClient.setEx(
      normalizedAlias,
      getCacheTtlSeconds(link.expiresAt),
      serializeCacheEntry(link),
    );

    return {
      alias: normalizedAlias,
      longUrl: link.longUrl,
      urlId: link.urlId,
      expiresAt: link.expiresAt,
    };
  } finally {
    connection.release();
  }
}

const DataPostService = async ({ longUrl, expiresAt: expiresInMinutes }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [longUrlResult] = await connection.query(
      "INSERT INTO long_url (long_url) VALUES (?)",
      [longUrl],
    );
    const longUrlId = longUrlResult.insertId;

    const [urlResult] = await connection.query(
      "INSERT INTO url (long_url_id) VALUES (?)",
      [longUrlId],
    );
    const urlId = urlResult.insertId;

    let expiresAtDate = null;
    if (expiresInMinutes) {
      const minutes = Number(expiresInMinutes);
      expiresAtDate = new Date(Date.now() + minutes * 60 * 1000);
      await connection.query(
        "INSERT INTO urlexpiry (url_id, expires_at) VALUES (?, ?)",
        [urlId, expiresAtDate],
      );
    }

    const alias = await generateUniqueAlias(connection);
    await connection.query("INSERT INTO alias (url_id, alias) VALUES (?, ?)", [
      urlId,
      alias,
    ]);

    await connection.commit();

    const cacheEntry = {
      urlId,
      longUrl,
      expiresAt: expiresAtDate,
    };

    await redisClient.setEx(
      alias,
      getCacheTtlSeconds(expiresAtDate),
      serializeCacheEntry(cacheEntry),
    );

    const shortUrl = `${getBaseUrl()}/${alias}`;
    log.info("Short URL created", { alias, urlId, shortUrl });

    return {
      output: shortUrl,
      alias,
    };
  } catch (err) {
    await connection.rollback();
    log.error("Failed to create short URL", { message: err.message });
    throw err;
  } finally {
    connection.release();
  }
};

const resolveAlias = async ({ alias }) => {
  const link = await lookupAlias({ alias, incrementClick: false });
  log.info("Alias resolved", { alias: link.alias });
  return {
    alias: link.alias,
    longUrl: link.longUrl,
  };
};

const redirectAlias = async ({ alias }) => {
  const link = await lookupAlias({ alias, incrementClick: true });
  log.info("Redirecting alias", {
    alias: link.alias,
    destination: link.longUrl,
  });
  return {
    long_url: link.longUrl,
    alias: link.alias,
  };
};

export { DataPostService, resolveAlias, redirectAlias };
