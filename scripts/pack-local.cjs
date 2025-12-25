const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const pkgDir = path.join(root, "packages", "ai-ui");
const outDir = path.join(root, ".pack");

fs.mkdirSync(outDir, { recursive: true });

function run(cmd, cwd) {
  // stdout+stderr віддаємо в консоль, щоб ти бачив що відбувається
  execSync(cmd, {
    cwd,
    stdio: "inherit",
  });
}

function runJson(cmd, cwd) {
  return execSync(cmd, {
    cwd,
    stdio: ["ignore", "pipe", "inherit"],
  }).toString();
}

// ✅ 1) Build пакета
run("npm run build:all", pkgDir);

// ✅ 2) Auto-clean старих tgz саме цього пакета в .pack
for (const f of fs.readdirSync(outDir)) {
  if (f.startsWith("mrszlv-ai-ui-components-") && f.endsWith(".tgz")) {
    fs.unlinkSync(path.join(outDir, f));
  }
}

// ✅ 3) Pack прямо в .pack (без rename/copy)
let filename = "";
try {
  const json = runJson(
    `npm pack --json --pack-destination "${outDir}"`,
    pkgDir
  );
  const parsed = JSON.parse(json);
  const info = Array.isArray(parsed) ? parsed[0] : parsed;
  filename = info?.filename || "";
} catch (e) {
  // fallback: без --json (але все одно pack-destination)
  run(`npm pack --pack-destination "${outDir}"`, pkgDir);

  // знайти найновіший tgz у outDir
  const tgzs = fs
    .readdirSync(outDir)
    .filter(
      (f) => f.startsWith("mrszlv-ai-ui-components-") && f.endsWith(".tgz")
    )
    .map((f) => ({ f, mtime: fs.statSync(path.join(outDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  filename = tgzs[0]?.f || "";
}

// ✅ 4) Жорстка перевірка: файл має існувати
const dest = path.join(outDir, filename);
if (!filename || !filename.endsWith(".tgz") || !fs.existsSync(dest)) {
  throw new Error(
    `Tarball not created. filename=${JSON.stringify(filename)} dest=${dest}`
  );
}

console.log(`Packed to ${path.relative(root, dest)}`);
