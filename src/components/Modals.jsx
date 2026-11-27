import { Button, Check, DangerBtn, Field, IconButton, Input, Select } from './ui.jsx';

function Overlay({ onClose, width, padded = true, children }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(21,21,54,.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(' + width + 'px,100%)', maxHeight: '92vh', overflowY: 'auto', background: '#fff', borderRadius: 18, boxShadow: 'var(--shadow-raised)', display: 'flex', flexDirection: 'column', ...(padded ? { padding: 20, gap: 14 } : {}) }}>
        {children}
      </div>
    </div>
  );
}

const Title = ({ children, style }) => <h2 style={{ margin: 0, font: '600 17px/1.3 var(--font-sans)', ...style }}>{children}</h2>;
const Footer = ({ onCancel, onSave, cta }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
    <Button variant="outline" size="sm" onClick={onCancel}>Отмена</Button>
    <Button size="sm" onClick={onSave}>{cta}</Button>
  </div>
);

export function OrderModal({ vm }) {
  const of = vm.of, v = of.v;
  return (
    <Overlay onClose={vm.closeModal} width={680} padded={false}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--ink-200)', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
        <Title style={{ flex: 1 }}>{of.title}</Title>
        <IconButton icon="x" variant="ghost" size={36} label="Закрыть" onClick={vm.closeModal} />
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          <Field label="Клиент *" err={of.err.client}>
            <Select value={v.clientId} onChange={of.on.clientId} opts={of.clientOpts} />
          </Field>
          {of.isNew && (
            <>
              <Field label="Имя нового клиента *"><Input value={v.newName} onChange={of.on.newName} placeholder="Имя и фамилия" /></Field>
              <Field label="Телефон"><Input value={v.newPhone} onChange={of.on.newPhone} placeholder="+7" /></Field>
            </>
          )}
          <Field label="Поставщик *" err={of.err.supplier}>
            <Input value={v.supplier} onChange={of.on.supplier} placeholder="Магазин, рынок, павильон" />
          </Field>
          <Field label="Контакт поставщика">
            <Input value={v.supplierContact} onChange={of.on.contact} placeholder="WeChat, WhatsApp, телефон" />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
          <Field label="Страна закупки"><Select value={v.country} onChange={of.on.country} opts={of.countryOpts} /></Field>
          <Field label="Город отправления"><Select value={v.originCity} onChange={of.on.originCity} opts={of.cityOpts} /></Field>
          <Field label="Город назначения"><Select value={v.destCity} onChange={of.on.destCity} opts={of.destOpts} /></Field>
          <Field label="Ожидаемая дата"><Input type="date" value={v.eta} onChange={of.on.eta} /></Field>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ font: '600 14px/1.3 var(--font-sans)' }}>Товары</div>
          {of.rows.map(r => (
            <div key={r.key} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12, borderRadius: 14, background: 'var(--ink-50)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <label title="Загрузить фото" style={{ width: 52, height: 52, borderRadius: 10, background: '#fff', border: '1.5px dashed var(--ink-300)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {r.hasPhoto ? <img src={r.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="ph ph-camera-plus" style={{ fontSize: 20, color: 'var(--ink-500)' }} />}
                  <input type="file" accept="image/*" onChange={r.onPhoto} style={{ display: 'none' }} />
                </label>
                <Input h={40} value={r.name} onChange={r.onName} placeholder="Название товара" style={{ flex: '3 1 180px', minWidth: 0 }} />
                <Input h={40} type="number" min="1" value={r.qty} onChange={r.onQty} aria-label="Количество" style={{ flex: '0 1 72px', minWidth: 0, padding: '0 10px' }} />
                <Input h={40} type="number" min="0" value={r.price} onChange={r.onPrice} placeholder="Цена, ₸" style={{ flex: '1 1 100px', minWidth: 0, padding: '0 10px' }} />
                {r.canRemove && <button type="button" onClick={r.onRemove} aria-label="Удалить товар" className="h-ink100" style={{ width: 36, height: 36, border: 'none', borderRadius: 10, background: 'none', color: 'var(--ink-600)', cursor: 'pointer' }}><i className="ph ph-trash" style={{ fontSize: 16 }} /></button>}
              </div>
              {r.err && <span style={{ color: 'var(--red-500)', font: '400 12px var(--font-sans)' }}>{r.err}</span>}
            </div>
          ))}
          <button type="button" onClick={of.addRow} style={{ alignSelf: 'flex-start', border: 'none', background: 'none', padding: 0, font: '500 13px var(--font-sans)', color: 'var(--violet-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><i className="ph ph-plus" />Добавить товар</button>
        </div>
        <Field label="Описание и заметки">
          <textarea className="f-violet" value={v.notes} onChange={of.on.notes} rows={2} placeholder="Размеры, цвет, особенности" style={{ padding: '10px 12px', border: '1px solid var(--ink-200)', borderRadius: 10, font: '400 13px/1.5 var(--font-sans)', resize: 'vertical', outline: 'none' }} />
        </Field>
      </div>
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--ink-200)', position: 'sticky', bottom: 0, background: '#fff' }}>
        <Footer onCancel={vm.closeModal} onSave={of.onSave} cta={of.cta} />
      </div>
    </Overlay>
  );
}

export function ShipModal({ vm }) {
  const f = vm.shf, v = f.v;
  return (
    <Overlay onClose={vm.closeModal} width={520}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Title style={{ flex: 1 }}>{f.title}</Title>
        <IconButton icon="x" variant="ghost" size={36} label="Закрыть" onClick={vm.closeModal} />
      </div>
      {f.count && <div style={{ font: '500 13px var(--font-sans)', color: 'var(--violet-600)' }}>{f.count}</div>}
      <Field label="Перевозчик" hint="Интеграции с API перевозчиков пока нет — статусы обновляются вручную.">
        <Select value={v.carrier} onChange={f.on.carrier} opts={f.carrierOpts} />
      </Field>
      <Field label="Трек-номер" err={f.err}>
        <Input value={v.track} onChange={f.on.track} placeholder="Можно добавить позже" />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
        {f.canOrigin && <Field label="Откуда"><Select value={v.originCity} onChange={f.on.originCity} opts={f.originOpts} /></Field>}
        <Field label="Куда"><Select value={v.destCity} onChange={f.on.destCity} opts={f.destOpts} /></Field>
        <Field label="Ожидаемая дата"><Input type="date" value={v.eta} onChange={f.on.eta} /></Field>
      </div>
      <div style={{ font: '400 12px/1.5 var(--font-sans)', color: 'var(--ink-600)' }}>Маршрут: {f.route}</div>
      <Footer onCancel={vm.closeModal} onSave={f.onSave} cta={f.cta} />
    </Overlay>
  );
}

export function StatusModal({ vm }) {
  const f = vm.stf, v = f.v;
  return (
    <Overlay onClose={vm.closeModal} width={480}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Title>{f.title}</Title>
          <div style={{ font: '400 12px/1.4 var(--font-sans)', color: 'var(--ink-600)', marginTop: 2 }}>{f.sub}</div>
        </div>
        <IconButton icon="x" variant="ghost" size={36} label="Закрыть" onClick={vm.closeModal} />
      </div>
      <Field label="Новый этап"><Select value={v.stage} onChange={f.on.stage} opts={f.stageOpts} /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
        <Field label="Подтверждённый город" err={f.err.city}><Select value={v.city} onChange={f.on.city} opts={f.cityOpts} /></Field>
        <Field label="Дата и время" err={f.err.at}><Input type="datetime-local" value={v.at} onChange={f.on.at} /></Field>
      </div>
      <Field label="Комментарий"><Input value={v.note} onChange={f.on.note} placeholder="Например: прошли таможню" /></Field>
      <Check checked={v.delayed} onChange={f.on.delayed}>Отметить задержку</Check>
      <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--ink-50)', font: '400 12px/1.5 var(--font-sans)', color: 'var(--ink-800)' }}>{f.api}</div>
      <Footer onCancel={vm.closeModal} onSave={f.onSave} cta="Записать событие" />
    </Overlay>
  );
}

export function ConfirmModal({ vm }) {
  const cf = vm.cf;
  return (
    <div onClick={vm.closeModal} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(21,21,54,.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(420px,100%)', background: '#fff', borderRadius: 18, boxShadow: 'var(--shadow-raised)', padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Title>{cf.title}</Title>
        <p style={{ margin: 0, font: '400 13px/1.55 var(--font-sans)', color: 'var(--ink-600)' }}>{cf.text}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
          <Button variant="outline" size="sm" onClick={vm.closeModal}>Отмена</Button>
          <DangerBtn solid onClick={cf.action}>{cf.cta}</DangerBtn>
        </div>
      </div>
    </div>
  );
}
