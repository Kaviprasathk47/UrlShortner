import { DataPostService, resolveAlias, redirectAlias } from "../service/service.js";
import { log } from "../utils/logger.js";

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const UserDataPost = async (req, res) => {
  const { longUrl, expiresAt } = req.body;

  if (!longUrl || !isValidUrl(longUrl)) {
    return res.status(400).json({
      output: "Failed",
      message: "A valid longUrl (starting with http:// or https://) is required",
    });
  }

  try {
    const response = await DataPostService({ longUrl, expiresAt });
    res.status(201).json({
      output: response.output,
      alias: response.alias,
      message: "Inserted",
    });
  } catch (err) {
    log.error("Create short URL failed", { message: err.message });
    res.status(500).json({
      output: "Error Occurred",
      message: err.message,
    });
  }
};

const ResolveAlias = async (req, res) => {
  const { alias } = req.params;

  if (!alias?.trim()) {
    return res.status(400).json({
      output: "Failed",
      message: "Alias param is required",
    });
  }

  try {
    const response = await resolveAlias({ alias });
    res.json({
      output: "Success",
      alias: response.alias,
      longUrl: response.longUrl,
    });
  } catch (err) {
    log.error("Resolve alias failed", {
      alias,
      statusCode: err.statusCode || 500,
      message: err.message,
    });
    res.status(err.statusCode || 500).json({
      output: "Error Occurred",
      message: err.message,
    });
  }
};

const GetUserData = async (req, res) => {
  const { alias } = req.params;

  if (!alias?.trim()) {
    return res.status(400).json({
      output: "Failed",
      message: "Alias param is required",
    });
  }

  try {
    const response = await redirectAlias({ alias });
    res.redirect(302, response.long_url);
  } catch (err) {
    log.error("Redirect failed", {
      alias,
      statusCode: err.statusCode || 500,
      message: err.message,
    });
    res.status(err.statusCode || 500).json({
      output: "Error Occurred",
      message: err.message,
    });
  }
};

export { UserDataPost, ResolveAlias, GetUserData };
