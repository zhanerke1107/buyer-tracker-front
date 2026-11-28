// Domain constants, formatting helpers, demo data and derived selectors.
export const LS = 'buyertrack.proto.v1';
export const DAY = 864e5;

export const STAGES = ['Заказ оформлен', 'Ожидает отправки', 'Передан перевозчику', 'Отправлен из страны покупки', 'В транзите', 'Прибыл в Казахстан', 'Внутренняя доставка', 'Доставлен клиенту'];

export const CITY = { 'Гуанчжоу': [23.13, 113.26], 'Иу': [29.31, 120.07], 'Пекин': [39.9, 116.4], 'Урумчи': [43.83, 87.62], 'Хоргос': [44.21, 80.41], 'Стамбул': [41.01, 28.98], 'Баку': [40.41, 49.87], 'Актау': [43.65, 51.17], 'Сеул': [37.57, 126.98], 'Инчхон': [37.46, 126.44], 'Алматы': [43.24, 76.89], 'Астана': [51.17, 71.43], 'Шымкент': [42.32, 69.59], 'Караганда': [49.81, 73.1], 'Атырау': [47.09, 51.92], 'Доха': [25.29, 51.53], 'Мадрид': [40.42, -3.70], 'Барселона': [41.39, 2.17], 'Лондон': [51.51, -0.13], 'Манчестер': [53.48, -2.24], 'Дубай': [25.20, 55.27], 'Абу-Даби': [24.45, 54.38] };

export const COUNTRIES = { 'Китай': ['Гуанчжоу', 'Иу', 'Пекин'], 'Турция': ['Стамбул'], 'Корея': ['Сеул', 'Инчхон'], 'Катар': ['Доха'], 'Испания': ['Мадрид', 'Барселона'], 'Великобритания': ['Лондон', 'Манчестер'], 'ОАЭ': ['Дубай', 'Абу-Даби'], 'Казахстан': ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актау', 'Атырау'] };

// Carrier adapters: api:false → manual tracking. Real integrations plug in server-side (never on client).
export const CARRIERS = [{ id: 'cargo', name: 'Карго-перевозчик', api: false }, { id: 'kazpost', name: 'Казпочта', api: false }, { id: 'dhl', name: 'DHL Express', api: false }, { id: 'fedex', name: 'FedEx', api: false }, { id: 'ups', name: 'UPS', api: false }, { id: 'other', name: 'Другой', api: false }];

export const cName = id => (CARRIERS.find(c => c.id === id) || { name: id || '—' }).name;
export const countryOf = c => { for (const k in COUNTRIES) if (COUNTRIES[k].includes(c)) return k; return ''; };
export const buildRoute = (o, d) => {
  const c = countryOf(o); const r = [o];
  if (c === 'Китай') r.push('Урумчи', 'Хоргос', 'Алматы');
  else if (c === 'Турция') r.push('Баку', 'Актау');
  else if (c === 'Корея') r.push('Инчхон', 'Алматы');
  else if (c === 'Испания' || c === 'Великобритания') r.push('Стамбул', 'Алматы'); // air cargo via Istanbul hub
  else if (c === 'Катар' || c === 'ОАЭ') r.push('Алматы'); // direct flight
  r.push(d);
  return r.filter((x, i) => r.indexOf(x) === i);
};
export const tone = s => s >= 7 ? { bg: 'var(--green-100)', dot: 'var(--green-500)' } : s >= 5 ? { bg: 'var(--mint-100)', dot: 'var(--teal-500)' } : s >= 2 ? { bg: 'var(--violet-50)', dot: 'var(--violet-500)' } : { bg: 'var(--ink-100)', dot: 'var(--ink-400)' };
export const pill = s => Object.assign({ label: STAGES[s] }, tone(s));
export const money = n => Math.round(+n || 0).toLocaleString('ru-RU') + ' ₸';
export const fd = ts => new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
export const fdt = ts => fd(ts) + ', ' + new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
export const isoTs = iso => iso ? new Date(iso + 'T00:00:00').getTime() : null;
export const rel = ts => { const m = Math.round((Date.now() - ts) / 6e4); if (m < 1) return 'только что'; if (m < 60) return m + ' мин назад'; const h = Math.round(m / 60); if (h < 24) return h + ' ч назад'; const d = Math.round(h / 24); return d === 1 ? 'вчера' : d + ' дн. назад'; };
export const etaRel = iso => { if (!iso) return ''; const t = new Date(); t.setHours(0, 0, 0, 0); const d = Math.round((isoTs(iso) - t.getTime()) / DAY); if (d === 0) return 'сегодня'; if (d === 1) return 'завтра'; if (d > 1) return 'через ' + d + ' дн.'; return 'просрочено на ' + (-d) + ' дн.'; };
export const token = () => { const a = new Uint8Array(10); crypto.getRandomValues(a); return Array.from(a, b => b.toString(36).padStart(2, '0')).join('').slice(0, 16); };
export const nextNum = (ids, start) => { let m = start - 1; ids.forEach(x => { const n = parseInt(String(x).replace(/\D/g, ''), 10); if (n > m) m = n; }); return m + 1; };
export const toLocalInput = ts => { const x = new Date(ts); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };

export function readImage(file, cb, max) {
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, (max || 480) / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', .82));
    };
    img.src = r.result;
  };
  r.readAsDataURL(file);
}

export function seed() {
  const n = Date.now();
  const t = (d, h) => { const x = new Date(n - d * DAY); x.setHours(h == null ? 10 : h, 15, 0, 0); return Math.min(x.getTime(), n - 6e5); };
  const f = d => { const x = new Date(n + d * DAY); return x.toISOString().slice(0, 10); };
  const P = { tan: 'assets/sneaker-tan.png', blue: 'assets/sneaker-blue.png', red: 'assets/sneaker-red.png', white: 'assets/sneaker-white.png', cam: 'assets/camera.png' };
  const O = (id, c, co, oc, dc, cr, eta, base, sup, cont) => ({ id, clientId: c, originCountry: co, originCity: oc, destCity: dc, createdAt: t(cr), eta: f(eta), baseStage: base, supplier: sup, supplierContact: cont, notes: '', archived: false, token: token(), files: [] });
  const I = (id, o, c, name, qty, price, photo, sh) => ({ id, orderId: o, clientId: c, name, qty, price, photo: photo || null, shipmentId: sh || null });
  const E = (stage, city, at, note) => ({ stage, city, at, note: note || '' });
  const S = (id, carrier, track, o, d, stage, eta, ev) => ({ id, carrier, track, originCity: o, destCity: d, route: buildRoute(o, d), stage, eta: f(eta), delayed: false, createdAt: ev[0].at, events: ev });
  return {
    demo: true,
    clients: [{ id: 'C-01', name: 'Айгерим Сапарова', phone: '+7 701 000 00 01', city: 'Алматы' }, { id: 'C-02', name: 'Данияр Ахметов', phone: '+7 701 000 00 02', city: 'Астана' }, { id: 'C-03', name: 'Мадина Ким', phone: '+7 701 000 00 03', city: 'Алматы' }, { id: 'C-04', name: 'Ержан Тулегенов', phone: '+7 701 000 00 04', city: 'Шымкент' }, { id: 'C-05', name: 'Алина Ли', phone: '+7 701 000 00 05', city: 'Караганда' }],
    orders: [O('BT-1038', 'C-02', 'Корея', 'Сеул', 'Астана', 16, -8, 1, 'Демо-поставщик · Сеул', '—'), O('BT-1041', 'C-01', 'Китай', 'Гуанчжоу', 'Алматы', 9, 4, 1, 'Демо-поставщик · рынок Байюнь', 'WeChat: demo_gz'), O('BT-1042', 'C-02', 'Китай', 'Иу', 'Астана', 8, 6, 1, 'Демо-поставщик · Иу', 'WeChat: demo_yw'), O('BT-1043', 'C-03', 'Корея', 'Сеул', 'Алматы', 6, 1, 1, 'Демо-поставщик · Тондэмун', 'KakaoTalk: demo_kr'), O('BT-1044', 'C-04', 'Турция', 'Стамбул', 'Шымкент', 14, -2, 1, 'Демо-поставщик · Лалели', 'WhatsApp: demo_tr'), O('BT-1045', 'C-05', 'Казахстан', 'Алматы', 'Караганда', 3, 2, 1, 'Демо-шоурум · Алматы', '—'), O('BT-1046', 'C-01', 'Китай', 'Гуанчжоу', 'Алматы', 2, 14, 1, 'Демо-поставщик · рынок Байюнь', 'WeChat: demo_gz'), O('BT-1047', 'C-03', 'Турция', 'Стамбул', 'Алматы', 1, 18, 0, 'Демо-поставщик · Лалели', 'WhatsApp: demo_tr')],
    items: [I('IT-0101', 'BT-1038', 'C-02', 'Кроссовки белые', 1, 38900, P.white, 'SH-299'), I('IT-0102', 'BT-1041', 'C-01', 'Кроссовки замшевые, бежевые', 2, 21500, P.tan, 'SH-301'), I('IT-0103', 'BT-1042', 'C-02', 'Кроссовки беговые, синие', 1, 18900, P.blue, 'SH-301'), I('IT-0104', 'BT-1042', 'C-02', 'Рюкзак городской, чёрный', 1, 12400, null, 'SH-302'), I('IT-0105', 'BT-1043', 'C-03', 'Плёночная камера', 1, 64000, P.cam, 'SH-305'), I('IT-0106', 'BT-1044', 'C-04', 'Кеды кожаные, красные', 3, 16700, P.red, 'SH-306'), I('IT-0107', 'BT-1045', 'C-05', 'Кроссовки белые', 1, 27500, P.white, 'SH-307'), I('IT-0108', 'BT-1046', 'C-01', 'Платье льняное', 2, 9800, null, null), I('IT-0109', 'BT-1046', 'C-01', 'Ремень кожаный', 1, 6500, null, null), I('IT-0110', 'BT-1047', 'C-03', 'Сумка кожаная, коньячная', 1, 42000, null, null)],
    shipments: [
      S('SH-299', 'dhl', 'DEMO-1Z-48210', 'Сеул', 'Астана', 7, -8, [E(1, 'Сеул', t(15)), E(2, 'Сеул', t(14)), E(3, 'Инчхон', t(13)), E(5, 'Алматы', t(12)), E(6, 'Алматы', t(11)), E(7, 'Астана', t(9), 'Получено клиентом')]),
      S('SH-301', 'cargo', 'DEMO-GZ-55812', 'Гуанчжоу', 'Алматы', 4, 4, [E(1, 'Гуанчжоу', t(7)), E(2, 'Гуанчжоу', t(6)), E(3, 'Гуанчжоу', t(5)), E(4, 'Урумчи', t(3)), E(4, 'Хоргос', t(0, 9), 'Ожидает таможенного оформления')]),
      S('SH-302', 'kazpost', 'DEMO-RR-30917', 'Иу', 'Астана', 2, 6, [E(1, 'Иу', t(4)), E(2, 'Иу', t(2))]),
      S('SH-305', 'dhl', 'DEMO-1Z-77104', 'Сеул', 'Алматы', 5, 1, [E(1, 'Сеул', t(5)), E(2, 'Сеул', t(4)), E(3, 'Инчхон', t(3)), E(5, 'Алматы', t(0, 7), 'Таможенное оформление')]),
      S('SH-306', 'cargo', 'DEMO-IST-2204', 'Стамбул', 'Шымкент', 4, -2, [E(1, 'Стамбул', t(13)), E(2, 'Стамбул', t(12)), E(3, 'Стамбул', t(11)), E(4, 'Баку', t(7))]),
      S('SH-307', 'kazpost', 'DEMO-KZ-88410', 'Алматы', 'Караганда', 6, 2, [E(1, 'Алматы', t(2)), E(2, 'Алматы', t(1)), E(6, 'Алматы', t(0, 8))]),
      S('SH-308', 'cargo', '', 'Гуанчжоу', 'Алматы', 1, 14, [E(1, 'Гуанчжоу', t(1), 'Посылка формируется на складе')])],
  };
}

export const empty = () => ({ demo: false, clients: [], orders: [], items: [], shipments: [] });

export function derive(d) {
  const S = {}, CL = {}, now = Date.now();
  d.clients.forEach(c => CL[c.id] = c);
  const ships = d.shipments.map(s => {
    const ev = (s.events || []).slice().sort((a, b) => a.at - b.at);
    const last = ev[ev.length - 1];
    const etaT = s.eta ? isoTs(s.eta) + DAY - 1 : null;
    const overdue = etaT && s.stage < 7 && etaT < now;
    const stale = s.stage >= 2 && s.stage < 7 && last && now - last.at > 5 * DAY;
    const reason = s.stage >= 7 ? '' : s.delayed ? 'Отмечена задержка' : overdue ? 'Срок прибытия прошёл' : stale ? 'Нет обновлений ' + Math.floor((now - last.at) / DAY) + ' дн.' : '';
    const lastCity = last ? last.city : s.originCity;
    const conf = s.stage >= 7 ? s.route.length - 1 : Math.max(0, s.route.indexOf(lastCity));
    const items = d.items.filter(i => i.shipmentId === s.id);
    const x = Object.assign({}, s, { events: ev, last, lastCity, lastAt: last ? last.at : s.createdAt, attention: !!reason, reason, conf, items, clientIds: [...new Set(items.map(i => i.clientId))] });
    x.clientsStr = x.clientIds.map(id => (CL[id] || { name: '—' }).name).join(', ');
    S[s.id] = x;
    return x;
  });
  const orders = d.orders.map(o => {
    const its = d.items.filter(i => i.orderId === o.id);
    const sh = [...new Set(its.map(i => i.shipmentId).filter(x => x && S[x]))].map(x => S[x]);
    const stage = its.length ? Math.min(...its.map(i => i.shipmentId && S[i.shipmentId] ? S[i.shipmentId].stage : o.baseStage)) : o.baseStage;
    const att = sh.find(x => x.attention);
    const etas = sh.map(x => x.eta).filter(Boolean).sort();
    const ph = its.find(i => i.photo);
    const c = CL[o.clientId] || { name: '—', phone: '', city: '' };
    return Object.assign({}, o, {
      items: its, ships: sh, stage, unassigned: its.filter(i => !i.shipmentId).length, attention: stage < 7 && !!att, reason: att ? att.reason : '',
      carrier: sh.length === 0 ? 'Не назначен' : sh.length === 1 ? cName(sh[0].carrier) : sh.length + ' отправления', carrierIds: sh.map(x => x.carrier),
      track: sh.length === 0 ? '—' : sh.length === 1 ? (sh[0].track || 'Без трека') : sh.map(x => x.track || x.id).join(', '),
      eta: etas.length ? etas[etas.length - 1] : o.eta, title: its[0] ? its[0].name : 'Без товаров', more: its.length > 1 ? '+ ещё ' + (its.length - 1) + ' тов.' : '',
      qty: its.reduce((a, i) => a + (+i.qty || 0), 0), total: its.reduce((a, i) => a + (+i.qty || 0) * (+i.price || 0), 0), photo: ph ? ph.photo : null, clientName: c.name, client: c,
    });
  }).sort((a, b) => b.createdAt - a.createdAt);
  return { S, ships, orders, CL };
}

export function steps(stage, evs) {
  return STAGES.map((l, i) => {
    const e = evs.filter(x => x.stage === i).sort((a, b) => a.at - b.at)[0];
    const on = i <= stage;
    return { label: l, at: e ? fdt(e.at) : '', dot: on ? 'var(--violet-500)' : '#fff', ring: on ? 'var(--violet-500)' : 'var(--ink-300)', fg: on ? 'var(--ink-900)' : 'var(--ink-500)', fw: i === stage ? 600 : 400, line: i < stage ? 'var(--violet-500)' : 'var(--ink-200)', showLine: i < 7, cur: i === stage };
  });
}
