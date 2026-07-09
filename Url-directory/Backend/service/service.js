import Url from "../models/url.model.js";
import { generateUniqueAlias } from "../utils/shortcode.js";
import { getBaseUrl } from "../utils/config.js";
import { log } from "../utils/logger.js";

function assertNotExpired(expiresAt) {
  if (expiresAt && expiresAt < new Date()) {
    const err = new Error("This link has expired");
    err.statusCode = 410;
    throw err;
  }
}

async function incrementClickCount(urlId) {
  if (!urlId) return;
  await Url.findByIdAndUpdate(urlId, { $inc: { clickCount: 1 } });
}

async function fetchLinkFromDatabase(alias) {
  const link = await Url.findOne({ alias });

  if (!link) {
    const err = new Error("Alias not found");
    err.statusCode = 404;
    throw err;
  }

  assertNotExpired(link.expiresAt);

  return {
    urlId: link._id.toString(),
    longUrl: link.longUrl,
    expiresAt: link.expiresAt,
  };
}

async function lookupAlias({ alias, incrementClick = false }) {
  const normalizedAlias = alias?.trim();
  if (!normalizedAlias) {
    const err = new Error("Alias is required");
    err.statusCode = 400;
    throw err;
  }

  const link = await fetchLinkFromDatabase(normalizedAlias);

  if (incrementClick) {
    await incrementClickCount(link.urlId);
    log.info("Click count incremented", {
      alias: normalizedAlias,
      urlId: link.urlId,
    });
  }

  return {
    alias: normalizedAlias,
    longUrl: link.longUrl,
    urlId: link.urlId,
    expiresAt: link.expiresAt,
  };
}

const DataPostService = async ({ longUrl, expiresAt: expiresInMinutes }) => {
  let expiresAtDate = null;
  if (expiresInMinutes) {
    const minutes = Number(expiresInMinutes);
    expiresAtDate = new Date(Date.now() + minutes * 60 * 1000);
  }

  const alias = await generateUniqueAlias();

  const urlDoc = await Url.create({
    alias,
    longUrl,
    expiresAt: expiresAtDate,
  });

  const shortUrl = `${getBaseUrl()}/${alias}`;
  log.info("Short URL created", { alias, urlId: urlDoc._id.toString(), shortUrl });

  return {
    output: shortUrl,
    alias,
  };
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
