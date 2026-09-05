import path from 'node:path';
import { fileURLToPath } from 'node:url';

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

const [major, minor] = process.versions.node.split('.').map((value) => Number(value));
if (!Number.isInteger(major) || !Number.isInteger(minor) || major < 22 || (major === 22 && minor < 13)) {
  fail(
    `Wizloft Harness requires Node.js >=22.13.0. This process is running Node.js ${process.versions.node}.`,
  );
} else {
  const repositoryRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
  let resolved;
  try {
    resolved = import.meta.resolve('@wizloft/harness-project');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_MODULE_NOT_FOUND') {
      fail(
      'Cannot resolve @wizloft/harness-project from .wizloft/harness/node_modules. Restore the isolated runtime with:\n\nnpm --prefix .wizloft/harness ci --ignore-scripts --no-audit --no-fund',
      );
    } else {
      fail(error instanceof Error ? error.message : String(error));
    }
  }
  if (resolved) {
    try {
      const { runProjectHarness } = await import(resolved);
      try {
        process.exitCode = await runProjectHarness(process.argv.slice(2), {
          repositoryRoot,
          env: process.env,
          stdin: process.stdin,
          stdout: process.stdout,
          stderr: process.stderr,
        });
      } catch (error) {
        fail(error instanceof Error ? error.message : String(error));
      }
    } catch (error) {
      fail(error instanceof Error ? error.message : String(error));
    }
  }
}
