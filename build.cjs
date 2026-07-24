const fs = require("fs");
const path = require("path");

const root = __dirname;
const output = path.resolve(root, "dist");
const outputParent = path.dirname(output);

if (outputParent !== path.resolve(root) || path.basename(output) !== "dist") {
  throw new Error(`Refusing to build outside the expected dist directory: ${output}`);
}

const files = [
  "index.html",
  "styles.css",
  "script.js",
  "desktop-preview.js",
  "aami-game.js",
  "local-server.cjs",
  "Amina-M-Resume.pdf",
  "avatar.svg",
  "Pointer.png",
  "works.html",
  "garden.html"
];

const directories = ["about", "works", "resume", "contact", "assets"];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}

for (const directory of directories) {
  fs.cpSync(path.join(root, directory), path.join(output, directory), {
    recursive: true
  });
}

for (const required of [
  "index.html",
  "styles.css",
  "desktop-preview.js",
  "about/index.html",
  "works/index.html",
  "resume/index.html",
  "contact/index.html"
]) {
  if (!fs.existsSync(path.join(output, required))) {
    throw new Error(`Production build is missing ${required}`);
  }
}

console.log(`Production build created at ${output}`);
