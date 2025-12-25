import { config as dotenvConfig } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

dotenvConfig({ path: path.resolve(process.cwd(), ".env.license") });

if (!process.env.LICENSE_PRIVATE_KEY_B64URL) {
  console.error(
    "Missing LICENSE_PRIVATE_KEY_B64URL. Put it into .env.license (root)."
  );
  process.exit(1);
}

// Usage:
// node scripts/license-bulk.mjs <clients.txt> <YYYY-MM-DD> <pro|demo> [--out licenses.csv] [--dry]
const argv = process.argv.slice(2);

const takeOpt = (name) => {
  const i = argv.indexOf(name);
  if (i === -1) return null;
  const val = argv[i + 1] ?? null;
  argv.splice(i, 2);
  return val;
};

const outFile = takeOpt("--out") || path.resolve(process.cwd(), "licenses.csv");
const dryRun = argv.includes("--dry");
if (dryRun) argv.splice(argv.indexOf("--dry"), 1);

const [inputFile, exp, plan] = argv;

if (!inputFile || !exp || !plan) {
  console.log(
    "Usage:\n  npm run license:bulk -- <clients.txt> <YYYY-MM-DD> <pro|demo> [--out licenses.csv] [--dry]"
  );
  process.exit(1);
}

const inputPath = path.isAbsolute(inputFile)
  ? inputFile
  : path.resolve(process.cwd(), inputFile);

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const text = fs.readFileSync(inputPath, "utf8");
const emails = text
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean)
  .filter((l) => !l.startsWith("#"));

if (emails.length === 0) {
  console.error("No emails found in input file.");
  process.exit(1);
}

// Prepare output CSV
const header = "email,plan,exp,iat,key,createdAt\n";
if (!fs.existsSync(outFile)) fs.writeFileSync(outFile, header, "utf8");

const already = new Set();
try {
  const existing = fs.readFileSync(outFile, "utf8").split(/\r?\n/);
  for (const line of existing) {
    if (!line || line.startsWith("email,")) continue;
    const m = line.match(/^"([^"]+)"/);
    if (m?.[1]) already.add(m[1]);
  }
} catch {
  // ignore
}

const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;

let ok = 0;
let skipped = 0;
let failed = 0;

console.log(`\nBulk issuing: ${emails.length} emails`);
console.log(`Plan: ${plan}, Exp: ${exp}`);
console.log(`Output: ${outFile}`);
if (dryRun) console.log("DRY RUN: no keys will be generated.\n");

for (const email of emails) {
  if (already.has(email)) {
    skipped++;
    console.log(`SKIP (already in csv): ${email}`);
    continue;
  }

  if (dryRun) {
    ok++;
    console.log(`DRY: ${email}`);
    continue;
  }

  const res = spawnSync(
    process.execPath,
    [
      path.resolve(process.cwd(), "scripts/license-issue.mjs"),
      email,
      exp,
      plan,
    ],
    { encoding: "utf8", env: process.env }
  );

  if (res.status !== 0) {
    failed++;
    console.log(`FAIL: ${email}`);
    process.stdout.write(res.stdout || "");
    process.stderr.write(res.stderr || "");
    continue;
  }

  const stdout = (res.stdout || "").trim();
  const match = stdout.match(/(mrszlv1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/);
  const key = match?.[1];

  if (!key) {
    failed++;
    console.log(`FAIL (no key parsed): ${email}`);
    process.stdout.write(res.stdout || "");
    continue;
  }

  const createdAt = new Date().toISOString();
  const iat = createdAt.slice(0, 10);

  const line =
    [email, plan, exp, iat, key, createdAt].map(esc).join(",") + "\n";
  fs.appendFileSync(outFile, line, "utf8");

  ok++;
  console.log(`OK: ${email}`);

  // ✅ auto-clear clients file
  try {
    fs.writeFileSync(inputPath, "", "utf8");
    console.log(`✔ clients file cleared: ${inputPath}`);
  } catch (err) {
    console.warn(`⚠ could not clear clients file: ${err.message}`);
  }
}

console.log(`\nDone.`);
console.log(`OK: ${ok}`);
console.log(`SKIP: ${skipped}`);
console.log(`FAIL: ${failed}\n`);

if (failed > 0) process.exit(1);
