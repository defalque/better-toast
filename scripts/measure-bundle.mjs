#!/usr/bin/env node
/**
 * Size ruler for better-toast as a consumer production app would ship it.
 *
 * 1. Production ng-packagr build of the library.
 * 2. Angular linker (AOT, linkerJitMode false) so ngDeclare* becomes ɵcmp.
 * 3. esbuild minify with ngDevMode/ngJitMode false, matching Angular production defines.
 * 4. gzip -9 and brotli 11 of that JS.
 *
 * Primary metric is `minGzip`. That is the JS a consumer pays for when they mount
 * <better-toaster>, not the unlinked FESM on npm.
 *
 * Usage: node scripts/measure-bundle.mjs
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createGzip, createBrotliCompress, constants as zlibConstants } from 'node:zlib';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import * as esbuild from 'esbuild';
import linkerPlugin from '@angular/compiler-cli/linker/babel';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distLib = join(root, 'dist', 'better-toast');
const tmpDir = join(root, 'tmp', 'bundle-measure');
const require = createRequire(join(root, 'node_modules/@angular/compiler-cli/package.json'));
const babel = require('@babel/core');

async function findFesm(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findFesm(path)));
    } else if (entry.isFile() && entry.name.endsWith('.mjs') && dir.includes('fesm')) {
      files.push(path);
    }
  }
  return files;
}

function compressSize(inputPath, outputPath, stream) {
  return pipeline(createReadStream(inputPath), stream, createWriteStream(outputPath)).then(
    async () => (await readFile(outputPath)).byteLength,
  );
}

async function linkFesm(source, filename) {
  const result = await babel.transformAsync(source, {
    filename,
    plugins: [[linkerPlugin, { linkerJitMode: false, sourceMapping: false }]],
    compact: false,
    configFile: false,
    babelrc: false,
    sourceMaps: false,
  });
  if (!result?.code) {
    throw new Error(`Angular linker produced no code for ${filename}`);
  }
  return result.code;
}

async function main() {
  const ngCli = join(root, 'node_modules/@angular/cli/bin/ng.js');
  execFileSync(process.execPath, [ngCli, 'build', 'better-toast', '--configuration', 'production'], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`,
    },
  });

  const fesmFiles = await findFesm(distLib);
  if (fesmFiles.length === 0) {
    throw new Error(`No FESM .mjs files under ${distLib}`);
  }

  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });

  const files = [];
  let minTotal = 0;
  let gzipTotal = 0;
  let brotliTotal = 0;
  let rawTotal = 0;
  let linkedTotal = 0;

  for (const fesmPath of fesmFiles.sort()) {
    const raw = await readFile(fesmPath);
    const linked = await linkFesm(raw.toString('utf8'), fesmPath);
    const stem = relative(distLib, fesmPath).replaceAll('/', '__');
    const linkedPath = join(tmpDir, `linked-${stem}`);
    const minPath = join(tmpDir, `min-${stem}`);
    await writeFile(linkedPath, linked);

    await esbuild.build({
      entryPoints: [linkedPath],
      outfile: minPath,
      bundle: false,
      minify: true,
      legalComments: 'none',
      target: 'es2022',
      format: 'esm',
      logLevel: 'silent',
      define: {
        ngDevMode: 'false',
        ngJitMode: 'false',
      },
    });

    const min = await readFile(minPath);
    const gzipBytes = await compressSize(minPath, `${minPath}.gz`, createGzip({ level: 9 }));
    const brotliBytes = await compressSize(
      minPath,
      `${minPath}.br`,
      createBrotliCompress({
        params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
      }),
    );

    rawTotal += raw.byteLength;
    linkedTotal += Buffer.byteLength(linked);
    minTotal += min.byteLength;
    gzipTotal += gzipBytes;
    brotliTotal += brotliBytes;

    files.push({
      file: relative(root, fesmPath),
      raw: raw.byteLength,
      linked: Buffer.byteLength(linked),
      min: min.byteLength,
      gzip: gzipBytes,
      brotli: brotliBytes,
    });
  }

  const result = {
    metric: 'minGzip',
    minGzip: gzipTotal,
    minBrotli: brotliTotal,
    min: minTotal,
    linked: linkedTotal,
    raw: rawTotal,
    files,
  };

  await writeFile(join(tmpDir, 'result.json'), `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
