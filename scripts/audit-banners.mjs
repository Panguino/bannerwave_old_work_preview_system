#!/usr/bin/env node
/**
 * Scan a local banners tree (folders with index.html) and write docs/banner-inventory.md
 *
 * Usage:
 *   node scripts/audit-banners.mjs [BANNERS_ROOT] [OUTPUT_MD]
 *
 * Default BANNERS_ROOT: C:\Users\brad\Desktop\Banners
 * Default OUTPUT: docs/banner-inventory.md (relative to cwd)
 */

import fs from 'fs';
import path from 'path';

const DEFAULT_ROOT = 'C:\\Users\\brad\\Desktop\\Banners';
const root = path.resolve(process.argv[2] || DEFAULT_ROOT);
const outFile = path.resolve(process.argv[3] || path.join(process.cwd(), 'docs', 'banner-inventory.md'));

const SKIP_DIR_NAMES = new Set(['node_modules', '.git', '__MACOSX']);

/** @param {string} relPosix */
function suggestedSlug(relPosix) {
	const s = relPosix
		.toLowerCase()
		.replace(/\.html?$/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return s.slice(0, 96) || 'banner';
}

function goodAdSize(w, h) {
	if (!w || !h) return false;
	if (w < 50 || h < 50 || w > 2000 || h > 2000) return false;
	// avoid year-like false positives (e.g. 2015x11)
	if (w > 3000 || h > 3000) return false;
	const ratio = w / h;
	if (ratio < 0.05 || ratio > 50) return false;
	return true;
}

/** @param {string} html @param {string} folderName @param {string} relPosix */
function inferDimensions(html, folderName, relPosix) {
	/** @type {{ w: number, h: number, from: string }[]} */
	const sources = [];

	const metaAdSize =
		html.match(/name\s*=\s*["']ad\.size["'][^>]*content\s*=\s*["']([^"']+)["']/i) ||
		html.match(/content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']ad\.size["']/i);
	if (metaAdSize) {
		const m = metaAdSize[1].match(/(\d{2,4})\s*[xX]\s*(\d{2,4})/);
		if (m && goodAdSize(+m[1], +m[2])) sources.push({ w: +m[1], h: +m[2], from: 'meta ad.size' });
	}

	const headSlice = html.slice(0, 12000);
	const dimMeta = headSlice.match(/\b(\d{2,4})\s*[xX]\s*(\d{2,4})\b/g);
	if (dimMeta) {
		for (const chunk of dimMeta) {
			const m = chunk.match(/\b(\d{2,4})\s*[xX]\s*(\d{2,4})\b/);
			if (m && goodAdSize(+m[1], +m[2])) {
				sources.push({ w: +m[1], h: +m[2], from: 'html head snippet' });
				break;
			}
		}
	}

	for (const hay of [folderName, relPosix.replace(/\//g, '-')]) {
		const m = hay.match(/(\d{2,4})\s*[xX]\s*(\d{2,4})/);
		if (m && goodAdSize(+m[1], +m[2])) sources.push({ w: +m[1], h: +m[2], from: 'path/folder name' });
	}

	const pick = sources[0];
	if (!pick) return { w: null, h: null, hint: '' };
	return { w: pick.w, h: pick.h, hint: pick.from };
}

function scoreFallbackBasename(base) {
	const b = base.toLowerCase();
	let s = 0;
	if (/fallback|backup|static|still|poster|endframe|thumb|preview|iab|default/.test(b)) s += 50;
	if (/^frame|^shot|^img|^image/.test(b)) s += 5;
	if (/^\d{2,4}x\d{2,4}/.test(b)) s += 15;
	return s;
}

function findBannerRoots(dir) {
	/** @type {string[]} */
	const roots = [];
	function walk(d) {
		let entries;
		try {
			entries = fs.readdirSync(d, { withFileTypes: true });
		} catch {
			return;
		}
		const hasIndex = entries.some((e) => e.isFile() && e.name === 'index.html');
		if (hasIndex) roots.push(d);
		for (const ent of entries) {
			if (!ent.isDirectory() || ent.name.startsWith('.') || SKIP_DIR_NAMES.has(ent.name)) continue;
			walk(path.join(d, ent.name));
		}
	}
	walk(dir);
	return roots;
}

function ownerRoot(filePath, rootsLongestFirst) {
	const norm = path.normalize(filePath);
	for (const r of rootsLongestFirst) {
		const prefix = r.endsWith(path.sep) ? r : r + path.sep;
		if (norm === r || norm.startsWith(prefix)) return r;
	}
	return null;
}

function main() {
	if (!fs.existsSync(root)) {
		console.error(`Banners root not found: ${root}`);
		process.exit(1);
	}

	const roots = findBannerRoots(root);
	const rootsLongest = [...roots].sort((a, b) => b.length - a.length);

	/** @type {Map<string, { bytes: number, js: number, css: number, imgs: number, other: number, jpgs: { full: string, rel: string, score: number }[] }>} */
	const agg = new Map();
	for (const r of roots) {
		agg.set(r, { bytes: 0, js: 0, css: 0, imgs: 0, other: 0, jpgs: [] });
	}

	function* walkFrom(d) {
		let entries;
		try {
			entries = fs.readdirSync(d, { withFileTypes: true });
		} catch {
			return;
		}
		for (const ent of entries) {
			if (ent.name.startsWith('.')) continue;
			if (ent.isDirectory()) {
				if (SKIP_DIR_NAMES.has(ent.name)) continue;
				yield* walkFrom(path.join(d, ent.name));
			} else {
				yield path.join(d, ent.name);
			}
		}
	}

	for (const full of walkFrom(root)) {
		const st = fs.statSync(full);
		const owner = ownerRoot(full, rootsLongest);
		if (!owner || !agg.has(owner)) continue;
		const ext = path.extname(full).toLowerCase();
		const a = agg.get(owner);
		a.bytes += st.size;
		if (ext === '.js' || ext === '.mjs') a.js += 1;
		else if (ext === '.css') a.css += 1;
		else if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'].includes(ext)) {
			a.imgs += 1;
			if (ext === '.jpg' || ext === '.jpeg') {
				const score = scoreFallbackBasename(path.basename(full));
				a.jpgs.push({
					full,
					rel: path.relative(owner, full).replace(/\\/g, '/'),
					score,
				});
			}
		} else a.other += 1;
	}

	const rows = roots.map((bannerDir) => {
		const rel = path.relative(root, bannerDir).replace(/\\/g, '/') || '.';
		const relPosix = rel;
		const indexPath = path.join(bannerDir, 'index.html');
		let html = '';
		try {
			html = fs.readFileSync(indexPath, 'utf8').slice(0, 96000);
		} catch {
			html = '';
		}
		const folderName = path.basename(bannerDir);
		const dim = inferDimensions(html, folderName, relPosix);
		const a = agg.get(bannerDir);
		const jpgsSorted = [...a.jpgs].sort((x, y) => y.score - x.score);
		const topJpg = jpgsSorted[0];
		const fallbackGuess = topJpg
			? topJpg.score >= 15
				? topJpg.rel
				: jpgsSorted.length === 1
					? topJpg.rel
					: jpgsSorted.filter((j) => j.score >= 10)[0]?.rel || '(pick manually)'
			: '—';

		const topSeg = relPosix.split('/')[0] || '(root)';

		return {
			rel: relPosix,
			slug: suggestedSlug(relPosix),
			topSeg,
			w: dim.w,
			h: dim.h,
			dimHint: dim.hint || (dim.w ? '' : 'unknown'),
			fallbackGuess,
			jpgCount: jpgsSorted.length,
			...a,
			js: a.js,
			css: a.css,
			imgs: a.imgs,
		};
	});

	rows.sort((a, b) => a.rel.localeCompare(b.rel, 'en'));

	const byTop = new Map();
	for (const row of rows) {
		byTop.set(row.topSeg, (byTop.get(row.topSeg) || 0) + 1);
	}

	const when = new Date().toISOString().slice(0, 19).replace('T', ' ');

	let md = `# Banner source inventory\n\n`;
	md += `**Generated:** ${when}  \n`;
	md += `**Scanned root:** \`${root.replace(/\\/g, '/')}\`  \n`;
	md += `**Units found:** ${rows.length} (each row is a directory that contains \`index.html\`)\n\n`;
	md += `Use this list to pick imports into \`public/banners/<id>/\` and \`src/data/banners.json\`. Check off rows as you verify each build in the preview app.\n\n`;

	md += `## Summary by top-level folder\n\n`;
	md += `| Top-level | Count |\n`;
	md += `|-----------|-------|\n`;
	for (const [k, v] of [...byTop.entries()].sort((a, b) => b[1] - a[1])) {
		md += `| \`${k}\` | ${v} |\n`;
	}
	md += `\n`;

	md += `## How to read this table\n\n`;
	md += `- **Dimensions** are best-effort from meta tags, HTML text, or path/folder names (e.g. \`300x250\`). Confirm in browser before locking into JSON.\n`;
	md += `- **Fallback JPG guess** prefers names like \`fallback\`, \`backup\`, \`static\`, etc. Many units use PNG-only; you may need to export a JPG for the admin grid.\n`;
	md += `- **Size** is the sum of all files under that banner folder (nested \`index.html\` siblings are separate rows, each with its own subtree).\n\n`;

	md += `## Full inventory\n\n`;
	md += `| ✓ | Path (under Banners) | Suggested slug | WxH | Dim source | JPGs | Fallback guess | .js | .css | images | Size (MB) |\n`;
	md += `|---|----------------------|----------------|-----|------------|------|----------------|-----|------|--------|------------|\n`;

	for (const row of rows) {
		const dimStr = row.w && row.h ? `${row.w}×${row.h}` : '—';
		const dimSrc = row.dimHint || '—';
		const mb = (row.bytes / (1024 * 1024)).toFixed(2);
		const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
		md += `| [ ] | \`${esc(row.rel)}\` | \`${esc(row.slug)}\` | ${dimStr} | ${esc(dimSrc)} | ${row.jpgCount} | \`${esc(row.fallbackGuess)}\` | ${row.js} | ${row.css} | ${row.imgs} | ${mb} |\n`;
	}

	md += `\n## Checklist (copy for issues / PRs)\n\n`;
	for (const row of rows) {
		md += `- [ ] \`${row.rel}\` → import as \`${row.slug}\`\n`;
	}

	fs.mkdirSync(path.dirname(outFile), { recursive: true });
	fs.writeFileSync(outFile, md, 'utf8');
	console.log(`Wrote ${outFile} (${rows.length} banners)`);
}

main();
