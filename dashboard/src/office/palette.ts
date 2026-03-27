// === Office Color Palette (Gather.town-inspired modern office) ===
export const COLORS = {
  // Floor (wood planks)
  woodLight: 0x9a7a56,
  woodBase: 0x876a48,
  woodDark: 0x755a3a,
  woodGap: 0x4e3a28,

  // Walls (clean cream)
  wallFace: 0xe4d8cc,
  wallTrim: 0xa89888,
  wallShadow: 0x887868,

  // Desk / Workstation (light maple)
  deskTop: 0xd4bf9c,
  deskEdge: 0xb8a480,
  deskShadow: 0x806844,
  monitorFrame: 0x2a2a32,
  monitorScreen: 0x1a2a3a,
  monitorScreenOn: 0x4a9aff,
  keyboard: 0x3a3a42,

  // Office chair (top-down)
  chairSeat: 0x3a3a4a,
  chairBase: 0x4a4a5a,

  // Furniture / Decor
  bookshelfWood: 0xc4a070,
  plantGreen: 0x5aaa5a,
  plantDark: 0x3a7a3a,
  plantPot: 0xd4a878,
  whiteboardBg: 0xf5f0ea,
  whiteboardFrame: 0x8a8a92,
  clockFace: 0xf0ebe0,
  clockFrame: 0x6a6a72,
  coffeeMachine: 0x4a4a52,

  // Characters
  skinLight: 0xf5c5a3,
  skinMedium: 0xd4a574,
  skinDark: 0x8b6340,
  hairBlack: 0x2a2018,
  hairBrown: 0x6a4a2a,
  hairBlonde: 0xd4a840,
  hairRed: 0xb04020,
  shirtBlue: 0x4a78b0,
  shirtGreen: 0x4a8a4a,
  shirtRed: 0xa84848,
  shirtWhite: 0xe0d8cc,
  shirtPurple: 0x7a58a0,
  pantsDark: 0x3a3a4a,
  shoeDark: 0x2a2018,

  // Character shading (auto-derived tones)
  skinLightShadow: 0xd4a883,
  skinMediumShadow: 0xb48854,
  skinDarkShadow: 0x6b4320,

  hairBlackLight: 0x3a3028,
  hairBlackDark: 0x1a1008,
  hairBrownLight: 0x8a6a4a,
  hairBrownDark: 0x4a2a0a,
  hairBlondeLight: 0xe4b850,
  hairBlondeDark: 0xb48830,
  hairRedLight: 0xc05030,
  hairRedDark: 0x903010,

  shirtBlueLight: 0x5a8ac0,
  shirtBlueDark: 0x3a6898,
  shirtGreenLight: 0x5a9a5a,
  shirtGreenDark: 0x3a7a3a,
  shirtRedLight: 0xb85858,
  shirtRedDark: 0x983838,
  shirtWhiteLight: 0xf0e8dc,
  shirtWhiteDark: 0xd0c8bc,
  shirtPurpleLight: 0x8a68b0,
  shirtPurpleDark: 0x6a4890,

  pantsBase: 0x3a3a4a,
  pantsShade: 0x2a2a3a, // darker shade for leg edges/inner shadow

  shoeBase: 0x2a2018,
  shoeLight: 0x3a3028,

  // Accessories
  mugBody: 0xe0e0e0,
  mugRim: 0xcccccc,
  mugHandle: 0xcccccc,
  postItYellow: 0xffee55,
  postItPink: 0xff8866,
  bookRed: 0xcc4444,
  bookBlue: 0x4466aa,
  bookGreen: 0x44aa44,
  photoFrame: 0x3a3028,
  waterBottle: 0x88bbdd,
  waterCap: 0x4488aa,

  // Name card
  nameCardBg: 0x14141c,
  nameCardText: 0xffffff,

  // Belt
  beltBuckle: 0x8a8a6a,

  // Collar
  collarWhite: 0xf0f0f0,

  // Status effects (high contrast)
  statusIdle: 0xaaaacc,
  statusWorking: 0x60b0ff,
  statusDone: 0x60f080,
  statusCheckpoint: 0xffbb22,
  bubbleBg: 0xffffff,
  bubbleBorder: 0x3a3a4a,
  particleGreen: 0x60f080,

  // Envelope
  envelopeBody: 0xf5e6c8,
  envelopeFold: 0xe0d0b0,
  envelopeSeal: 0xcc3333,

  // Isometric floor tiles
  tileWood1: 0xc8ac86,
  tileWood2: 0xbca076,
  tileWood3: 0xd8c4a0,
  tileWood4: 0xb49870,
  tileGrain: 0x8a6a44,
  tileGrid: 0x000000,

  // Isometric walls
  wallFaceIso: 0xecdcd0,
  wallLeftIso: 0xe0d0c4,
  wallRightIso: 0xd4c8bc,
  baseboard: 0x8a7a68,

  // Furniture additions
  couchFabric: 0x8a6a5a,
  couchLight: 0x9a7a6a,
  couchDark: 0x5a3a2a,
  couchPillow: 0xc8a080,
  rugCenter: 0x8a3838,
  rugMiddle: 0xaa5848,
  rugOuter: 0xcc7858,
  lampShade: 0xecd4a4,
  lampShadeDark: 0xd8bc84,
  lampShadeRight: 0xc8ac74,
  lampGlow: 0xffaa44,
  lampPole: 0x4e4e5e,
  windowGlass: 0x80b0e0,
  windowFrame: 0xd0d0d8,
  windowReflect: 0xa0d0ff,
  sideTable: 0xb89a72,

  // Chair (isometric multi-face)
  chairSeatTop: 0x4e4e5e,
  chairSeatLeft: 0x3e3e4e,
  chairSeatRight: 0x2e2e3e,
  chairBackTop: 0x5e5e6e,
  chairBackLeft: 0x4e4e5e,
  chairBackRight: 0x3e3e4e,
  chairWheelBase: 0x3a3a42,
  chairWheel: 0x2a2a32,
  chairPole: 0x3a3a42,

  // Desk (isometric multi-face)
  deskTopIso: 0xd8c4a0,
  deskLeftIso: 0xbc9e76,
  deskRightIso: 0xa48864,
  deskGrain: 0xc8b48c,
  deskDrawer: 0xbc9e76,
  deskDrawerFace: 0xa48864,
  deskDrawerHandle: 0xd8c4a0,

  // Monitor (isometric)
  monitorOuter: 0x2e2e36,
  monitorBezel: 0x1e1e26,
  monitorStand: 0x3e3e46,
  monitorStandBase: 0x4e4e5e,

  // Keyboard/Mouse
  keyboardBody: 0x3e3e46,
  keyboardKey: 0x5e5e6e,
  mousePad: 0x2a2a32,
  mouseBody: 0x4e4e5e,
  mouseTop: 0x5e5e6e,
  mouseWheel: 0x3e3e46,

  // Character additions
  charOutline: 0x18101e,
} as const;

// === Layout Constants ===
export const TILE = 32;
export const CELL_W = 4 * TILE; // 128px wide per cell (spacious)
export const CELL_H = 4 * TILE; // 128px tall per cell
export const SCENE_SCALE = 3;   // Integer scaling — crisp pixel art

// Isometric tile dimensions (2:1 dimetric)
export const ISO_TILE_W = 64;
export const ISO_TILE_H = 32;

// Grid offsets for agent desks (tiles from room edge)
export const ISO_MARGIN_TILES = 2;

export type CharacterColors = {
  hair: number;      hairLight: number;     hairDark: number;
  skin: number;      skinShadow: number;
  shirt: number;     shirtLight: number;    shirtDark: number;
  pants: number;     pantsDark: number;
  shoe: number;      shoeLight: number;
};

// Character variants (assigned round-robin to agents)
export const CHARACTER_VARIANTS: CharacterColors[] = [
  {
    hair: COLORS.hairBlack,  hairLight: COLORS.hairBlackLight,  hairDark: COLORS.hairBlackDark,
    skin: COLORS.skinLight,  skinShadow: COLORS.skinLightShadow,
    shirt: COLORS.shirtBlue, shirtLight: COLORS.shirtBlueLight, shirtDark: COLORS.shirtBlueDark,
    pants: COLORS.pantsBase, pantsDark: COLORS.pantsShade,
    shoe: COLORS.shoeBase,   shoeLight: COLORS.shoeLight,
  },
  {
    hair: COLORS.hairBrown,  hairLight: COLORS.hairBrownLight,  hairDark: COLORS.hairBrownDark,
    skin: COLORS.skinMedium, skinShadow: COLORS.skinMediumShadow,
    shirt: COLORS.shirtGreen, shirtLight: COLORS.shirtGreenLight, shirtDark: COLORS.shirtGreenDark,
    pants: COLORS.pantsBase, pantsDark: COLORS.pantsShade,
    shoe: COLORS.shoeBase,   shoeLight: COLORS.shoeLight,
  },
  {
    hair: COLORS.hairBlonde, hairLight: COLORS.hairBlondeLight,  hairDark: COLORS.hairBlondeDark,
    skin: COLORS.skinLight,  skinShadow: COLORS.skinLightShadow,
    shirt: COLORS.shirtRed,  shirtLight: COLORS.shirtRedLight,  shirtDark: COLORS.shirtRedDark,
    pants: COLORS.pantsBase, pantsDark: COLORS.pantsShade,
    shoe: COLORS.shoeBase,   shoeLight: COLORS.shoeLight,
  },
  {
    hair: COLORS.hairRed,    hairLight: COLORS.hairRedLight,    hairDark: COLORS.hairRedDark,
    skin: COLORS.skinDark,   skinShadow: COLORS.skinDarkShadow,
    shirt: COLORS.shirtWhite, shirtLight: COLORS.shirtWhiteLight, shirtDark: COLORS.shirtWhiteDark,
    pants: COLORS.pantsBase, pantsDark: COLORS.pantsShade,
    shoe: COLORS.shoeBase,   shoeLight: COLORS.shoeLight,
  },
  {
    hair: COLORS.hairBlack,  hairLight: COLORS.hairBlackLight,  hairDark: COLORS.hairBlackDark,
    skin: COLORS.skinMedium, skinShadow: COLORS.skinMediumShadow,
    shirt: COLORS.shirtPurple, shirtLight: COLORS.shirtPurpleLight, shirtDark: COLORS.shirtPurpleDark,
    pants: COLORS.pantsBase, pantsDark: COLORS.pantsShade,
    shoe: COLORS.shoeBase,   shoeLight: COLORS.shoeLight,
  },
  {
    hair: COLORS.hairBrown,  hairLight: COLORS.hairBrownLight,  hairDark: COLORS.hairBrownDark,
    skin: COLORS.skinLight,  skinShadow: COLORS.skinLightShadow,
    shirt: COLORS.shirtGreen, shirtLight: COLORS.shirtGreenLight, shirtDark: COLORS.shirtGreenDark,
    pants: COLORS.pantsBase, pantsDark: COLORS.pantsShade,
    shoe: COLORS.shoeBase,   shoeLight: COLORS.shoeLight,
  },
];
