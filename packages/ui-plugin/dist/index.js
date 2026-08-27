import { r as __toESM } from "./rolldown-runtime-CMFfr-1z.js";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
//#region src/types.ts
/** the CONCRETE registry — iterable at build time (the vite plugin walks this) */
const SLOT_REGISTRY = {
	calendar: {
		slot: "calendar",
		consumers: [{
			consumer: "jx-html-input ::-webkit-calendar-picker-indicator",
			technique: "background-image",
			browsers: "chromium",
			notes: "Firefox/WebKit fall back to native indicator"
		}]
	},
	clock: {
		slot: "clock",
		consumers: [{
			consumer: "jx-html-input[type=time] ::-webkit-calendar-picker-indicator",
			technique: "background-image",
			browsers: "chromium",
			notes: "same as calendar"
		}]
	},
	chevron: {
		slot: "chevron",
		consumers: [{
			consumer: "jx-html-select (native select)",
			technique: "background-image",
			browsers: "all",
			notes: "replaces CSS gradients (alignment fix)"
		}]
	},
	pipette: {
		slot: "pipette",
		consumers: [{
			consumer: "jx-html-color ::after",
			technique: "mask",
			browsers: "all"
		}]
	},
	clear: {
		slot: "clear",
		consumers: [{
			consumer: "input component × button",
			technique: "inline-svg",
			browsers: "all",
			notes: "DOM injection via {@html}; serializer has a dom-string mode"
		}]
	}
};
/** all registered slot names (for iteration) */
const SLOT_NAMES = Object.keys(SLOT_REGISTRY);
//#endregion
//#region src/providers/svg.ts
/** join a directory and filename without depending on node:path */
const joinPath = (dir, file) => dir.endsWith("/") ? `${dir}${file}` : `${dir}/${file}`;
/** the opening <svg …> tag (viewBox is read from here, not from children) */
const SVG_OPEN_TAG_RE = /<svg\b[^>]*>/i;
/** viewBox="minX minY width height" (XML allows comma separators too) */
const VIEWBOX_RE = /viewBox\s*=\s*["']([^"']+)["']/i;
/** every stroke="…" presentation attribute in the document */
const STROKE_ATTR_RE = /\bstroke\s*=\s*["']([^"']*)["']/gi;
/** opaque stroke paint values mean the artwork is stroke-based */
const TRANSPARENT_STROKE = /* @__PURE__ */ new Set([
	"",
	"none",
	"transparent"
]);
/**
* Detect the artwork nature: 'stroke' if any element paints a visible
* stroke, otherwise 'fill' (fill is the SVG default — plain
* `<path d="…"/>` glyphs and font extractions land here).
*
* Attribute-based heuristic: CSS inside a <style> block is not
* inspected. Lucide-style roots (`fill="none" stroke="currentColor"`)
* resolve to 'stroke'; `stroke="none"` values are ignored so
* fill-based sets that disable stroke explicitly still resolve to
* 'fill'.
*/
function detectNature(svg) {
	for (const match of svg.matchAll(STROKE_ATTR_RE)) if (!TRANSPARENT_STROKE.has(match[1].trim().toLowerCase())) return "stroke";
	return "fill";
}
/** decode + parse a loaded SVG file into a SvgAsset; throws on malformed input */
function parseSvgAsset(source) {
	const svg = new TextDecoder().decode(source.data).trim();
	const openTag = SVG_OPEN_TAG_RE.exec(svg)?.[0];
	if (openTag === void 0) throw new Error("no <svg> root element");
	const viewBoxMatch = VIEWBOX_RE.exec(openTag);
	if (viewBoxMatch === null) throw new Error("missing viewBox on the <svg> root");
	const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
	const width = parts[2];
	const height = parts[3];
	if (parts.length !== 4 || !parts.every((n) => Number.isFinite(n)) || width <= 0 || height <= 0) throw new Error(`invalid viewBox "${viewBoxMatch[1]}"`);
	return {
		svg,
		viewBox: {
			width,
			height
		},
		nature: detectNature(svg),
		source: {
			kind: "file",
			path: source.path
		}
	};
}
/**
* A file-based icon provider backed by .svg files in one directory.
*
* @example
* ```ts
* // full directory: all five slots, default filenames
* svgIconProvider({ dir: './src/assets/icons' })
*
* // scoped override (mixin): only the chevron slot, custom filename
* svgIconProvider({ dir: './src/assets/icons', slots: { chevron: 'down.svg' } })
* ```
*/
function svgIconProvider(options) {
	const slotFiles = options.slots ? Object.entries(options.slots).filter((entry) => entry[1] !== void 0) : SLOT_NAMES.map((slot) => [slot, `${slot}.svg`]);
	return async (ctx) => {
		const cache = /* @__PURE__ */ new Map();
		/** (re)load one slot's file into the cache; warn + skip on failure */
		const loadSlot = async (slot, file) => {
			const path = joinPath(options.dir, file);
			try {
				const source = await ctx.loadSource(path);
				cache.set(slot, parseSvgAsset(source));
			} catch (error) {
				cache.delete(slot);
				const reason = error instanceof Error ? error.message : String(error);
				console.warn(`[svgIconProvider] skipping slot "${slot}" (${path}): ${reason} — the slot falls back to the next provider`);
			}
		};
		await Promise.all(slotFiles.map(([slot, file]) => loadSlot(slot, file)));
		for (const [slot, file] of slotFiles) ctx.watchFile(joinPath(options.dir, file), () => {
			loadSlot(slot, file);
		});
		return { getIcon(slot) {
			return cache.get(slot) ?? null;
		} };
	};
}
//#endregion
//#region src/providers/lucide.ts
/** lucide icons are normalized to the 24×24 design grid */
const LUCIDE_VIEWBOX = {
	width: 24,
	height: 24
};
/**
* lucide stroke-artwork wrapper. Mirrors the lucide attribute set:
* fill="none", stroke="currentColor", round caps/joins, 2px stroke.
*
* - No width/height: the theme owns sizing (frozen principle #3).
* - stroke="currentColor": in 'dom-string' mode (the clear slot's ×
*   button) it inherits the surrounding text color; in 'css-var' data
*   URIs currentColor computes to the initial `color` value (black),
*   matching the %23000-encoded fallbacks baked into jx-pure.css.
*/
const lucideSvg = (paths) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
/**
* The embedded slot artwork (lucide geometry, verified against the
* standard layer's icons.ts / jx-pure.css data URIs).
*/
const LUCIDE_ICONS = {
	/** lucide `calendar` — rect + header ticks + week line */
	calendar: lucideSvg("<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M16 2v4\"/><path d=\"M8 2v4\"/><path d=\"M3 10h18\"/>"),
	/** lucide `clock` — circle + hands polyline */
	clock: lucideSvg("<circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/>"),
	/** lucide `chevron-down` — the select dropdown arrow */
	chevron: lucideSvg("<path d=\"m6 9 6 6 6-6\"/>"),
	/** lucide `pipette` — the color picker indicator */
	pipette: lucideSvg("<path d=\"m2 22 1-1h3l9-9\"/><path d=\"M3 21v-3l9-9\"/><path d=\"m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z\"/>"),
	/** lucide `x` — the input clear button (×) */
	clear: lucideSvg("<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>")
};
/**
* The default icon provider: every registered slot serves embedded
* lucide artwork, source kind 'inline', nature 'stroke'.
*
* @example
* ```ts
* jxUI({ icons: lucideIconProvider() })
* ```
*/
function lucideIconProvider() {
	return async () => {
		const cache = /* @__PURE__ */ new Map();
		for (const [slot, svg] of Object.entries(LUCIDE_ICONS)) cache.set(slot, {
			svg,
			viewBox: LUCIDE_VIEWBOX,
			nature: "stroke",
			source: { kind: "inline" }
		});
		return { getIcon(slot) {
			return cache.get(slot) ?? null;
		} };
	};
}
//#endregion
//#region src/providers/font.ts
const DEFAULT_VIEW_BOX = {
	width: 24,
	height: 24
};
/** path-data precision: 3 decimals on a ≤ few-hundred-px viewBox is sub-pixel */
const PATH_DECIMALS = 3;
/**
* Build an IconProviderFactory that extracts font glyphs as SVG paths.
* The vite plugin awaits the factory at build start; the returned
* provider answers getIcon() synchronously from the pre-built cache.
*/
function fontIconProvider(options) {
	return async (ctx) => {
		const { fontPath, symbols } = options;
		const viewBox = options.viewBox ?? DEFAULT_VIEW_BOX;
		/** (re)parse the font + rebuild the slot cache */
		const buildCache = async () => {
			const opentype = await loadOpentype();
			const source = await ctx.loadSource(fontPath);
			const font = opentype.parse(toArrayBuffer(source.data));
			const cache = /* @__PURE__ */ new Map();
			for (const slot of Object.keys(symbols)) {
				const codepoint = symbols[slot];
				if (typeof codepoint !== "number") continue;
				cache.set(slot, extractGlyph(font, {
					slot,
					codepoint,
					fontPath,
					viewBox
				}));
			}
			return cache;
		};
		let cache = await buildCache();
		ctx.watchFile(fontPath, () => {
			buildCache().then((next) => {
				cache = next;
			}, (error) => {
				console.warn(`[fontIconProvider] failed to re-extract "${fontPath}" after change; keeping previous icons`, error);
			});
		});
		return { getIcon(slot) {
			return cache.get(slot) ?? null;
		} };
	};
}
function extractGlyph(font, req) {
	const { slot, codepoint, fontPath, viewBox } = req;
	const codepointHex = `U+${codepoint.toString(16).toUpperCase().padStart(4, "0")}`;
	if (!Number.isInteger(codepoint) || codepoint < 0 || codepoint > 1114111) throw new Error(`fontIconProvider: slot "${slot}" maps to invalid codepoint ${String(codepoint)} (${codepointHex}) in "${fontPath}"`);
	const char = String.fromCodePoint(codepoint);
	if (font.charToGlyphIndex(char) === 0) throw new Error(`fontIconProvider: font "${fontPath}" has no glyph mapped at ${codepointHex} (slot "${slot}") — check the symbols mapping`);
	const glyph = font.charToGlyph(char);
	const bbox = glyph.getBoundingBox();
	const bboxWidth = bbox.x2 - bbox.x1;
	const bboxHeight = bbox.y2 - bbox.y1;
	if (!(bboxWidth > 0) || !(bboxHeight > 0)) throw new Error(`fontIconProvider: glyph at ${codepointHex} (slot "${slot}") in "${fontPath}" has an empty outline`);
	const { pathData } = normalizeGlyph(glyph, font.unitsPerEm, bbox, viewBox);
	const { width, height } = viewBox;
	return {
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path d="${pathData}" fill="currentColor"/></svg>`,
		viewBox: {
			width,
			height
		},
		nature: "fill",
		source: {
			kind: "font-glyph",
			path: fontPath,
			codepoint
		}
	};
}
/**
* Map the glyph's bounding box — uniformly scaled, centered — onto the
* target viewBox (contain-fit, aspect ratio preserved).
*
* opentype.js `getPath(x, y, fontSize)` maps font units (u, v) to
* `X = x + u·s, Y = y − v·s` with `s = fontSize / unitsPerEm` (it also
* flips the y-axis: font y-up → SVG y-down). Solving x, y, fontSize for
* a centered bbox fit gives the closed form below — one getPath call,
* no manual command rewriting.
*/
function normalizeGlyph(glyph, unitsPerEm, bbox, viewBox) {
	const bboxWidth = bbox.x2 - bbox.x1;
	const bboxHeight = bbox.y2 - bbox.y1;
	const scale = Math.min(viewBox.width / bboxWidth, viewBox.height / bboxHeight);
	const fontSize = unitsPerEm * scale;
	const x = (viewBox.width - bboxWidth * scale) / 2 - bbox.x1 * scale;
	const y = (viewBox.height - bboxHeight * scale) / 2 + bbox.y2 * scale;
	return { pathData: glyph.getPath(x, y, fontSize).toPathData(PATH_DECIMALS) };
}
async function loadOpentype() {
	try {
		return await import("./opentype-e6matCgy.js").then((m) => /* @__PURE__ */ __toESM(m.default, 1));
	} catch (error) {
		throw new Error("fontIconProvider requires opentype.js to parse fonts. Install it in the consuming project (e.g. `npm i -D opentype.js`) or convert the font to pre-extracted SVG icons.", { cause: error });
	}
}
/**
* opentype.parse builds a DataView over its argument, so a Uint8Array
* view throws ("First argument to DataView constructor must be an
* ArrayBuffer"). `slice()` always yields a fresh, exact-fit buffer,
* which also defends against subarray views into larger buffers.
*/
function toArrayBuffer(data) {
	return data.slice().buffer;
}
//#endregion
//#region src/providers/mixin.ts
/**
* Compose provider factories: `mixinIconProvider(base, { chevron: customChevrons })`
* answers every slot from `base` except where an override provides one.
*/
function mixinIconProvider(base, overrides) {
	return async (ctx) => {
		const baseProvider = await base(ctx);
		const overrideProviders = /* @__PURE__ */ new Map();
		for (const slot of SLOT_NAMES) {
			const factory = overrides[slot];
			if (factory !== void 0) overrideProviders.set(slot, await factory(ctx));
		}
		return { getIcon(slot) {
			const override = overrideProviders.get(slot);
			if (override !== void 0) {
				const asset = override.getIcon(slot);
				if (asset !== null) return asset;
			}
			return baseProvider.getIcon(slot);
		} };
	};
}
//#endregion
//#region src/serializer.ts
/** prefix for all serializer diagnostics */
const LOG_PREFIX = "[jx-ui]";
/** derive a human-readable label from the asset's source metadata */
function describeSource(source) {
	switch (source.kind) {
		case "file": return source.path !== void 0 ? `file ${source.path}` : "file";
		case "font-glyph": return source.codepoint !== void 0 ? `font-glyph U+${source.codepoint.toString(16).toUpperCase().padStart(4, "0")}` : "font-glyph";
		case "inline": return "inline";
	}
}
function formatIssueMessages(messages) {
	return messages.map((message) => `  - ${message}`).join("\n");
}
/**
* Serialize a structured SVG asset into its consumable form.
*
* @param asset   the SvgAsset to serialize
* @param mode    'css-var' (default) → CSS custom property value;
*                'dom-string' → raw SVG string for {@html} injection
* @param checker optional safety checker; when omitted the asset is
*                serialized UNCHECKED (trusted local build-pipeline
*                files — design.md §5)
* @returns the serialized string, or null when a warn-mode check
*          rejected the asset (the caller falls back)
* @throws when an error-mode check fails (opt-in, HTTP-sourced icons)
*/
function serializeIcon(asset, mode = "css-var", checker) {
	if (checker !== void 0) {
		const source = describeSource(asset.source);
		const result = checker.check(asset.svg, source);
		if (!result.passed) {
			const detail = formatIssueMessages(result.issues.map((issue) => issue.message));
			if (result.issues.some((issue) => issue.severity === "error")) throw new Error(`${LOG_PREFIX} SVG safety check failed (${source}):\n${detail}`);
			console.warn(`${LOG_PREFIX} SVG safety check rejected the icon (${source}); serving the inline fallback:\n${detail}`);
			return null;
		}
	}
	if (mode === "dom-string") return asset.svg;
	return `url("data:image/svg+xml,${encodeURIComponent(asset.svg)}")`;
}
/**
* Walk every registered slot and serialize whatever the lookup supplies.
* SLOT_NAMES (derived from SLOT_REGISTRY in types.ts) is consumed here —
* the slot registry is defined exactly once, in types.ts.
*
* Slots the provider does not serve — or whose asset fails a warn-mode
* check — are omitted from the result, so the standard layer's inline
* fallbacks serve for them.
*
* @param getIcon  a slot → SvgAsset lookup (an IconProvider's getIcon)
* @param mode     passed through to serializeIcon
* @param checker  passed through to serializeIcon
* @throws when an error-mode check fails (propagates — the build fails)
*/
function serializeAllSlots(getIcon, mode = "css-var", checker) {
	const serialized = {};
	for (const slot of SLOT_NAMES) {
		const asset = getIcon(slot);
		if (asset === null) continue;
		const value = serializeIcon(asset, mode, checker);
		if (value === null) continue;
		serialized[slot] = value;
	}
	return serialized;
}
//#endregion
//#region src/safety.ts
/** default max SVG byte size — 10KB per icon (design.md §5) */
const DEFAULT_MAX_BYTES = 10240;
/** default max path command count (design.md §5) */
const DEFAULT_MAX_PATH_COMMANDS = 500;
/** default disallowed elements (design.md §5: script, foreignObject, use) */
const DEFAULT_DISALLOWED_ELEMENTS = [
	"script",
	"foreignObject",
	"use"
];
/**
* matches the `d="…"` / `d='…'` attribute of any `<path>` element.
* `[^>]?` keeps the scan inside a single tag (d cannot contain `>`).
*/
const PATH_D_ATTRIBUTE = /<path\b[^>]*?\bd\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
/**
* path command letters — M/L/C/Q/A/Z per the contract, plus H/V/S/T
* (the remaining valid path commands, upper and lower case). 'e' is
* deliberately excluded: it appears in scientific-notation numbers
* (e.g. `1e3`), never as a command.
*/
const PATH_COMMAND_LETTERS = /[mlhvcsqtaz]/gi;
function escapeRegExp(text) {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/**
* an opening-tag pattern for one element name — `\b` prevents prefix
* false positives (`<use>` must not match `<user>`); case-insensitive
* so `<SCRIPT>` and `<foreignobject>` are caught too.
*/
function openingTagPattern(elementName) {
	return new RegExp(`<\\s*${escapeRegExp(elementName)}\\b`, "i");
}
/** count path command letters across every <path> element's d attribute */
function countPathCommands(svg) {
	let count = 0;
	for (const match of svg.matchAll(PATH_D_ATTRIBUTE)) {
		const data = match[1] ?? match[2] ?? "";
		count += (data.match(PATH_COMMAND_LETTERS) ?? []).length;
	}
	return count;
}
/**
* Create the built-in SVG safety checker.
*
* @param config `mode` is required ('warn' logs + lets the serializer
*               reject; 'error' lets the serializer throw). `maxBytes`
*               (default 10240), `maxPathCommands` (default 500) and
*               `disallowedElements` (default script/foreignObject/use)
*               override the built-in limits.
*/
function createSafetyChecker(config) {
	const mode = config.mode ?? "warn";
	const maxBytes = config.maxBytes ?? DEFAULT_MAX_BYTES;
	const maxPathCommands = config.maxPathCommands ?? DEFAULT_MAX_PATH_COMMANDS;
	const elementPatterns = (config.disallowedElements ?? DEFAULT_DISALLOWED_ELEMENTS).map((name) => ({
		name,
		pattern: openingTagPattern(name)
	}));
	const encoder = new TextEncoder();
	return { check(svg, source) {
		const severity = mode === "error" ? "error" : "warning";
		const issues = [];
		const byteLength = encoder.encode(svg).length;
		if (byteLength > maxBytes) issues.push({
			severity,
			message: `SVG byte size ${byteLength} exceeds the limit of ${maxBytes} bytes`,
			source
		});
		const commandCount = countPathCommands(svg);
		if (commandCount > maxPathCommands) issues.push({
			severity,
			message: `SVG path command count ${commandCount} exceeds the limit of ${maxPathCommands}`,
			source
		});
		for (const { name, pattern } of elementPatterns) if (pattern.test(svg)) issues.push({
			severity,
			message: `disallowed element <${name}> found in SVG`,
			source
		});
		return {
			issues,
			passed: issues.length === 0
		};
	} };
}
/**
* resolved virtual ids. the `\0` prefix is the rollup/vite convention for
* "our virtual module" — it keeps other plugins/resolvers from touching it.
*/
const RESOLVED_PREFIX = `\0virtual:@jixoai/ui-plugin/icons`;
const RESOLVED_CSS_ID = RESOLVED_PREFIX;
const RESOLVED_JS_ID = `${RESOLVED_PREFIX}?dom`;
/**
* classify a (raw or resolved) module id as one of our virtual modules.
* tolerant of the `\0` prefix and of vite's cache-busting query params
* (`?t=…` appended by moduleGraph invalidation).
*/
function classifyVirtualId(id) {
	const bare = id.startsWith("\0") ? id.slice(1) : id;
	if (bare === "virtual:@jixoai/ui-plugin/icons") return "css";
	if (bare === `virtual:@jixoai/ui-plugin/icons?dom` || bare.startsWith(`virtual:@jixoai/ui-plugin/icons?dom&`)) return "js";
	if (bare.startsWith(`virtual:@jixoai/ui-plugin/icons?`)) return "css";
	return null;
}
/** WOFF2 magic bytes: 0x77 0x4F 0x46 0x32 ("wOF2") */
function isWoff2(data) {
	return data.length >= 4 && data[0] === 119 && data[1] === 79 && data[2] === 70 && data[3] === 50;
}
/** WOFF 1.0 magic bytes: 0x77 0x4F 0x46 0x46 ("wOFF") — not supported */
function isWoff1(data) {
	return data.length >= 4 && data[0] === 119 && data[1] === 79 && data[2] === 70 && data[3] === 70;
}
/**
* does the (latin1-decoded) head of a file look like an SVG document?
* skips a BOM, comments, an xml declaration and a doctype, then requires
* `<svg` + whitespace or `>`.
*/
function looksLikeSvg(head) {
	let rest = head.replace(/^\uFEFF/, "").trimStart();
	for (;;) {
		if (rest.startsWith("<?xml")) {
			const end = rest.indexOf("?>");
			if (end < 0) return false;
			rest = rest.slice(end + 2).trimStart();
			continue;
		}
		if (rest.startsWith("<!--")) {
			const end = rest.indexOf("-->");
			if (end < 0) return false;
			rest = rest.slice(end + 3).trimStart();
			continue;
		}
		if (/^<!DOCTYPE/i.test(rest)) {
			const end = rest.indexOf(">");
			if (end < 0) return false;
			rest = rest.slice(end + 1).trimStart();
			continue;
		}
		break;
	}
	return /^<svg[\s>]/i.test(rest);
}
/**
* normalize a loaded source to its post-normalization mime type.
* magic bytes take priority; the file extension is the fallback.
*/
function detectMimeType(data, path) {
	if (data.length >= 4) {
		if (data[0] === 0 && data[1] === 1 && data[2] === 0 && data[3] === 0 || data[0] === 79 && data[1] === 84 && data[2] === 84 && data[3] === 79) return "font/ttf";
		if (isWoff1(data)) throw new Error(`jxUI: WOFF 1.0 is not supported (${path}) — convert to TTF or WOFF2`);
	}
	if (looksLikeSvg(Buffer.from(data.buffer, data.byteOffset, Math.min(data.byteLength, 1024)).toString("latin1"))) return "image/svg+xml";
	const ext = extname(path).toLowerCase();
	if (ext === ".svg") return "image/svg+xml";
	if (ext === ".ttf" || ext === ".otf") return "font/ttf";
	if (ext === ".woff2") throw new Error(`jxUI: not a valid WOFF2 file (${path})`);
	throw new Error(`jxUI: unrecognized icon source format (${path})`);
}
/**
* non-literal specifier on purpose: `wawoff2` is an OPTIONAL runtime
* dependency and must stay external (never analyzed/bundled). if the
* package is absent the dynamic import rejects and we surface the
* contract error below.
*/
const WAWOFF2_MODULE_ID = "wawoff2";
async function decompressWoff2(data) {
	let wawoff2;
	try {
		wawoff2 = await import(WAWOFF2_MODULE_ID);
	} catch {
		throw new Error("jxUI: WOFF2 source encountered but the optional dependency \"wawoff2\" is not installed (install wawoff2 or convert the font to TTF)");
	}
	const decompressed = await wawoff2.decompress(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
	return new Uint8Array(decompressed);
}
/** does this slot have a consumer that injects the SVG into the DOM? */
function usesDomInjection(slot) {
	return SLOT_REGISTRY[slot].consumers.some((capability) => capability.technique === "inline-svg");
}
function errorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}
/** serialize every provided slot into the virtual CSS + JS module contents */
const defaultChecker = createSafetyChecker({ mode: "warn" });
function generateModules(provider) {
	const declarations = [];
	const domEntries = [];
	for (const slot of SLOT_NAMES) {
		const asset = provider.getIcon(slot);
		if (asset === null) continue;
		const value = serializeIcon(asset, "css-var", defaultChecker);
		if (value === null) continue;
		declarations.push(`    --jx-icon-${slot}: ${value};`);
		if (usesDomInjection(slot)) {
			const domString = serializeIcon(asset, "dom-string", defaultChecker);
			if (domString !== null) domEntries.push(`  ${slot}: ${JSON.stringify(domString)},`);
		}
	}
	return {
		css: declarations.length > 0 ? `@layer theme {\n  :root {\n${declarations.join("\n")}\n  }\n}\n` : `/* jx-ui: no icons resolved — standard layer inline fallbacks serve */\n`,
		js: `export const domIcons = {\n${domEntries.join("\n")}${domEntries.length > 0 ? "\n" : ""}};\nexport default domIcons;\n`
	};
}
/**
* create the @jixoai/ui-plugin vite plugin.
*
* ```ts
* // vite.config.ts
* import { jxUI, lucideIconProvider } from '@jixoai/ui-plugin';
* export default { plugins: [sveltekit(), tailwindcss(), jxUI({ icons: lucideIconProvider() })] };
* ```
*/
function jxUI(options) {
	let provider = null;
	let cssCode = "";
	let jsCode = "";
	let server = null;
	let buildPromise = null;
	let refreshChain = Promise.resolve();
	/** watched files (absolute) → provider-registered change callbacks */
	const watches = /* @__PURE__ */ new Map();
	const logError = (message) => {
		const logger = server?.config.logger;
		if (logger) logger.error(`[jx-ui] ${message}\n`, { timestamp: true });
		else console.error(`[jx-ui] ${message}`);
	};
	const loadSource = async (path) => {
		const resolved = resolve(path);
		const bytes = new Uint8Array(await readFile(resolved));
		if (isWoff2(bytes)) return {
			data: await decompressWoff2(bytes),
			path: resolved,
			mimeType: "font/ttf"
		};
		return {
			data: bytes,
			path: resolved,
			mimeType: detectMimeType(bytes, resolved)
		};
	};
	const watchFile = (path, onChange) => {
		const resolved = resolve(path);
		const callbacks = watches.get(resolved) ?? /* @__PURE__ */ new Set();
		callbacks.add(onChange);
		watches.set(resolved, callbacks);
		server?.watcher.add(resolved);
	};
	const createContext = () => ({
		loadSource,
		watchFile
	});
	const start = async () => {
		provider = await options.icons(createContext());
		const generated = generateModules(provider);
		cssCode = generated.css;
		jsCode = generated.js;
	};
	const ensureBuilt = () => {
		buildPromise ??= start();
		return buildPromise;
	};
	const invalidateVirtualModules = () => {
		if (!server) return;
		for (const id of [RESOLVED_CSS_ID, RESOLVED_JS_ID]) {
			const moduleNode = server.moduleGraph.getModuleById(id);
			if (moduleNode) server.moduleGraph.invalidateModule(moduleNode);
		}
		server.ws.send({ type: "full-reload" });
	};
	/**
	* re-run the factory (fresh loadSource bytes), regenerate the virtual
	* modules and invalidate them. failures keep the previous icons and
	* log — a transient bad edit must not nuke a working dev session.
	*/
	const refresh = async () => {
		try {
			await start();
			invalidateVirtualModules();
		} catch (error) {
			logError(`icon refresh failed — keeping previous icons: ${errorMessage(error)}`);
		}
	};
	const scheduleRefresh = () => {
		refreshChain = refreshChain.then(refresh);
	};
	const onWatchEvent = (file) => {
		const callbacks = watches.get(file);
		if (!callbacks) return;
		for (const onChange of callbacks) onChange();
		scheduleRefresh();
	};
	return {
		name: "jx-ui",
		enforce: "pre",
		/** await the provider factory; failures fail the build by design */
		async buildStart() {
			await ensureBuilt();
		},
		resolveId(id, importer) {
			const kind = classifyVirtualId(id);
			if (kind === null) return null;
			return kind === "js" ? RESOLVED_JS_ID : RESOLVED_CSS_ID;
		},
		async load(id) {
			const kind = classifyVirtualId(id);
			if (kind === null) return null;
			await ensureBuilt();
			return kind === "js" ? jsCode : cssCode;
		},
		configureServer(devServer) {
			server = devServer;
			server.watcher.on("change", onWatchEvent);
			server.watcher.on("add", onWatchEvent);
			for (const watched of watches.keys()) server.watcher.add(watched);
		}
	};
}
//#endregion
export { SLOT_NAMES, SLOT_REGISTRY, createSafetyChecker, fontIconProvider, jxUI, lucideIconProvider, mixinIconProvider, serializeAllSlots, serializeIcon, svgIconProvider };

//# sourceMappingURL=index.js.map