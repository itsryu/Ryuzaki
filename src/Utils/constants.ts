import { readFileSync } from 'node:fs';
import { cpus, totalmem, version } from 'node:os';
import { join } from 'node:path';
import { env } from 'node:process';

const packageJsonPath = join(__dirname, '..', '..', '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as Record<string, string>;
const CPUs = cpus();

export const VERSION: string = env.npm_package_version ?? packageJson.version;
export const CPU_MODEL = CPUs[0].model;
export const CPU_CORES = CPUs.length;
export const TOTAL_RAM = totalmem();
export const OS_VERSION = version();