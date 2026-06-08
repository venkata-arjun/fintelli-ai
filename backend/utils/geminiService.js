import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const parseGeminiApiKeys = () => {
  const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";

  return rawKeys
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
};

const apiKeys = parseGeminiApiKeys();
const clients = new Map();

if (apiKeys.length === 0) {
  console.error(
    "WARNING: GEMINI_API_KEYS or GEMINI_API_KEY is not set. AI features will not work.",
  );
}

const getClient = (apiKey, keyIndex) => {
  if (!clients.has(keyIndex)) {
    clients.set(
      keyIndex,
      new GoogleGenAI({
        apiKey,
      }),
    );
  }

  return clients.get(keyIndex);
};

const getErrorStatus = (error) =>
  error?.status ||
  error?.statusCode ||
  error?.code ||
  error?.error?.code ||
  error?.response?.status;

const getErrorText = (error) =>
  [
    error?.message,
    error?.error?.message,
    error?.error?.status,
    error?.response?.data?.error?.message,
    error?.response?.data?.error?.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const isRetryableGeminiError = (error) => {
  const status = Number(getErrorStatus(error));
  const message = getErrorText(error);

  if ([401, 403, 429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  // Gemini can surface quota/key/service failures as provider-specific text.
  return [
    "api key",
    "apikey",
    "permission",
    "forbidden",
    "unauthorized",
    "quota",
    "rate limit",
    "resource_exhausted",
    "unavailable",
    "service unavailable",
  ].some((pattern) => message.includes(pattern));
};

export const generateGeminiContent = async (request, { operation } = {}) => {
  if (apiKeys.length === 0) {
    throw new Error("No Gemini API keys configured.");
  }

  let lastError;

  // Each request starts from key index 0 and advances only when that key fails.
  for (let index = 0; index < apiKeys.length; index += 1) {
    const keyNumber = index + 1;
    const client = getClient(apiKeys[index], index);

    console.info(
      `[Gemini] ${operation || "request"}: using API key index ${keyNumber}/${apiKeys.length}`,
    );

    try {
      return await client.models.generateContent(request);
    } catch (error) {
      lastError = error;

      if (!isRetryableGeminiError(error) || index === apiKeys.length - 1) {
        break;
      }

      console.warn(
        `[Gemini] ${operation || "request"}: key index ${keyNumber} failed, retrying next key.`,
      );
    }
  }

  const finalError = new Error(
    "All Gemini API keys failed or are currently unavailable.",
  );
  finalError.cause = lastError;
  throw finalError;
};

export default {
  generateGeminiContent,
};
