import { config as dotenvConfig } from "dotenv";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import fs from "node:fs";

dotenvConfig({ path: path.resolve(process.cwd(), ".env.license") });

if (!process.env.LICENSE_PRIVATE_KEY_B64URL) {
  console.error(
    "Missing LICENSE_PRIVATE_KEY_B64URL. Put it into .env.license (root)."
  );
  process.exit(1);
}

// args: <email> <YYYY-MM-DD> <pro|demo> [--out <file>] [--format csv|jsonl]
const argv = process.argv.slice(2);
if (argv.length < 3) {
  console.log(
    "Usage: npm run license:issue -- <email> <YYYY-MM-DD> <pro|demo> [--out <file>] [--format csv|jsonl]"
  );
  process.exit(1);
}

const takeOpt = (name) => {
  const i = argv.indexOf(name);
  if (i === -1) return null;
  const val = argv[i + 1] ?? null;
  argv.splice(i, 2);
  return val;
};

const outFile = takeOpt("--out");
const format = (takeOpt("--format") || "").toLowerCase() || null;

const [email, exp, plan] = argv;

// викликаємо твій issue-скрипт, який друкує ключ у stdout
const res = spawnSync(
  process.execPath,
  [path.resolve(process.cwd(), "scripts/license-issue.mjs"), email, exp, plan],
  { encoding: "utf8", env: process.env }
);

if (res.status !== 0) {
  process.stdout.write(res.stdout || "");
  process.stderr.write(res.stderr || "");
  process.exit(res.status ?? 1);
}

const stdout = (res.stdout || "").trim();
process.stdout.write(res.stdout || "");

const match = stdout.match(/(mrszlv1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/);
const key = match?.[1];

if (!key) {
  console.error("\nCould not parse license key from output.");
  process.exit(1);
}

const createdAt = new Date().toISOString();
const iat = createdAt.slice(0, 10); // YYYY-MM-DD

// дефолти: CSV файл у корені
const finalFormat = format || (outFile?.endsWith(".jsonl") ? "jsonl" : "csv");
const finalOut =
  outFile ||
  (finalFormat === "jsonl"
    ? path.resolve(process.cwd(), "licenses.jsonl")
    : path.resolve(process.cwd(), "licenses.csv"));

if (finalFormat === "jsonl") {
  const row = { email, plan, exp, iat, key, createdAt };
  fs.appendFileSync(finalOut, JSON.stringify(row) + "\n", "utf8");
  console.log(`\nSaved: ${finalOut}`);
} else {
  const header = "email,plan,exp,iat,key,createdAt\n";
  if (!fs.existsSync(finalOut)) fs.writeFileSync(finalOut, header, "utf8");

  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const line =
    [email, plan, exp, iat, key, createdAt].map(esc).join(",") + "\n";
  fs.appendFileSync(finalOut, line, "utf8");
  console.log(`\nSaved: ${finalOut}`);
}
