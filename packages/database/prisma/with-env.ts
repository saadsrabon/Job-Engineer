import './load-env';
import { execSync } from 'child_process';

const args = process.argv.slice(2).join(' ');
execSync(`prisma ${args}`, { stdio: 'inherit', env: process.env });
