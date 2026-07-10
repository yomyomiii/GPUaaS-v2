// D_GPUaaS-v2 Design Tokens
// Single source of truth for all design constants.
// ConsoleLayout.tsx re-exports these for backward compat.

// ─── Brand Colors ─────────────────────────────────────────────────────────────
export const PRIMARY      = "#635ADC";
export const PRIMARY_10   = "rgb(243,242,255)";   // tints/alpha for bg
export const PRIMARY_20   = "rgb(230,228,255)";
export const PRIMARY_80   = "rgb(62,57,160)";     // hover/pressed

// ─── Neutral Gray Scale ───────────────────────────────────────────────────────
export const WHITE        = "#ffffff";
export const GRAY_5       = "rgb(249,249,249)";   // page bg
export const GRAY_10      = "rgb(242,242,242)";   // divider, card border
export const GRAY_30      = "rgb(221,221,221)";   // border secondary
export const GRAY_40      = "rgb(204,204,204)";   // disabled, placeholder
export const GRAY_60      = "rgb(119,119,119)";   // label, icon secondary
export const GRAY_70      = "rgb(80,80,80)";      // body text, LNB sub
export const GRAY_90      = "rgb(42,42,42)";      // heading, primary text
export const BLACK        = "rgb(0,0,0)";

// ─── Semantic Colors ──────────────────────────────────────────────────────────
export const RED          = "rgb(239,68,68)";     // danger / error
export const RED_10       = "rgb(254,242,242)";   // danger bg
export const GREEN        = "rgb(34,197,94)";     // success / running
export const GREEN_10     = "rgb(240,253,244)";   // success bg
export const BLUE         = "rgb(36,142,213)";    // info / creating
export const BLUE_10      = "rgb(211,232,247)";   // info bg
export const YELLOW       = "rgb(255,177,68)";    // warning
export const YELLOW_10    = "rgb(255,251,235)";   // warning bg

// ─── Typography ───────────────────────────────────────────────────────────────
export const FONT_SANS    = "'Pretendard Variable', Pretendard, -apple-system, sans-serif";
export const FONT_MONO    = "'Roboto Mono', monospace";

export const TEXT_XS      = 11;   // notification dot, label chip
export const TEXT_SM      = 12;   // caption, badge, timestamp
export const TEXT_BASE    = 13;   // body, table cell, nav item
export const TEXT_MD      = 14;   // tab label, form input, sub-heading
export const TEXT_LG      = 15;   // logo, workspace switcher
export const TEXT_XL      = 24;   // page title
export const TEXT_2XL     = 28;   // metric card value

export const FONT_NORMAL  = 400;
export const FONT_MEDIUM  = 500;
export const FONT_SEMI    = 600;
export const FONT_BOLD    = 700;
export const FONT_BLACK   = 800;

// ─── Spacing (8px grid) ───────────────────────────────────────────────────────
export const SPACE_1  = 4;
export const SPACE_2  = 8;
export const SPACE_3  = 12;
export const SPACE_4  = 16;
export const SPACE_5  = 20;
export const SPACE_6  = 24;
export const SPACE_7  = 28;
export const SPACE_8  = 32;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const RADIUS_XS   = 4;    // language button, small chip
export const RADIUS_SM   = 6;    // GNB buttons, nav active
export const RADIUS_MD   = 8;    // nav items, buttons xsmall
export const RADIUS_LG   = 10;   // dropdowns, modals, btn small
export const RADIUS_XL   = 12;   // buttons medium, modal
export const RADIUS_CARD = 14;   // cards
export const RADIUS_FULL = 9999; // badges, pills, avatar

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const SHADOW_CARD       = "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)";
export const SHADOW_CARD_HOVER = "0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)";
export const SHADOW_DROPDOWN   = "0 4px 16px rgba(0,0,0,0.14)";
export const SHADOW_MODAL      = "0 8px 32px rgba(0,0,0,0.18)";

// ─── Animation ────────────────────────────────────────────────────────────────
export const TRANSITION_FAST   = "0.1s ease";
export const TRANSITION_NORMAL = "0.15s ease";
export const TRANSITION_SLOW   = "0.2s ease";

// ─── Layout ───────────────────────────────────────────────────────────────────
export const GNB_HEIGHT     = 40;
export const LNB_WIDTH      = 244;
export const PAGE_MAX_WIDTH = 1200;
export const PAGE_PADDING   = SPACE_7;  // 28px

// ─── Component Size Maps (for PrimaryBtn) ─────────────────────────────────────
export const BTN_SIZES = {
  medium: { height: 44, padding: "0 20px", fontSize: TEXT_MD,   radius: RADIUS_XL, fontWeight: FONT_SEMI },
  small:  { height: 36, padding: "0 16px", fontSize: TEXT_BASE, radius: RADIUS_LG, fontWeight: FONT_SEMI },
  xsmall: { height: 28, padding: "0 12px", fontSize: TEXT_SM,   radius: RADIUS_MD, fontWeight: FONT_MEDIUM },
} as const;

// ─── Z-Index ─────────────────────────────────────────────────────────────────
export const Z_GNB     = 100;
export const Z_SIDEBAR = 50;
export const Z_DROPDOWN = 200;
export const Z_MODAL   = 300;
export const Z_TOAST   = 400;
