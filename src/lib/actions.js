// State mutations. `self` = { state (current), setState(partial | fn) } — see useStore.js.
import * as B from './core.js';

const { STAGES } = B;
const A = {};

A.toast = (self, msg) => { clearTimeout(self._tt); self.setState({ toast: msg }); self._tt = setTimeout(() => self.setState({ toast: null }), 2800); };
A.upd = (self, fn) => self.setState(s => ({ data: fn(s.data) }));
A.persist = (self, state) => {
  try { localStorage.setItem(B.LS, JSON.stringify({ data: state.data, user: state.user })); }
  catch (e) { A.toast(self, 'Хранилище браузера заполнено — удалите часть фото'); }
};
A.init = () => {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(B.LS) || 'null'); } catch (e) { /* ignore */ }
  const st = { ready: true, screen: 'dashboard', user: null, data: B.seed(), q: '', showFilters: false, flt: { status: '', country: '', dest: '', carrier: '', client: '', archived: false }, openOrder: null, modal: null, form: null, shipForm: null, sf: null, confirm: null, errors: {}, sel: {}, target: '', dragOver: null, selShip: null, mapSel: null, mapAll: false, toast: null, authMode: 'login', auth: { name: '', email: '', password: '', role: 'buyer' }, authErr: {}, trackToken: null, trackInput: '', noteDraft: null, w: window.innerWidth, dashVar: null, ordVar: null, shipVar: null };
  if (s) { st.user = s.user || null; if (s.data) st.data = s.data; }
  if (!st.user) st.screen = 'auth';
  const h = location.hash.match(/#\/track\/([\w-]+)/);
  if (h) { st.screen = 'track'; st.trackToken = h[1]; }
  return st;
};
A.linkFor = tok => location.href.split('#')[0] + '#/track/' + tok;
A.copy = (self, text) => {
  const ok = () => A.toast(self, 'Ссылка скопирована');
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok, () => A.toast(self, 'Скопируйте ссылку вручную'));
  else A.toast(self, 'Скопируйте ссылку вручную');
};
A.patchOrder = (self, id, p) => A.upd(self, d => Object.assign({}, d, { orders: d.orders.map(o => o.id === id ? Object.assign({}, o, p) : o) }));
A.patchShip = (self, id, p) => A.upd(self, d => Object.assign({}, d, { shipments: d.shipments.map(o => o.id === id ? Object.assign({}, o, p) : o) }));

// auth
A.submitAuth = (self, e) => {
  if (e && e.preventDefault) e.preventDefault();
  const a = self.state.auth, reg = self.state.authMode === 'register', er = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim())) er.email = 'Введите корректный e-mail';
  if (reg && a.password.length < 8) er.password = 'Минимум 8 символов';
  if (!reg && !a.password) er.password = 'Введите пароль';
  if (reg && a.name.trim().length < 2) er.name = 'Укажите имя';
  if (Object.keys(er).length) return self.setState({ authErr: er });
  const user = { name: reg ? a.name.trim() : a.email.split('@')[0], email: a.email.trim(), role: reg ? a.role : 'buyer' };
  if (user.role === 'client') { self.setState({ user: null, authErr: {}, screen: 'track' }); return A.toast(self, 'Клиентский кабинет — в следующей итерации. Используйте ссылку от байера.'); }
  self.setState({ user, authErr: {}, screen: 'dashboard' });
};
A.logout = self => self.setState({ user: null, screen: 'auth', openOrder: null, modal: null });

// orders
const blankRow = () => ({ key: Math.random().toString(36).slice(2), id: null, name: '', qty: '1', price: '', photo: null });
A.blankRow = blankRow;
A.openCreate = self => {
  const d = self.state.data;
  self.setState({ modal: 'order', errors: {}, form: { mode: 'create', id: null, clientId: d.clients.length ? '' : '__new', newName: '', newPhone: '', supplier: '', supplierContact: '', country: 'Китай', originCity: 'Гуанчжоу', destCity: 'Алматы', eta: '', notes: '', items: [blankRow()] } });
};
A.openEdit = self => {
  const d = self.state.data, o = d.orders.find(x => x.id === self.state.openOrder);
  if (!o) return;
  self.setState({ modal: 'order', errors: {}, form: { mode: 'edit', id: o.id, clientId: o.clientId, newName: '', newPhone: '', supplier: o.supplier, supplierContact: o.supplierContact || '', country: o.originCountry, originCity: o.originCity, destCity: o.destCity, eta: o.eta || '', notes: o.notes || '', items: d.items.filter(i => i.orderId === o.id).map(i => ({ key: i.id, id: i.id, name: i.name, qty: String(i.qty), price: String(i.price), photo: i.photo })) } });
};
A.saveOrder = self => {
  const f = self.state.form, d = self.state.data, er = {};
  if (!f.clientId) er.client = 'Выберите клиента';
  if (f.clientId === '__new' && f.newName.trim().length < 2) er.client = 'Укажите имя клиента';
  if (!f.supplier.trim()) er.supplier = 'Укажите поставщика';
  f.items.forEach((r, i) => {
    if (!r.name.trim()) er['i' + i] = 'Укажите название товара';
    else if (!(parseInt(r.qty, 10) >= 1)) er['i' + i] = 'Количество — целое число от 1';
    else if (r.price !== '' && !(+r.price >= 0)) er['i' + i] = 'Стоимость должна быть числом';
  });
  if (Object.keys(er).length) return self.setState({ errors: er });
  let clients = d.clients, cid = f.clientId;
  if (cid === '__new') { cid = 'C-' + String(B.nextNum(d.clients.map(c => c.id), 1)).padStart(2, '0'); clients = clients.concat({ id: cid, name: f.newName.trim(), phone: f.newPhone.trim(), city: f.destCity }); }
  let items = d.items, orders = d.orders, oid = f.id;
  let n = B.nextNum(d.items.map(i => i.id), 1);
  const mk = r => ({ name: r.name.trim(), qty: parseInt(r.qty, 10), price: +r.price || 0, photo: r.photo });
  const fields = { clientId: cid, supplier: f.supplier.trim(), supplierContact: f.supplierContact.trim(), originCountry: f.country, originCity: f.originCity, destCity: f.destCity, eta: f.eta, notes: f.notes };
  if (f.mode === 'create') {
    oid = 'BT-' + B.nextNum(d.orders.map(o => o.id), 1001);
    orders = [Object.assign({ id: oid, createdAt: Date.now(), baseStage: 0, archived: false, token: B.token(), files: [] }, fields)].concat(orders);
    items = items.concat(f.items.map(r => Object.assign({ id: 'IT-' + String(n++).padStart(4, '0'), orderId: oid, clientId: cid, shipmentId: null }, mk(r))));
  } else {
    orders = orders.map(o => o.id === oid ? Object.assign({}, o, fields) : o);
    const keep = f.items.filter(r => r.id).map(r => r.id);
    items = items.filter(i => i.orderId !== oid || keep.includes(i.id)).map(i => { const r = f.items.find(x => x.id === i.id); return r ? Object.assign({}, i, mk(r), { clientId: cid }) : i; })
      .concat(f.items.filter(r => !r.id).map(r => Object.assign({ id: 'IT-' + String(n++).padStart(4, '0'), orderId: oid, clientId: cid, shipmentId: null }, mk(r))));
  }
  self.setState({ data: Object.assign({}, d, { clients, orders, items }), modal: null, form: null, errors: {}, openOrder: oid });
  A.toast(self, f.mode === 'create' ? 'Заказ ' + oid + ' создан' : 'Изменения сохранены');
};
A.archive = (self, id) => {
  const o = self.state.data.orders.find(x => x.id === id);
  A.patchOrder(self, id, { archived: !o.archived });
  self.setState({ openOrder: null });
  A.toast(self, o.archived ? 'Заказ возвращён из архива' : 'Заказ ' + id + ' перенесён в архив');
};
A.askDelete = (self, id) => self.setState({
  modal: 'confirm', confirm: {
    title: 'Удалить заказ ' + id + '?', text: 'Заказ и все его товары будут удалены без возможности восстановления. Если нужно лишь скрыть заказ — используйте архив.', cta: 'Удалить',
    action: () => { A.upd(self, d => Object.assign({}, d, { orders: d.orders.filter(o => o.id !== id), items: d.items.filter(i => i.orderId !== id) })); self.setState({ modal: null, openOrder: null }); A.toast(self, 'Заказ ' + id + ' удалён'); },
  },
});
A.setBase = (self, id, n) => A.patchOrder(self, id, { baseStage: n });
A.addFiles = (self, id, list) => {
  Array.from(list || []).forEach(file => {
    const kind = file.type.startsWith('image/') ? 'Фото' : file.type === 'application/pdf' ? 'PDF' : 'Документ';
    const push = data => A.upd(self, d => Object.assign({}, d, { orders: d.orders.map(o => o.id === id ? Object.assign({}, o, { files: (o.files || []).concat({ name: file.name, size: file.size, kind, data: data || null, at: Date.now() }) }) : o) }));
    if (kind === 'Фото') B.readImage(file, push, 640); else push(null);
  });
  A.toast(self, 'Файл прикреплён');
};
A.removeFile = (self, id, i) => A.upd(self, d => Object.assign({}, d, { orders: d.orders.map(o => o.id === id ? Object.assign({}, o, { files: o.files.filter((_, k) => k !== i) }) : o) }));
A.regen = (self, id) => { A.patchOrder(self, id, { token: B.token() }); A.toast(self, 'Новая ссылка создана, старая больше не работает'); };

// shipments
A.toggleSel = (self, id) => self.setState(s => ({ sel: Object.assign({}, s.sel, { [id]: !s.sel[id] }) }));
A.assign = (self, ids, shipId) => {
  const d = self.state.data, s = d.shipments.find(x => x.id === shipId);
  if (!s || !ids.length) return;
  if (s.stage > 1) return A.toast(self, shipId + ' уже передано перевозчику — товары добавить нельзя');
  const lock = new Set(d.shipments.filter(x => x.stage > 1).map(x => x.id));
  const mv = d.items.filter(i => ids.includes(i.id) && !(i.shipmentId && lock.has(i.shipmentId)) && i.shipmentId !== shipId);
  if (!mv.length) return;
  const set = new Set(mv.map(i => i.id));
  self.setState({ data: Object.assign({}, d, { items: d.items.map(i => set.has(i.id) ? Object.assign({}, i, { shipmentId: shipId }) : i) }), sel: {} });
  A.toast(self, 'В ' + shipId + ' добавлено: ' + mv.length + ' тов.');
};
A.unassign = (self, ids) => {
  const d = self.state.data;
  const lock = new Set(d.shipments.filter(x => x.stage > 1).map(x => x.id));
  const set = new Set(ids.filter(id => { const i = d.items.find(x => x.id === id); return i && i.shipmentId && !lock.has(i.shipmentId); }));
  if (!set.size) return;
  A.upd(self, dd => Object.assign({}, dd, { items: dd.items.map(i => set.has(i.id) ? Object.assign({}, i, { shipmentId: null }) : i) }));
  A.toast(self, 'Возвращено в нераспределённые: ' + set.size);
};
A.openShipForm = (self, ids, editId) => {
  const d = self.state.data;
  if (editId) {
    const s = d.shipments.find(x => x.id === editId);
    return self.setState({ modal: 'ship', errors: {}, shipForm: { mode: 'edit', id: s.id, carrier: s.carrier, track: s.track || '', originCity: s.originCity, destCity: s.destCity, eta: s.eta || '', itemIds: [], stage: s.stage } });
  }
  const it = d.items.find(i => ids && ids.includes(i.id));
  const o = it && d.orders.find(x => x.id === it.orderId);
  self.setState({ modal: 'ship', errors: {}, shipForm: { mode: 'create', id: null, carrier: 'cargo', track: '', originCity: o ? o.originCity : 'Гуанчжоу', destCity: 'Алматы', eta: '', itemIds: ids || [], stage: 1 } });
};
A.saveShip = self => {
  const f = self.state.shipForm, d = self.state.data, er = {};
  if (f.track && !/^[\w\- ]{4,40}$/.test(f.track.trim())) er.track = 'Только латиница, цифры, «-», от 4 символов';
  if (Object.keys(er).length) return self.setState({ errors: er });
  const now = Date.now();
  let shipments = d.shipments, items = d.items, id = f.id;
  if (f.mode === 'create') {
    id = 'SH-' + B.nextNum(d.shipments.map(s => s.id), 301);
    shipments = shipments.concat({ id, carrier: f.carrier, track: f.track.trim(), originCity: f.originCity, destCity: f.destCity, route: B.buildRoute(f.originCity, f.destCity), stage: 1, eta: f.eta, delayed: false, createdAt: now, events: [{ stage: 1, city: f.originCity, at: now, note: 'Отправление создано' }] });
    const set = new Set(f.itemIds);
    items = items.map(i => set.has(i.id) ? Object.assign({}, i, { shipmentId: id }) : i);
  } else {
    shipments = shipments.map(s => s.id === id ? Object.assign({}, s, { carrier: f.carrier, track: f.track.trim(), eta: f.eta, destCity: f.destCity, originCity: s.stage <= 1 ? f.originCity : s.originCity, route: B.buildRoute(s.stage <= 1 ? f.originCity : s.originCity, f.destCity) }) : s);
  }
  self.setState({ data: Object.assign({}, d, { shipments, items }), modal: null, shipForm: null, sel: {}, selShip: id });
  A.toast(self, f.mode === 'create' ? 'Отправление ' + id + ' создано' : 'Отправление обновлено');
};
A.askDeleteShip = (self, id) => self.setState({
  modal: 'confirm', confirm: {
    title: 'Удалить ' + id + '?', text: 'Товары вернутся в список нераспределённых. Историю отправления восстановить нельзя.', cta: 'Удалить',
    action: () => { A.upd(self, d => Object.assign({}, d, { shipments: d.shipments.filter(s => s.id !== id), items: d.items.map(i => i.shipmentId === id ? Object.assign({}, i, { shipmentId: null }) : i) })); self.setState({ modal: null, selShip: null }); A.toast(self, id + ' удалено'); },
  },
});
A.openStatus = (self, id) => {
  const s = self.state.data.shipments.find(x => x.id === id);
  const nx = Math.min(7, s.stage + 1);
  const ci = Math.min(s.route.length - 1, Math.max(0, s.route.indexOf((s.events[s.events.length - 1] || {}).city)) + (nx >= 5 ? 1 : 0));
  self.setState({ modal: 'status', errors: {}, sf: { shipId: id, stage: String(nx), city: nx === 7 ? s.destCity : s.route[ci], at: B.toLocalInput(Date.now()), note: '', delayed: !!s.delayed } });
};
A.saveStatus = self => {
  const f = self.state.sf, er = {};
  const at = Date.parse(f.at);
  if (!f.city) er.city = 'Укажите город';
  if (isNaN(at)) er.at = 'Укажите дату и время';
  else if (at > Date.now() + 6e4) er.at = 'Нельзя указать время в будущем';
  if (Object.keys(er).length) return self.setState({ errors: er });
  const st = +f.stage;
  self.setState(s => ({ data: Object.assign({}, s.data, { shipments: s.data.shipments.map(x => x.id === f.shipId ? Object.assign({}, x, { stage: st, delayed: st === 7 ? false : !!f.delayed, events: x.events.concat({ stage: st, city: f.city, at, note: f.note.trim() }) }) : x) }), modal: null, sf: null }));
  A.toast(self, f.shipId + ': ' + STAGES[st]);
};

// csv
A.exportCSV = (self, list, D) => {
  const rows = [['ID товара', 'Заказ', 'Товар', 'Кол-во', 'Цена, ₸', 'Клиент', 'Телефон', 'Страна', 'Город отправления', 'Город назначения', 'Отправление', 'Перевозчик', 'Трек-номер', 'Статус', 'Ожидаемая дата']];
  list.forEach(o => o.items.forEach(i => {
    const s = i.shipmentId && D.S[i.shipmentId];
    rows.push([i.id, o.id, i.name, i.qty, i.price, o.clientName, o.client.phone || '', o.originCountry, o.originCity, o.destCity, s ? s.id : '', s ? B.cName(s.carrier) : '', s ? s.track : '', STAGES[s ? s.stage : o.baseStage], (s && s.eta) || o.eta || '']);
  }));
  const csv = '﻿' + rows.map(r => r.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(';')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'buyertrack-' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a); a.click(); a.remove();
  A.toast(self, 'Экспортировано строк: ' + (rows.length - 1));
};

export default A;
