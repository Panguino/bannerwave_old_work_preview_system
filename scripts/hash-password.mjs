#!/usr/bin/env node
import bcrypt from 'bcryptjs';

const pwd = process.argv[2];
if (!pwd) {
	console.error('Usage: node scripts/hash-password.mjs <plain-password>');
	process.exit(1);
}
const hash = bcrypt.hashSync(pwd, 12);
console.log(hash);
