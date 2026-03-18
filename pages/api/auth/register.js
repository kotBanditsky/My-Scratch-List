import clientPromise from "../../../components/mongodb/mongo";
import { dbName } from "../../../components/mongodb/mongo";
import { createHash } from "crypto";
import * as bip39 from "bip39";

function generateName() {
  const adjectives = ["Swift", "Brave", "Cosmic", "Lucky", "Noble", "Mystic", "Vivid", "Bold", "Calm", "Dark", "Frosty", "Golden", "Iron", "Jade", "Keen", "Lunar", "Neo", "Onyx", "Pixel", "Ruby"];
  const nouns = ["Wolf", "Fox", "Hawk", "Bear", "Dragon", "Phoenix", "Tiger", "Lynx", "Raven", "Sage", "Storm", "Blade", "Frost", "Spark", "Stone", "Shadow", "Knight", "Viper", "Ghost", "Star"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj}${noun}${num}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const client = await clientPromise;
  const db = client.db(dbName);

  // Generate seed phrase
  const mnemonic = bip39.generateMnemonic();
  const seedHash = createHash("sha256").update(mnemonic.trim().toLowerCase()).digest("hex");

  // Check collision (extremely unlikely)
  const existing = await db.collection("users").findOne({ seedHash });
  if (existing) {
    return res.status(409).json({ error: "Collision, try again" });
  }

  // Generate unique username — retry until unique
  let username;
  for (let i = 0; i < 20; i++) {
    const candidate = generateName();
    const taken = await db.collection("users").findOne({ username: candidate.toLowerCase() });
    if (!taken) {
      username = candidate;
      break;
    }
  }
  if (!username) {
    return res.status(500).json({ error: "Could not generate unique username" });
  }

  await db.collection("users").insertOne({
    seedHash,
    name: username,
    username: username.toLowerCase(),
    role: "user",
    games: [],
    createdAt: new Date(),
  });

  res.status(201).json({ stat: "okay", seed: mnemonic, username });
}
