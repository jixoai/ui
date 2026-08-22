/**
 * Blueprint stage constants (apps/www/src/lib/blueprints/stage.ts).
 *
 * Every scene renders inside a fixed-size stage so the whole catalog
 * shares ONE canvas ratio — the satori tool (scripts/build-blueprints.mjs)
 * serializes each `[data-blueprint]` stage into a standalone SVG at
 * exactly these dimensions.
 */
export const STAGE_W = 640;
export const STAGE_H = 360;
