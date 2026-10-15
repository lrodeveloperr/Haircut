// ---------------------------------------------------------------------------------------------
// Pattern painter: draws a seamless square tile of a pattern in two colours on a 2D canvas.
// The same tiles texture the 3D clipper / gown and fill the wardrobe swatches.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';

  const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rgbHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const shade = (h, k) => rgbHex(hexRgb(h).map((v) => (k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  const mix = (a, b, t) => rgbHex(hexRgb(a).map((v, i) => v + (hexRgb(b)[i] - v) * t));
  const lum = (h) => { const [r, g, b] = hexRgb(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };

  // draw fn at all 9 wrap offsets so shapes crossing the tile edge continue on the other side
  function wrapped(ctx, S, fn) {
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { ctx.save(); ctx.translate(ox, oy); fn(); ctx.restore(); }
  }
  function blob(ctx, x, y, r, R, n = 9) {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2, rr = r * (0.7 + 0.5 * R.next());
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      i ? ctx.quadraticCurveTo(x + Math.cos(a - Math.PI / n) * rr * 1.15, y + Math.sin(a - Math.PI / n) * rr * 1.15, px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  // smooth periodic value noise for marble / wood / galaxy (period S)
  function periodicNoise(R, cells) {
    const g = Array.from({ length: cells * cells }, () => R.next());
    const at = (x, y) => g[((y % cells) + cells) % cells * cells + (((x % cells) + cells) % cells)];
    return (u, v) => {
      const x = u * cells, y = v * cells, xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
      return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
    };
  }
  function pixels(ctx, S, fn) {
    const img = ctx.createImageData(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const c = fn(x / S, y / S), o = (y * S + x) * 4;
      img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  const P = {
    solid(ctx, S, a) { ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); },
    'two-tone'(ctx, S, a, b) { ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); ctx.fillStyle = b; ctx.fillRect(0, S * 0.5, S, S * 0.5); ctx.fillStyle = shade(b, -0.25); ctx.fillRect(0, S * 0.49, S, S * 0.025); },
    yoke(ctx, S, a, b) { ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); ctx.fillStyle = b; ctx.fillRect(0, 0, S, S * 0.22); ctx.fillStyle = shade(a, -0.2); ctx.fillRect(0, S * 0.22, S, S * 0.012); },
    racing(ctx, S, a, b) { ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); ctx.fillStyle = b; ctx.fillRect(S * 0.36, 0, S * 0.1, S); ctx.fillRect(S * 0.54, 0, S * 0.1, S); },
    stripes(ctx, S, a, b) { ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); ctx.fillStyle = b; for (let i = 0; i < 4; i++) ctx.fillRect((i * S) / 4, 0, S / 8, S); },
    pinstripe(ctx, S, a, b) { ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); ctx.fillStyle = b; for (let i = 0; i < 8; i++) ctx.fillRect((i * S) / 8, 0, Math.max(1.5, S / 110), S); },
    checker(ctx, S, a, b) { const n = 8, c = S / n; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { ctx.fillStyle = (x + y) % 2 ? b : a; ctx.fillRect(x * c, y * c, c, c); } },
    gingham(ctx, S, a, b) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S);
      const n = 6, c = S / n;
      ctx.globalAlpha = 0.55; ctx.fillStyle = b;
      for (let i = 0; i < n; i += 2) { ctx.fillRect(i * c, 0, c, S); ctx.fillRect(0, i * c, S, c); }
      ctx.globalAlpha = 1;
    },
    tartan(ctx, S, a, b) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S);
      const bands = [[0.0, 0.18, b, 0.6], [0.3, 0.06, shade(a, -0.55), 0.7], [0.5, 0.2, b, 0.55], [0.74, 0.03, '#f2efe6', 0.8], [0.84, 0.05, shade(b, -0.5), 0.7]];
      for (const [p, w, c, al] of bands) { ctx.globalAlpha = al; ctx.fillStyle = c; ctx.fillRect(p * S, 0, w * S, S); ctx.fillRect(0, p * S, S, w * S); }
      ctx.globalAlpha = 1;
    },
    dots(ctx, S, a, b) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); ctx.fillStyle = b;
      const n = 4, c = S / n;
      wrapped(ctx, S, () => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { ctx.beginPath(); ctx.arc(x * c + (y % 2 ? c / 2 : 0) + c / 4, y * c + c / 2, c * 0.2, 0, 7); ctx.fill(); } });
    },
    chevron(ctx, S, a, b) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); ctx.fillStyle = b;
      const n = 4, h = S / n;
      for (let i = -1; i <= n; i++) {
        ctx.beginPath();
        const y = i * h;
        ctx.moveTo(0, y); ctx.lineTo(S / 2, y + h / 2); ctx.lineTo(S, y); ctx.lineTo(S, y + h / 2); ctx.lineTo(S / 2, y + h); ctx.lineTo(0, y + h / 2);
        ctx.closePath(); ctx.fill();
      }
    },
    fade(ctx, S, a, b) { const g = ctx.createLinearGradient(0, 0, 0, S); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, S, S); },
    carbon(ctx, S, a, b) {
      const base = mix(a, '#101010', 0.6), n = 16, c = S / n;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const horiz = (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0;
        const g = horiz ? ctx.createLinearGradient(x * c, y * c, x * c, (y + 1) * c) : ctx.createLinearGradient(x * c, y * c, (x + 1) * c, y * c);
        g.addColorStop(0, shade(base, -0.4)); g.addColorStop(0.5, shade(mix(base, b, 0.25), 0.25)); g.addColorStop(1, shade(base, -0.4));
        ctx.fillStyle = g; ctx.fillRect(x * c, y * c, c, c);
      }
    },
    camo(ctx, S, a, b, R) {
      const cols = [a, b, mix(a, b, 0.5), shade(mix(a, b, 0.3), -0.45)];
      ctx.fillStyle = cols[0]; ctx.fillRect(0, 0, S, S);
      for (let k = 1; k < 4; k++) {
        ctx.fillStyle = cols[k];
        for (let i = 0; i < 7; i++) { const x = R.next() * S, y = R.next() * S, r = S * (0.06 + 0.07 * R.next()); wrapped(ctx, S, () => { blob(ctx, x, y, r, HSC.rng(i * 31 + k)); blob(ctx, x + r * 0.8, y + r * 0.3, r * 0.8, HSC.rng(i * 17 + k)); }); }
      }
    },
    marble(ctx, S, a, b, R) {
      const n = periodicNoise(R, 6), n2 = periodicNoise(R, 12), A = hexRgb(a), B = hexRgb(b);
      pixels(ctx, S, (u, v) => {
        const t = Math.abs(Math.sin((u + v) * Math.PI * 4 + 6 * n(u, v) + 2 * n2(u, v)));
        const vein = Math.pow(1 - t, 6);
        return A.map((c, i) => c + (B[i] - c) * vein);
      });
    },
    wood(ctx, S, a, b, R) {
      const n = periodicNoise(R, 4), A = hexRgb(a), B = hexRgb(b);
      pixels(ctx, S, (u, v) => {
        const r = Math.sin((u * 10 + 3 * n(u, v)) * Math.PI * 2) * 0.5 + 0.5;
        const t = Math.pow(r, 3) * 0.75 + 0.15 * n(v, u);
        return A.map((c, i) => c + (B[i] - c) * t);
      });
    },
    galaxy(ctx, S, a, b, R) {
      const n = periodicNoise(R, 5), n2 = periodicNoise(R, 10), base = [10, 10, 24], A = hexRgb(a), B = hexRgb(b);
      pixels(ctx, S, (u, v) => {
        const t = n(u, v), s = n2(u, v);
        return base.map((c, i) => c + A[i] * Math.pow(t, 3) * 0.8 + B[i] * Math.pow(s, 4) * 0.7);
      });
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 90; i++) { ctx.globalAlpha = 0.4 + 0.6 * R.next(); ctx.fillRect(R.next() * S, R.next() * S, 1 + R.next() * 1.5, 1 + R.next() * 1.5); }
      ctx.globalAlpha = 1;
    },
    flames(ctx, S, a, b, R) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S);
      for (const [col, k] of [[b, 1], [mix(b, '#ffe08a', 0.6), 0.6]]) {
        ctx.fillStyle = col;
        for (let i = 0; i < 6; i++) {
          const x = (i / 6) * S + R.next() * S * 0.05, w = S * 0.16 * k, h = S * (0.45 + 0.35 * R.next()) * k;
          wrapped(ctx, S, () => {
            ctx.beginPath(); ctx.moveTo(x - w, S);
            ctx.bezierCurveTo(x - w, S - h * 0.5, x - w * 0.2, S - h * 0.7, x + w * 0.2, S - h);
            ctx.bezierCurveTo(x + w * 0.1, S - h * 0.6, x + w, S - h * 0.45, x + w, S);
            ctx.closePath(); ctx.fill();
          });
        }
      }
    },
    honeycomb(ctx, S, a, b) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); ctx.strokeStyle = b; ctx.lineWidth = Math.max(1.5, S / 90);
      const r = S / 8, h = r * Math.sqrt(3);
      wrapped(ctx, S, () => {
        for (let row = 0; row * h * 0.5 < S + h; row++) for (let col = 0; col * r * 3 < S + 3 * r; col++) {
          const cx = col * r * 3 + (row % 2 ? r * 1.5 : 0), cy = row * h * 0.5;
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) { const ang = (i / 6) * Math.PI * 2; ctx[i ? 'lineTo' : 'moveTo'](cx + r * Math.cos(ang), cy + r * Math.sin(ang)); }
          ctx.stroke();
        }
      });
    },
    leopard(ctx, S, a, b, R) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S);
      for (let i = 0; i < 16; i++) {
        const x = R.next() * S, y = R.next() * S, r = S * (0.045 + 0.03 * R.next());
        wrapped(ctx, S, () => {
          ctx.fillStyle = b; blob(ctx, x, y, r, HSC.rng(i + 5), 7);
          ctx.fillStyle = mix(a, b, 0.35); blob(ctx, x, y, r * 0.55, HSC.rng(i + 9), 6);
        });
      }
    },
    zebra(ctx, S, a, b) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); ctx.fillStyle = b;
      for (let i = 0; i < 7; i++) {
        const x0 = (i / 7) * S;
        ctx.beginPath(); ctx.moveTo(x0, 0);
        for (let y = 0; y <= S; y += S / 16) ctx.lineTo(x0 + Math.sin((y / S) * Math.PI * 2 + i) * S * 0.04, y);
        for (let y = S; y >= 0; y -= S / 16) ctx.lineTo(x0 + S * 0.055 + Math.sin((y / S) * Math.PI * 2 + i + 0.8) * S * 0.05, y);
        ctx.closePath(); ctx.fill();
      }
    },
    'diamond-plate'(ctx, S, a, b) {
      const g = ctx.createLinearGradient(0, 0, S, S); g.addColorStop(0, shade(a, 0.15)); g.addColorStop(1, shade(a, -0.15));
      ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
      const n = 8, c = S / n;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        ctx.save(); ctx.translate(x * c + c / 2, y * c + c / 2); ctx.rotate(((x + y) % 2 ? 1 : -1) * Math.PI / 4);
        ctx.fillStyle = shade(b, 0.3); ctx.fillRect(-c * 0.32, -c * 0.07, c * 0.64, c * 0.14);
        ctx.fillStyle = shade(b, -0.3); ctx.fillRect(-c * 0.32, c * 0.03, c * 0.64, c * 0.04);
        ctx.restore();
      }
    },
    houndstooth(ctx, S, a, b) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); ctx.fillStyle = b;
      const n = 6, c = S / n;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const ox = x * c, oy = y * c, q = c / 4;
        ctx.beginPath();
        ctx.moveTo(ox, oy + 2 * q); ctx.lineTo(ox + 2 * q, oy); ctx.lineTo(ox + 3 * q, oy); ctx.lineTo(ox + 2 * q, oy + q);
        ctx.lineTo(ox + 4 * q, oy + q); ctx.lineTo(ox + 2 * q, oy + 3 * q); ctx.lineTo(ox + 2 * q, oy + 4 * q); ctx.lineTo(ox + q, oy + 4 * q);
        ctx.lineTo(ox + q, oy + 3 * q); ctx.lineTo(ox, oy + 4 * q);
        ctx.closePath(); ctx.fill();
      }
    },
    argyle(ctx, S, a, b) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S);
      const n = 2, w = S / n, h = S / n;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        ctx.fillStyle = (x + y) % 2 ? b : mix(a, b, 0.4);
        ctx.beginPath(); ctx.moveTo(x * w + w / 2, y * h); ctx.lineTo(x * w + w, y * h + h / 2); ctx.lineTo(x * w + w / 2, y * h + h); ctx.lineTo(x * w, y * h + h / 2); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = '#f2efe6'; ctx.lineWidth = Math.max(1, S / 160); ctx.setLineDash([S / 40, S / 40]);
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * w, 0); ctx.lineTo(i * w + S, S); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i * w + S, 0); ctx.lineTo(i * w, S); ctx.stroke(); }
      ctx.setLineDash([]);
    },
    waves(ctx, S, a, b) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); ctx.strokeStyle = b; ctx.lineWidth = S / 40;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        for (let x = 0; x <= S; x += S / 32) { const y = (i + 0.5) * (S / 6) + Math.sin((x / S) * Math.PI * 4) * S / 30; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
      }
    },
    'barber-pole'(ctx, S, a, b) {
      ctx.fillStyle = '#f2efe6'; ctx.fillRect(0, 0, S, S);
      const cols = [a, '#f2efe6', b, '#f2efe6'], w = S / 4;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, S, S); ctx.clip();
      for (let i = -4; i < 8; i++) {
        ctx.fillStyle = cols[((i % 4) + 4) % 4];
        ctx.beginPath(); ctx.moveTo(i * w, 0); ctx.lineTo(i * w + w, 0); ctx.lineTo(i * w + w - S, S); ctx.lineTo(i * w - S, S); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    },
    floral(ctx, S, a, b, R) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S);
      for (let i = 0; i < 12; i++) {
        const x = R.next() * S, y = R.next() * S, r = S * (0.06 + 0.025 * R.next()), rot = R.next() * 6;
        wrapped(ctx, S, () => {
          ctx.fillStyle = b;
          for (let k = 0; k < 5; k++) { const ang = rot + (k / 5) * Math.PI * 2; ctx.beginPath(); ctx.ellipse(x + Math.cos(ang) * r, y + Math.sin(ang) * r, r * 0.75, r * 0.45, ang, 0, 7); ctx.fill(); }
          ctx.fillStyle = lum(b) > 0.5 ? shade(b, -0.5) : '#f6d44a'; ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, 7); ctx.fill();
        });
      }
    },
    palms(ctx, S, a, b, R) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); ctx.fillStyle = b;
      for (let i = 0; i < 9; i++) {
        const x = R.next() * S, y = R.next() * S, s = S * (0.12 + 0.04 * R.next()), rot = R.next() * 6;
        wrapped(ctx, S, () => {
          for (let k = 0; k < 7; k++) {
            const ang = rot + (k / 7) * Math.PI * 2;
            ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * 0.5, -s * 0.36, s, 0); ctx.quadraticCurveTo(s * 0.5, s * 0.2, 0, 0); ctx.fill();
            ctx.restore();
          }
        });
      }
    },
    scissors(ctx, S, a, b) {
      ctx.fillStyle = a; ctx.fillRect(0, 0, S, S); ctx.strokeStyle = b; ctx.fillStyle = b; ctx.lineWidth = Math.max(3, S / 30);
      const n = 4, c = S / n;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        ctx.save(); ctx.translate(x * c + c / 2 + (y % 2 ? c / 2 : 0), y * c + c / 2); ctx.rotate(y % 2 ? 0.6 : -0.6);
        const s = c * 0.44;
        ctx.beginPath(); ctx.arc(-s * 0.45, s * 0.55, s * 0.26, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.arc(s * 0.45, s * 0.55, s * 0.26, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-s * 0.4, s * 0.38); ctx.lineTo(s * 0.2, -s * 0.85); ctx.lineTo(-s * 0.02, -s * 0.85); ctx.lineTo(-s * 0.18, s * 0.38); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(s * 0.4, s * 0.38); ctx.lineTo(-s * 0.2, -s * 0.85); ctx.lineTo(s * 0.02, -s * 0.85); ctx.lineTo(s * 0.18, s * 0.38); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    },
  };

  HSC.drawPattern = function (ctx, S, name, a, b, seed = 7) {
    const fn = P[name] || P.solid;
    ctx.save();
    ctx.clearRect(0, 0, S, S);
    fn(ctx, S, a, b, HSC.rng(seed));
    ctx.restore();
  };
  HSC.colourTools = { hexRgb, rgbHex, shade, mix, lum };
})(globalThis.HSC || (globalThis.HSC = {}));
