// This builds the web site that hosts Chapbook, including API docs, guide, and
// formats. Call this with a `watch` argument to put it into watch mode, and to
// serve a dev version at http://localhost:3000.

/* eslint-disable no-console */
import chokidar from "chokidar";
import { $ } from "execa";
import { compileTwine2HTML, parseStoryFormat, parseTwee } from "extwee";
import fs from "fs-extra";
import http from "http";
import path from "path";
import serveStatic from "serve-static";
import { fileURLToPath } from "url";
import { buildFormat } from "./build-format.mjs";

process.env.NODE_ENV = "production";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  await fs.readFile(path.resolve(__dirname, "../package.json"), "utf8")
);
const dest = path.resolve(`${__dirname}/../dist`);
const root = path.resolve(`${__dirname}/..`);
const formatDest = `${dest}/use/${pkg.version}`;

async function copyDirectory(src, dest) {
  await fs.copy(src, dest);
  console.log(`Copied ${src}.`);
}

function startDevServer() {
  const serve = serveStatic(dest);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const server = http.createServer((req, res) => serve(req, res, () => {}));

  server.listen(3000);
  console.log("Server started: http://localhost:3000");
}

async function cleanOutputDirectory() {
  await fs.mkdirp(dest);
  await fs.emptyDir(dest);
  console.log(`Cleaned ${dest}.`);
}

async function copyStaticFiles() {
  await copyDirectory(`${root}/homepage`, dest);
  await copyDirectory(`${root}/previous-versions`, `${dest}/use`);
}

async function buildApi() {
  await $`typedoc`;
  console.log("Wrote API docs.");
}

async function buildExample() {
  const format = parseStoryFormat(
    await fs.readFile(`${formatDest}/format.js`, "utf8")
  );
  const source = await fs.readFile(
    `${root}/demo/cloak-of-darkness.twee`,
    "utf8"
  );
  const story = parseTwee(source);

  // Hard-coding IFID so that it remains constant regardless of version changes.
  story.IFID = "89CFB7DD-F61A-4E4E-8006-8D343BC6F4A2";
  await fs.mkdirp(`${dest}/examples`);
  await fs.writeFile(
    `${dest}/examples/cloak-of-darkness.html`,
    compileTwine2HTML(story, format),
    "utf8"
  );
  await fs.writeFile(`${dest}/examples/cloak-of-darkness.txt`, source, "utf8");
  console.log("Wrote Cloak of Darkness example.");
}

async function buildGuide() {
  await $({ cwd: `${root}/guide` })`mdbook build`;
  console.log("Wrote guide.");
}

async function buildOnce() {
  await cleanOutputDirectory();
  await Promise.all([
    copyStaticFiles(),
    buildApi(),
    buildGuide(),
    buildFormat().then(buildExample),
  ]);
}

async function devServer() {
  await cleanOutputDirectory();
  copyStaticFiles();
  chokidar
    .watch([`${root}/homepage`, `${root}/previous-versions`])
    .on("change", copyStaticFiles);
  buildApi();
  chokidar.watch(`${root}/src`).on("change", buildApi);
  buildGuide();
  chokidar.watch(`${root}/guide`).on("change", buildGuide);
  buildFormat().then(buildExample);
  chokidar
    .watch(`${root}/src`)
    .on("change", () => buildFormat().then(buildExample));
  startDevServer();
}

if (process.argv.length === 3 && process.argv[2] === "watch") {
  devServer();
} else {
  buildOnce();
}
