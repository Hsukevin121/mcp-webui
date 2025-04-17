// src/config/index.ts

import * as fs from "fs";
import path from 'path';
import { fileURLToPath } from "url";
import { Config } from "../types/config"; // Import the main Config type

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load config once at startup
//const configPath = "./mcp-config.json";
let config: Config;

try {
  const configPath = path.resolve(__dirname, "../../mcp-config.json");
  const raw = fs.readFileSync(configPath, "utf-8");
  config = JSON.parse(raw);
} catch (error) {
  if (error instanceof Error) {
    throw new Error(`Failed to load config: ${error.message}`);
  }
  throw error;
}

// Export the full config and specific sections
export const getConfig = () => config;
export const ollamaConfig = config.ollama;
