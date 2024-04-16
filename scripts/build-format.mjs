// This builds the web site that hosts Chapbook, including API docs, guide, and
// formats. Call this with a `watch` argument to put it into watch mode, and to
// serve a dev version at http://localhost:3000.

/* eslint-disable no-console */
import chokidar from "chokidar";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { build, loadConfigFromFile } from "vite";

process.env.NODE_ENV = "production";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  await fs.readFile(path.resolve(__dirname, "../package.json"), "utf8")
);
const dest = path.resolve(`${__dirname}/../dist`);
const root = path.resolve(`${__dirname}/..`);
const formatDest = `${dest}/use/${pkg.version}`;

export async function buildFormat() {
  const { config: runtimeConfig } = await loadConfigFromFile(
    {},
    "vite.runtime.config.js"
  );
  const { config: extensionsConfig } = await loadConfigFromFile(
    {},
    "vite.extensions.config.js"
  );

  const { output: runtimeOutput } = await build(runtimeConfig);
  const [extensionsOutput] = await build(extensionsConfig);
  const source = runtimeOutput[0].source;
  const hydrateSource = extensionsOutput.output[0].code;

  const format = {
    source,
    author: pkg.author.replace(/ <.*>/, ""),
    description: pkg.description,
    hydrate: hydrateSource,
    image: "logo.svg",
    name: pkg.name,
    proofing: false,
    url: pkg.repository,
    version: pkg.version,
  };

  await fs.mkdirp(formatDest);
  await fs.writeFile(
    `${formatDest}/format.js`,
    `window.storyFormat(${JSON.stringify(format)})`,
    "utf8"
  );
  await fs.copy(`${root}/src/logo.svg`, `${formatDest}/logo.svg`);
  await fs.emptyDir(`${root}/build`);
  await fs.rmdir(`${root}/build`);
  console.log("Wrote format.");

  if (process.argv.includes("watch")) {
    const watcher = chokidar.watch(`${root}/src`);

    watcher.once("change", () => {
      watcher.close();
      buildFormat();
    });
  }
}

if (process.env.npm_lifecycle_event === "build:format") {
  buildFormat();
}
