import crypto from "crypto";
import Url from "../models/url.model.js";

const CHARSET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const MIN_LENGTH = 6;
const MAX_LENGTH = 8;
const MAX_COLLISION_RETRIES = 10;

function randomLength() {
  return MIN_LENGTH + crypto.randomInt(0, MAX_LENGTH - MIN_LENGTH + 1);
}

export function generateShortCode(length = randomLength()) {
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARSET[bytes[i] % CHARSET.length];
  }
  return code;
}

export async function generateUniqueAlias() {
  for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
    const alias = generateShortCode();
    const exists = await Url.exists({ alias });
    if (!exists) {
      return alias;
    }
  }

  throw new Error("Could not generate a unique short code. Please try again.");
}
