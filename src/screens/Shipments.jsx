import { AttChip, AttIcon, Button, DangerBtn, H2, H3, History, LinkBtn, Pill, Segmented, Select, Thumb, Timeline } from '../components/ui.jsx';

const t11 = { font: '400 11px/1.3 var(--font-sans)', color: 'var(--ink-600)' };
const splitSt = { font: '500 11px/1.3 var(--font-sans)', color: 'var(--violet-600)' };

export default function Shipments({ vm }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1400 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ margin: 0, font: '600 22px/1.3 var(--font-sans)' }}>Отправления</h1>
          <p style={{ margin: '4px 0 0', font: '400 13px/1.5 var(--font-sans)', color: 'var(--ink-600)' }}>Одна посылка — товары нескольких клиентов. Один заказ — несколько посылок. Каждый товар помнит клиента и заказ.</p>
        </div>
        <Segmented items={vm.shipSeg} />
        <Button size="sm" icon="package" onClick={vm.newShip}>Новое отправление</Button>
      </div>
      {vm.shipBoard ? <Board vm={vm} /> : <Detail vm={vm} />}
    </div>
  );
}

function Board({ vm }) {
  const z = vm.unZone;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <section onDragOver={z.onDragOver} onDragLeave={z.onDragLeave} onDrop={z.onDrop} style={{ flex: '1 1 340px', minWidth: 0, background: z.zbg, border: '1.5px solid ' + z.zb, borderRadius: 14, boxShadow: 'var(--shadow-card)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <H2 style={{ flex: 1 }}>Нераспределённые товары</H2>
          <span style={{ font: '600 13px var(--font-sans)', color: 'var(--ink-600)' }}>{vm.unCount}</span>
        </div>
        {vm.hasSel ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 10, background: 'var(--violet-50)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: '500 13px var(--font-sans)', color: 'var(--ink-900)' }}>
              <span style={{ flex: 1 }}>Выбрано: {vm.selCount}</span>
              <LinkBtn onClick={vm.clearSel} fs={12} color="var(--ink-600)">Снять выбор</LinkBtn>
            </div>
            {vm.hasTargets && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Select value={vm.target} onChange={vm.onTarget} opts={vm.targetOpts} style={{ flex: 1, minWidth: 0, height: 36, padding: '0 10px', font: '400 13px var(--font-sans)' }} />
                <Button size="sm" onClick={vm.addToTarget}>Добавить</Button>
              </div>
            )}
            <Button size="sm" variant="outline" icon="plus" onClick={vm.newShipFromSel} fullWidth>Новое отправление из выбранных</Button>
          </div>
        ) : (
          <p style={{ margin: 0, font: '400 12px/1.5 var(--font-sans)', color: 'var(--ink-600)' }}>Отметьте товары или перетащите их в посылку справа. Перетащите товар сюда, чтобы убрать его из посылки.</p>
        )}
        {vm.unGroups.map(g => (
          <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ font: '600 12px/1.3 var(--font-sans)', color: 'var(--ink-800)' }}>{g.name}</span>
            {g.items.map(i => (
              <div key={i.id} draggable onDragStart={i.onDragStart} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 8, borderRadius: 10, background: '#fff', border: '1px solid var(--ink-200)', cursor: 'grab' }}>
                <input type="checkbox" checked={i.checked} onChange={i.onToggle} aria-label="Выбрать" style={{ width: 18, height: 18, accentColor: 'var(--violet-500)', flexShrink: 0, cursor: 'pointer' }} />
                <Thumb x={i} size={40} radius={8} icon={16} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ font: '500 13px/1.3 var(--font-sans)', color: 'var(--ink-900)' }}>{i.name}</span>
                  <span style={t11}>{i.meta}</span>
                </div>
                <i className="ph ph-dots-six-vertical" style={{ fontSize: 18, color: 'var(--ink-400)' }} />
              </div>
            ))}
          </div>
        ))}
        {!vm.hasUn && <p style={{ margin: 0, padding: '16px 0', font: '400 13px/1.5 var(--font-sans)', color: 'var(--ink-600)', textAlign: 'center' }}>Все товары распределены по отправлениям.</p>}
      </section>

      <div style={{ flex: '2 1 460px', minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap: 14, alignItems: 'start' }}>
        {vm.boardShips.map(s => (
          <section key={s.id} onDragOver={s.onDragOver} onDragLeave={s.onDragLeave} onDrop={s.onDrop} style={{ background: s.zbg, border: '1.5px solid ' + s.zb, borderRadius: 14, boxShadow: 'var(--shadow-card)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 14px/1.3 var(--font-sans)', color: 'var(--ink-900)' }}>{s.id} · {s.routeShort}</div>
                <div style={{ font: '400 12px/1.4 var(--font-sans)', color: 'var(--ink-600)' }}>{s.carrier} · {s.track}</div>
              </div>
              {s.locked && <i className="ph ph-lock-simple" title="Передано перевозчику — состав зафиксирован" style={{ fontSize: 16, color: 'var(--ink-500)' }} />}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <Pill pill={s.pill} />
              {s.attention && <AttChip reason={s.reason} />}
            </div>
            <div style={{ font: '400 12px/1.4 var(--font-sans)', color: 'var(--ink-600)' }}>{s.count} · последний пункт: {s.last}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {s.items.map(i => (
                <div key={i.id} draggable={i.canRemove} onDragStart={i.onDragStart} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 8px', borderRadius: 10, background: 'var(--ink-50)' }}>
                  <Thumb x={i} size={34} radius={8} icon={14} />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ font: '500 12px/1.3 var(--font-sans)', color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.name}</span>
                    <span style={t11}>{i.client} · {i.meta}</span>
                    {i.hasSplit && <span style={splitSt}>{i.split}</span>}
                  </div>
                  {i.canRemove && (
                    <button type="button" onClick={i.onRemove} aria-label="Убрать из посылки" className="h-ink100" style={{ width: 28, height: 28, border: 'none', borderRadius: 8, background: 'none', color: 'var(--ink-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="ph ph-x" /></button>
                  )}
                </div>
              ))}
              {s.empty && <div style={{ padding: 16, border: '1.5px dashed var(--ink-300)', borderRadius: 10, font: '400 12px/1.4 var(--font-sans)', color: 'var(--ink-600)', textAlign: 'center' }}>Перетащите товары сюда</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button size="sm" variant="soft" onClick={s.onStatus}>Обновить статус</Button>
              <Button size="sm" variant="outline" onClick={s.onDetail}>Детали</Button>
            </div>
          </section>
        ))}
        {!vm.boardShips.length && <div style={{ padding: 32, borderRadius: 14, background: '#fff', boxShadow: 'var(--shadow-card)', font: '400 13px/1.5 var(--font-sans)', color: 'var(--ink-600)', textAlign: 'center' }}>Активных отправлений нет. Создайте отправление и добавьте в него товары.</div>}
      </div>
    </div>
  );
}

function Detail({ vm }) {
  const sd = vm.sd;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {vm.shipList.map(s => (
          <button key={s.id} type="button" onClick={s.onClick} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', border: '1.5px solid ' + (s.selected ? 'var(--violet-300)' : 'transparent'), borderRadius: 14, background: s.selected ? 'var(--violet-50)' : '#fff', boxShadow: 'var(--shadow-card)', textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <span style={{ font: '600 13px/1.3 var(--font-sans)', color: 'var(--ink-900)', flex: 1 }}>{s.id} · {s.routeShort}</span>
              {s.attention && <AttIcon />}
            </span>
            <span style={{ font: '400 12px/1.3 var(--font-sans)', color: 'var(--ink-600)' }}>{s.carrier} · {s.count}</span>
            <Pill pill={s.pill} fs={11} pad="3px 9px" style={{ alignSelf: 'flex-start' }} />
          </button>
        ))}
        {!vm.shipList.length && <p style={{ font: '400 13px var(--font-sans)', color: 'var(--ink-600)' }}>Отправлений пока нет.</p>}
      </div>

      {sd && (
        <section style={{ flex: '2.4 1 480px', minWidth: 0, background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow-card)', padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ font: '600 18px/1.3 var(--font-sans)' }}>{sd.id}</div>
              <div style={{ font: '400 13px/1.5 var(--font-sans)', color: 'var(--ink-600)' }}>{sd.carrier} · трек {sd.track} · прибытие {sd.eta}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {sd.notDone && <Button size="sm" onClick={sd.onStatus}>Обновить статус</Button>}
              <Button size="sm" variant="soft" icon="map-trifold" onClick={sd.onMap}>На карте</Button>
              <Button size="sm" variant="outline" onClick={sd.onEdit}>Изменить</Button>
              {sd.canDelete && <DangerBtn onClick={sd.onDelete}>Удалить</DangerBtn>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, background: 'var(--ink-50)', font: '400 12px/1.5 var(--font-sans)', color: 'var(--ink-800)' }}>
            <i className="ph ph-hand-pointing" style={{ fontSize: 16, color: 'var(--ink-600)', marginTop: 1 }} />{sd.apiNote}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <H3 style={{ margin: '0 0 10px' }}>Маршрут</H3>
              <Timeline rows={sd.routeSteps} minLine={22} pb={12} />
            </div>
            <div style={{ flex: '1.4 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <H3>Содержимое · {sd.count}</H3>
              {sd.groups.map(g => (
                <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ font: '500 12px/1.3 var(--font-sans)', color: 'var(--ink-800)' }}>{g.name} · {g.phone}</span>
                  {g.items.map(i => (
                    <div key={i.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 8px', borderRadius: 10, background: 'var(--ink-50)' }}>
                      <Thumb x={i} size={34} radius={8} icon={14} />
                      <button type="button" onClick={i.onOpen} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1, border: 'none', background: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
                        <span style={{ font: '500 12px/1.3 var(--font-sans)', color: 'var(--ink-900)' }}>{i.name}</span>
                        <span style={t11}>{i.meta}</span>
                        {i.hasSplit && <span style={splitSt}>{i.split}</span>}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              {sd.empty && <p style={{ margin: 0, font: '400 12px var(--font-sans)', color: 'var(--ink-600)' }}>В отправлении пока нет товаров.</p>}
              {sd.canAdd && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 6, borderTop: '1px solid var(--ink-100)' }}>
                  <span style={{ font: '500 12px var(--font-sans)', color: 'var(--ink-800)' }}>Добавить нераспределённые</span>
                  {sd.addable.map(i => (
                    <label key={i.id} style={{ display: 'flex', gap: 10, alignItems: 'center', font: '400 12px/1.3 var(--font-sans)', color: 'var(--ink-900)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={i.checked} onChange={i.onToggle} style={{ width: 16, height: 16, accentColor: 'var(--violet-500)' }} />{i.name} · <span style={{ color: 'var(--ink-600)' }}>{i.client}</span>
                    </label>
                  ))}
                  {sd.hasSel && <Button size="sm" onClick={sd.onAddSel} style={{ alignSelf: 'flex-start' }}>Добавить выбранные</Button>}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <H3 style={{ margin: '0 0 6px' }}>История статусов</H3>
            <History list={sd.history} suffix=" · вручную" />
          </div>
        </section>
      )}
    </div>
  );
}
