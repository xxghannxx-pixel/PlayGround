import { WIDTH, HEIGHT, buildGeometry, shade, rgba } from './data.js';

export const geometry = buildGeometry();

const BACKDROP_THEMES = {
  rose: { top: '#2d0d1c', mid: '#7d2c4b', light: '#f09ab5', glow: '#ffc2d4', floor: '#1a0711' },
  midnight: { top: '#0d0919', mid: '#3b265c', light: '#b69bdd', glow: '#dcc8ff', floor: '#08060f' },
  peach: { top: '#24100c', mid: '#8a3c2d', light: '#ffb58f', glow: '#ffd8b5', floor: '#190906' },
  mint: { top: '#071612', mid: '#28695d', light: '#9ae5d1', glow: '#c8fff0', floor: '#04100d' },
};

function seeded(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function clearLayer(ctx) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

export function drawBackdrop(ctx, model) {
  const theme = BACKDROP_THEMES[model.backdrop] || BACKDROP_THEMES.rose;
  clearLayer(ctx);
  const base = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  base.addColorStop(0, theme.mid);
  base.addColorStop(0.42, theme.top);
  base.addColorStop(1, theme.floor);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glow = ctx.createRadialGradient(450, 430, 40, 450, 520, 560);
  glow.addColorStop(0, rgba(theme.glow, 0.34));
  glow.addColorStop(0.42, rgba(theme.light, 0.17));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const random = seeded(model.backdrop.length * 97 + 31);
  ctx.save();
  for (let i = 0; i < 18; i += 1) {
    const x = random() * WIDTH;
    const y = random() * HEIGHT;
    const r = 18 + random() * 92;
    const bokeh = ctx.createRadialGradient(x, y, 0, x, y, r);
    bokeh.addColorStop(0, rgba(theme.glow, 0.05 + random() * 0.09));
    bokeh.addColorStop(0.72, rgba(theme.light, 0.04));
    bokeh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bokeh;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = rgba(theme.glow, 0.05);
  ctx.lineWidth = 2;
  for (let x = -100; x < WIDTH + 100; x += 84) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 32, HEIGHT * 0.3, x - 20, HEIGHT * 0.7, x + 18, HEIGHT);
    ctx.stroke();
  }

  for (let i = 0; i < 42; i += 1) {
    const x = random() * WIDTH;
    const y = 40 + random() * (HEIGHT - 120);
    const size = 0.8 + random() * 2.6;
    ctx.fillStyle = rgba(theme.glow, 0.14 + random() * 0.38);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const vignette = ctx.createRadialGradient(450, 500, 260, 450, 560, 800);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.72, 'rgba(0,0,0,0.12)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.62)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function hairPathLong() {
  const path = new Path2D();
  path.moveTo(450, 84);
  path.bezierCurveTo(330, 84, 214, 166, 192, 338);
  path.bezierCurveTo(176, 468, 160, 566, 124, 688);
  path.bezierCurveTo(88, 810, 88, 946, 126, 1042);
  path.bezierCurveTo(188, 1082, 282, 1072, 326, 1022);
  path.bezierCurveTo(356, 988, 370, 930, 378, 860);
  path.bezierCurveTo(360, 810, 348, 748, 350, 690);
  path.bezierCurveTo(330, 620, 322, 540, 334, 468);
  path.bezierCurveTo(344, 360, 362, 250, 450, 84);
  path.closePath();
  return path;
}

function hairPathBob() {
  const path = new Path2D();
  path.moveTo(450, 84);
  path.bezierCurveTo(330, 84, 220, 170, 198, 340);
  path.bezierCurveTo(180, 470, 178, 600, 198, 730);
  path.bezierCurveTo(212, 820, 246, 910, 310, 960);
  path.bezierCurveTo(354, 992, 390, 974, 404, 940);
  path.bezierCurveTo(380, 860, 370, 760, 378, 660);
  path.bezierCurveTo(356, 580, 350, 500, 360, 420);
  path.bezierCurveTo(370, 300, 380, 190, 450, 84);
  path.closePath();
  return path;
}

function hairCapPath() {
  const path = new Path2D();
  path.moveTo(450, 82);
  path.bezierCurveTo(340, 82, 240, 150, 217, 300);
  path.bezierCurveTo(205, 390, 212, 470, 228, 535);
  path.bezierCurveTo(245, 590, 290, 620, 330, 615);
  path.bezierCurveTo(350, 610, 368, 590, 376, 565);
  path.bezierCurveTo(350, 480, 350, 380, 370, 300);
  path.bezierCurveTo(390, 210, 420, 150, 450, 82);
  path.closePath();
  return path;
}

function fillHairMass(ctx, path, model) {
  const hair = model.hair;
  const gradient = ctx.createLinearGradient(0, 70, 0, 1090);
  gradient.addColorStop(0, shade(hair, 28));
  gradient.addColorStop(0.25, hair);
  gradient.addColorStop(0.72, shade(hair, -22));
  gradient.addColorStop(1, shade(hair, -48));

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fill(path);
  ctx.translate(WIDTH, 0);
  ctx.scale(-1, 1);
  ctx.fill(path);
  ctx.restore();
}

function drawHairSheen(ctx, model, long = true) {
  const hair = model.hair;
  const light = shade(hair, 56);
  ctx.save();
  ctx.lineCap = 'round';
  const strands = long
    ? [
        [[218, 220], [196, 380], [176, 590], [150, 760]],
        [[250, 250], [218, 440], [196, 650], [178, 840]],
        [[296, 300], [270, 500], [250, 700], [240, 880]],
        [[352, 400], [334, 590], [320, 750], [318, 900]],
      ]
    : [
        [[226, 220], [206, 390], [204, 600], [222, 780]],
        [[268, 260], [248, 430], [242, 650], [270, 840]],
        [[320, 390], [308, 560], [304, 730], [320, 880]],
      ];
  for (const side of [1, -1]) {
    ctx.save();
    if (side < 0) {
      ctx.translate(WIDTH, 0);
      ctx.scale(-1, 1);
    }
    strands.forEach((points, index) => {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      ctx.bezierCurveTo(points[1][0], points[1][1], points[2][0], points[2][1], points[3][0], points[3][1]);
      ctx.strokeStyle = rgba(light, index === 2 ? 0.24 : 0.14);
      ctx.lineWidth = index === 2 ? 13 : 8;
      ctx.stroke();
    });
    ctx.restore();
  }
  ctx.restore();
}

export function drawHairBack(ctx, model) {
  clearLayer(ctx);
  const hair = model.hair;
  if (model.style === 'bun') {
    const bun = ctx.createRadialGradient(437, 95, 10, 450, 120, 100);
    bun.addColorStop(0, shade(hair, 38));
    bun.addColorStop(0.65, hair);
    bun.addColorStop(1, shade(hair, -40));
    ctx.fillStyle = bun;
    ctx.beginPath();
    ctx.ellipse(450, 120, 88, 78, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(shade(hair, -50), 0.55);
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.arc(450, 120, 32 + Math.abs(i) * 13, Math.PI * (0.15 + i * 0.05), Math.PI * (0.85 + i * 0.05));
      ctx.stroke();
    }
    fillHairMass(ctx, hairCapPath(), model);
    ctx.save();
    ctx.globalAlpha = 0.55;
    drawHairSheen(ctx, model, false);
    ctx.restore();
    return;
  }

  fillHairMass(ctx, model.style === 'bob' ? hairPathBob() : hairPathLong(), model);
  drawHairSheen(ctx, model, model.style !== 'bob');

  if (model.style === 'waves') {
    const rim = ctx.createLinearGradient(0, 100, 0, 1050);
    rim.addColorStop(0, rgba('#ffffff', 0.06));
    rim.addColorStop(0.6, rgba('#ffffff', 0.03));
    rim.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rim;
    ctx.fill(hairPathLong());
    ctx.save();
    ctx.translate(WIDTH, 0);
    ctx.scale(-1, 1);
    ctx.fill(hairPathLong());
    ctx.restore();
  }
}

export function drawHairFront(ctx, model) {
  clearLayer(ctx);
  const hair = model.hair;
  const dark = shade(hair, -32);
  const light = shade(hair, 54);

  if (model.style === 'bun') {
    const side = new Path2D();
    side.moveTo(246, 230);
    side.bezierCurveTo(216, 320, 210, 430, 220, 520);
    side.bezierCurveTo(228, 600, 246, 656, 268, 690);
    side.bezierCurveTo(282, 640, 286, 580, 278, 520);
    side.bezierCurveTo(270, 430, 274, 330, 298, 250);
    side.closePath();
    ctx.fillStyle = shade(hair, -8);
    ctx.fill(side);
    ctx.save();
    ctx.translate(WIDTH, 0);
    ctx.scale(-1, 1);
    ctx.fill(side);
    ctx.restore();
    const sweep = new Path2D();
    sweep.moveTo(450, 90);
    sweep.bezierCurveTo(356, 104, 290, 168, 272, 252);
    sweep.bezierCurveTo(322, 208, 386, 192, 450, 196);
    sweep.bezierCurveTo(514, 192, 578, 208, 628, 252);
    sweep.bezierCurveTo(610, 168, 544, 104, 450, 90);
    sweep.closePath();
    ctx.fillStyle = ctx.createLinearGradient(0, 90, 0, 260);
    ctx.fillStyle = dark;
    ctx.fill(sweep);
  } else {
    const fringe = new Path2D();
    fringe.moveTo(450, 96);
    fringe.bezierCurveTo(342, 96, 250, 166, 230, 300);
    fringe.bezierCurveTo(268, 282, 312, 268, 348, 276);
    fringe.bezierCurveTo(378, 232, 420, 212, 462, 218);
    fringe.bezierCurveTo(516, 224, 562, 248, 592, 296);
    fringe.bezierCurveTo(606, 186, 542, 112, 450, 96);
    fringe.closePath();
    const fg = ctx.createLinearGradient(0, 90, 0, 320);
    fg.addColorStop(0, light);
    fg.addColorStop(0.38, hair);
    fg.addColorStop(1, dark);
    ctx.fillStyle = fg;
    ctx.fill(fringe);

    const sideSweep = new Path2D();
    sideSweep.moveTo(452, 104);
    sideSweep.bezierCurveTo(376, 122, 322, 176, 300, 252);
    sideSweep.bezierCurveTo(352, 220, 408, 208, 454, 216);
    sideSweep.bezierCurveTo(494, 223, 528, 242, 554, 276);
    sideSweep.bezierCurveTo(542, 194, 504, 138, 452, 104);
    sideSweep.closePath();
    const sg = ctx.createLinearGradient(0, 100, 0, 280);
    sg.addColorStop(0, rgba(light, 0.75));
    sg.addColorStop(0.55, rgba(hair, 0.92));
    sg.addColorStop(1, rgba(dark, 0.9));
    ctx.fillStyle = sg;
    ctx.fill(sideSweep);

    const strandLeft = new Path2D();
    strandLeft.moveTo(246, 272);
    strandLeft.bezierCurveTo(218, 380, 208, 510, 220, 620);
    strandLeft.bezierCurveTo(228, 720, 250, 800, 280, 860);
    strandLeft.bezierCurveTo(300, 790, 302, 700, 292, 610);
    strandLeft.bezierCurveTo(283, 510, 282, 390, 308, 296);
    strandLeft.closePath();
    const slg = ctx.createLinearGradient(0, 270, 0, 860);
    slg.addColorStop(0, shade(hair, 6));
    slg.addColorStop(1, shade(hair, -24));
    ctx.fillStyle = slg;
    ctx.fill(strandLeft);

    const strandRight = new Path2D();
    strandRight.moveTo(654, 272);
    strandRight.bezierCurveTo(682, 380, 692, 510, 680, 620);
    strandRight.bezierCurveTo(672, 720, 650, 800, 620, 860);
    strandRight.bezierCurveTo(600, 790, 598, 700, 608, 610);
    strandRight.bezierCurveTo(617, 510, 618, 390, 592, 296);
    strandRight.closePath();
    const srg = ctx.createLinearGradient(0, 270, 0, 860);
    srg.addColorStop(0, shade(hair, -2));
    srg.addColorStop(1, shade(hair, -28));
    ctx.fillStyle = srg;
    ctx.fill(strandRight);

    ctx.strokeStyle = rgba(light, 0.34);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(300, 300);
    ctx.bezierCurveTo(272, 410, 266, 540, 280, 650);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(606, 310);
    ctx.bezierCurveTo(632, 420, 636, 540, 624, 650);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(452, 110);
    ctx.bezierCurveTo(458, 160, 452, 210, 438, 250);
    ctx.strokeStyle = rgba(dark, 0.45);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export function drawSkinBase(ctx, model) {
  clearLayer(ctx);
  const skin = model.skin;
  const light = shade(skin, 24);
  const mid = shade(skin, -8);
  const deep = shade(skin, -46);

  const chest = ctx.createLinearGradient(0, 950, 0, HEIGHT);
  chest.addColorStop(0, mid);
  chest.addColorStop(0.35, shade(skin, 2));
  chest.addColorStop(1, shade(skin, -22));
  ctx.fillStyle = chest;
  ctx.beginPath();
  ctx.moveTo(263, HEIGHT);
  ctx.bezierCurveTo(270, 1054, 340, 997, 450, 984);
  ctx.bezierCurveTo(560, 997, 630, 1054, 637, HEIGHT);
  ctx.closePath();
  ctx.fill();

  const neck = ctx.createLinearGradient(350, 840, 560, 1035);
  neck.addColorStop(0, shade(skin, -12));
  neck.addColorStop(0.45, skin);
  neck.addColorStop(1, shade(skin, -18));
  ctx.fillStyle = neck;
  ctx.beginPath();
  ctx.moveTo(371, 836);
  ctx.lineTo(529, 836);
  ctx.bezierCurveTo(546, 898, 560, 954, 572, 1012);
  ctx.bezierCurveTo(516, 1036, 384, 1036, 328, 1012);
  ctx.bezierCurveTo(340, 954, 354, 898, 371, 836);
  ctx.closePath();
  ctx.fill();

  const robe = ctx.createLinearGradient(200, 1010, 700, 1150);
  robe.addColorStop(0, '#5b1734');
  robe.addColorStop(0.45, '#7c2246');
  robe.addColorStop(0.72, '#420d26');
  robe.addColorStop(1, '#230512');
  ctx.fillStyle = robe;
  ctx.beginPath();
  ctx.moveTo(188, HEIGHT);
  ctx.bezierCurveTo(206, 1078, 305, 1024, 450, 1011);
  ctx.bezierCurveTo(595, 1024, 694, 1078, 712, HEIGHT);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,210,226,0.32)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(214, HEIGHT - 8);
  ctx.bezierCurveTo(238, 1088, 330, 1042, 450, 1030);
  ctx.bezierCurveTo(570, 1042, 662, 1088, 686, HEIGHT - 8);
  ctx.stroke();

  const fold = ctx.createLinearGradient(260, 1060, 640, 1100);
  fold.addColorStop(0, 'rgba(255,255,255,0)');
  fold.addColorStop(0.5, 'rgba(255,255,255,0.1)');
  fold.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.strokeStyle = fold;
  ctx.lineWidth = 7;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(290 + i * 55, 1090 + i * 12);
    ctx.bezierCurveTo(380 + i * 40, 1060 + i * 10, 500 - i * 20, 1065 + i * 10, 620 - i * 45, 1105 + i * 10);
    ctx.stroke();
  }

  ctx.strokeStyle = rgba(deep, 0.18);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(374, 1018);
  ctx.bezierCurveTo(398, 1008, 422, 1008, 438, 1016);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(462, 1016);
  ctx.bezierCurveTo(478, 1008, 502, 1008, 526, 1018);
  ctx.stroke();

  const earFill = ctx.createLinearGradient(180, 480, 230, 590);
  earFill.addColorStop(0, light);
  earFill.addColorStop(1, shade(skin, -22));
  ctx.fillStyle = earFill;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(209, 536, 33, 58, -0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(691, 536, 33, 58, 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const faceGradient = ctx.createRadialGradient(392, 438, 90, 450, 540, 540);
  faceGradient.addColorStop(0, light);
  faceGradient.addColorStop(0.35, shade(skin, 10));
  faceGradient.addColorStop(0.74, skin);
  faceGradient.addColorStop(1, shade(skin, -18));
  ctx.fillStyle = faceGradient;
  ctx.fill(geometry.face);

  ctx.save();
  ctx.clip(geometry.face);

  const leftShade = ctx.createLinearGradient(186, 0, 344, 0);
  leftShade.addColorStop(0, rgba(deep, 0.32));
  leftShade.addColorStop(0.7, rgba(deep, 0.06));
  leftShade.addColorStop(1, rgba(deep, 0));
  ctx.fillStyle = leftShade;
  ctx.fillRect(180, 180, 190, 760);

  const rightShade = ctx.createLinearGradient(714, 0, 556, 0);
  rightShade.addColorStop(0, rgba(deep, 0.32));
  rightShade.addColorStop(0.7, rgba(deep, 0.06));
  rightShade.addColorStop(1, rgba(deep, 0));
  ctx.fillStyle = rightShade;
  ctx.fillRect(530, 180, 200, 760);

  const forehead = ctx.createRadialGradient(414, 320, 20, 430, 350, 220);
  forehead.addColorStop(0, rgba(light, 0.35));
  forehead.addColorStop(0.7, rgba(light, 0.07));
  forehead.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = forehead;
  ctx.fillRect(180, 180, 540, 320);

  const cheekLight = (x) => {
    const g = ctx.createRadialGradient(x, 592, 8, x, 600, 120);
    g.addColorStop(0, rgba(light, 0.26));
    g.addColorStop(0.65, rgba(light, 0.06));
    g.addColorStop(1, 'rgba(255,255,255,0)');
    return g;
  };
  ctx.fillStyle = cheekLight(320);
  ctx.fillRect(220, 530, 220, 180);
  ctx.fillStyle = cheekLight(580);
  ctx.fillRect(460, 530, 220, 180);

  const eyeSocket = ctx.createRadialGradient(343, 515, 4, 343, 520, 78);
  eyeSocket.addColorStop(0, rgba(deep, 0.18));
  eyeSocket.addColorStop(1, rgba(deep, 0));
  ctx.fillStyle = eyeSocket;
  ctx.fillRect(250, 440, 190, 140);
  const eyeSocketR = ctx.createRadialGradient(557, 515, 4, 557, 520, 78);
  eyeSocketR.addColorStop(0, rgba(deep, 0.18));
  eyeSocketR.addColorStop(1, rgba(deep, 0));
  ctx.fillStyle = eyeSocketR;
  ctx.fillRect(460, 440, 190, 140);

  const bridgeShadow = new Path2D();
  bridgeShadow.moveTo(438, 500);
  bridgeShadow.bezierCurveTo(427, 548, 423, 592, 431, 622);
  bridgeShadow.bezierCurveTo(441, 632, 452, 627, 456, 617);
  bridgeShadow.bezierCurveTo(446, 590, 446, 548, 451, 500);
  bridgeShadow.closePath();
  ctx.fillStyle = rgba(deep, 0.16);
  ctx.fill(bridgeShadow);

  const noseLight = ctx.createRadialGradient(446, 600, 0, 446, 600, 34);
  noseLight.addColorStop(0, rgba(light, 0.55));
  noseLight.addColorStop(1, rgba(light, 0));
  ctx.fillStyle = noseLight;
  ctx.fillRect(400, 560, 100, 90);

  const jaw = ctx.createLinearGradient(0, 790, 0, 912);
  jaw.addColorStop(0, 'rgba(90,40,32,0)');
  jaw.addColorStop(0.7, rgba(deep, 0.1));
  jaw.addColorStop(1, rgba(deep, 0.16));
  ctx.fillStyle = jaw;
  ctx.fillRect(250, 780, 400, 140);

  ctx.strokeStyle = rgba(deep, 0.3);
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(426, 623);
  ctx.bezierCurveTo(431, 629, 437, 631, 442, 630);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(474, 623);
  ctx.bezierCurveTo(469, 629, 463, 631, 458, 630);
  ctx.stroke();

  ctx.strokeStyle = rgba(deep, 0.18);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(450, 667);
  ctx.bezierCurveTo(447, 700, 447, 718, 450, 731);
  ctx.stroke();

  ctx.fillStyle = rgba(deep, 0.45);
  ctx.beginPath();
  ctx.arc(553, 793, 2.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  const lipBase = ctx.createLinearGradient(0, 700, 0, 830);
  lipBase.addColorStop(0, '#a85f67');
  lipBase.addColorStop(0.48, '#c27c80');
  lipBase.addColorStop(1, '#b1656f');
  ctx.fillStyle = lipBase;
  ctx.fill(geometry.lips);

  ctx.save();
  ctx.clip(geometry.lips);
  const lipLight = ctx.createRadialGradient(450, 790, 2, 450, 785, 94);
  lipLight.addColorStop(0, 'rgba(255,225,222,0.34)');
  lipLight.addColorStop(1, 'rgba(255,225,222,0)');
  ctx.fillStyle = lipLight;
  ctx.fillRect(350, 700, 200, 140);
  ctx.restore();
}

export function drawFeatures(ctx, model) {
  clearLayer(ctx);
  const deepEyes = '#2a181b';
  const browColor = shade(model.hair, -24);
  const browLight = shade(model.hair, 16);

  const drawBrow = (path, flip) => {
    const grad = ctx.createLinearGradient(260, 410, 435, 450);
    grad.addColorStop(0, browColor);
    grad.addColorStop(0.6, shade(model.hair, -6));
    grad.addColorStop(1, shade(model.hair, -34));
    ctx.fillStyle = grad;
    ctx.fill(path);
    ctx.save();
    ctx.clip(path);
    ctx.strokeStyle = rgba(browLight, 0.28);
    ctx.lineWidth = 1.3;
    for (let i = 0; i < 16; i += 1) {
      const x = 270 + i * 9.5;
      const y = 438 - Math.sin((i / 15) * Math.PI) * 11;
      ctx.beginPath();
      ctx.moveTo(x, y + 6);
      ctx.quadraticCurveTo(x + 4 * flip, y - 1, x + 10 * flip, y - 4);
      ctx.stroke();
    }
    ctx.restore();
  };
  drawBrow(geometry.leftBrow, 1);
  drawBrow(geometry.rightBrow, -1);

  const drawEye = (eyePath, cx, side) => {
    ctx.save();
    ctx.clip(eyePath);
    const white = ctx.createLinearGradient(0, 450, 0, 530);
    white.addColorStop(0, '#f2dfdc');
    white.addColorStop(0.25, '#fffaf7');
    white.addColorStop(1, '#f7e9e5');
    ctx.fillStyle = white;
    ctx.fillRect(cx - 100, 440, 200, 100);

    const upperShadow = ctx.createLinearGradient(0, 460, 0, 498);
    upperShadow.addColorStop(0, 'rgba(100,52,58,0.32)');
    upperShadow.addColorStop(1, 'rgba(100,52,58,0)');
    ctx.fillStyle = upperShadow;
    ctx.fillRect(cx - 100, 450, 200, 100);

    const iris = ctx.createRadialGradient(cx - 4, 484, 2, cx, 491, 25);
    iris.addColorStop(0, shade(model.eye, 34));
    iris.addColorStop(0.45, model.eye);
    iris.addColorStop(0.83, shade(model.eye, -26));
    iris.addColorStop(1, shade(model.eye, -58));
    ctx.fillStyle = iris;
    ctx.beginPath();
    ctx.arc(cx, 491, 21.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(shade(model.eye, -70), 0.72);
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(cx, 491, 20.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#150f11';
    ctx.beginPath();
    ctx.arc(cx, 491, 8.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.arc(cx - 6, 484.5, 4.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.arc(cx + 6.5, 497, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.save();
    ctx.strokeStyle = deepEyes;
    ctx.lineWidth = 6.6;
    ctx.beginPath();
    ctx.moveTo(side > 0 ? 274 : 626, 497);
    ctx.bezierCurveTo(side > 0 ? 294 : 606, 472, side > 0 ? 324 : 576, 462, side > 0 ? 350 : 550, 465);
    ctx.bezierCurveTo(side > 0 ? 378 : 522, 468, side > 0 ? 401 : 499, 481, side > 0 ? 416 : 484, 497);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = rgba(deepEyes, 0.3);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(side > 0 ? 290 : 610, 508);
    ctx.bezierCurveTo(side > 0 ? 324 : 576, 519, side > 0 ? 366 : 534, 520, side > 0 ? 402 : 498, 507);
    ctx.stroke();

    ctx.strokeStyle = rgba(deepEyes, 0.32);
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(side > 0 ? 280 : 620, 479);
    ctx.bezierCurveTo(side > 0 ? 308 : 592, 454, side > 0 ? 360 : 540, 452, side > 0 ? 400 : 500, 474);
    ctx.stroke();

    ctx.strokeStyle = deepEyes;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i += 1) {
      const outerX = side > 0 ? 275 : 625;
      const dir = side > 0 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(outerX + dir * i * 2, 496 - i * 1.5);
      ctx.quadraticCurveTo(outerX + dir * (9 + i * 3), 485 - i * 3, outerX + dir * (17 + i * 6), 478 - i * 6);
      ctx.stroke();
    }

    ctx.strokeStyle = rgba('#ffffff', 0.7);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 21, 484);
    ctx.bezierCurveTo(cx - 15, 480, cx - 8, 480, cx - 3, 483);
    ctx.stroke();
  };

  drawEye(geometry.leftEye, 343, 1);
  drawEye(geometry.rightEye, 557, -1);

  ctx.strokeStyle = rgba('#7d4a46', 0.3);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(382, 704);
  ctx.quadraticCurveTo(410, 694, 434, 702);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(518, 704);
  ctx.quadraticCurveTo(490, 694, 466, 702);
  ctx.stroke();

  ctx.fillStyle = rgba(shade(model.skin, 35), 0.4);
  ctx.beginPath();
  ctx.ellipse(450, 660, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawOverlay(ctx, model) {
  clearLayer(ctx);
  const crease = new Path2D();
  crease.moveTo(362, 739);
  crease.bezierCurveTo(392, 744, 420, 745, 450, 746);
  crease.bezierCurveTo(480, 745, 508, 744, 538, 739);
  ctx.strokeStyle = 'rgba(76,24,35,0.36)';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.stroke(crease);

  const glow = ctx.createRadialGradient(450, 794, 2, 450, 790, 70);
  glow.addColorStop(0, 'rgba(255,245,238,0.36)');
  glow.addColorStop(0.45, 'rgba(255,236,230,0.12)');
  glow.addColorStop(1, 'rgba(255,236,230,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(450, 793, 62, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  const upperGlow = ctx.createRadialGradient(462, 737, 1, 462, 737, 26);
  upperGlow.addColorStop(0, 'rgba(255,250,246,0.3)');
  upperGlow.addColorStop(1, 'rgba(255,250,246,0)');
  ctx.fillStyle = upperGlow;
  ctx.beginPath();
  ctx.ellipse(462, 737, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  const sparkle = (x, y, r, alpha) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${alpha})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  sparkle(338, 484, 2.4, 0.55);
  sparkle(562, 484, 2.4, 0.55);
}

export function renderBase(layers, model) {
  drawBackdrop(layers.bg, model);
  drawHairBack(layers.hairBack, model);
  drawSkinBase(layers.skin, model);
  drawFeatures(layers.features, model);
  drawHairFront(layers.hairFront, model);
  drawOverlay(layers.overlay, model);
}
