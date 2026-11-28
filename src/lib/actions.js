// State mutations. `self` = { state (current), setState(partial | fn) } — see useStore.js.
// All data changes go through the FastAPI backend; every mutation returns the fresh snapshot,
// which replaces state.data (the shape matches what derive()/vm.js expect).
import * as B from './core.js';
import api, { getToken, setToken } from './api.js';

const A = {};

A.toast = (self, msg) => { if (!msg) return; clearTimeout(self._tt); self.setState({ toast: msg }); self._tt = setTimeout(() => self.setState({ toast: null }), 2800); };

// Runs an API call: applies the returned snapshot, shows its message, maps field errors into the form.
A.run = async (self, promise, { patch, errorsKey = 'errors', toast = true } = {}) => {
  try {
    const res = await promise;
    const p = Object.assign({}, res && res.data ? { data: res.data } : {}, typeof patch === 'function' ? patch(res) : patch || {});
    self.setState(p);
    if (toast && res && res.message) A.toast(self, res.message);
    return res || {};
  } catch (e) {
    if (e.status === 401 && errorsKey !== 'authErr') { A.forceLogout(self); A.toast(self, e.message); return null; }
    if (e.field && (e.status === 422 || errorsKey === 'authErr')) self.setState({ [errorsKey]: { [e.field]: e.message } });
    else A.toast(self, e.message);
    return null;
  }
};

A.persist = (self, state) => {
  try { localStorage.setItem(B.LS, JSON.stringify({ user: state.user })); } catch (e) { /* ignore */ }
};
A.init = () => {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(B.LS) || 'null'); } catch (e) { /* ignore */ }
  const st = { ready: true, loading: false, screen: 'dashboard', user: null, data: B.empty(), trackData: null, trackLoading: false, q: '', showFilters: false, flt: { status: '', country: '', dest: '', carrier: '', client: '', archived: false }, openOrder: null, modal: null, form: null, shipForm: null, sf: null, confirm: null, errors: {}, sel: {}, target: '', dragOver: null, selShip: null, mapSel: null, mapAll: false, toast: null, authMode: 'login', auth: { name: '', email: '', password: '', role: 'buyer' }, authErr: {}, trackToken: null, trackInput: '', noteDraft: null, w: window.innerWidth, dashVar: null, ordVar: null, shipVar: null };
  if (s && s.user && getToken()) st.user = s.user;
  if (!st.user) st.screen = 'auth';
  const h = location.hash.match(/#\/track\/([\w-]+)/);
  if (h) { st.screen = 'track'; st.trackToken = h[1]; }
  return st;
};
A.refresh = async self => {
  self.setState({ loading: true });
  await A.run(self, api.data(), { toast: false });
  self.setState({ loading: false });
};
A.loadTrack = async (self, token) => {
  if (!token) return self.setState({ trackData: null, trackLoading: false });
  self.setState({ trackLoading: true });
  try { const r = await api.track(token); self.setState({ trackData: r.data, trackLoading: false }); }
  catch (e) { self.setState({ trackData: null, trackLoading: false }); if (e.status !== 404) A.toast(self, e.message); }
};

A.linkFor = tok => location.href.split('#')[0] + '#/track/' + tok;
A.copy = (self, text) => {
  const ok = () => A.toast(self, 'Ссылка скопирована');
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok, () => A.toast(self, 'Скопируйте ссылку вручную'));
  else A.toast(self, 'Скопируйте ссылку вручную');
};

// auth
A.submitAuth = async (self, e) => {
  if (e && e.preventDefault) e.preventDefault();
  const a = self.state.auth, reg = self.state.authMode === 'register', er = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim())) er.email = 'Введите корректный e-mail';
  if (reg && a.password.length < 8) er.password = 'Минимум 8 символов';
  if (!reg && !a.password) er.password = 'Введите пароль';
  if (reg && a.name.trim().length < 2) er.name = 'Укажите имя';
  if (Object.keys(er).length) return self.setState({ authErr: er });
  const call = reg
    ? api.register({ name: a.name.trim(), email: a.email.trim(), password: a.password, role: a.role })
    : api.login({ email: a.email.trim(), password: a.password });
  const res = await A.run(self, call, { errorsKey: 'authErr', toast: false });
  if (!res) return;
  if (res.user.role === 'client') { self.setState({ user: null, authErr: {}, screen: 'track' }); return A.toast(self, 'Клиентский кабинет — в следующей итерации. Используйте ссылку от байера.'); }
  setToken(res.token);
  self.setState({ user: res.user, authErr: {}, screen: 'dashboard', auth: Object.assign({}, a, { password: '' }) });
  A.refresh(self);
};
A.forceLogout = self => { setToken(null); self.setState({ user: null, screen: 'auth', openOrder: null, modal: null, data: B.empty() }); };
A.logout = self => { api.logout().catch(() => {}).finally(() => setToken(null)); self.setState({ user: null, screen: 'auth', openOrder: null, modal: null, data: B.empty() }); };

A.loadDemo = self => A.run(self, api.loadDemo(), { patch: { sel: {} } });
A.clearDemo = self => A.run(self, api.clearData(), { patch: { sel: {}, openOrder: null } });

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
A.saveOrder = async self => {
  const f = self.state.form, er = {};
  if (!f.clientId) er.client = 'Выберите клиента';
  if (f.clientId === '__new' && f.newName.trim().length < 2) er.client = 'Укажите имя клиента';
  if (!f.supplier.trim()) er.supplier = 'Укажите поставщика';
  f.items.forEach((r, i) => {
    if (!r.name.trim()) er['i' + i] = 'Укажите название товара';
    else if (!(parseInt(r.qty, 10) >= 1)) er['i' + i] = 'Количество — целое число от 1';
    else if (r.price !== '' && !(+r.price >= 0)) er['i' + i] = 'Стоимость должна быть числом';
  });
  if (Object.keys(er).length) return self.setState({ errors: er });
  const body = {
    clientId: f.clientId, newClientName: f.newName.trim(), newClientPhone: f.newPhone.trim(), supplier: f.supplier.trim(), supplierContact: f.supplierContact.trim(),
    originCountry: f.country, originCity: f.originCity, destCity: f.destCity, eta: f.eta, notes: f.notes,
    items: f.items.map(r => ({ id: r.id || null, name: r.name.trim(), qty: parseInt(r.qty, 10), price: +r.price || 0, photo: r.photo })),
  };
  await A.run(self, f.mode === 'create' ? api.createOrder(body) : api.updateOrder(f.id, body), { patch: res => ({ modal: null, form: null, errors: {}, openOrder: res.id }) });
};
A.saveNote = (self, id, notes) => A.run(self, api.patchOrder(id, { notes }), { patch: { noteDraft: null } });
A.archive = (self, id) => {
  const o = self.state.data.orders.find(x => x.id === id);
  return A.run(self, api.patchOrder(id, { archived: !o.archived }), { patch: { openOrder: null } });
};
A.askDelete = (self, id) => self.setState({
  modal: 'confirm', confirm: {
    title: 'Удалить заказ ' + id + '?', text: 'Заказ и все его товары будут удалены без возможности восстановления. Если нужно лишь скрыть заказ — используйте архив.', cta: 'Удалить',
    action: () => A.run(self, api.deleteOrder(id), { patch: { modal: null, openOrder: null } }),
  },
});
A.setBase = (self, id, n) => A.run(self, api.patchOrder(id, { baseStage: n }), { toast: false });
A.addFiles = (self, id, list) => {
  Array.from(list || []).forEach(file => {
    const kind = file.type.startsWith('image/') ? 'Фото' : file.type === 'application/pdf' ? 'PDF' : 'Документ';
    const push = data => A.run(self, api.addFile(id, { name: file.name, size: file.size, kind, data: data || null }));
    if (kind === 'Фото') B.readImage(file, push, 640); else push(null);
  });
};
A.removeFile = (self, id, i) => {
  const o = self.state.data.orders.find(x => x.id === id), f = o && o.files[i];
  if (f) A.run(self, api.removeFile(id, f.id));
};
A.regen = (self, id) => A.run(self, api.regenToken(id));

// shipments
A.toggleSel = (self, id) => self.setState(s => ({ sel: Object.assign({}, s.sel, { [id]: !s.sel[id] }) }));
A.assign = (self, ids, shipId) => {
  if (!shipId || !ids.length) return;
  return A.run(self, api.assign(shipId, ids), { patch: { sel: {} } });
};
A.unassign = (self, ids) => { if (ids.length) return A.run(self, api.unassign(ids)); };
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
  const f = self.state.shipForm, er = {};
  if (f.track && !/^[\w\- ]{4,40}$/.test(f.track.trim())) er.track = 'Только латиница, цифры, «-», от 4 символов';
  if (Object.keys(er).length) return self.setState({ errors: er });
  const body = { carrier: f.carrier, track: f.track.trim(), originCity: f.originCity, destCity: f.destCity, eta: f.eta, itemIds: f.itemIds };
  return A.run(self, f.mode === 'create' ? api.createShip(body) : api.updateShip(f.id, body), { patch: res => ({ modal: null, shipForm: null, sel: {}, selShip: res.id }) });
};
A.askDeleteShip = (self, id) => self.setState({
  modal: 'confirm', confirm: {
    title: 'Удалить ' + id + '?', text: 'Товары вернутся в список нераспределённых. Историю отправления восстановить нельзя.', cta: 'Удалить',
    action: () => A.run(self, api.deleteShip(id), { patch: { modal: null, selShip: null } }),
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
  return A.run(self, api.addEvent(f.shipId, { stage: +f.stage, city: f.city, at, note: f.note.trim(), delayed: !!f.delayed }), { patch: { modal: null, sf: null } });
};

// csv
A.exportCSV = (self, list, D) => {
  const rows = [['ID товара', 'Заказ', 'Товар', 'Кол-во', 'Цена, ₸', 'Клиент', 'Телефон', 'Страна', 'Город отправления', 'Город назначения', 'Отправление', 'Перевозчик', 'Трек-номер', 'Статус', 'Ожидаемая дата']];
  list.forEach(o => o.items.forEach(i => {
    const s = i.shipmentId && D.S[i.shipmentId];
    rows.push([i.id, o.id, i.name, i.qty, i.price, o.clientName, o.client.phone || '', o.originCountry, o.originCity, o.destCity, s ? s.id : '', s ? B.cName(s.carrier) : '', s ? s.track : '', B.STAGES[s ? s.stage : o.baseStage], (s && s.eta) || o.eta || '']);
  }));
  const csv = '﻿' + rows.map(r => r.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(';')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'buyertrack-' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a); a.click(); a.remove();
  A.toast(self, 'Экспортировано строк: ' + (rows.length - 1));
};

export default A;
