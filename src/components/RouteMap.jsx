// Leaflet map (OpenStreetMap tiles). Shows only confirmed city checkpoints, never invented GPS.
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CITY } from '../lib/core.js';

export default function RouteMap({ spec, style }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const sigRef = useRef(null);
  const specRef = useRef(spec);
  specRef.current = spec;

  useEffect(() => {
    const el = elRef.current;
    const m = L.map(el, { scrollWheelZoom: !!spec.wheel, worldCopyJump: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(m);
    m.setView([44, 76], 3);
    mapRef.current = m;
    layerRef.current = L.layerGroup().addTo(m);
    const ro = new ResizeObserver(() => { m.invalidateSize(); });
    ro.observe(el);
    const t = setTimeout(() => { m.invalidateSize(); sigRef.current = null; draw(); }, 150);
    draw();
    return () => { clearTimeout(t); ro.disconnect(); m.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { draw(); });

  function draw() {
    const m = mapRef.current, sp = specRef.current, el = elRef.current;
    if (!m || !sp || !el || !el.clientWidth || !el.clientHeight) return;
    const sig = JSON.stringify(sp.routes.map(r => [r.id, r.conf, r.sel, r.dim, r.label, r.names]));
    if (sig === sigRef.current) return;
    sigRef.current = sig;
    const g = layerRef.current;
    g.clearLayers();
    const all = [];
    sp.routes.forEach(r => {
      const pts = r.names.map(c => CITY[c]).filter(Boolean);
      if (pts.length < 1) return;
      const op = r.dim ? .22 : 1;
      const done = pts.slice(0, r.conf + 1), rest = pts.slice(r.conf);
      if (done.length > 1) L.polyline(done, { color: '#553FE9', weight: r.sel ? 4 : 3, opacity: op }).addTo(g);
      if (rest.length > 1) L.polyline(rest, { color: '#7C7C92', weight: 2, dashArray: '6 7', opacity: op }).addTo(g);
      pts.forEach((pt, i) => {
        if (i === r.conf) return;
        const o = i === 0, dd = i === pts.length - 1;
        L.circleMarker(pt, { radius: o || dd ? 5 : 4, color: dd ? '#151536' : '#553FE9', weight: 2, fillColor: dd ? '#151536' : '#fff', fillOpacity: op, opacity: op })
          .bindTooltip(r.names[i] + (o ? ' · отправление' : dd ? ' · назначение' : ' · транзит'), { direction: 'top' }).addTo(g);
      });
      const c = L.circleMarker(pts[r.conf], { radius: r.sel ? 9 : 7, color: '#fff', weight: 3, fillColor: r.done ? '#22B856' : '#553FE9', fillOpacity: op, opacity: op })
        .bindTooltip('<b>' + r.id + '</b> · ' + r.label, { direction: 'top', permanent: !!r.sel, offset: [0, -6] }).addTo(g);
      c.on('click', () => specRef.current.onPick && specRef.current.onPick(r.id));
      if (!sp.hasSel || r.sel) all.push(...pts);
    });
    if (all.length) {
      const b = L.latLngBounds(all);
      const z = m.getBoundsZoom(b, false, L.point(80, 80));
      if (isFinite(z)) m.setView(b.getCenter(), Math.max(2, Math.min(6, z)));
    }
  }

  return <div ref={elRef} style={{ borderRadius: 10, overflow: 'hidden', background: 'var(--ink-100)', position: 'relative', zIndex: 0, ...style }} />;
}
