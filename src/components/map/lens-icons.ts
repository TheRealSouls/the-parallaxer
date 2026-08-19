import { faBrain, faChartLine, faLandmark } from "@fortawesome/free-solid-svg-icons";

/**
 * One Font Awesome glyph per lens, drawn on the map beside each circle's name.
 *
 * The path data is pulled from the icon package at build time and inlined into
 * the server-rendered SVG rather than fetched by the Font Awesome kit script.
 * The map is the first thing on the page, and an icon that arrives a second
 * later, after a script has parsed and injected it, would flash.
 */
export const LENS_ICON: Record<"philosophy" | "politics" | "economics", string> = {
  philosophy: faBrain.icon[4] as string,
  politics: faLandmark.icon[4] as string,
  economics: faChartLine.icon[4] as string,
};
