const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "dist");
fs.mkdirSync(outDir, { recursive: true });
console.log("Ensured dist folder:", outDir);
