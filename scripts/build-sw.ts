import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env depending on the environment
// Prioritize .env.local if it exists, then .env
const envPath = path.resolve(__dirname, "../.env");
const envLocalPath = path.resolve(__dirname, "../.env.local");

dotenv.config({ path: envPath });
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

const templatePath = path.resolve(
  __dirname,
  "../public/firebase-messaging-sw.template.js",
);
const outputPath = path.resolve(
  __dirname,
  "../public/firebase-messaging-sw.js",
);

try {
  let content = fs.readFileSync(templatePath, "utf-8");

  const requiredKeys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];

  requiredKeys.forEach((key) => {
    const value = process.env[key];
    if (!value) {
      console.warn(`Warning: Missing environment variable ${key}`);
    }
    // Replace ${KEY} with the actual value
    // We use a regex to replace all occurrences if any
    const regex = new RegExp(`\\$\\{${key}\\}`, "g");
    content = content.replace(regex, value || "");
  });

  fs.writeFileSync(outputPath, content);
  console.log("Successfully generated public/firebase-messaging-sw.js");
} catch (error) {
  console.error("Error generating service worker:", error);
  process.exit(1);
}
