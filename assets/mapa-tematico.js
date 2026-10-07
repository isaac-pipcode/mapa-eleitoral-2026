/* Módulo comum dos mapas temáticos (perfis, mudança, abstenção, Rio, indicadores).
 *
 * Os geradores emitem só os DADOS no HTML; o comportamento fica aqui e em
 * assets/paineis/<painel>.js. Assim uma regeração não desfaz a UX.
 *
 *   const M = MT.mapa('map', {malha:'malha_uf.json', limites:[[s,o],[n,l]]});
 *   const E = MT.escala(valores, {fmt, cortes?, inverso?});
 *   M.legenda({titulo, escala:E, tamanho:'eleitores', extras:[...]});
 *   MT.lista(el, itens, {render, aoEscolher, selecionado});
 */
(function () {
  'use strict';
  const reduzMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Sequencial de um matiz (claro → escuro), validado contra o fundo claro do mapa.
  const PALETA = ['#b7d3f6', '#6da7ec', '#2a78d6', '#1c5cab', '#0d366b'];
  const COR_DESTAQUE = '#b45309';

  function quantil(ord, p) {
    if (!ord.length) return NaN;
    const i = (ord.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
    return ord[lo] + (ord[hi] - ord[lo]) * (i - lo);
  }
  function arredonda(v) {
    if (!isFinite(v) || v === 0) return v;
    const a = Math.abs(v), d = a >= 100 ? 0 : a >= 10 ? 1 : a >= 1 ? 2 : 3;
    return +v.toFixed(d);
  }

  /* Classes por quintis (padrão) ou cortes fixos. inverso: valor pequeno = cor escura. */
  function escala(valores, op) {
    op = op || {};
    const fmt = op.fmt || (v => v.toLocaleString('pt-BR'));
    const s = valores.filter(v => v != null && isFinite(v)).sort((a, b) => a - b);
    let cortes = op.cortes || [0.2, 0.4, 0.6, 0.8].map(p => arredonda(quantil(s, p)));
    cortes = cortes.filter((v, i, a) => isFinite(v) && (!i || v > a[i - 1]));
    let cores = PALETA.slice(PALETA.length - cortes.length - 1);
    if (op.inverso) cores = cores.slice().reverse();
    const classe = v => { let i = 0; while (i < cortes.length && v >= cortes[i]) i++; return i; };
    const classes = cores.map((cor, i) => ({ cor, n: 0, de: i ? cortes[i - 1] : null, ate: i < cortes.length ? cortes[i] : null }));
    s.forEach(v => classes[classe(v)].n++);
    classes.forEach(c => {
      c.rot = c.de == null ? (c.ate == null ? 'todos' : `abaixo de ${fmt(c.ate)}`)
        : c.ate == null ? `${fmt(c.de)} ou mais` : `${fmt(c.de)} a ${fmt(c.ate)}`;
    });
    return { cor: v => v == null || !isFinite(v) ? '#c9ced6' : cores[classe(v)], classes, quintis: !op.cortes };
  }

  /* Raio proporcional à raiz (área ∝ valor). */
  function raio(v, max, rMin, rMax) {
    return Math.max(rMin, Math.min(rMax, rMin + (rMax - rMin) * Math.sqrt(Math.max(0, v) / (max || 1))));
  }

  function debounce(fn, ms) {
    let t;
    return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(() => fn.apply(c, a), ms || 180); };
  }

  function anuncia(txt) {
    const a = document.getElementById('anuncio');
    if (!a) return;
    a.textContent = '';
    setTimeout(() => { a.textContent = txt; }, 40);
  }

  /* ---------------------------------------------------------------- mapa */
  function mapa(id, op) {
    op = op || {};
    const el = document.getElementById(id);
    const map = L.map(el, { preferCanvas: true, zoomSnap: 0.25, minZoom: op.minZoom || 3, maxBounds: op.maxLimites, maxBoundsViscosity: 0.8 });
    map.attributionControl.setPrefix(false);
    map.attributionControl.addAttribution('Contornos: IBGE · Dados: TSE');
    const limites = L.latLngBounds(op.limites);
    map.fitBounds(limites);

    // fundo vetorial (malha do IBGE); também serve de coroplético quando o nível é estado/região
    const BASE = { color: '#b9c2ce', weight: 0.9, fillColor: '#eef2f7', fillOpacity: 1 };
    const areas = {};
    let fundo = null;
    const malhaPronta = !op.malha ? Promise.resolve(null) : fetch(op.malha).then(r => r.json()).then(M => {
      const fs = Object.keys(M).map(k => ({
        type: 'Feature', properties: { n: k },
        geometry: { type: 'MultiPolygon', coordinates: M[k].map(p => p.map(a => a.map(q => [q[1], q[0]]))) },
      }));
      fundo = L.geoJSON({ type: 'FeatureCollection', features: fs }, {
        style: BASE, interactive: true,
        onEachFeature: (f, l) => { areas[f.properties.n] = l; },
      }).addTo(map).bringToBack();
      return fundo;
    }).catch(() => null);

    /* Pinta as áreas da malha: cor(chave) → cor ou null (fica neutra). */
    function pintaAreas(cor, o) {
      o = o || {};
      return malhaPronta.then(() => {
        Object.keys(areas).forEach(k => {
          const l = areas[k], c = cor(k);
          l.setStyle(c ? { fillColor: c, color: '#fff', weight: 1.2, fillOpacity: 1 } : BASE);
          l.off('click'); l.unbindTooltip();
          if (c && o.tooltip) l.bindTooltip(() => o.tooltip(k), { sticky: true, direction: 'top' });
          if (c && o.aoClicar) l.on('click', () => o.aoClicar(k, l));
        });
      });
    }
    function limpaAreas() { pintaAreas(() => null); }

    // "Ver tudo": volta ao enquadramento inicial
    const Ver = L.Control.extend({
      options: { position: 'topleft' },
      onAdd() {
        const b = L.DomUtil.create('button', 'mt-vertudo');
        b.type = 'button';
        b.title = 'Ver o mapa inteiro';
        b.setAttribute('aria-label', 'Ver o mapa inteiro');
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
        L.DomEvent.disableClickPropagation(b);
        b.onclick = () => { limpaDestaque(); map.closePopup(); voa(limites); };
        return b;
      },
    });
    new Ver().addTo(map);

    // legenda (controle Leaflet, recolhível)
    const Leg = L.Control.extend({
      options: { position: 'bottomleft' },
      onAdd() {
        const d = L.DomUtil.create('details', 'mt-legenda');
        d.open = innerWidth > 700;
        L.DomEvent.disableClickPropagation(d);
        L.DomEvent.disableScrollPropagation(d);
        return d;
      },
    });
    const leg = new Leg().addTo(map);

    function legenda(o) {
      const E = o.escala;
      let h = `<summary>Legenda<span class="mt-leg-tit">: ${esc(o.titulo)}</span></summary><div class="mt-leg-corpo">` +
        `<div class="mt-leg-titulo">${esc(o.titulo)}</div><ul>`;
      if (E) h += E.classes.map(c => `<li><i style="background:${c.cor}"></i>${esc(c.rot)}<span>${c.n.toLocaleString('pt-BR')}</span></li>`).join('');
      (o.extras || []).forEach(x => { h += `<li><i class="${x.classe || ''}" style="${x.estilo || ''}"></i>${esc(x.rot)}${x.n != null ? `<span>${x.n.toLocaleString('pt-BR')}</span>` : ''}</li>`; });
      h += '</ul>';
      if (o.tamanho) h += `<div class="mt-leg-tam"><i class="p"></i><i class="g"></i>área do círculo ∝ ${esc(o.tamanho)}</div>`;
      if (E && E.quintis) h += '<p>Classes por quintis dos itens exibidos: cada cor reúne cerca de 1/5 deles.</p>';
      if (o.nota) h += `<p>${esc(o.nota)}</p>`;
      h += '</div>';
      const aberto = leg.getContainer().open;
      leg.getContainer().innerHTML = h;
      leg.getContainer().open = aberto;
    }

    // destaque do item selecionado
    const anel = L.circleMarker([0, 0], { radius: 10, color: COR_DESTAQUE, weight: 3, fill: false, interactive: false });
    function limpaDestaque() { anel.remove(); }
    function destaca(m) {
      const r = (m.getRadius ? m.getRadius() : 8) + 5;
      anel.setLatLng(m.getLatLng()).setRadius(r).addTo(map).bringToFront();
    }
    function voa(alvo, zoom) {
      const anima = !reduzMovimento();
      if (alvo instanceof L.LatLngBounds) map.flyToBounds(alvo, { animate: anima, duration: 0.6, padding: [12, 12] });
      else map.flyTo(alvo, Math.max(map.getZoom(), zoom || 9), { animate: anima, duration: 0.6 });
    }
    function foca(m, zoom) {
      if (!m) return;
      voa(m.getLatLng(), zoom);
      const abre = () => { destaca(m); m.openPopup(); };
      if (reduzMovimento()) abre(); else map.once('moveend', abre);
    }

    // o contêiner muda de tamanho (layout flex, rotação do celular): recalcula
    if ('ResizeObserver' in window) new ResizeObserver(debounce(() => map.invalidateSize(), 100)).observe(el);
    setTimeout(() => map.invalidateSize(), 0);

    const camada = L.layerGroup().addTo(map);
    function limitesAreas(ks) {
      let b = null;
      ks.forEach(k => { const l = areas[k]; if (l) { const lb = l.getBounds(); b = b ? b.extend(lb) : L.latLngBounds(lb.getSouthWest(), lb.getNorthEast()); } });
      return b;
    }
    let areaSel = null;
    function focaArea(k) {
      const l = areas[k];
      if (!l) return;
      limpaDestaque();
      if (areaSel && areas[areaSel]) areas[areaSel].setStyle({ color: '#fff', weight: 1.2 });
      areaSel = k;
      voa(l.getBounds());
      l.setStyle({ color: COR_DESTAQUE, weight: 3 }).bringToFront();
    }
    return { map, camada, legenda, foca, destaca, limpaDestaque, limites, pintaAreas, limpaAreas, focaArea, limitesAreas, voa, malhaPronta };
  }

  /* ---------------------------------------------------------------- lista acessível */
  function lista(el, itens, op) {
    const passo = op.passo || 100;
    let n = Math.min(passo, itens.length);
    function desenha() {
      el.innerHTML = '';
      const ul = document.createElement('ul');
      ul.className = 'mt-lista';
      itens.slice(0, n).forEach((it, i) => {
        const r = op.render(it, i);
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'row';
        if (op.selecionado && op.selecionado(it)) b.setAttribute('aria-current', 'true');
        b.innerHTML = `<span class="mt-pos">${i + 1}</span><span class="mt-txt"><span class="nm">${r.nome}</span><span class="mt">${r.meta || ''}</span></span>` +
          `<span class="vl"><b>${r.valor}</b>${r.sub ? `<span class="mt">${r.sub}</span>` : ''}</span>`;
        b.onclick = () => {
          el.querySelectorAll('[aria-current]').forEach(x => x.removeAttribute('aria-current'));
          b.setAttribute('aria-current', 'true');
          op.aoEscolher(it);
        };
        li.appendChild(b);
        ul.appendChild(li);
      });
      el.appendChild(ul);
      if (n < itens.length) {
        const m = document.createElement('button');
        m.type = 'button';
        m.className = 'mt-mais';
        m.textContent = `Mostrar mais ${Math.min(passo, itens.length - n).toLocaleString('pt-BR')} (de ${(itens.length - n).toLocaleString('pt-BR')} restantes)`;
        m.onclick = () => { n = Math.min(itens.length, n + passo); desenha(); };
        el.appendChild(m);
      }
      if (!itens.length) el.innerHTML = `<p class="mt-vazio">${op.vazio || 'Nenhum item passa nos filtros.'}</p>`;
    }
    desenha();
  }

  // celular: a navegação rola na horizontal; mostra a aba do painel atual
  document.addEventListener('DOMContentLoaded', () => {
    const atual = document.querySelector('nav[aria-label="Painéis disponíveis"] [aria-current]');
    if (atual) atual.scrollIntoView({ inline: 'center', block: 'nearest' });
  });

  window.MT = { escala, raio, debounce, anuncia, mapa, lista, esc, quantil, PALETA, COR_DESTAQUE };
})();
