import { Button, Check, LinkBtn, Pill, SearchBar, Segmented, Select, Thumb } from '../components/ui.jsx';

const COLS = 'minmax(240px,2.4fr) 70px minmax(120px,1.2fr) minmax(110px,1fr) minmax(90px,.9fr) minmax(150px,1.3fr) minmax(170px,1.4fr) 110px';
const fsel = { height: 40, padding: '0 10px', font: '400 13px var(--font-sans)', minWidth: 0 };
const small = { fontSize: 12, color: 'var(--ink-600)' };

export default function Orders({ vm }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1400 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, font: '600 22px/1.3 var(--font-sans)', flex: 1, minWidth: 160 }}>Заказы</h1>
        <Segmented items={vm.ordSeg} />
        <Button size="sm" variant="soft" icon="download-simple" onClick={vm.exportCSV}>CSV</Button>
        <Button size="sm" icon="plus" onClick={vm.openCreate}>Новый заказ</Button>
      </div>
      <SearchBar placeholder="Номер заказа, товар, клиент, трек-номер..." value={vm.q} onChange={vm.onQ} onFilter={vm.toggleFilters} />
      {vm.showFilters && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, alignItems: 'center' }}>
          <Select value={vm.flt.status} onChange={vm.on.status} opts={vm.statusOpts} style={fsel} />
          <Select value={vm.flt.client} onChange={vm.on.client} opts={vm.clientOpts} style={fsel} />
          <Select value={vm.flt.country} onChange={vm.on.country} opts={vm.countryOpts} style={fsel} />
          <Select value={vm.flt.dest} onChange={vm.on.dest} opts={vm.destOpts} style={fsel} />
          <Select value={vm.flt.carrier} onChange={vm.on.carrier} opts={vm.carrierOpts} style={fsel} />
          <Check checked={vm.flt.archived} onChange={vm.on.archived}>Архив</Check>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, font: '400 13px var(--font-sans)', color: 'var(--ink-600)' }}>
        <span>{vm.resultStr}</span>
        {vm.hasF && <LinkBtn onClick={vm.resetF}>Сбросить фильтры</LinkBtn>}
      </div>

      {!vm.hasRows && (
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow-card)', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
          <i className="ph ph-receipt" style={{ fontSize: 32, color: 'var(--ink-400)' }} />
          <span style={{ font: '500 15px var(--font-sans)' }}>Заказы не найдены</span>
          <span style={{ font: '400 13px/1.5 var(--font-sans)', color: 'var(--ink-600)', maxWidth: 360 }}>Измените фильтры или создайте первый заказ — товары, клиента и маршрут можно указать сразу.</span>
          <Button size="sm" icon="plus" onClick={vm.openCreate}>Новый заказ</Button>
        </div>
      )}

      {vm.ordTable && vm.hasRows && (vm.isDesktop ? <OrdersTable rows={vm.rows} /> : <OrdersCards rows={vm.rows} />)}
      {vm.ordClients && <ByClient groups={vm.byClient} />}
    </div>
  );
}

function OrdersTable({ rows }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow-card)', overflowX: 'auto' }}>
      <div style={{ minWidth: 1080, font: '400 13px/1.4 var(--font-sans)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--ink-200)', font: '500 12px/1.3 var(--font-sans)', color: 'var(--ink-600)' }}>
          <span>Товар</span><span>Кол-во</span><span>Клиент</span><span>Откуда</span><span>Куда</span><span>Перевозчик / трек</span><span>Статус</span><span>Прибытие</span>
        </div>
        {rows.map(r => (
          <div key={r.id} onClick={r.onOpen} className="h-ink50" style={{ display: 'grid', gridTemplateColumns: COLS, gap: 8, alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--ink-100)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
              <Thumb x={r} />
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{r.title}</span>
                <span style={small}>{r.id} {r.more}</span>
              </div>
            </div>
            <span style={{ color: 'var(--ink-800)' }}>{r.qty}</span>
            <span style={{ color: 'var(--ink-900)' }}>{r.client}</span>
            <div><div style={{ color: 'var(--ink-900)' }}>{r.from}</div><div style={small}>{r.fromC}</div></div>
            <span style={{ color: 'var(--ink-900)' }}>{r.to}</span>
            <div style={{ minWidth: 0 }}><div style={{ color: 'var(--ink-900)' }}>{r.carrier}</div><div style={{ ...small, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.track}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
              <Pill pill={r.pill} />
              {r.attention && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '500 11px var(--font-sans)', color: 'var(--red-500)' }}><i className="ph-fill ph-warning-circle" />{r.reason}</span>}
            </div>
            <div style={{ whiteSpace: 'nowrap' }}><div style={{ color: 'var(--ink-900)' }}>{r.eta}</div><div style={small}>{r.etaRel}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersCards({ rows }) {
  const meta = { font: '400 12px/1.3 var(--font-sans)', color: 'var(--ink-600)' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map(r => (
        <button key={r.id} type="button" onClick={r.onOpen} style={{ display: 'flex', gap: 12, padding: 12, border: 'none', borderRadius: 14, background: '#fff', boxShadow: 'var(--shadow-card)', textAlign: 'left', cursor: 'pointer' }}>
          <Thumb x={r} size={56} icon={20} />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ font: '500 14px/1.3 var(--font-sans)', color: 'var(--ink-900)' }}>{r.title}</span>
            <span style={meta}>{r.id} · {r.client} · {r.qty}</span>
            <span style={meta}>{r.from} → {r.to} · {r.eta}</span>
            <Pill pill={r.pill} fs={11} style={{ alignSelf: 'flex-start' }} />
            {r.attention && <span style={{ font: '500 11px var(--font-sans)', color: 'var(--red-500)' }}>{r.reason}</span>}
          </div>
        </button>
      ))}
    </div>
  );
}

function ByClient({ groups }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,340px),1fr))', gap: 14, alignItems: 'start' }}>
      {groups.map(g => (
        <section key={g.id} style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow-card)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--violet-100)', color: 'var(--violet-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="ph-fill ph-user" style={{ fontSize: 18 }} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '600 14px/1.3 var(--font-sans)' }}>{g.name}</div>
              <div style={{ font: '400 12px/1.3 var(--font-sans)', color: 'var(--ink-600)' }}>{g.city} · {g.phone}</div>
            </div>
            <span style={{ font: '500 12px var(--font-sans)', color: 'var(--ink-600)' }}>{g.stat}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {g.items.map(i => (
              <button key={i.id} type="button" onClick={i.onOpen} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', border: 'none', borderTop: '1px solid var(--ink-100)', background: 'none', textAlign: 'left', cursor: 'pointer' }}>
                <Thumb x={i} size={40} radius={8} icon={16} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ font: '500 13px/1.3 var(--font-sans)', color: 'var(--ink-900)' }}>{i.name}</span>
                  <span style={{ font: '400 11px/1.3 var(--font-sans)', color: 'var(--ink-600)' }}>{i.meta} · {i.ship}</span>
                </div>
                <Pill pill={i.pill} fs={11} pad="3px 8px" nowrap />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
