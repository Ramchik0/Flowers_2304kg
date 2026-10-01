/* Генератор SVG-цветов: глянцевые лепестки, как у изделий из изолона и фоамирана. */
(function () {
  let uid = 0;

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  // amt < 0 — темнее, amt > 0 — светлее
  function shade(hex, amt) {
    const [r, g, b] = hexToRgb(hex);
    const t = amt < 0 ? 0 : 255;
    const p = Math.abs(amt);
    const mix = c => Math.round((t - c) * p + c);
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
  }

  function petalPath(w, l, s) {
    switch (s) {
      case 'round':
        return `M0,0 C${w * 1.2},${-l * .25} ${w * 1.1},${-l} 0,${-l} C${-w * 1.1},${-l} ${-w * 1.2},${-l * .25} 0,0Z`;
      case 'wide':
        return `M0,0 C${w * 1.3},${-l * .1} ${w * 1.2},${-l * 1.05} 0,${-l} C${-w * 1.2},${-l * 1.05} ${-w * 1.3},${-l * .1} 0,0Z`;
      case 'ruffle':
        return `M0,0 C${w},${-l * .2} ${w * 1.15},${-l * .8} ${w * .5},${-l * .97} Q${w * .25},${-l * .86} 0,${-l} Q${-w * .25},${-l * .86} ${-w * .5},${-l * .97} C${-w * 1.15},${-l * .8} ${-w},${-l * .2} 0,0Z`;
      default: // pointed
        return `M0,0 C${w},${-l * .3} ${w * .6},${-l * .8} 0,${-l} C${-w * .6},${-l * .8} ${-w},${-l * .3} 0,0Z`;
    }
  }

  const SHAPES = {
    rose: {
      layers: [
        { n: 5, w: 46, l: 98, s: 'round' },
        { n: 5, w: 40, l: 80, s: 'round', off: 36 },
        { n: 5, w: 32, l: 60, s: 'round', off: 10 },
        { n: 4, w: 24, l: 40, s: 'round', off: 50 },
        { n: 3, w: 16, l: 24, s: 'round', off: 20 }
      ], center: 'none'
    },
    peony: {
      layers: [
        { n: 8, w: 40, l: 100, s: 'ruffle' },
        { n: 8, w: 36, l: 84, s: 'ruffle', off: 22 },
        { n: 7, w: 30, l: 66, s: 'ruffle', off: 8 },
        { n: 6, w: 24, l: 46, s: 'ruffle', off: 30 },
        { n: 5, w: 16, l: 28, s: 'ruffle', off: 12 }
      ], center: 'none'
    },
    poppy: {
      layers: [
        { n: 4, w: 82, l: 100, s: 'wide' },
        { n: 4, w: 70, l: 84, s: 'wide', off: 45 }
      ], center: 'poppy'
    },
    dahlia: {
      layers: [
        { n: 14, w: 26, l: 100, s: 'pointed' },
        { n: 13, w: 24, l: 86, s: 'pointed', off: 13 },
        { n: 12, w: 21, l: 70, s: 'pointed', off: 5 },
        { n: 10, w: 18, l: 53, s: 'pointed', off: 17 },
        { n: 8, w: 15, l: 36, s: 'pointed', off: 8 },
        { n: 6, w: 11, l: 22, s: 'pointed', off: 30 }
      ], center: 'dot'
    },
    lily: {
      layers: [
        { n: 3, w: 32, l: 100, s: 'pointed' },
        { n: 3, w: 30, l: 94, s: 'pointed', off: 60 }
      ], center: 'stamen'
    },
    lotus: {
      layers: [
        { n: 8, w: 28, l: 100, s: 'pointed' },
        { n: 8, w: 26, l: 80, s: 'pointed', off: 22 },
        { n: 6, w: 22, l: 58, s: 'pointed', off: 8 }
      ], center: 'lotus'
    }
  };

  function center(type, color, id) {
    if (type === 'poppy') {
      let s = `<circle r="20" fill="#1b1016"/>`;
      for (let i = 0; i < 18; i++) {
        const a = i * 20 * Math.PI / 180;
        s += `<line x1="0" y1="0" x2="${Math.cos(a) * 34}" y2="${Math.sin(a) * 34}" stroke="#1b1016" stroke-width="2.5" stroke-linecap="round"/><circle cx="${Math.cos(a) * 34}" cy="${Math.sin(a) * 34}" r="3.4" fill="#1b1016"/>`;
      }
      return s + `<circle r="11" fill="#3d5a3a"/>`;
    }
    if (type === 'stamen' || type === 'dot') {
      let s = `<circle r="${type === 'dot' ? 14 : 8}" fill="url(#c${id})" class="core"/>`;
      const count = type === 'dot' ? 10 : 6;
      const len = type === 'dot' ? 22 : 46;
      for (let i = 0; i < count; i++) {
        const a = (i * 360 / count + 15) * Math.PI / 180;
        const x = Math.cos(a) * len, y = Math.sin(a) * len;
        s += `<line x1="0" y1="0" x2="${x}" y2="${y}" stroke="${shade(color, .55)}" stroke-width="1.5" opacity=".8"/><circle cx="${x}" cy="${y}" r="${type === 'dot' ? 3.5 : 4.5}" fill="url(#b${id})"/>`;
      }
      return s;
    }
    if (type === 'lotus') {
      let s = `<circle r="18" fill="#e7c55a" class="core"/>`;
      for (let i = 0; i < 9; i++) {
        const a = i * 40 * Math.PI / 180;
        s += `<circle cx="${Math.cos(a) * 9}" cy="${Math.sin(a) * 9}" r="2.4" fill="#a8862a"/>`;
      }
      return s;
    }
    return `<circle r="6" fill="${shade(color, -.45)}" class="core"/>`;
  }

  /**
   * opts: { color, shape, bloom (bool), className }
   */
  function makeFlower(opts) {
    const id = ++uid;
    const color = opts.color || '#E2392B';
    const def = SHAPES[opts.shape] || SHAPES.rose;
    const deep = shade(color, -.3);
    const tip = shade(color, .18);

    let petals = '';
    let delay = 0;
    def.layers.forEach((L, li) => {
      for (let i = 0; i < L.n; i++) {
        const rot = (360 / L.n) * i + (L.off || 0);
        const d = petalPath(L.w, L.l, L.s);
        const gloss = `M${-L.w * .18},${-L.l * .2} C${-L.w * .32},${-L.l * .5} ${-L.w * .18},${-L.l * .78} ${-L.w * .02},${-L.l * .86}`;
        petals += `<g class="petal" style="--r:${rot}deg;--d:${delay}ms">` +
          `<path d="${d}" fill="url(#g${id})" stroke="${shade(color, .45)}" stroke-opacity=".55" stroke-width="1"/>` +
          `<path d="M0,${-L.l * .12} L0,${-L.l * .7}" stroke="${deep}" stroke-opacity=".28" stroke-width="1.2" fill="none"/>` +
          `<path d="${gloss}" stroke="#fff" stroke-opacity=".45" stroke-width="${Math.max(1.5, L.w * .08)}" stroke-linecap="round" fill="none"/>` +
          `</g>`;
        delay += li === 0 ? 28 : 22;
      }
    });

    return `<svg class="flower ${opts.bloom ? 'bloom' : ''} ${opts.className || ''}" viewBox="-115 -115 230 230" aria-hidden="true">
      <defs>
        <radialGradient id="g${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="105">
          <stop offset="0" stop-color="${deep}"/>
          <stop offset=".45" stop-color="${color}"/>
          <stop offset="1" stop-color="${tip}"/>
        </radialGradient>
        <radialGradient id="c${id}"><stop offset="0" stop-color="#fff6d8"/><stop offset="1" stop-color="#d9a441"/></radialGradient>
        <radialGradient id="b${id}" cx=".35" cy=".35"><stop offset="0" stop-color="#fff8e1"/><stop offset=".5" stop-color="#d8b25a"/><stop offset="1" stop-color="#8a6a22"/></radialGradient>
        <radialGradient id="l${id}"><stop offset="0" stop-color="#fff1c2" stop-opacity=".95"/><stop offset=".5" stop-color="#ffd27a" stop-opacity=".35"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
      </defs>
      <g class="petals">${petals}</g>
      <circle class="lamp" r="70" fill="url(#l${id})"/>
      <g class="center">${center(def.center, color, id)}</g>
    </svg>`;
  }

  window.Flower = { make: makeFlower, shade, shapes: Object.keys(SHAPES) };
})();
