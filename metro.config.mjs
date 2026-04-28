import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { withJazz } from "jazz-tools/dev/expo";
import { withUniwindConfig } from "uniwind/metro";

const require = createRequire(import.meta.url);
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const config = getDefaultConfig(projectRoot);

// pnpm uses symlinks for hoisted packages
config.resolver.unstable_enableSymlinks = true;

// Start Jazz dev server + inject EXPO_PUBLIC_JAZZ_* for Metro inline env
await withJazz({}, { schemaDir: projectRoot });

// Uniwind must be outermost wrapper
export default withUniwindConfig(config, {
  cssEntryFile: "./global.css",
  dtsFile: "./uniwind-types.d.ts",
});
