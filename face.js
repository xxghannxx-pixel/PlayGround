/* Maison Miroir — canvas portrait renderer */
import {
  W, H, skinOf, hairOf, eyeOf, blushOf, shadowOf, lipOf, linerOf, browOf, auraOf
} from './data.js';

const TAU = Math.PI * 2;

function rgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgba(hex, a) {
  const c = rgb(hex);
  return `rgba(${c.r},${c.g},${c.b},${Math.max(0, Math.min(1, a))})`;
}
function shade(hex, amount) {
  const c = rgb(hex);
  const target = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  const mix = v => Math.round(v + (target - v) * p);
  return `rgb(${mix(c.r)},${mix(c.g)},${mix(c.b)})`;
}
function seedRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const FACE = new Path2D('M450 150 C570 150 644 236 650 378 C658 518 638 648 568 716 C530 754 486 780 450 782 C414 780 370 754 332 716 C262 648 242 518 250 378 C256 236 330 150 450 150 Z');
const NECK = new Path2D('M386 718 C388 772 378 806 342 832 L342 916 L558 916 L558 832 C522 806 512 772 514 718 Z');
const CHEST = new Path2D('M292 1120 C296 966 348 872 450 838 C552 872 604 966 608 1120 Z');
const DRESS = new Path2D('M156 1120 L156 1014 C172 924 256 852 368 818 L450 956 L532 818 C644 852 728 924 744 1014 L744 1120 Z');
const EAR_L = new Path2D('M262 444 C242 434 225 456 228 490 C231 522 246 544 266 535 C254 508 251 476 262 444 Z');
const CHEEK_L = new Path2D('M248 480 C242 548 256 620 300 674 C334 714 366 734 392 742 L392 600 C374 584 360 552 356 514 Z');

const EYE_WHITE_L = new Path2D('M306 441 C320 407 381 401 408 439 C390 467 332 471 306 441 Z');
const LID_L = new Path2D('M298 449 C304 412 330 389 362 385 C391 382 411 397 419 427 C420 436 419 443 416 449 C400 420 374 410 348 414 C326 418 310 430 298 449 Z');
const EYE_UPPER_L = new Path2D('M306 441 C320 407 381 401 408 439');
const EYE_LOWER_L = new Path2D('M312 447 C335 469 380 467 404 446');
const CREASE_L = new Path2D('M316 410 C342 386 384 383 404 407');
const IRIS_L = { x: 356, y: 439, r: 18.5 };

const BROW_SHAPES = {
  natural: new Path2D('M302 372 C320 350 350 338 380 342 C395 344 407 352 412 362 C400 355 380 350 358 351 C334 352 315 360 302 372 Z'),
  arched: new Path2D('M302 375 C318 352 342 337 366 336 C390 335 404 345 412 360 C398 350 380 345 360 347 C338 350 318 360 302 375 Z'),
  straight: new Path2D('M302 368 C328 356 362 352 392 356 C401 357 408 360 412 364 C396 361 366 359 340 361 C324 362 312 365 302 368 Z')
};

const LIP_UPPER = new Path2D('M366 653 C388 633 414 632 440 648 C446 652 454 652 460 648 C486 632 512 633 534 653 C504 662 478 666 450 666 C422 666 396 662 366 653 Z');
const LIP_LOWER = new Path2D('M366 653 C396 661 422 666 450 666 C478 666 504 661 534 653 C528 688 502 714 450 716 C398 714 372 688 366 653 Z');
const LIPS = new Path2D();
LIPS.addPath(LIP_UPPER);
LIPS.addPath(LIP_LOWER);

const HAIR_PATHS = {
  loose: new Path2D('M450 78 C298 78 194 192 192 392 C190 566 246 748 210 1008 C258 1046 330 1030 352 938 C314 764 288 610 298 452 C308 286 352 208 450 208 C548 208 592 286 602 452 C612 610 586 764 548 938 C570 1030 642 1046 690 1008 C654 748 710 566 708 392 C706 192 602 78 450 78 Z'),
  bob: new Path2D('M450 78 C300 78 196 192 194 392 C192 540 232 690 246 760 C296 798 350 772 366 720 C330 618 314 508 322 408 C330 270 360 204 450 204 C540 204 570 270 578 408 C586 508 570 618 534 720 C550 772 604 798 654 760 C668 690 708 540 706 392 C704 192 600 78 450 78 Z'),
  updo: new Path2D('M450 84 C316 84 218 188 214 374 C212 474 236 562 292 620 C322 650 358 664 394 660 C366 590 352 510 354 420 C356 280 380 206 450 206 C520 206 544 280 546 420 C548 510 534 590 506 660 C542 664 578 650 608 620 C664 562 688 474 686 374 C682 188 584 84 450 84 Z')
};
const FRONT_LOOSE_L = new Path2D('M450 106 C368 106 300 152 274 238 C260 280 260 314 269 339 C275 354 292 354 300 336 C319 303 349 270 392 242 C422 224 440 214 450 214 Z');
const FRONT_UPDO_L = new Path2D('M450 112 C374 112 308 158 280 240 C266 282 268 316 280 342 C285 349 294 349 302 334 C321 302 352 266 392 240 C418 226 438 218 450 218 Z');
const UPDO_SIDE_L = new Path2D('M278 338 C264 378 260 424 266 468 C270 498 278 520 292 532 C306 504 306 460 304 416 C302 372 306 350 314 332 Z');
const SIDE_LOCK_LOOSE_L = new Path2D('M282 334 C248 400 246 472 264 540 C276 590 294 630 294 674 C293 712 300 744 308 772 C318 750 328 720 328 684 C328 666 326 646 322 628 C312 578 304 542 304 498 C304 450 312 400 326 344 C322 328 306 318 292 324 C288 327 285 330 282 334 Z');
const SIDE_LOCK_BOB_L = new Path2D('M276 328 C258 392 254 450 266 504 C276 540 288 568 292 596 C304 564 306 522 300 480 C294 434 302 384 316 342 Z');

const LASHES = [
  { x: 309, y: 438, a: -2.45, l: 9 },
  { x: 319, y: 428, a: -2.25, l: 11 },
  { x: 331, y: 419, a: -2.05, l: 12 },
  { x: 345, y: 413, a: -1.9, l: 13 },
  { x: 359, y: 411, a: -1.75, l: 13 },
  { x: 373, y: 413, a: -1.55, l: 13 },
  { x: 387, y: 420, a: -1.35, l: 12 },
  { x: 399, y: 430, a: -1.12, l: 11 }
];
const LOWER_LASHES = [
  { x: 320, y: 456, a: 2.55, l: 6 },
  { x: 340, y: 463, a: 2.3, l: 7 },
  { x: 365, y: 464, a: 2.0, l: 7 },
  { x: 390, y: 456, a: 1.7, l: 6 }
];

const FRECKLES = (() => {
  const rnd = seedRandom(88);
  const list = [];
  for (let i = 0; i < 34; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = 450 + side * (24 + rnd() * 118);
    const y = 524 + rnd() * 84;
    list.push({ x, y, r: .9 + rnd() * 1.6, a: .22 + rnd() * .3 });
  }
  for (let i = 0; i < 7; i++) list.push({ x: 438 + rnd() * 24, y: 538 + rnd() * 36, r: .8 + rnd() * 1.1, a: .18 + rnd() * .2 });
  return list;
})();

const GLITTER_CHEEKS = (() => {
  const rnd = seedRandom(412);
  const list = [];
  for (let i = 0; i < 30; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = 450 + side * (58 + rnd() * 100);
    const y = 512 + rnd() * 82;
    list.push({ x, y, r: 1.4 + rnd() * 2.6, a: .35 + rnd() * .45, rot: rnd() * TAU });
  }
  return list;
})();

const GLITTER_EYES = [
  { x: 332, y: 403, r: 1.5 }, { x: 348, y: 396, r: 1.1 }, { x: 364, y: 400, r: 1.7 },
  { x: 380, y: 406, r: 1.1 }, { x: 394, y: 416, r: 1.4 }, { x: 320, y: 420, r: 1 }
];

const BOKEH = (() => {
  const rnd = seedRandom(27);
  return Array.from({ length: 26 }, () => ({
    x: rnd() * W,
    y: rnd() * H * .92,
    r: 12 + rnd() * 78,
    a: .035 + rnd() * .1,
    warm: rnd() > .35
  }));
})();

export function isOnFace(x, y) {
  const head = ((x - 450) / 212) ** 2 + ((y - 470) / 326) ** 2 <= 1;
  const neck = x > 372 && x < 528 && y > 736 && y < 920;
  return head || neck;
}

export function createFaceRenderer(canvas, paintCanvas) {
  const ctx = canvas.getContext('2d');
  const pctx = paintCanvas.getContext('2d');
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    paintCanvas.width = Math.round(W * dpr);
    paintCanvas.height = Math.round(H * dpr);
  }
  resize();

  function softEllipse(x, y, rx, ry, color, alpha, rot = 0) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(.55, rgba(color, alpha * .58));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function sparkleOn(context, x, y, r, color, alpha, rot = 0, points = 4) {
    context.save();
    context.translate(x, y);
    context.rotate(rot);
    context.globalAlpha = alpha;
    context.fillStyle = color;
    context.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const a = (i / (points * 2)) * TAU - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * .24;
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      if (i === 0) context.moveTo(px, py); else context.lineTo(px, py);
    }
    context.closePath();
    context.fill();
    context.restore();
  }

  function sparkle(x, y, r, color, alpha, rot = 0, points = 4) {
    sparkleOn(ctx, x, y, r, color, alpha, rot, points);
  }

  function starPath(x, y, outer, inner, points, rot = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const a = rot + (i / (points * 2)) * TAU;
      const rr = i % 2 === 0 ? outer : inner;
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function mirrorDraw(fn) {
    fn();
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    fn();
    ctx.restore();
  }

  /* ---------------- background ---------------- */

  function drawBackground(look) {
    const aura = auraOf(look);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, aura.top);
    g.addColorStop(.48, aura.mid);
    g.addColorStop(1, aura.bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(450, 430, 40, 450, 430, 560);
    glow.addColorStop(0, rgba(aura.glow, aura.id === 'night' ? .18 : .5));
    glow.addColorStop(.6, rgba(aura.glow, aura.id === 'night' ? .06 : .17));
    glow.addColorStop(1, rgba(aura.glow, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    for (const b of BOKEH) {
      const bg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      const color = b.warm ? '#fff2df' : '#f7ccd8';
      bg.addColorStop(0, rgba(color, b.a * (aura.id === 'night' ? .65 : 1)));
      bg.addColorStop(.68, rgba(color, b.a * .35));
      bg.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, TAU);
      ctx.fill();
    }

    const floor = ctx.createRadialGradient(450, 1020, 20, 450, 1000, 430);
    floor.addColorStop(0, rgba('#2a1428', .22));
    floor.addColorStop(1, rgba('#2a1428', 0));
    ctx.fillStyle = floor;
    ctx.fillRect(0, 700, W, H - 700);

    const vignette = ctx.createRadialGradient(450, 470, 300, 450, 500, 760);
    vignette.addColorStop(0, rgba('#1b0e1d', 0));
    vignette.addColorStop(.7, rgba('#1b0e1d', .06));
    vignette.addColorStop(1, rgba('#1b0e1d', aura.id === 'night' ? .46 : .3));
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    // fine light rays
    ctx.save();
    ctx.globalAlpha = aura.id === 'night' ? .07 : .1;
    ctx.strokeStyle = '#fff1de';
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(190 + i * 92, 0);
      ctx.lineTo(80 + i * 122, 430);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------------- hair back ---------------- */

  function hairGradient(hair, y1 = 70, y2 = 1050) {
    const g = ctx.createLinearGradient(0, y1, 0, y2);
    g.addColorStop(0, hair.light);
    g.addColorStop(.18, hair.base);
    g.addColorStop(.66, shade(hair.base, -.35));
    g.addColorStop(1, shade(hair.dark, -.25));
    return g;
  }

  function drawHairBack(look) {
    const hair = hairOf(look);
    const style = look.hairstyle;
    if (style === 'updo') {
      const bunGrad = ctx.createRadialGradient(430, 58, 4, 450, 94, 98);
      bunGrad.addColorStop(0, hair.light);
      bunGrad.addColorStop(.5, hair.base);
      bunGrad.addColorStop(1, hair.dark);
      ctx.fillStyle = bunGrad;
      ctx.beginPath();
      ctx.ellipse(450, 96, 83, 74, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = rgba(hair.light, .26);
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(450, 96, 64 - i * 12, 54 - i * 11, -.45, Math.PI * .15, Math.PI * 1.6);
        ctx.stroke();
      }
    }
    ctx.fillStyle = hairGradient(hair);
    ctx.fill(HAIR_PATHS[style] || HAIR_PATHS.loose);

    ctx.save();
    ctx.clip(HAIR_PATHS[style] || HAIR_PATHS.loose);
    ctx.strokeStyle = rgba(hair.light, .22);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const strands = style === 'loose' ? [
      'M250 280 C225 440 235 660 245 880',
      'M300 230 C275 430 290 650 305 900',
      'M650 280 C675 440 665 660 655 880',
      'M600 230 C625 430 610 650 595 900'
    ] : ['M260 260 C240 390 246 560 258 720', 'M640 260 C660 390 654 560 642 720'];
    for (const d of strands) {
      ctx.beginPath();
      ctx.stroke(new Path2D(d));
    }
    ctx.restore();

    // soft rim light
    ctx.save();
    ctx.strokeStyle = rgba(hair.light, .42);
    ctx.lineWidth = 2.2;
    ctx.globalAlpha = .55;
    ctx.beginPath();
    ctx.ellipse(450, 390, 252, 296, 0, Math.PI * 1.03, Math.PI * 1.97);
    ctx.stroke();
    ctx.restore();
  }

  /* ---------------- body ---------------- */

  function drawBody(look) {
    const skin = skinOf(look);
    const chestG = ctx.createLinearGradient(0, 820, 0, 1120);
    chestG.addColorStop(0, skin.base);
    chestG.addColorStop(.55, shade(skin.base, -.08));
    chestG.addColorStop(1, shade(skin.shadow, -.12));
    ctx.fillStyle = chestG;
    ctx.fill(CHEST);

    const neckG = ctx.createLinearGradient(380, 710, 530, 900);
    neckG.addColorStop(0, shade(skin.base, .04));
    neckG.addColorStop(.55, skin.base);
    neckG.addColorStop(1, skin.shadow);
    ctx.fillStyle = neckG;
    ctx.fill(NECK);

    ctx.save();
    ctx.clip(NECK);
    softEllipse(450, 774, 82, 40, skin.deep, .26);
    softEllipse(450, 718, 64, 24, skin.deep, .16);
    softEllipse(450, 824, 30, 36, skin.deep, .12);
    ctx.restore();

    ctx.save();
    ctx.clip(CHEST);
    softEllipse(450, 866, 96, 34, skin.deep, .13);
    ctx.strokeStyle = rgba(shade(skin.base, .25), .35);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(398, 866); ctx.quadraticCurveTo(438, 886, 474, 864);
    ctx.moveTo(426, 890); ctx.quadraticCurveTo(458, 900, 490, 878);
    ctx.stroke();
    ctx.restore();

    const dressG = ctx.createLinearGradient(280, 820, 620, 1120);
    dressG.addColorStop(0, '#6b3a55');
    dressG.addColorStop(.5, '#4d293f');
    dressG.addColorStop(1, '#2c172c');
    ctx.fillStyle = dressG;
    ctx.fill(DRESS);

    ctx.save();
    ctx.clip(DRESS);
    const sheen = ctx.createLinearGradient(360, 820, 560, 1120);
    sheen.addColorStop(0, 'rgba(255,220,226,.18)');
    sheen.addColorStop(.42, 'rgba(255,220,226,.02)');
    sheen.addColorStop(1, 'rgba(0,0,0,.18)');
    ctx.fillStyle = sheen;
    ctx.fillRect(150, 800, 600, 330);
    ctx.restore();

    ctx.strokeStyle = 'rgba(231,194,146,.32)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(368, 818);
    ctx.lineTo(450, 956);
    ctx.lineTo(532, 818);
    ctx.stroke();

    // soft edge light on shoulders
    softEllipse(300, 940, 120, 60, '#f1c5bd', .08);
    softEllipse(600, 940, 120, 60, '#f1c5bd', .08);
  }

  function drawEars(look) {
    const skin = skinOf(look);
    const grad = ctx.createLinearGradient(210, 430, 275, 550);
    grad.addColorStop(0, skin.base);
    grad.addColorStop(1, skin.shadow);
    mirrorDraw(() => {
      ctx.fillStyle = grad;
      ctx.fill(EAR_L);
      ctx.strokeStyle = rgba(skin.deep, .4);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(252, 455);
      ctx.bezierCurveTo(236, 470, 236, 495, 246, 517);
      ctx.stroke();
      softEllipse(244, 486, 15, 26, skin.deep, .13, .2);
    });
  }

  /* ---------------- face ---------------- */

  function drawFace(look) {
    const skin = skinOf(look);
    const blush = blushOf(look);
    const faceGrad = ctx.createRadialGradient(404, 366, 40, 450, 470, 460);
    faceGrad.addColorStop(0, shade(skin.base, .11));
    faceGrad.addColorStop(.48, skin.base);
    faceGrad.addColorStop(.82, shade(skin.base, -.07));
    faceGrad.addColorStop(1, skin.shadow);
    ctx.fillStyle = faceGrad;
    ctx.fill(FACE);

    ctx.save();
    ctx.clip(FACE);

    // broad side shading
    softEllipse(276, 450, 72, 160, skin.deep, .22);
    softEllipse(624, 450, 72, 160, skin.deep, .22);
    softEllipse(330, 690, 82, 58, skin.deep, .15);
    softEllipse(570, 690, 82, 58, skin.deep, .15);
    softEllipse(450, 168, 190, 54, skin.deep, .14);

    // contour
    const contour = look.contour;
    if (contour > .01) {
      softEllipse(288, 566, 52, 92, skin.deep, .27 * contour, .22);
      softEllipse(612, 566, 52, 92, skin.deep, .27 * contour, -.22);
      softEllipse(342, 704, 84, 38, skin.deep, .19 * contour, .28);
      softEllipse(558, 704, 84, 38, skin.deep, .19 * contour, -.28);
      softEllipse(450, 596, 20, 16, skin.deep, .13 * contour);
    }

    // blush
    const blushA = look.blushIntensity;
    if (blushA > .01) {
      softEllipse(336, 552, 72, 50, blush.hex, .72 * blushA, .08);
      softEllipse(564, 552, 72, 50, blush.hex, .72 * blushA, -.08);
      softEllipse(450, 568, 32, 18, blush.hex, .18 * blushA);
      softEllipse(362, 594, 42, 22, blush.hex, .25 * blushA, -.1);
      softEllipse(538, 594, 42, 22, blush.hex, .25 * blushA, .1);
    }

    // highlighter
    const hi = look.highlight;
    if (hi > .01) {
      softEllipse(450, 286, 96, 58, '#fff1de', .25 * hi);
      softEllipse(342, 505, 50, 26, '#fff1de', .34 * hi, -.12);
      softEllipse(558, 505, 50, 26, '#fff1de', .34 * hi, .12);
      softEllipse(450, 516, 11, 62, '#fff1de', .24 * hi);
      softEllipse(450, 704, 32, 17, '#fff1de', .27 * hi);
      softEllipse(450, 632, 17, 7, '#fff1de', .22 * hi);
      softEllipse(303, 628, 22, 13, '#fff1de', .16 * hi);
      softEllipse(597, 628, 22, 13, '#fff1de', .16 * hi);
    }

    // eye socket warmth
    softEllipse(356, 430, 54, 28, shade(skin.deep, -.05), .1);
    softEllipse(544, 430, 54, 28, shade(skin.deep, -.05), .1);
    ctx.restore();
  }

  function drawNose(look) {
    const skin = skinOf(look);
    ctx.save();
    ctx.clip(FACE);
    // soft bridge shadow instead of two hard vertical strokes
    softEllipse(450, 506, 17, 66, skin.deep, .1);
    softEllipse(429, 538, 9, 21, skin.deep, .08, -.08);
    softEllipse(471, 538, 9, 21, skin.deep, .08, .08);
    softEllipse(450, 568, 19, 10, skin.deep, .14);
    softEllipse(445, 536, 9, 26, '#fff2e1', .16);
    softEllipse(450, 552, 13, 9, '#fff2e1', .22);
    softEllipse(450, 590, 26, 8, skin.deep, .06);
    // nostril wings
    ctx.strokeStyle = rgba(shade(skin.deep, -.12), .32);
    ctx.lineWidth = 1.7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(423, 563); ctx.quadraticCurveTo(432, 578, 443, 574);
    ctx.moveTo(477, 563); ctx.quadraticCurveTo(468, 578, 457, 574);
    ctx.stroke();
    ctx.restore();
  }

  /* ---------------- eyes ---------------- */

  function drawEyeShadow(look) {
    const shadow = shadowOf(look);
    const inten = look.shadowIntensity;
    if (inten <= .01) return;
    mirrorDraw(() => {
      ctx.save();
      ctx.clip(LID_L);
      const g = ctx.createLinearGradient(0, 382, 0, 452);
      g.addColorStop(0, rgba(shadow.hex, .02 * inten));
      g.addColorStop(.38, rgba(shadow.hex, .26 * inten));
      g.addColorStop(.72, rgba(shadow.hex, .64 * inten));
      g.addColorStop(1, rgba(shadow.hex, .88 * inten));
      ctx.fillStyle = g;
      ctx.fillRect(280, 370, 160, 96);

      softEllipse(310, 431, 38, 26, shade(shadow.hex, -.22), .48 * inten);
      if (look.shadowFinish === 'satin') {
        softEllipse(360, 416, 30, 13, '#fff2df', .2 * inten);
      }
      if (look.shadowFinish === 'glitter') {
        for (const sp of GLITTER_EYES) {
          sparkle(sp.x, sp.y, sp.r * (.75 + inten * .5), '#fff2d4', .34 + .4 * inten, .3, 4);
        }
        softEllipse(350, 412, 36, 17, '#ffe7c0', .14 * inten);
      }
      ctx.restore();
    });
    // soft lower shadow
    softEllipse(356, 467, 54, 12, shadow.hex, .17 * inten);
    softEllipse(544, 467, 54, 12, shadow.hex, .17 * inten);
  }

  function drawEye(look) {
    const eye = eyeOf(look);
    const liner = linerOf(look);
    mirrorDraw(() => {
      ctx.save();
      ctx.fillStyle = '#fff8f2';
      ctx.fill(EYE_WHITE_L);
      const whiteG = ctx.createLinearGradient(0, 410, 0, 468);
      whiteG.addColorStop(0, rgba('#fffaf5', .95));
      whiteG.addColorStop(.55, rgba('#fdf1ec', .9));
      whiteG.addColorStop(1, rgba('#e8c7c0', .7));
      ctx.fillStyle = whiteG;
      ctx.fill(EYE_WHITE_L);

      ctx.save();
      ctx.clip(EYE_WHITE_L);
      const irisG = ctx.createRadialGradient(IRIS_L.x - 5, IRIS_L.y - 6, 2, IRIS_L.x, IRIS_L.y, IRIS_L.r);
      irisG.addColorStop(0, eye.light);
      irisG.addColorStop(.36, eye.base);
      irisG.addColorStop(.86, shade(eye.base, -.2));
      irisG.addColorStop(1, eye.dark);
      ctx.fillStyle = irisG;
      ctx.beginPath();
      ctx.arc(IRIS_L.x, IRIS_L.y, IRIS_L.r, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = rgba(eye.dark, .55);
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * TAU;
        ctx.beginPath();
        ctx.moveTo(IRIS_L.x + Math.cos(a) * 7, IRIS_L.y + Math.sin(a) * 7);
        ctx.lineTo(IRIS_L.x + Math.cos(a) * 16.5, IRIS_L.y + Math.sin(a) * 16.5);
        ctx.stroke();
      }
      ctx.strokeStyle = rgba(eye.dark, .8);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(IRIS_L.x, IRIS_L.y, IRIS_L.r - .6, 0, TAU);
      ctx.stroke();

      ctx.fillStyle = '#170f10';
      ctx.beginPath();
      ctx.arc(IRIS_L.x, IRIS_L.y, 7.2, 0, TAU);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,252,247,.95)';
      ctx.beginPath();
      ctx.arc(IRIS_L.x - 5.5, IRIS_L.y - 6, 4.1, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,244,232,.7)';
      ctx.beginPath();
      ctx.arc(IRIS_L.x + 5.5, IRIS_L.y + 6, 1.9, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,240,230,.35)';
      ctx.beginPath();
      ctx.ellipse(IRIS_L.x, IRIS_L.y + 13, 9, 2.6, 0, 0, TAU);
      ctx.fill();

      // inner corner warmth
      softEllipse(310, 442, 14, 12, '#d99895', .25);
      softEllipse(402, 440, 11, 10, '#d99895', .14);
      ctx.restore();

      ctx.strokeStyle = 'rgba(125,72,66,.45)';
      ctx.lineWidth = 1.3;
      ctx.stroke(EYE_LOWER_L);

      ctx.strokeStyle = 'rgba(118,67,63,.22)';
      ctx.lineWidth = 1.5;
      ctx.stroke(CREASE_L);

      // eyeliner
      if (look.liner !== 'none') {
        const settings = look.liner === 'soft'
          ? { width: 2.1, alpha: .62, wing: 0 }
          : look.liner === 'wing'
            ? { width: 3.2, alpha: .88, wing: 27 }
            : { width: 4.8, alpha: .94, wing: 33 };
        ctx.strokeStyle = rgba(liner.hex, settings.alpha);
        ctx.lineWidth = settings.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(EYE_UPPER_L);
        if (settings.wing > 0) {
          ctx.beginPath();
          ctx.moveTo(306, 441);
          ctx.bezierCurveTo(296, 434, 288, 426, 278, 416);
          ctx.lineTo(278 + settings.wing * .16, 412 + settings.wing * .03);
          ctx.quadraticCurveTo(292, 422, 308, 436);
          ctx.stroke();
        }
        if (look.liner === 'bold') {
          ctx.strokeStyle = rgba(liner.hex, .55);
          ctx.lineWidth = 2.1;
          ctx.beginPath();
          ctx.moveTo(315, 448);
          ctx.quadraticCurveTo(350, 466, 396, 448);
          ctx.stroke();
        }
      }

      // lashes
      if (look.lashes !== 'none') {
        const glam = look.lashes === 'glam';
        const mult = glam ? 1.32 : 1;
        ctx.strokeStyle = 'rgba(31,21,23,.82)';
        ctx.lineCap = 'round';
        for (const lash of LASHES) {
          const len = lash.l * mult;
          const tipX = lash.x + Math.cos(lash.a) * len;
          const tipY = lash.y + Math.sin(lash.a) * len;
          const cpX = lash.x + Math.cos(lash.a) * len * .45 - Math.sin(lash.a) * 2.5;
          const cpY = lash.y + Math.sin(lash.a) * len * .45 + Math.cos(lash.a) * 2.5;
          ctx.lineWidth = glam ? 1.8 : 1.35;
          ctx.beginPath();
          ctx.moveTo(lash.x, lash.y);
          ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
          ctx.stroke();
        }
        if (glam) {
          for (const lash of LOWER_LASHES) {
            ctx.lineWidth = 1.1;
            ctx.strokeStyle = 'rgba(31,21,23,.64)';
            ctx.beginPath();
            ctx.moveTo(lash.x, lash.y);
            ctx.quadraticCurveTo(
              lash.x + Math.cos(lash.a) * lash.l * .45,
              lash.y + Math.sin(lash.a) * lash.l * .45,
              lash.x + Math.cos(lash.a) * lash.l * .8,
              lash.y + Math.sin(lash.a) * lash.l * .8
            );
            ctx.stroke();
          }
          softEllipse(360, 468, 55, 9, '#2a1b1d', .13);
        }
      }
      ctx.restore();
    });
  }

  function drawBrows(look) {
    const brow = browOf(look);
    const path = BROW_SHAPES[look.brows] || BROW_SHAPES.natural;
    mirrorDraw(() => {
      ctx.fillStyle = rgba(brow.hex, .9);
      ctx.fill(path);
      ctx.strokeStyle = rgba(shade(brow.hex, -.25), .3);
      ctx.lineWidth = .9;
      for (let i = 0; i < 9; i++) {
        const x = 309 + i * 11;
        const y = 351 + Math.sin(i * .7) * 4;
        ctx.beginPath();
        ctx.moveTo(x, y + 4);
        ctx.lineTo(x + 7, y - 5);
        ctx.stroke();
      }
    });
  }

  /* ---------------- lips ---------------- */

  function drawLips(look) {
    const lip = lipOf(look);
    const inten = look.lipIntensity;
    const naturalTop = ctx.createLinearGradient(0, 630, 0, 668);
    naturalTop.addColorStop(0, '#b46c72');
    naturalTop.addColorStop(.6, '#c58082');
    naturalTop.addColorStop(1, '#a95f66');
    ctx.fillStyle = naturalTop;
    ctx.fill(LIP_UPPER);
    const naturalBottom = ctx.createLinearGradient(0, 664, 0, 718);
    naturalBottom.addColorStop(0, '#b56e71');
    naturalBottom.addColorStop(.5, '#cb8889');
    naturalBottom.addColorStop(1, '#b56f73');
    ctx.fillStyle = naturalBottom;
    ctx.fill(LIP_LOWER);

    if (inten > .02) {
      ctx.save();
      ctx.clip(LIPS);
      const g = ctx.createLinearGradient(0, 628, 0, 720);
      g.addColorStop(0, shade(lip.hex, -.18));
      g.addColorStop(.36, lip.hex);
      g.addColorStop(.66, shade(lip.hex, .08));
      g.addColorStop(1, shade(lip.hex, -.12));
      ctx.globalAlpha = Math.min(1, inten * 1.16);
      ctx.fillStyle = g;
      ctx.fillRect(356, 620, 188, 108);
      ctx.globalAlpha = Math.min(.4, inten * .35);
      softEllipse(450, 674, 72, 14, '#4b1d28', .4);
      ctx.restore();
    }

    // mouth line
    ctx.strokeStyle = rgba('#6e303b', .48);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(368, 653);
    ctx.bezierCurveTo(398, 664, 418, 668, 450, 668);
    ctx.bezierCurveTo(482, 668, 502, 664, 532, 653);
    ctx.stroke();

    if (inten > .2) {
      ctx.save();
      ctx.clip(LIPS);
      ctx.strokeStyle = rgba(shade(lip.hex, -.34), .13);
      ctx.lineWidth = .9;
      for (let i = 0; i < 12; i++) {
        const x = 380 + i * 13;
        const top = 636 + Math.abs(x - 450) * .04;
        ctx.beginPath();
        ctx.moveTo(x, top + 5);
        ctx.quadraticCurveTo(x + 2, top + 16, x - 1, top + 26);
        ctx.stroke();
      }
      softEllipse(376, 659, 13, 8, '#57222d', .2);
      softEllipse(524, 659, 13, 8, '#57222d', .2);
      ctx.restore();
    }
    if (look.lipLiner) {
      ctx.strokeStyle = rgba(shade(lip.hex, -.32), .8);
      ctx.lineWidth = 2.1;
      ctx.stroke(LIPS);
    }

    // finishes
    ctx.save();
    ctx.clip(LIPS);
    if (look.lipFinish === 'gloss') {
      ctx.fillStyle = 'rgba(255,247,238,.52)';
      ctx.beginPath();
      ctx.ellipse(414, 696, 30, 9, -.18, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,250,245,.35)';
      ctx.beginPath();
      ctx.ellipse(487, 701, 22, 6.5, .12, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,250,245,.32)';
      ctx.beginPath();
      ctx.ellipse(456, 640, 13, 4.5, 0, 0, TAU);
      ctx.fill();
      sparkle(406, 691, 5, '#fffaf2', .55, .2, 4);
      sparkle(500, 696, 4, '#fffaf2', .4, .1, 4);
    } else if (look.lipFinish === 'satin') {
      softEllipse(424, 696, 42, 12, '#fff4e6', .2);
      softEllipse(470, 641, 20, 6, '#fff4e6', .12);
    } else {
      softEllipse(430, 700, 40, 7, '#fff4e6', .05);
    }
    ctx.restore();

    // cupid's bow highlight
    softEllipse(450, 634, 13, 5, '#ffe9df', .2);
  }

  /* ---------------- extras ---------------- */

  function drawSkinDetails(look) {
    const skin = skinOf(look);
    if (look.freckles) {
      ctx.save();
      for (const f of FRECKLES) {
        ctx.fillStyle = rgba(shade(skin.deep, -.05), f.a);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    if (look.mole) {
      ctx.fillStyle = 'rgba(72,40,35,.7)';
      ctx.beginPath();
      ctx.ellipse(578, 586, 3.1, 2.6, .25, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,240,230,.2)';
      ctx.beginPath();
      ctx.arc(577, 585, 1, 0, TAU);
      ctx.fill();
    }
    if (look.glitter) {
      for (const gp of GLITTER_CHEEKS) {
        sparkle(gp.x, gp.y, gp.r, gp.x % 2 < 1 ? '#ffe6b3' : '#fff3e5', gp.a, gp.rot, 4);
      }
      sparkle(334, 508, 3.6, '#fff0c8', .7, .3, 4);
      sparkle(566, 512, 3, '#ffe7bb', .6, .1, 4);
    }
  }

  /* ---------------- hair front / accessories ---------------- */

  function drawHairFront(look) {
    const hair = hairOf(look);
    const style = look.hairstyle;
    const frontPath = style === 'updo' ? FRONT_UPDO_L : FRONT_LOOSE_L;
    const frontGrad = ctx.createLinearGradient(0, 105, 0, 520);
    frontGrad.addColorStop(0, hair.light);
    frontGrad.addColorStop(.35, hair.base);
    frontGrad.addColorStop(.8, shade(hair.base, -.3));
    frontGrad.addColorStop(1, shade(hair.dark, -.1));
    mirrorDraw(() => {
      ctx.fillStyle = frontGrad;
      ctx.fill(frontPath);
      ctx.save();
      ctx.clip(frontPath);
      ctx.strokeStyle = rgba(hair.light, .26);
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(308, 228);
      ctx.bezierCurveTo(292, 280, 286, 330, 298, 378);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(348, 260);
      ctx.bezierCurveTo(334, 305, 334, 346, 348, 390);
      ctx.stroke();
      ctx.restore();
    });

    if (style !== 'updo') {
      const lock = style === 'bob' ? SIDE_LOCK_BOB_L : SIDE_LOCK_LOOSE_L;
      const lockGrad = ctx.createLinearGradient(270, 330, 330, 760);
      lockGrad.addColorStop(0, shade(hair.base, -.05));
      lockGrad.addColorStop(.5, shade(hair.base, -.24));
      lockGrad.addColorStop(1, hair.dark);
      mirrorDraw(() => {
        ctx.fillStyle = lockGrad;
        ctx.fill(lock);
        ctx.save();
        ctx.clip(lock);
        ctx.strokeStyle = rgba(hair.light, .24);
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(302, 366);
        ctx.bezierCurveTo(292, 456, 294, 552, 304, 640);
        ctx.stroke();
        ctx.restore();
      });
    } else {
      const sideGrad = ctx.createLinearGradient(260, 330, 320, 540);
      sideGrad.addColorStop(0, hair.base);
      sideGrad.addColorStop(.7, shade(hair.base, -.28));
      sideGrad.addColorStop(1, hair.dark);
      mirrorDraw(() => {
        ctx.fillStyle = sideGrad;
        ctx.fill(UPDO_SIDE_L);
        ctx.save();
        ctx.clip(UPDO_SIDE_L);
        ctx.strokeStyle = rgba(hair.light, .2);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(290, 356);
        ctx.bezierCurveTo(282, 408, 284, 466, 292, 510);
        ctx.stroke();
        ctx.restore();
      });
      ctx.save();
      ctx.strokeStyle = rgba(hair.base, .8);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (const d of [
        'M386 240 C376 258 372 278 376 296',
        'M510 245 C522 262 526 282 522 300',
        'M324 300 C314 320 312 338 316 354',
        'M574 302 C584 320 586 338 582 356'
      ]) {
        ctx.beginPath();
        ctx.stroke(new Path2D(d));
      }
      ctx.restore();
    }

    // top shine
    ctx.save();
    ctx.globalAlpha = .35;
    ctx.strokeStyle = '#fff2df';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(450, 180, 142, 104, 0, Math.PI * 1.12, Math.PI * 1.62);
    ctx.stroke();
    ctx.restore();
  }

  function drawEarrings(look) {
    const kind = look.earrings;
    if (kind === 'none') return;
    mirrorDraw(() => {
      const x = 247;
      const y = 526;
      ctx.save();
      ctx.strokeStyle = '#e4bd7e';
      ctx.fillStyle = '#e4bd7e';
      ctx.shadowColor = 'rgba(0,0,0,.25)';
      ctx.shadowBlur = 4;
      if (kind === 'hoops') {
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.arc(x, y + 20, 22, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,242,210,.6)';
        ctx.lineWidth = .9;
        ctx.beginPath();
        ctx.arc(x, y + 20, 18, Math.PI * 1.1, Math.PI * 1.7);
        ctx.stroke();
      } else if (kind === 'pearl') {
        const g = ctx.createRadialGradient(x - 3, y - 2, 1, x, y + 4, 9);
        g.addColorStop(0, '#fffdf6');
        g.addColorStop(.6, '#f2e5d2');
        g.addColorStop(1, '#c9b39b');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y + 4, 8, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.8)';
        ctx.beginPath();
        ctx.arc(x - 2.5, y + 1, 2.2, 0, TAU);
        ctx.fill();
      } else {
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x, y + 16);
        ctx.stroke();
        const g = ctx.createLinearGradient(x, y + 16, x, y + 38);
        g.addColorStop(0, '#f5dfb1');
        g.addColorStop(.55, '#d9a86b');
        g.addColorStop(1, '#b97c57');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, y + 14);
        ctx.bezierCurveTo(x + 10, y + 24, x + 7, y + 38, x, y + 42);
        ctx.bezierCurveTo(x - 7, y + 38, x - 10, y + 24, x, y + 14);
        ctx.fill();
        sparkle(x - 2, y + 25, 3, '#fff7e6', .65, .2, 4);
      }
      ctx.restore();
    });
  }

  function drawNecklace(look) {
    const kind = look.necklace;
    if (kind === 'none') return;
    const chain = new Path2D('M380 828 C394 878 420 906 450 906 C480 906 506 878 520 828');
    ctx.save();
    if (kind === 'chain') {
      ctx.strokeStyle = 'rgba(226,187,124,.9)';
      ctx.lineWidth = 1.8;
      ctx.stroke(chain);
      ctx.fillStyle = '#e8c58c';
      ctx.beginPath();
      ctx.moveTo(450, 902);
      ctx.lineTo(457, 910);
      ctx.lineTo(450, 922);
      ctx.lineTo(443, 910);
      ctx.closePath();
      ctx.fill();
      sparkle(450, 909, 3.4, '#fff7e8', .8, .2, 4);
    } else {
      for (let i = 0; i < 11; i++) {
        const t = i / 10;
        const x = 380 + t * 140;
        const y = 828 + Math.sin(t * Math.PI) * 74;
        const g = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 5.5);
        g.addColorStop(0, '#fffaf0');
        g.addColorStop(.65, '#efe0ca');
        g.addColorStop(1, '#c6ae94');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = '#e8c58c';
      ctx.beginPath();
      ctx.moveTo(450, 900);
      ctx.lineTo(456, 909);
      ctx.lineTo(450, 919);
      ctx.lineTo(444, 909);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  /* ---------------- stickers ---------------- */

  function drawSticker(sticker) {
    ctx.save();
    ctx.translate(sticker.x, sticker.y);
    ctx.rotate(sticker.rot || 0);
    ctx.scale(sticker.scale || 1, sticker.scale || 1);
    if (sticker.type === 'gem') {
      const g = ctx.createLinearGradient(-10, -12, 10, 14);
      g.addColorStop(0, '#fff0cf');
      g.addColorStop(.45, '#e7b6c6');
      g.addColorStop(1, '#a65c84');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -13); ctx.lineTo(10, -4); ctx.lineTo(0, 15); ctx.lineTo(-10, -4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,247,232,.7)';
      ctx.lineWidth = .9;
      ctx.beginPath();
      ctx.moveTo(0, -13); ctx.lineTo(-4, -4); ctx.lineTo(0, 15);
      ctx.moveTo(-4, -4); ctx.lineTo(10, -4);
      ctx.stroke();
      sparkle(3, -6, 3.5, '#fffdf6', .9, .2, 4);
    } else if (sticker.type === 'star') {
      const g = ctx.createLinearGradient(0, -14, 0, 14);
      g.addColorStop(0, '#fff1c9');
      g.addColorStop(1, '#d5a35d');
      ctx.fillStyle = g;
      starPath(0, 0, 14, 5.8, 5);
      ctx.fill();
      sparkle(0, 0, 3.4, '#fffdf2', .7, .3, 4);
    } else if (sticker.type === 'heart') {
      const g = ctx.createLinearGradient(0, -12, 0, 12);
      g.addColorStop(0, '#f6b7c5');
      g.addColorStop(1, '#c95f82');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.bezierCurveTo(-17, 1, -12, -13, -2.5, -8);
      ctx.bezierCurveTo(0, -6.5, 0, -5, 0, -4);
      ctx.bezierCurveTo(0, -5, 0, -6.5, 2.5, -8);
      ctx.bezierCurveTo(12, -13, 17, 1, 0, 12);
      ctx.fill();
      sparkle(-4, -5, 2.6, '#fff6ef', .7, .1, 4);
    } else if (sticker.type === 'flower') {
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((i / 5) * TAU);
        const g = ctx.createRadialGradient(0, -9, 1, 0, -9, 8);
        g.addColorStop(0, '#fff6f1');
        g.addColorStop(1, '#e7a7b8');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(0, -9, 5.4, 8.2, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#e8c27e';
      ctx.beginPath();
      ctx.arc(0, 0, 4.4, 0, TAU);
      ctx.fill();
      sparkle(1, -2, 2, '#fff9e8', .8, 0, 4);
    } else if (sticker.type === 'pearl') {
      const g = ctx.createRadialGradient(-2, -3, 1, 0, 0, 8);
      g.addColorStop(0, '#fffdf8');
      g.addColorStop(.55, '#efe3d4');
      g.addColorStop(1, '#c5b09b');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.beginPath();
      ctx.arc(-2, -2, 2, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  /* ---------------- free paint ---------------- */

  function drawStroke(context, stroke) {
    const pts = stroke.points;
    if (!pts.length) return;
    context.save();
    context.globalAlpha = stroke.opacity;
    context.strokeStyle = stroke.color;
    context.fillStyle = stroke.color;
    context.lineWidth = stroke.size;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    if (stroke.mode === 'erase') context.globalCompositeOperation = 'destination-out';

    if (pts.length === 1) {
      context.beginPath();
      context.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, TAU);
      context.fill();
    } else {
      context.beginPath();
      context.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const midX = (pts[i].x + pts[i + 1].x) / 2;
        const midY = (pts[i].y + pts[i + 1].y) / 2;
        context.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
      }
      const last = pts[pts.length - 1];
      context.lineTo(last.x, last.y);
      context.stroke();
    }

    if (stroke.mode === 'glitter') {
      context.globalAlpha = Math.min(1, stroke.opacity + .15);
      context.globalCompositeOperation = 'source-over';
      for (let i = 0; i < pts.length; i += 4) {
        const p = pts[i];
        const twinkle = .55 + ((i * 37) % 10) / 22;
        sparkleOn(context, p.x + Math.sin(i * 1.7) * 3, p.y + Math.cos(i * 1.3) * 3,
          1.5 + (i % 3), i % 2 ? '#fff4d4' : '#fff8ee', twinkle, i * .7, 4);
      }
    }
    context.restore();
  }

  function rebuildPaint(look) {
    pctx.setTransform(1, 0, 0, 1, 0, 0);
    pctx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const stroke of look.strokes) drawStroke(pctx, stroke);
  }

  function drawPaint() {
    ctx.save();
    ctx.clip(FACE);
    ctx.drawImage(paintCanvas, 0, 0, W, H);
    ctx.restore();
  }

  /* ---------------- main ---------------- */

  function render(look) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    rebuildPaint(look);

    drawBackground(look);
    drawHairBack(look);
    drawBody(look);
    drawEars(look);
    drawFace(look);
    drawEyeShadow(look);
    drawEye(look);
    drawBrows(look);
    drawNose(look);
    drawLips(look);
    drawSkinDetails(look);
    drawPaint();
    for (const sticker of look.stickers) drawSticker(sticker);
    drawHairFront(look);
    drawEarrings(look);
    drawNecklace(look);
  }

  return { render, resize };
}
