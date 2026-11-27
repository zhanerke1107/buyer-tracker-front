import { AttChip, Button, Card, DangerBtn, H3, History, IconButton, LinkBtn, Pill, Thumb, Timeline } from './ui.jsx';

const lbl = { fontSize: 12, color: 'var(--ink-600)' };
const Info = ({ label, value, sub, accent }) => (
  <div>
    <div style={lbl}>{label}</div>
    <div style={{ fontWeight: accent ? 600 : 500, color: accent ? 'var(--violet-500)' : undefined }}>{value}</div>
    {sub && <div style={lbl}>{sub}</div>}
  </div>
);

export default function OrderDrawer({ vm }) {
  const od = vm.od;
  if (!od) return null;
  return (
    <div onClick={vm.closeOd} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(21,21,54,.28)', display: 'flex', justifyContent: 'flex-end' }}>
      <aside onClick={e => e.stopPropagation()} style={{ width: 'min(580px,100vw)', height: '100%', background: 'var(--ink-50)', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-raised)' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 2, background: '#fff', borderBottom: '1px solid var(--ink-200)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '600 17px/1.3 var(--font-sans)' }}>{od.id}</div>
            <div style={{ font: '400 12px/1.3 var(--font-sans)', color: 'var(--ink-600)' }}>Создан {od.created}</div>
          </div>
          <IconButton icon="pencil-simple" variant="soft" size={36} label="Редактировать" onClick={od.onEdit} />
          <IconButton icon="x" variant="ghost" size={36} label="Закрыть" onClick={vm.closeOd} />
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card style={{ gap: 10 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <Pill pill={od.pill} />
              {od.attention && <AttChip reason={od.reason} />}
              {od.archived && <span style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--ink-100)', font: '500 12px/1.2 var(--font-sans)', color: 'var(--ink-800)' }}>В архиве</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, font: '400 13px/1.4 var(--font-sans)' }}>
              <Info label="Клиент" value={od.client} sub={od.phone + ' · ' + od.ccity} />
              <Info label="Поставщик" value={od.supplier} sub={od.contact} />
              <Info label="Маршрут" value={od.from + ' → ' + od.to} />
              <Info label="Прибытие" value={od.eta} />
              <Info label="Количество" value={od.qty} />
              <Info label="Стоимость" value={od.total} accent />
            </div>
          </Card>

          <Card style={{ gap: 8 }}>
            <H3 style={{ margin: '0 0 4px' }}>Товары</H3>
            {od.split && <div style={{ font: '500 12px/1.4 var(--font-sans)', color: 'var(--violet-600)' }}>{od.splitText}</div>}
            {od.items.map(i => (
              <div key={i.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--ink-100)' }}>
                <Thumb x={i} size={52} icon={20} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ font: '500 13px/1.3 var(--font-sans)' }}>{i.name}</span>
                  <span style={{ font: '400 12px/1.3 var(--font-sans)', color: 'var(--ink-600)' }}>{i.id} · {i.meta}</span>
                  <button type="button" onClick={i.onGo} style={{ alignSelf: 'flex-start', border: 'none', background: 'none', padding: 0, font: '500 12px var(--font-sans)', color: 'var(--violet-500)', cursor: 'pointer', display: 'flex', gap: 4, alignItems: 'center' }}><i className="ph ph-package" />{i.ship}</button>
                </div>
                <span style={{ font: '500 13px var(--font-sans)' }}>{i.sum}</span>
              </div>
            ))}
          </Card>

          <Card style={{ gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <H3 style={{ flex: 1 }}>Статус доставки</H3>
              {od.hasShips && <LinkBtn onClick={od.onMap} fs={12}>Показать на карте</LinkBtn>}
            </div>
            {od.hasBase && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ font: '400 12px var(--font-sans)', color: 'var(--ink-600)' }}>Нераспределённые товары:</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {od.baseBtns.map(b => (
                    <button key={b.label} type="button" onClick={b.onClick} style={{ height: 32, padding: '0 12px', border: '1px solid var(--ink-200)', borderRadius: 999, background: b.active ? 'var(--violet-500)' : '#fff', color: b.active ? '#fff' : 'var(--ink-800)', font: '500 12px var(--font-sans)', cursor: 'pointer' }}>{b.label}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {od.shipBtns.map(b => <Button key={b.id} size="sm" variant="soft" onClick={b.onClick}>{b.label}</Button>)}
            </div>
            {od.manual && <span style={{ font: '400 11px/1.4 var(--font-sans)', color: 'var(--ink-600)' }}>Отслеживание ручное: API перевозчика не подключён.</span>}
            <div style={{ display: 'flex', flexDirection: 'column', paddingTop: 4 }}>
              <Timeline rows={od.steps} minLine={14} pb={8} inline />
            </div>
          </Card>

          {od.hasHistory && (
            <Card style={{ gap: 2 }}>
              <H3 style={{ margin: '0 0 6px' }}>История перемещения</H3>
              <History list={od.history} withShip />
            </Card>
          )}

          <Card style={{ gap: 10 }}>
            <H3>Ссылка для клиента</H3>
            <span style={{ font: '400 12px/1.4 var(--font-sans)', color: 'var(--ink-600)' }}>Клиент увидит статус, маршрут и товары без цен — без регистрации.</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input readOnly value={od.link} style={{ flex: 1, minWidth: 0, height: 36, padding: '0 12px', border: '1px solid var(--ink-200)', borderRadius: 10, background: 'var(--ink-50)', font: '400 12px var(--font-sans)', color: 'var(--ink-800)' }} />
              <IconButton icon="copy" variant="soft" size={36} label="Скопировать" onClick={od.onCopy} />
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <LinkBtn onClick={od.onPublic} fs={12}>Открыть как клиент</LinkBtn>
              <LinkBtn onClick={od.onRegen} fs={12} color="var(--ink-600)">Перевыпустить ссылку</LinkBtn>
            </div>
          </Card>

          <Card style={{ gap: 10 }}>
            <H3>Заметки</H3>
            <textarea className="f-violet" value={od.note} onChange={od.onNote} rows={3} placeholder="Комментарий для себя: договорённости, размеры, особенности упаковки..." style={{ padding: '10px 12px', border: '1px solid var(--ink-200)', borderRadius: 10, font: '400 13px/1.5 var(--font-sans)', resize: 'vertical', outline: 'none' }} />
            {od.noteDirty && <Button size="sm" onClick={od.onSaveNote} style={{ alignSelf: 'flex-start' }}>Сохранить</Button>}
          </Card>

          <Card style={{ gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <H3 style={{ flex: 1 }}>Фото, чеки, документы</H3>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--violet-50)', color: 'var(--violet-500)', font: '500 13px var(--font-sans)', cursor: 'pointer' }}>
                <i className="ph ph-paperclip" />Прикрепить
                <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={od.onFile} style={{ display: 'none' }} />
              </label>
            </div>
            {od.files.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderTop: '1px solid var(--ink-100)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--ink-100)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {f.isImg ? <img src={f.data} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="ph ph-file-text" style={{ fontSize: 18, color: 'var(--ink-600)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '500 13px/1.3 var(--font-sans)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                  <div style={{ font: '400 11px var(--font-sans)', color: 'var(--ink-600)' }}>{f.meta}</div>
                </div>
                <button type="button" onClick={f.onRemove} aria-label="Удалить файл" className="h-ink100" style={{ width: 28, height: 28, border: 'none', borderRadius: 8, background: 'none', color: 'var(--ink-600)', cursor: 'pointer' }}><i className="ph ph-trash" /></button>
              </div>
            ))}
          </Card>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '4px 0 24px' }}>
            <Button size="sm" variant="outline" icon="archive" onClick={od.onArchive}>{od.archiveLabel}</Button>
            <DangerBtn onClick={od.onDelete} style={{ padding: '0 14px' }}><i className="ph ph-trash" style={{ color: 'var(--red-500)' }} />Удалить заказ</DangerBtn>
          </div>
        </div>
      </aside>
    </div>
  );
}
