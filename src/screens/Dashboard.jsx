import RouteMap from '../components/RouteMap.jsx';
import { AttIcon, Card, H2, Muted, Segmented, Thumb } from '../components/ui.jsx';

const listBtn = { display: 'flex', gap: 12, padding: '10px 8px', border: 'none', borderRadius: 10, background: 'transparent', textAlign: 'left', cursor: 'pointer' };
const sub = { font: '400 12px/1.4 var(--font-sans)', color: 'var(--ink-600)' };

export default function Dashboard({ vm }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1280 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 style={{ margin: 0, font: '600 22px/1.3 var(--font-sans)' }}>Что происходит с заказами</h1>
          <Muted style={{ margin: '4px 0 0' }}>{vm.summary}</Muted>
        </div>
        <Segmented items={vm.dashSeg} />
      </div>

      {vm.demo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px 16px', borderRadius: 10, background: 'var(--coin-100)', font: '400 13px/1.5 var(--font-sans)', color: 'var(--ink-800)' }}>
          <i className="ph-fill ph-info" style={{ fontSize: 18, color: 'var(--coin-500)' }} />
          <span style={{ flex: 1, minWidth: 200 }}>Демо-данные для знакомства с платформой — это не реальные отправления.</span>
          <button type="button" onClick={vm.clearDemo} style={{ border: 'none', background: 'none', font: '500 13px var(--font-sans)', color: 'var(--violet-500)', cursor: 'pointer', padding: 0 }}>Очистить и начать с нуля</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
        {vm.kpis.map(k => (
          <button key={k.label} type="button" onClick={k.onClick} className="h-raised" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, border: 'none', borderRadius: 14, background: '#fff', boxShadow: 'var(--shadow-card)', textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: k.icBg, color: k.ic, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className={k.icon} style={{ fontSize: 18 }} /></span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ font: '600 26px/1.1 var(--font-sans)', color: 'var(--ink-900)' }}>{k.value}</span>
              <span style={{ font: '400 13px/1.3 var(--font-sans)', color: 'var(--ink-600)' }}>{k.label}</span>
            </span>
          </button>
        ))}
      </div>

      {vm.dashA ? <Overview vm={vm} /> : <Pipeline vm={vm} />}
    </div>
  );
}

function Overview({ vm }) {
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <Card style={{ flex: '2 1 520px', minWidth: 0, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <H2 style={{ flex: 1 }}>Маршруты активных отправлений</H2>
            <span style={{ font: '400 12px var(--font-sans)', color: 'var(--ink-600)' }}>Последний подтверждённый город, не GPS</span>
          </div>
          <RouteMap spec={vm.mapSpec} style={{ height: 340 }} />
        </Card>
        <Card style={{ flex: '1 1 300px', minWidth: 0, gap: 6 }}>
          <H2 style={{ margin: '0 0 6px' }}>Требуют внимания</H2>
          {vm.attList.map(o => (
            <button key={o.id} type="button" onClick={o.onOpen} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 10, border: 'none', borderRadius: 10, background: 'var(--red-100)', textAlign: 'left', cursor: 'pointer' }}>
              <AttIcon size={20} />
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ font: '500 13px/1.3 var(--font-sans)', color: 'var(--ink-900)' }}>{o.id} · {o.client}</span>
                <span style={{ font: '400 12px/1.3 var(--font-sans)', color: 'var(--ink-800)' }}>{o.reason}</span>
              </span>
              <i className="ph ph-caret-right" style={{ color: 'var(--ink-600)' }} />
            </button>
          ))}
          {!vm.attList.length && <Muted>Всё в порядке — задержек и зависших заказов нет.</Muted>}
        </Card>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <Card style={{ flex: '1 1 340px', minWidth: 0, gap: 4 }}>
          <H2 style={{ margin: '0 0 8px' }}>Последние обновления</H2>
          {vm.updates.map(u => (
            <button key={u.key} type="button" onClick={u.onClick} className="h-ink50" style={listBtn}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: u.dot, marginTop: 6, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ font: '500 13px/1.35 var(--font-sans)', color: 'var(--ink-900)' }}>{u.title} · {u.city}</span>
                <span style={sub}>{u.ship} · {u.who}</span>
                {u.hasNote && <span style={sub}>«{u.note}»</span>}
              </span>
              <span style={{ font: '400 12px var(--font-sans)', color: 'var(--ink-600)', whiteSpace: 'nowrap' }}>{u.when}</span>
            </button>
          ))}
          {!vm.updates.length && <Muted>Событий пока нет.</Muted>}
        </Card>
        <Card style={{ flex: '1 1 340px', minWidth: 0, gap: 4 }}>
          <H2 style={{ margin: '0 0 8px' }}>Ближайшие доставки</H2>
          {vm.upcoming.map(u => (
            <button key={u.id} type="button" onClick={u.onClick} className="h-ink50" style={{ ...listBtn, alignItems: 'center' }}>
              <span style={{ width: 46, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0', borderRadius: 10, background: 'var(--ink-50)' }}>
                <span style={{ font: '600 13px/1.2 var(--font-sans)', color: 'var(--ink-900)' }}>{u.date}</span>
              </span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ font: '500 13px/1.35 var(--font-sans)', color: 'var(--ink-900)' }}>{u.id} · {u.route}</span>
                <span style={{ ...sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.who}</span>
              </span>
              <span style={{ font: '500 12px var(--font-sans)', color: u.relFg, whiteSpace: 'nowrap' }}>{u.rel}</span>
            </button>
          ))}
          {!vm.upcoming.length && <Muted>Нет отправлений с датой прибытия.</Muted>}
        </Card>
      </div>
    </>
  );
}

function Pipeline({ vm }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
        {vm.phases.map(ph => (
          <section key={ph.title} style={{ background: 'var(--ink-100)', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 4px 4px' }}>
              <h2 style={{ margin: 0, font: '600 14px/1.3 var(--font-sans)', flex: 1 }}>{ph.title}</h2>
              <span style={{ font: '600 13px var(--font-sans)', color: 'var(--ink-600)' }}>{ph.count}</span>
            </div>
            {ph.orders.map(o => (
              <button key={o.id} type="button" onClick={o.onOpen} className="h-raised" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 10, border: 'none', borderRadius: 10, background: '#fff', boxShadow: 'var(--shadow-card)', textAlign: 'left', cursor: 'pointer' }}>
                <Thumb x={o} size={40} radius={8} />
                <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ font: '500 12px/1.3 var(--font-sans)', color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.title}</span>
                  <span style={{ font: '400 11px/1.3 var(--font-sans)', color: 'var(--ink-600)' }}>{o.id} · {o.client}</span>
                  <span style={{ font: '400 11px/1.3 var(--font-sans)', color: 'var(--ink-600)' }}>{o.pill.label}</span>
                </span>
                {o.attention && <AttIcon size={18} />}
              </button>
            ))}
            {ph.hasMore && <span style={{ font: '500 12px var(--font-sans)', color: 'var(--ink-600)', padding: '2px 4px' }}>{ph.more}</span>}
            {ph.empty && <span style={{ font: '400 12px var(--font-sans)', color: 'var(--ink-600)', padding: '8px 4px' }}>Пусто</span>}
          </section>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <Card style={{ flex: '2 1 480px', minWidth: 0, gap: 12 }}>
          <H2>Карта маршрутов</H2>
          <RouteMap spec={vm.mapSpec} style={{ height: 300 }} />
        </Card>
        <Card style={{ flex: '1 1 300px', minWidth: 0, gap: 4 }}>
          <H2 style={{ margin: '0 0 8px' }}>Последние обновления</H2>
          {vm.updates.map(u => (
            <button key={u.key} type="button" onClick={u.onClick} className="h-ink50" style={{ display: 'flex', gap: 10, padding: 8, border: 'none', borderRadius: 10, background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: u.dot, marginTop: 6, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, font: '400 12px/1.45 var(--font-sans)', color: 'var(--ink-600)' }}><span style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{u.ship} · {u.city}</span> — {u.title}</span>
              <span style={{ font: '400 11px var(--font-sans)', color: 'var(--ink-600)', whiteSpace: 'nowrap' }}>{u.when}</span>
            </button>
          ))}
        </Card>
      </div>
    </>
  );
}
