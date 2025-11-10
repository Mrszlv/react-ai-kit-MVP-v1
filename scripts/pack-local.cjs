const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const pkgDir = path.join(root, "packages", "ai-ui");
const outDir = path.join(root, ".pack");
fs.mkdirSync(outDir, { recursive: true });

function run(cmd, cwd) {
  return execSync(cmd, {
    cwd,
    stdio: ["ignore", "pipe", "inherit"],
  }).toString();
}

run("npm run build:all", pkgDir);

function resolveTarballName() {
  try {
    const json = run("npm pack --json", pkgDir);
    const parsed = JSON.parse(json);

    const info = Array.isArray(parsed) ? parsed[0] : parsed;
    if (info && typeof info.filename === "string") return info.filename;
    if (info && typeof info === "string") return info; // на всяк
  } catch {}
  const out = run("npm pack", pkgDir).trim();
  const lines = out.split(/\r?\n/).filter(Boolean);
  return lines[lines.length - 1];
}

const filename = resolveTarballName();

if (!filename || typeof filename !== "string" || !filename.endsWith(".tgz")) {
  throw new Error(
    `Tarball name not detected, got: ${JSON.stringify(filename)}`
  );
}

const src = path.join(pkgDir, filename);
const dest = path.join(outDir, filename);
try {
  fs.renameSync(src, dest);
} catch {
  fs.copyFileSync(src, dest);
  fs.unlinkSync(src);
}

console.log(`Packed to ${path.relative(root, dest)}`);
