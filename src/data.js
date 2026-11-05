export const WIDTH = 900;
export const HEIGHT = 1150;

export const SKIN_TONES = [
  { name: 'Porcelana', color: '#f8d9c4' },
  { name: 'Melocotón', color: '#f0c6a8' },
  { name: 'Arena', color: '#e5b08a' },
  { name: 'Canela', color: '#d69a70' },
  { name: 'Caramelo', color: '#c5835c' },
  { name: 'Cacao', color: '#a86644' },
  { name: 'Caoba', color: '#8a4f33' },
  { name: 'Ébano', color: '#6b3a25' },
];

export const HAIR_COLORS = [
  { name: 'Negro azabache', color: '#241a1b' },
  { name: 'Castaño oscuro', color: '#4a2b22' },
  { name: 'Castaño', color: '#6b3a24' },
  { name: 'Caramelo', color: '#a5602c' },
  { name: 'Miel', color: '#c98a4b' },
  { name: 'Rubio', color: '#e0b36b' },
  { name: 'Borgoña', color: '#8e3b4a' },
  { name: 'Rosa', color: '#b46a8c' },
];

export const EYE_COLORS = [
  { name: 'Marrón', color: '#5b3a26' },
  { name: 'Negro', color: '#2b1b18' },
  { name: 'Oliva', color: '#6b8a5a' },
  { name: 'Azul', color: '#4d7f8f' },
  { name: 'Gris', color: '#7a8f9f' },
  { name: 'Ámbar', color: '#8b6a3e' },
];

export const HAIR_STYLES = [
  { id: 'waves', name: 'Ondas', hint: 'Melena larga y suave' },
  { id: 'bob', name: 'Bob', hint: 'Corte corto con movimiento' },
  { id: 'bun', name: 'Moño', hint: 'Recogido elegante' },
];

export const BACKDROPS = [
  { id: 'rose', name: 'Rosa', colors: ['#f3b3c6', '#a53b63', '#2a1020'] },
  { id: 'midnight', name: 'Noche', colors: ['#c6a8e8', '#5b3a86', '#171024'] },
  { id: 'peach', name: 'Melocotón', colors: ['#ffd0ad', '#d97a62', '#351a19'] },
  { id: 'mint', name: 'Menta', colors: ['#b7e8d6', '#4d9c8c', '#10251f'] },
];

export const PALETTES = {
  lipstick: [
    { name: 'Nude', color: '#c9837c' },
    { name: 'Rosa', color: '#d75d72' },
    { name: 'Fresa', color: '#d94862' },
    { name: 'Coral', color: '#e76f51' },
    { name: 'Rojo', color: '#c8102e' },
    { name: 'Vino', color: '#8e1f3a' },
    { name: 'Malva', color: '#a65c74' },
    { name: 'Berry', color: '#772b52' },
    { name: 'Fucsia', color: '#d4338f' },
    { name: 'Terracota', color: '#b85c45' },
    { name: 'Durazno', color: '#e89a86' },
    { name: 'Chocolate', color: '#8a5a4e' },
  ],
  gloss: [
    { name: 'Cristal', color: '#fff4ef' },
    { name: 'Rosa', color: '#ffd9e6' },
    { name: 'Miel', color: '#ffe8c9' },
    { name: 'Menta', color: '#dcfff4' },
  ],
  eyeshadow: [
    { name: 'Champán', color: '#e6c9a8' },
    { name: 'Rosa', color: '#e8a6b4' },
    { name: 'Durazno', color: '#efb48f' },
    { name: 'Cobre', color: '#b96b3f' },
    { name: 'Dorado', color: '#d4a62a' },
    { name: 'Oliva', color: '#8a8b4a' },
    { name: 'Esmeralda', color: '#2f8f6b' },
    { name: 'Turquesa', color: '#2ba9b0' },
    { name: 'Azul', color: '#3e6fbf' },
    { name: 'Lavanda', color: '#a58bd8' },
    { name: 'Violeta', color: '#7d4bb3' },
    { name: 'Neutro', color: '#c69a82' },
  ],
  eyeliner: [
    { name: 'Negro', color: '#171317' },
    { name: 'Marrón', color: '#3a2a28' },
    { name: 'Cobre', color: '#5b3a2e' },
    { name: 'Marino', color: '#1e2a3d' },
    { name: 'Ciruela', color: '#3b1f3a' },
    { name: 'Verde', color: '#0f4a3c' },
  ],
  mascara: [
    { name: 'Negro', color: '#171317' },
    { name: 'Marrón', color: '#3a2a28' },
    { name: 'Marino', color: '#1e2a3d' },
    { name: 'Ciruela', color: '#3b1f3a' },
  ],
  blush: [
    { name: 'Rosa', color: '#f08a9a' },
    { name: 'Melocotón', color: '#f2a68c' },
    { name: 'Coral', color: '#e8826d' },
    { name: 'Frambuesa', color: '#d96b8a' },
    { name: 'Vino', color: '#c95d75' },
    { name: 'Arena', color: '#f4b6a6' },
    { name: 'Malva', color: '#b85c7a' },
    { name: 'Pétalo', color: '#e9a2b3' },
  ],
  highlighter: [
    { name: 'Perla', color: '#fff0da' },
    { name: 'Champán', color: '#ffe6c4' },
    { name: 'Rosa', color: '#f7d9e3' },
    { name: 'Lila', color: '#e8d1ff' },
    { name: 'Hielo', color: '#d9f0ff' },
    { name: 'Oro', color: '#ffd9a8' },
  ],
  contour: [
    { name: 'Arena', color: '#d3a07e' },
    { name: 'Canela', color: '#b98263' },
    { name: 'Caramelo', color: '#a87355' },
    { name: 'Cacao', color: '#8f5c42' },
    { name: 'Caoba', color: '#7a4a34' },
  ],
  foundation: [
    { name: 'Porcelana', color: '#f8d9c4' },
    { name: 'Melocotón', color: '#f0c6a8' },
    { name: 'Arena', color: '#e5b08a' },
    { name: 'Canela', color: '#d69a70' },
    { name: 'Caramelo', color: '#c5835c' },
    { name: 'Cacao', color: '#a86644' },
    { name: 'Caoba', color: '#8a4f33' },
    { name: 'Ébano', color: '#6b3a25' },
  ],
  freckles: [
    { name: 'Miel', color: '#a56a45' },
    { name: 'Canela', color: '#8a5a3b' },
    { name: 'Cacao', color: '#6f462d' },
    { name: 'Cobre', color: '#b46b48' },
  ],
  eraser: [{ name: 'Borrador', color: '#ffffff' }],
};

export const TOOL_CATEGORIES = [
  { id: 'lips', name: 'Labios', tools: ['lipstick', 'gloss'] },
  { id: 'eyes', name: 'Ojos', tools: ['eyeshadow', 'eyeliner', 'mascara'] },
  { id: 'face', name: 'Rostro', tools: ['blush', 'highlighter', 'contour', 'foundation'] },
  { id: 'extra', name: 'Detalles', tools: ['freckles', 'eraser'] },
];

export const TOOLS = {
  lipstick: {
    name: 'Labial', category: 'lips', layer: 'lipstick', clip: 'lips',
    brush: 24, alpha: 0.34, softness: 0.58, palette: 'lipstick', unit: 'px',
    hint: 'Desliza el labial sobre los labios. Repite para intensificar el color.',
  },
  gloss: {
    name: 'Brillo', category: 'lips', layer: 'lipstick', clip: 'lips',
    brush: 15, alpha: 0.11, softness: 0.95, palette: 'gloss', unit: 'px',
    hint: 'Añade un acabado jugoso y luminoso sobre el labial.',
  },
  eyeshadow: {
    name: 'Sombra', category: 'eyes', layer: 'eyeshadow', clip: 'shadow',
    brush: 36, alpha: 0.2, softness: 1, palette: 'eyeshadow', unit: 'px',
    hint: 'Difumina la sombra sobre los párpados. Mezcla tonos para crear profundidad.',
  },
  eyeliner: {
    name: 'Delineador', category: 'eyes', layer: 'eyeMakeup', clip: 'eye',
    brush: 6, alpha: 0.62, softness: 0.32, palette: 'eyeliner', unit: 'px',
    hint: 'Traza el delineado junto a las pestañas. Arrastra hacia fuera para un ojo de gato.',
  },
  mascara: {
    name: 'Pestañas', category: 'eyes', layer: 'eyeMakeup', clip: 'eye',
    brush: 9, alpha: 0.42, softness: 0.72, palette: 'mascara', unit: 'px',
    hint: 'Peina las pestañas hacia arriba con pasadas cortas en el borde del ojo.',
  },
  blush: {
    name: 'Rubor', category: 'face', layer: 'blush', clip: 'cheeks',
    brush: 68, alpha: 0.15, softness: 1, palette: 'blush', unit: 'px',
    hint: 'Sonroja las mejillas con movimientos circulares y suaves.',
  },
  highlighter: {
    name: 'Iluminador', category: 'face', layer: 'highlight', clip: 'highlight',
    brush: 34, alpha: 0.16, softness: 1, palette: 'highlighter', unit: 'px',
    hint: 'Ilumina pómulos, puente de la nariz, arco de cupido y barbilla.',
  },
  contour: {
    name: 'Contorno', category: 'face', layer: 'underMakeup', clip: 'face',
    brush: 52, alpha: 0.12, softness: 1, palette: 'contour', unit: 'px',
    hint: 'Sombrea sienes, mandíbula y laterales de la nariz para esculpir el rostro.',
  },
  foundation: {
    name: 'Base', category: 'face', layer: 'underMakeup', clip: 'face',
    brush: 84, alpha: 0.1, softness: 1, palette: 'foundation', unit: 'px',
    hint: 'Difumina una capa ligera para unificar el tono de la piel.',
  },
  freckles: {
    name: 'Pecas', category: 'extra', layer: 'underMakeup', clip: 'face',
    brush: 42, alpha: 0.54, softness: 0.1, palette: 'freckles', unit: 'px', stamp: true,
    hint: 'Dibuja un puente de pecas sobre nariz y mejillas.',
  },
  eraser: {
    name: 'Borrador', category: 'extra', layer: null, clip: null,
    brush: 30, alpha: 1, softness: 0.15, palette: 'eraser', unit: 'px',
    hint: 'Borra maquillaje de cualquier zona. La piel y las facciones no se tocan.',
  },
};

export const CHALLENGES = [
  {
    id: 'rose-day',
    title: 'Rosa de día',
    client: 'Luna',
    initials: 'LU',
    tagline: 'Cita de primavera',
    quote: 'Quiero algo dulce y romántico para un picnic. ¡Que se note el rubor pero sin exagerar!',
    model: { skin: '#e5b08a', hair: '#4a2b22', eye: '#5b3a26', style: 'waves', backdrop: 'rose' },
    accent: '#ff89a8',
    reqs: [
      { tool: 'lipstick', color: '#d94862', label: 'Labios fresa', minCoverage: 0.32 },
      { tool: 'eyeshadow', color: '#e8a6b4', label: 'Párpados rosados', minCoverage: 0.2 },
      { tool: 'blush', color: '#f08a9a', label: 'Rubor suave', minCoverage: 0.12 },
    ],
  },
  {
    id: 'golden-night',
    title: 'Noche dorada',
    client: 'Valeria',
    initials: 'VA',
    tagline: 'Alfombra roja',
    quote: 'Tengo una gala esta noche. Quiero ojos de oro, labios vino y una piel que brille bajo las luces.',
    model: { skin: '#c5835c', hair: '#241a1b', eye: '#241a1b', style: 'bun', backdrop: 'midnight' },
    accent: '#f0c36a',
    reqs: [
      { tool: 'eyeshadow', color: '#d4a62a', label: 'Ojos dorados', minCoverage: 0.22 },
      { tool: 'lipstick', color: '#8e1f3a', label: 'Labios vino', minCoverage: 0.32 },
      { tool: 'highlighter', color: '#ffe6c4', label: 'Piel luminosa', minCoverage: 0.08 },
      { tool: 'eyeliner', color: '#171317', label: 'Delineado negro', minCoverage: 0.04 },
    ],
  },
  {
    id: 'soft-picnic',
    title: 'Natural & fresco',
    client: 'Maya',
    initials: 'MA',
    tagline: 'Pícnic al aire libre',
    quote: 'Busco un look limpio y luminoso, como recién salida de una siesta al sol. Nada recargado.',
    model: { skin: '#f0c6a8', hair: '#a5602c', eye: '#6b8a5a', style: 'waves', backdrop: 'peach' },
    accent: '#f3b47f',
    reqs: [
      { tool: 'lipstick', color: '#d97783', label: 'Labios nude', minCoverage: 0.3 },
      { tool: 'blush', color: '#f2a68c', label: 'Rubor melocotón', minCoverage: 0.12 },
      { tool: 'highlighter', color: '#fff0da', label: 'Luz natural', minCoverage: 0.07 },
    ],
  },
  {
    id: 'violet-mystery',
    title: 'Misterio violeta',
    client: 'Iris',
    initials: 'IR',
    tagline: 'Fiesta neón',
    quote: 'Esta noche quiero ser la protagonista. Violeta ahumado, labios oscuros y un brillo misterioso.',
    model: { skin: '#8a4f33', hair: '#241a1b', eye: '#7a8f9f', style: 'bob', backdrop: 'midnight' },
    accent: '#b68cff',
    reqs: [
      { tool: 'eyeshadow', color: '#7d4bb3', label: 'Sombra violeta', minCoverage: 0.22 },
      { tool: 'lipstick', color: '#772b52', label: 'Labios berry', minCoverage: 0.32 },
      { tool: 'eyeliner', color: '#171317', label: 'Delineado intenso', minCoverage: 0.04 },
      { tool: 'highlighter', color: '#e8d1ff', label: 'Toque lila', minCoverage: 0.07 },
    ],
  },
  {
    id: 'mermaid',
    title: 'Sirena de verano',
    client: 'Coral',
    initials: 'CO',
    tagline: 'Vacaciones en la costa',
    quote: 'Quiero que mis ojos recuerden al mar. Turquesa, coral y un brillo de agua salada.',
    model: { skin: '#d69a70', hair: '#c98a4b', eye: '#4d7f8f', style: 'waves', backdrop: 'mint' },
    accent: '#54d6c4',
    reqs: [
      { tool: 'eyeshadow', color: '#2ba9b0', label: 'Ojos turquesa', minCoverage: 0.22 },
      { tool: 'lipstick', color: '#e76f51', label: 'Labios coral', minCoverage: 0.3 },
      { tool: 'blush', color: '#e8826d', label: 'Rubor coral', minCoverage: 0.12 },
      { tool: 'highlighter', color: '#d9f0ff', label: 'Brillo de agua', minCoverage: 0.07 },
    ],
  },
  {
    id: 'classic-red',
    title: 'Clásico rojo',
    client: 'Sofía',
    initials: 'SO',
    tagline: 'Siempre elegante',
    quote: 'El look francés de toda la vida: labios rojos, ojo de gato y una piel perfecta. Sin miedo.',
    model: { skin: '#f8d9c4', hair: '#8e3b4a', eye: '#5b3a26', style: 'bob', backdrop: 'rose' },
    accent: '#ff5a72',
    reqs: [
      { tool: 'lipstick', color: '#c8102e', label: 'Labios rojos', minCoverage: 0.34 },
      { tool: 'eyeshadow', color: '#c69a82', label: 'Párpado neutro', minCoverage: 0.16 },
      { tool: 'eyeliner', color: '#171317', label: 'Ojo de gato', minCoverage: 0.05 },
      { tool: 'blush', color: '#d96b8a', label: 'Rubor clásico', minCoverage: 0.1 },
    ],
  },
];

export const DEFAULT_MODEL = {
  skin: '#e5b08a',
  hair: '#4a2b22',
  eye: '#5b3a26',
  style: 'waves',
  backdrop: 'rose',
};

export function shade(hex, amount) {
  const value = hex.replace('#', '');
  const num = parseInt(value.length === 3 ? value.split('').map((c) => c + c).join('') : value, 16);
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  const r = clamp(((num >> 16) & 255) + amount);
  const g = clamp(((num >> 8) & 255) + amount);
  const b = clamp((num & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function rgba(hex, alpha) {
  const value = hex.replace('#', '');
  const num = parseInt(value.length === 3 ? value.split('').map((c) => c + c).join('') : value, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

export function mix(hexA, hexB, ratio) {
  const a = hexA.replace('#', '');
  const b = hexB.replace('#', '');
  const parse = (s) => parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s, 16);
  const na = parse(a);
  const nb = parse(b);
  const lerp = (x, y) => Math.round(x + (y - x) * ratio);
  return `#${((lerp((na >> 16) & 255, (nb >> 16) & 255) << 16) | (lerp((na >> 8) & 255, (nb >> 8) & 255) << 8) | lerp(na & 255, nb & 255)).toString(16).padStart(6, '0')}`;
}

export function buildGeometry() {
  const face = new Path2D();
  face.moveTo(450, 188);
  face.bezierCurveTo(318, 185, 231, 271, 216, 394);
  face.bezierCurveTo(201, 500, 223, 626, 271, 730);
  face.bezierCurveTo(306, 800, 370, 878, 450, 900);
  face.bezierCurveTo(530, 878, 594, 800, 629, 730);
  face.bezierCurveTo(677, 626, 699, 500, 684, 394);
  face.bezierCurveTo(669, 271, 582, 185, 450, 188);
  face.closePath();

  const lips = new Path2D();
  lips.moveTo(362, 736);
  lips.bezierCurveTo(380, 716, 410, 706, 433, 722);
  lips.bezierCurveTo(442, 728, 446, 733, 450, 739);
  lips.bezierCurveTo(454, 733, 458, 728, 467, 722);
  lips.bezierCurveTo(490, 706, 520, 716, 538, 736);
  lips.bezierCurveTo(505, 752, 475, 762, 450, 762);
  lips.bezierCurveTo(425, 762, 395, 752, 362, 736);
  lips.closePath();
  lips.moveTo(362, 741);
  lips.bezierCurveTo(398, 764, 428, 772, 450, 772);
  lips.bezierCurveTo(472, 772, 502, 764, 538, 741);
  lips.bezierCurveTo(530, 796, 492, 823, 450, 823);
  lips.bezierCurveTo(408, 823, 370, 796, 362, 741);
  lips.closePath();

  const leftEye = new Path2D();
  leftEye.moveTo(274, 497);
  leftEye.bezierCurveTo(294, 472, 324, 462, 350, 465);
  leftEye.bezierCurveTo(378, 468, 401, 481, 416, 497);
  leftEye.bezierCurveTo(396, 513, 366, 522, 334, 520);
  leftEye.bezierCurveTo(309, 518, 287, 510, 274, 497);
  leftEye.closePath();

  const rightEye = new Path2D();
  rightEye.moveTo(626, 497);
  rightEye.bezierCurveTo(606, 472, 576, 462, 550, 465);
  rightEye.bezierCurveTo(522, 468, 499, 481, 484, 497);
  rightEye.bezierCurveTo(504, 513, 534, 522, 566, 520);
  rightEye.bezierCurveTo(591, 518, 613, 510, 626, 497);
  rightEye.closePath();

  const leftShadow = new Path2D();
  leftShadow.ellipse(343, 472, 101, 75, -0.05, 0, Math.PI * 2);
  const rightShadow = new Path2D();
  rightShadow.ellipse(557, 472, 101, 75, 0.05, 0, Math.PI * 2);
  const shadow = new Path2D();
  shadow.addPath(leftShadow);
  shadow.addPath(rightShadow);

  const eye = new Path2D();
  eye.addPath(leftEye);
  eye.addPath(rightEye);
  eye.ellipse(271, 491, 18, 27, 0.3, 0, Math.PI * 2);
  eye.ellipse(629, 491, 18, 27, -0.3, 0, Math.PI * 2);

  const cheeks = new Path2D();
  cheeks.ellipse(293, 651, 106, 68, -0.12, 0, Math.PI * 2);
  cheeks.ellipse(607, 651, 106, 68, 0.12, 0, Math.PI * 2);

  const highlight = new Path2D();
  highlight.ellipse(450, 331, 132, 56, 0, 0, Math.PI * 2);
  highlight.ellipse(450, 575, 17, 95, 0, 0, Math.PI * 2);
  highlight.ellipse(321, 596, 83, 27, -0.18, 0, Math.PI * 2);
  highlight.ellipse(579, 596, 83, 27, 0.18, 0, Math.PI * 2);
  highlight.ellipse(450, 844, 47, 23, 0, 0, Math.PI * 2);
  highlight.ellipse(450, 731, 25, 12, 0, 0, Math.PI * 2);

  const leftBrow = new Path2D();
  leftBrow.moveTo(266, 447);
  leftBrow.bezierCurveTo(292, 430, 334, 421, 378, 427);
  leftBrow.bezierCurveTo(402, 431, 418, 439, 427, 447);
  leftBrow.bezierCurveTo(394, 440, 354, 439, 318, 443);
  leftBrow.bezierCurveTo(294, 445, 277, 446, 266, 447);
  leftBrow.closePath();

  const rightBrow = new Path2D();
  rightBrow.moveTo(634, 447);
  rightBrow.bezierCurveTo(608, 430, 566, 421, 522, 427);
  rightBrow.bezierCurveTo(498, 431, 482, 439, 473, 447);
  rightBrow.bezierCurveTo(506, 440, 546, 439, 582, 443);
  rightBrow.bezierCurveTo(606, 445, 623, 446, 634, 447);
  rightBrow.closePath();

  const leftUpper = new Path2D();
  leftUpper.moveTo(274, 497);
  leftUpper.bezierCurveTo(294, 472, 324, 462, 350, 465);
  leftUpper.bezierCurveTo(378, 468, 401, 481, 416, 497);

  const rightUpper = new Path2D();
  rightUpper.moveTo(626, 497);
  rightUpper.bezierCurveTo(606, 472, 576, 462, 550, 465);
  rightUpper.bezierCurveTo(522, 468, 499, 481, 484, 497);

  return { face, lips, leftEye, rightEye, shadow, eye, cheeks, highlight, leftBrow, rightBrow, leftUpper, rightUpper };
}
