// View-model: turns raw state into ready-to-render values for every screen.
import * as B from './core.js';
import A from './actions.js';

const { STAGES, COUNTRIES, CARRIERS, cName, pill, money, fd, fdt, isoTs, rel, etaRel, DAY } = B;

const ev = e => e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
const seg = (self, opts, cur, key) => opts.map(([v, l]) => ({ label: l, active: cur === v, onClick: () => self.setState({ [key]: v }) }));
const thumb = x => ({ photo: x.photo || '', hasPhoto: !!x.photo });

export function buildVM(self, props = {}) {
  const st = self.state, d = st.data, D = B.derive(d), S = D.S, CL = D.CL;
  const mob = !!props.forceMobile || st.w < 860;
  const dashVar = st.dashVar || props.dashboardVariant || 'A', ordVar = st.ordVar || props.ordersVariant || 'table', shipVar = st.shipVar || props.shipmentsVariant || 'board';
  const go = id => () => self.setState({ screen: id, openOrder: null });
  const act = D.orders.filter(o => !o.archived);
  const openO = id => () => self.setState({ openOrder: id, noteDraft: null });
  const cnt = { total: act.length, transit: act.filter(o => o.stage >= 2 && o.stage <= 6).length, att: act.filter(o => o.attention).length, wait: act.filter(o => o.stage <= 1).length, done: act.filter(o => o.stage === 7).length };
  const blankF = { status: '', country: '', dest: '', carrier: '', client: '', archived: false };
  const toOrders = status => () => self.setState({ screen: 'orders', flt: Object.assign({}, blankF, { status }), q: '', showFilters: !!status });
  const navDefs = [['dashboard', 'Главная', 'squares-four', null], ['orders', 'Заказы', 'receipt', cnt.total], ['shipments', 'Отправления', 'package', D.ships.filter(s => s.stage < 7).length], ['map', 'Карта маршрутов', 'map-trifold', null]];
  const nav = navDefs.map(([id, label, icon, c]) => { const a = st.screen === id; return { id, label, short: label.split(' ')[0], onClick: go(id), active: a, icon: (a ? 'ph-fill' : 'ph') + ' ph-' + icon, count: c == null ? '' : String(c) }; });

  const ro = o => Object.assign({ id: o.id, title: o.title, more: o.more, qty: o.qty + ' шт', client: o.clientName, from: o.originCity, fromC: o.originCountry, to: o.destCity, carrier: o.carrier, track: o.track, pill: pill(o.stage), attention: o.attention, reason: o.reason, eta: o.eta ? fd(isoTs(o.eta)) : '—', etaRel: o.stage < 7 ? etaRel(o.eta) : '', onOpen: openO(o.id) }, thumb(o));

  // dashboard
  const kpis = [['Всего заказов', cnt.total, 'receipt', ''], ['В пути', cnt.transit, 'airplane-tilt', 'g:transit'], ['Требуют внимания', cnt.att, 'warning-circle', 'attention'], ['Ожидают отправки', cnt.wait, 'clock', 'g:waiting'], ['Получены', cnt.done, 'check-circle', 'g:done']]
    .map(([label, v, icon, k]) => ({ label, value: String(v), icon: 'ph-fill ph-' + icon, onClick: toOrders(k), ic: k === 'attention' && v ? 'var(--red-500)' : 'var(--violet-500)', icBg: k === 'attention' && v ? 'var(--red-100)' : 'var(--violet-50)' }));
  const attList = act.filter(o => o.attention || (o.unassigned && o.stage <= 1 && Date.now() - o.createdAt > 3 * DAY)).map(o => Object.assign(ro(o), { reason: o.reason || 'Товары не распределены по отправлениям' }));
  const evAll = []; D.ships.forEach(s => s.events.forEach(e => evAll.push({ e, s }))); evAll.sort((a, b) => b.e.at - a.e.at);
  const updates = evAll.slice(0, 6).map(({ e, s }) => ({ key: s.id + e.at + e.stage, title: STAGES[e.stage], city: e.city, when: rel(e.at), ship: s.id, who: s.clientsStr || 'Без товаров', note: e.note, hasNote: !!e.note, dot: B.tone(e.stage).dot, onClick: () => self.setState({ screen: 'shipments', shipVar: 'detail', selShip: s.id }) }));
  const upcoming = D.ships.filter(s => s.stage < 7 && s.eta).sort((a, b) => a.eta < b.eta ? -1 : 1).slice(0, 5).map(s => ({ id: s.id, route: s.originCity + ' → ' + s.destCity, date: fd(isoTs(s.eta)), rel: etaRel(s.eta), relFg: s.attention ? 'var(--red-500)' : 'var(--ink-600)', pill: pill(s.stage), who: s.clientsStr || '—', onClick: () => self.setState({ screen: 'map', mapSel: s.id }) }));
  const phases = [['Подготовка', 0, 1], ['В пути за рубежом', 2, 4], ['В Казахстане', 5, 6], ['Доставлено', 7, 7]].map(([title, a, b]) => { const l = act.filter(o => o.stage >= a && o.stage <= b); return { title, count: String(l.length), orders: l.slice(0, 5).map(ro), more: l.length > 5 ? 'Ещё ' + (l.length - 5) : '', hasMore: l.length > 5, empty: !l.length }; });
  const week = D.ships.filter(s => s.stage < 7 && s.eta && isoTs(s.eta) - Date.now() < 7 * DAY && isoTs(s.eta) >= Date.now() - DAY).length;

  // orders list
  const f = st.flt, q = st.q.trim().toLowerCase();
  const sm = (o, v) => !v || (v === 'attention' ? o.attention : v === 'g:waiting' ? o.stage <= 1 : v === 'g:transit' ? o.stage >= 2 && o.stage <= 6 : v === 'g:done' ? o.stage === 7 : o.stage === +v.slice(1));
  const fl = D.orders.filter(o => (f.archived ? o.archived : !o.archived) && (!q || [o.id, o.clientName, o.items.map(i => i.name + ' ' + i.id).join(' '), o.track, o.originCity, o.originCountry, o.destCity, o.carrier, o.supplier].join(' ').toLowerCase().includes(q)) && sm(o, f.status) && (!f.country || o.originCountry === f.country) && (!f.dest || o.destCity === f.dest || o.originCity === f.dest) && (!f.carrier || o.carrierIds.includes(f.carrier)) && (!f.client || o.clientId === f.client));
  const setF = k => e => self.setState({ flt: Object.assign({}, st.flt, { [k]: ev(e) }) });
  const statusOpts = [['', 'Все статусы'], ['attention', 'Требуют внимания'], ['g:waiting', 'Ожидают отправки'], ['g:transit', 'В пути'], ['g:done', 'Получены']].concat(STAGES.map((l, i) => ['s' + i, i + 1 + '. ' + l])).map(([v, l]) => ({ v, l }));
  const fActive = Object.keys(f).filter(k => f[k]).length;
  const byClient = d.clients.map(c => {
    const os = fl.filter(o => o.clientId === c.id); const its = [];
    os.forEach(o => o.items.forEach(i => { const s = i.shipmentId && S[i.shipmentId]; its.push(Object.assign({ id: i.id, name: i.name, meta: i.id + ' · ' + o.id + ' · ' + i.qty + ' шт', pill: pill(s ? s.stage : o.baseStage), ship: s ? s.id : 'Не распределён', onOpen: openO(o.id) }, thumb(i))); }));
    return { id: c.id, name: c.name, city: c.city, phone: c.phone, stat: os.length + ' заказ. · ' + its.length + ' тов.', items: its, show: its.length > 0 };
  }).filter(g => g.show);

  // shipments
  const ordBy = {}; d.orders.forEach(o => ordBy[o.id] = o);
  const dragStart = id => e => { const ids = st.sel[id] ? Object.keys(st.sel).filter(k => st.sel[k]) : [id]; e.dataTransfer.setData('text/plain', JSON.stringify(ids)); e.dataTransfer.effectAllowed = 'move'; };
  const splitOf = i => { const o = D.orders.find(x => x.id === i.orderId); return o && o.ships.length > 1 ? 'Заказ разделён: ' + o.ships.map(s => s.id).join(' + ') : ''; };
  const iv = i => { const sp = splitOf(i); return Object.assign({ id: i.id, name: i.name, meta: i.id + ' · ' + i.orderId + ' · ' + i.qty + ' шт', client: (CL[i.clientId] || { name: '—' }).name, checked: !!st.sel[i.id], onToggle: () => A.toggleSel(self, i.id), onDragStart: dragStart(i.id), split: sp, hasSplit: !!sp, onRemove: () => A.unassign(self, [i.id]), onOpen: openO(i.orderId) }, thumb(i)); };
  const un = d.items.filter(i => !i.shipmentId && ordBy[i.orderId] && !ordBy[i.orderId].archived);
  const unGroups = d.clients.map(c => ({ id: c.id, name: c.name, items: un.filter(i => i.clientId === c.id).map(iv) })).filter(g => g.items.length);
  const selIds = Object.keys(st.sel).filter(k => st.sel[k] && un.find(i => i.id === k));
  const openShips = D.ships.filter(s => s.stage <= 1);
  const target = openShips.find(s => s.id === st.target) ? st.target : (openShips[0] || {}).id || '';
  const dz = (id, fn) => ({
    onDragOver: e => { e.preventDefault(); if (st.dragOver !== id) self.setState({ dragOver: id }); },
    onDragLeave: e => { if (!e.currentTarget.contains(e.relatedTarget)) self.setState({ dragOver: null }); },
    onDrop: e => { e.preventDefault(); self.setState({ dragOver: null }); let ids = []; try { ids = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (x) { /* ignore */ } fn(ids); },
    zb: st.dragOver === id ? 'var(--violet-300)' : 'transparent', zbg: st.dragOver === id ? 'var(--violet-50)' : '#fff',
  });
  const sv = s => Object.assign({ id: s.id, carrier: cName(s.carrier), track: s.track || 'Трек не указан', route: s.route.join(' → '), routeShort: s.originCity + ' → ' + s.destCity, pill: pill(s.stage), attention: s.attention, reason: s.reason, count: s.items.length + ' тов. · ' + s.clientIds.length + ' клиент.', clients: s.clientsStr || 'Пусто', last: s.lastCity + ' · ' + rel(s.lastAt), eta: s.eta ? fd(isoTs(s.eta)) : '—', open: s.stage <= 1, locked: s.stage > 1, items: s.items.map(i => Object.assign(iv(i), { canRemove: s.stage <= 1 })), empty: !s.items.length, onStatus: () => A.openStatus(self, s.id), onDetail: () => self.setState({ shipVar: 'detail', selShip: s.id }), onEdit: () => A.openShipForm(self, null, s.id), onDelete: () => A.askDeleteShip(self, s.id), canDelete: s.stage <= 1, notDone: s.stage < 7, onMap: () => self.setState({ screen: 'map', mapSel: s.id }) }, dz(s.id, ids => A.assign(self, ids, s.id)));
  const boardShips = D.ships.filter(s => s.stage < 7).sort((a, b) => a.stage - b.stage).map(sv);
  const listShips = D.ships.slice().sort((a, b) => (a.stage === 7) - (b.stage === 7) || b.lastAt - a.lastAt);
  const selShipId = listShips.find(s => s.id === st.selShip) ? st.selShip : (listShips[0] || {}).id;
  const shipList = listShips.map(s => Object.assign(sv(s), { selected: s.id === selShipId, onClick: () => self.setState({ selShip: s.id }) }));
  const rs = s => s.route.map((c, i) => { const e = s.events.filter(x => x.city === c).sort((a, b) => b.at - a.at)[0]; const done = i < s.conf || s.stage >= 7, cur = i === s.conf && s.stage < 7; return { city: c, state: cur ? 'Последний подтверждённый пункт' : done ? 'Пройден' : 'Планируется', at: e && (done || cur) ? fdt(e.at) : '', dot: done || cur ? 'var(--violet-500)' : '#fff', ring: done || cur ? 'var(--violet-500)' : 'var(--ink-300)', fw: cur ? 600 : 400, line: i < s.conf || s.stage >= 7 ? 'var(--violet-500)' : 'var(--ink-200)', showLine: i < s.route.length - 1 }; });
  let sd = null; const ss = S[selShipId];
  if (ss) {
    sd = Object.assign(sv(ss), {
      routeSteps: rs(ss), apiNote: cName(ss.carrier) + ': интеграция не подключена — статусы обновляет байер вручную.',
      groups: ss.clientIds.map(cid => ({ id: cid, name: (CL[cid] || { name: '—' }).name, phone: (CL[cid] || {}).phone || '', items: ss.items.filter(i => i.clientId === cid).map(iv) })),
      history: ss.events.slice().reverse().map(e => ({ title: STAGES[e.stage], city: e.city, at: fdt(e.at), note: e.note, hasNote: !!e.note, dot: B.tone(e.stage).dot })),
      addable: un.map(iv), canAdd: ss.stage <= 1 && un.length > 0, onAddSel: () => A.assign(self, selIds, ss.id), selCount: String(selIds.length), hasSel: selIds.length > 0,
    });
  }

  // map
  const mShips = (st.mapAll ? D.ships : D.ships.filter(s => s.stage < 7));
  const mapSel = mShips.find(s => s.id === st.mapSel) ? st.mapSel : null;
  const mapList = mShips.map(s => ({ id: s.id, route: s.originCity + ' → ' + s.destCity, pill: pill(s.stage), last: s.lastCity + ' · ' + fdt(s.lastAt), who: s.clientsStr || '—', attention: s.attention, reason: s.reason, selected: s.id === mapSel, onClick: () => self.setState({ mapSel: s.id === mapSel ? null : s.id }) }));
  const msd = mapSel ? Object.assign(sv(S[mapSel]), { routeSteps: rs(S[mapSel]), clients: S[mapSel].clientsStr || 'Пусто' }) : null;
  const spec = (list, sel, wheel) => ({ wheel, hasSel: !!sel, onPick: id => self.setState({ mapSel: id }), routes: list.map(s => ({ id: s.id, names: s.route, conf: s.conf, done: s.stage >= 7, sel: sel === true || sel === s.id, dim: !!sel && sel !== true && sel !== s.id, label: (s.stage >= 7 ? 'доставлено · ' : '') + s.lastCity + ' · ' + fdt(s.lastAt) })) });

  // public tracking
  const DT = st.trackData ? B.derive(st.trackData) : null;
  const to = st.trackToken && DT && DT.orders.find(o => o.token === st.trackToken && !o.archived);
  let tv = null;
  if (to) {
    const evs = []; to.ships.forEach(s => s.events.forEach(e => evs.push(Object.assign({}, e, { ship: s.id })))); evs.sort((a, b) => b.at - a.at);
    const ls = to.ships.slice().sort((a, b) => b.lastAt - a.lastAt)[0];
    tv = { id: to.id, pill: pill(to.stage), first: to.clientName.split(' ')[0], route: to.originCity + ', ' + to.originCountry + ' → ' + to.destCity, eta: to.eta ? fd(isoTs(to.eta)) : 'не указана', etaRel: to.stage < 7 ? etaRel(to.eta) : '', last: ls ? ls.lastCity : to.originCity, lastAt: ls ? 'обновлено ' + fdt(ls.lastAt) : 'отправка ещё не начата', steps: B.steps(to.stage, evs), items: to.items.map(i => Object.assign({ id: i.id, name: i.name, qty: i.qty + ' шт' }, thumb(i))), history: evs.map(e => ({ title: STAGES[e.stage], city: e.city, at: fdt(e.at), note: e.note, hasNote: !!e.note, dot: B.tone(e.stage).dot })), hasHistory: evs.length > 0, noHistory: !evs.length, ships: to.ships.map(s => ({ id: s.id, carrier: cName(s.carrier), track: s.track || '—' })), hasShips: to.ships.length > 0 };
  }

  // order drawer
  const oo = st.openOrder && D.orders.find(o => o.id === st.openOrder);
  let od = null;
  if (oo) {
    const evs = []; oo.ships.forEach(s => s.events.forEach(e => evs.push(Object.assign({}, e, { ship: s.id })))); evs.sort((a, b) => b.at - a.at);
    const link = A.linkFor(oo.token); const nv = st.noteDraft != null ? st.noteDraft : (oo.notes || '');
    od = {
      id: oo.id, title: oo.title, pill: pill(oo.stage), attention: oo.attention, reason: oo.reason, client: oo.clientName, phone: oo.client.phone || '—', ccity: oo.client.city || '—', supplier: oo.supplier, contact: oo.supplierContact || '—', from: oo.originCity + ', ' + oo.originCountry, to: oo.destCity, total: money(oo.total), qty: oo.qty + ' шт', created: fdt(oo.createdAt), eta: oo.eta ? fd(isoTs(oo.eta)) + (oo.stage < 7 ? ' · ' + etaRel(oo.eta) : '') : 'Не указана', archived: oo.archived, archiveLabel: oo.archived ? 'Из архива' : 'В архив',
      items: oo.items.map(i => { const s = i.shipmentId && S[i.shipmentId]; return Object.assign({ id: i.id, name: i.name, meta: i.qty + ' шт × ' + money(i.price), sum: money(i.qty * i.price), ship: s ? s.id + ' · ' + cName(s.carrier) : 'Не распределён', onGo: s ? () => self.setState({ screen: 'shipments', shipVar: 'detail', selShip: s.id, openOrder: null }) : () => self.setState({ screen: 'shipments', shipVar: 'board', openOrder: null, sel: { [i.id]: true } }) }, thumb(i)); }),
      split: oo.ships.length > 1, splitText: 'Заказ разделён на ' + oo.ships.length + ' отправления: ' + oo.ships.map(s => s.id).join(', '), steps: B.steps(oo.stage, evs),
      history: evs.map(e => ({ title: STAGES[e.stage], city: e.city, at: fdt(e.at), note: e.note, hasNote: !!e.note, ship: e.ship, dot: B.tone(e.stage).dot })), hasHistory: evs.length > 0,
      shipBtns: oo.ships.filter(s => s.stage < 7).map(s => ({ id: s.id, label: 'Обновить статус ' + s.id, onClick: () => A.openStatus(self, s.id) })), manual: oo.ships.length > 0,
      hasBase: oo.unassigned > 0, baseBtns: [0, 1].map(n => ({ label: STAGES[n], onClick: () => A.setBase(self, oo.id, n), active: oo.baseStage === n })),
      files: (oo.files || []).map((x, i) => ({ name: x.name, meta: x.kind + ' · ' + Math.max(1, Math.round(x.size / 1024)) + ' КБ', isImg: !!x.data, data: x.data || '', onRemove: () => A.removeFile(self, oo.id, i) })),
      link, onCopy: () => A.copy(self, link), onRegen: () => A.regen(self, oo.id), onPublic: () => { location.hash = '#/track/' + oo.token; },
      onEdit: () => A.openEdit(self), onArchive: () => A.archive(self, oo.id), onDelete: () => A.askDelete(self, oo.id), onMap: () => self.setState({ screen: 'map', mapSel: oo.ships[0].id, openOrder: null }), hasShips: oo.ships.length > 0,
      note: nv, onNote: e => self.setState({ noteDraft: e.target.value }), noteDirty: st.noteDraft != null && st.noteDraft !== (oo.notes || ''), onSaveNote: () => A.saveNote(self, oo.id, st.noteDraft),
      onFile: e => { A.addFiles(self, oo.id, e.target.files); e.target.value = ''; },
    };
  }

  // forms
  const fm = st.form, er = st.errors || {};
  let of = null;
  if (fm) {
    const sf = k => e => self.setState({ form: Object.assign({}, st.form, { [k]: ev(e) }) });
    const setRow = (i, k, v) => self.setState(s => ({ form: Object.assign({}, s.form, { items: s.form.items.map((r, j) => j === i ? Object.assign({}, r, { [k]: v }) : r) }) }));
    of = {
      title: fm.mode === 'create' ? 'Новый заказ' : 'Редактирование ' + fm.id, cta: fm.mode === 'create' ? 'Создать заказ' : 'Сохранить', v: fm, isNew: fm.clientId === '__new',
      clientOpts: [{ v: '', l: 'Выберите клиента' }].concat(d.clients.map(c => ({ v: c.id, l: c.name + ' · ' + c.city })), [{ v: '__new', l: '+ Новый клиент' }]),
      countryOpts: Object.keys(COUNTRIES).map(v => ({ v, l: v })), cityOpts: COUNTRIES[fm.country].map(v => ({ v, l: v })), destOpts: COUNTRIES['Казахстан'].map(v => ({ v, l: v })),
      on: { clientId: sf('clientId'), newName: sf('newName'), newPhone: sf('newPhone'), supplier: sf('supplier'), contact: sf('supplierContact'), eta: sf('eta'), notes: sf('notes'), destCity: sf('destCity'), originCity: sf('originCity'), country: e => { const v = ev(e); self.setState({ form: Object.assign({}, st.form, { country: v, originCity: COUNTRIES[v][0] }) }); } },
      err: { client: er.client || '', supplier: er.supplier || '' },
      rows: fm.items.map((r, i) => Object.assign({}, r, { onName: e => setRow(i, 'name', ev(e)), onQty: e => setRow(i, 'qty', ev(e)), onPrice: e => setRow(i, 'price', ev(e)), onPhoto: e => { const file = e.target.files[0]; if (file) B.readImage(file, u => setRow(i, 'photo', u), 480); }, onRemove: () => self.setState(s => ({ form: Object.assign({}, s.form, { items: s.form.items.filter((_, j) => j !== i) }) })), canRemove: fm.items.length > 1, err: er['i' + i] || '' }, thumb(r))),
      addRow: () => self.setState(s => ({ form: Object.assign({}, s.form, { items: s.form.items.concat(A.blankRow()) }) })), onSave: () => A.saveOrder(self),
    };
  }
  let shf = null;
  if (st.shipForm) {
    const x = st.shipForm; const sf = k => e => self.setState({ shipForm: Object.assign({}, st.shipForm, { [k]: ev(e) }) }); const all = [].concat(...Object.values(COUNTRIES));
    shf = { title: x.mode === 'create' ? 'Новое отправление' : 'Отправление ' + x.id, cta: x.mode === 'create' ? 'Создать отправление' : 'Сохранить', v: x, canOrigin: x.stage <= 1, count: x.itemIds.length ? 'Будет добавлено товаров: ' + x.itemIds.length : '', carrierOpts: CARRIERS.map(c => ({ v: c.id, l: c.name })), originOpts: all.map(v => ({ v, l: v + ' · ' + B.countryOf(v) })), destOpts: COUNTRIES['Казахстан'].map(v => ({ v, l: v })), route: B.buildRoute(x.originCity, x.destCity).join(' → '), on: { carrier: sf('carrier'), track: sf('track'), originCity: sf('originCity'), destCity: sf('destCity'), eta: sf('eta') }, err: er.track || '', onSave: () => A.saveShip(self) };
  }
  let stf = null;
  if (st.sf) {
    const x = st.sf, s = S[x.shipId]; const sf = k => e => self.setState({ sf: Object.assign({}, st.sf, { [k]: ev(e) }) });
    stf = { title: 'Статус ' + x.shipId, sub: s.route.join(' → ') + ' · сейчас: ' + STAGES[s.stage], v: x, stageOpts: STAGES.map((l, i) => ({ v: String(i), l: (i + 1) + '. ' + l })), cityOpts: [...new Set(s.route.concat(Object.keys(B.CITY)))].map(v => ({ v, l: v })), on: { stage: sf('stage'), city: sf('city'), at: sf('at'), note: sf('note'), delayed: sf('delayed') }, err: { city: er.city || '', at: er.at || '' }, api: cName(s.carrier) + ' — API не подключён. Событие будет записано вручную с вашим именем и временем.', onSave: () => A.saveStatus(self) };
  }

  // auth
  const au = st.auth, ae = st.authErr || {}, reg = st.authMode === 'register', setA = k => e => self.setState({ auth: Object.assign({}, st.auth, { [k]: ev(e) }) });
  const mapSpec = st.screen === 'map' ? spec(mShips, mapSel, true) : st.screen === 'track' ? spec(to ? to.ships : [], true, false) : spec(D.ships.filter(s => s.stage >= 1 && s.stage < 7), null, false);
  const isApp = !!st.user && st.screen !== 'auth' && st.screen !== 'track';

  return {
    mapSpec,
    isAuth: st.screen === 'auth', isTrack: st.screen === 'track', isApp, isDesktop: !mob, isMobile: mob, mainPad: mob ? '16px 14px 96px' : '28px 32px 48px',
    user: st.user || { name: '', email: '' }, initial: st.user ? st.user.name.slice(0, 1).toUpperCase() : '', logout: () => A.logout(self),
    nav, isDash: st.screen === 'dashboard', isOrders: st.screen === 'orders', isShips: st.screen === 'shipments', isMap: st.screen === 'map',
    demo: !!d.demo, clearDemo: () => A.clearDemo(self), loadDemo: () => A.loadDemo(self),
    openCreate: () => A.openCreate(self),
    // dashboard
    dashSeg: seg(self, [['A', 'Обзор'], ['B', 'Конвейер']], dashVar, 'dashVar'), dashA: dashVar === 'A', dashB: dashVar === 'B', kpis, attList, updates, upcoming, phases,
    summary: cnt.transit + ' в пути · ' + cnt.att + ' требуют внимания · ' + cnt.wait + ' ожидают отправки · ' + week + ' прибудут в ближайшие 7 дней',
    // orders
    ordSeg: seg(self, [['table', 'Таблица'], ['clients', 'По клиентам']], ordVar, 'ordVar'), ordTable: ordVar === 'table', ordClients: ordVar === 'clients',
    q: st.q, onQ: v => self.setState({ q: typeof v === 'string' ? v : ev(v) }), toggleFilters: () => self.setState({ showFilters: !st.showFilters }), showFilters: st.showFilters, flt: f,
    on: { status: setF('status'), country: setF('country'), dest: setF('dest'), carrier: setF('carrier'), client: setF('client'), archived: setF('archived') },
    statusOpts, countryOpts: [{ v: '', l: 'Все страны' }].concat(Object.keys(COUNTRIES).map(v => ({ v, l: v }))), destOpts: [{ v: '', l: 'Все города' }].concat(COUNTRIES['Казахстан'].concat(['Гуанчжоу', 'Иу', 'Стамбул', 'Сеул']).map(v => ({ v, l: v }))), carrierOpts: [{ v: '', l: 'Все перевозчики' }].concat(CARRIERS.map(c => ({ v: c.id, l: c.name }))), clientOpts: [{ v: '', l: 'Все клиенты' }].concat(d.clients.map(c => ({ v: c.id, l: c.name }))),
    resetF: () => self.setState({ flt: blankF, q: '' }), hasF: fActive > 0 || !!q,
    rows: fl.map(ro), hasRows: fl.length > 0, resultStr: 'Найдено: ' + fl.length, byClient, exportCSV: () => A.exportCSV(self, fl, D),
    // shipments
    shipSeg: seg(self, [['board', 'Сборка посылок'], ['detail', 'Список и детали']], shipVar, 'shipVar'), shipBoard: shipVar === 'board', shipDetail: shipVar === 'detail',
    unGroups, hasUn: un.length > 0, unCount: String(un.length), unZone: dz('__un', ids => A.unassign(self, ids)),
    selCount: String(selIds.length), hasSel: selIds.length > 0, clearSel: () => self.setState({ sel: {} }),
    targetOpts: openShips.map(s => ({ v: s.id, l: s.id + ' · ' + s.originCity + ' → ' + s.destCity })), target, onTarget: e => self.setState({ target: ev(e) }), hasTargets: openShips.length > 0,
    addToTarget: () => A.assign(self, selIds, target), newShipFromSel: () => A.openShipForm(self, selIds), newShip: () => A.openShipForm(self, []),
    boardShips, shipList, sd,
    // map
    mapSegAll: [{ label: 'Активные', active: !st.mapAll, onClick: () => self.setState({ mapAll: false }) }, { label: 'Все, вкл. доставленные', active: !!st.mapAll, onClick: () => self.setState({ mapAll: true }) }],
    mapList, msd, clearMapSel: () => self.setState({ mapSel: null }), mapH: mob ? '380px' : 'calc(100vh - 170px)',
    // track
    tv, trackFound: !!tv, trackMissing: !!st.trackToken && !tv && !st.trackLoading, trackEmpty: !st.trackToken, trackInput: st.trackInput, onTrackInput: e => self.setState({ trackInput: ev(e) }),
    onTrackSubmit: e => { e.preventDefault(); const v = st.trackInput.trim(); const m = v.match(/track\/([\w-]+)/); const t = m ? m[1] : v; if (t) location.hash = '#/track/' + t; },
    trackBack: () => { history.replaceState(null, '', location.pathname + location.search); self.setState({ screen: st.user ? 'dashboard' : 'auth', trackToken: null }); }, trackBackLabel: st.user ? 'Вернуться в кабинет' : 'Войти',
    // drawer + modals
    od, closeOd: () => self.setState({ openOrder: null, noteDraft: null }),
    modalOrder: st.modal === 'order' && !!of, of, modalShip: st.modal === 'ship' && !!shf, shf, modalStatus: st.modal === 'status' && !!stf, stf, modalConfirm: st.modal === 'confirm' && !!st.confirm, cf: st.confirm || {}, closeModal: () => self.setState({ modal: null, errors: {} }),
    toast: st.toast || '',
    // auth
    au, ae: { name: ae.name || '', email: ae.email || '', password: ae.password || '' }, isRegister: reg, authTitle: reg ? 'Регистрация' : 'Вход в BuyerTrack', authCta: reg ? 'Создать аккаунт' : 'Войти',
    authSeg: [['login', 'Вход'], ['register', 'Регистрация']].map(([v, l]) => ({ label: l, active: st.authMode === v, onClick: () => self.setState({ authMode: v, authErr: {} }) })),
    roleSeg: [['buyer', 'Я байер'], ['client', 'Я клиент']].map(([v, l]) => ({ label: l, active: au.role === v, onClick: () => self.setState({ auth: Object.assign({}, st.auth, { role: v }) }) })),
    onAuth: { name: setA('name'), email: setA('email'), password: setA('password') }, submitAuth: e => A.submitAuth(self, e), toTrack: () => self.setState({ screen: 'track', trackToken: null }),
  };
}
