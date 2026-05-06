import { readdir } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && fullPath.endsWith(".js")) return [fullPath];
    return [];
  }));

  return files.flat();
};

const files = await walk(path.resolve("src"));

for (const file of files) {
  await execFileAsync(process.execPath, ["--check", file]);
}

console.log(`Backend check OK (${files.length} archivos)`);
