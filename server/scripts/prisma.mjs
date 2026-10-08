import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(root, ".env") });

const args = process.argv.slice(2);
const prismaCli = path.join(root, "node_modules/prisma/build/index.js");
const child = spawn(process.execPath, [prismaCli, ...args], {
  stdio: "inherit",
  env: process.env,
  cwd: path.join(root, "server"),
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
