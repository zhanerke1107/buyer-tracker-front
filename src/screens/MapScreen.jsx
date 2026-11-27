import RouteMap from '../components/RouteMap.jsx';
import { AttIcon, LinkBtn, Segmented, Timeline } from '../components/ui.jsx';

export default function MapScreen({ vm }) {
  const msd = vm.msd;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 300px', minWidth: 0, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h1 style={{ margin: 0, font: '600 22px/1.3 var(--font-sans)' }}>Карта маршрутов</h1>
        <Segmented items={vm.mapSegAll} style={{ alignSelf: 'flex-start' }} />
        {msd && (
          <section style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow-card)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ flex: 1, font: '600 14px/1.3 var(--font-sans)' }}>{msd.id} · {msd.carrier}</span>
              <LinkBtn onClick={vm.clearMapSel} fs={12}>Все маршруты</LinkBtn>
            </div>
            <span style={{ font: '400 12px/1.4 var(--font-sans)', color: 'var(--ink-600)' }}>{msd.clients} · {msd.count}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Timeline rows={msd.routeSteps} minLine={18} />
            </div>
          </section>
        )}
        {vm.mapList.map(s => (
          <button key={s.id} type="button" onClick={s.onClick} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 14px', border: '1.5px solid ' + (s.selected ? 'var(--violet-300)' : 'transparent'), borderRadius: 14, background: s.selected ? 'var(--violet-50)' : '#fff', boxShadow: 'var(--shadow-card)', textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
              <span style={{ flex: 1, font: '600 13px/1.3 var(--font-sans)', color: 'var(--ink-900)' }}>{s.id} · {s.route}</span>
              {s.attention && <AttIcon />}
            </span>
            <span style={{ font: '400 12px/1.35 var(--font-sans)', color: 'var(--ink-600)' }}>{s.pill.label} · {s.last}</span>
            <span style={{ font: '400 11px/1.35 var(--font-sans)', color: 'var(--ink-600)' }}>{s.who}</span>
          </button>
        ))}
        {!vm.mapList.length && <p style={{ margin: 0, font: '400 13px var(--font-sans)', color: 'var(--ink-600)' }}>Нет отправлений для отображения.</p>}
      </div>
      <div style={{ flex: '3 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <RouteMap spec={vm.mapSpec} style={{ height: vm.mapH, minHeight: 380, borderRadius: 14, boxShadow: 'var(--shadow-card)' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, font: '400 12px/1.4 var(--font-sans)', color: 'var(--ink-600)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 22, height: 3, background: 'var(--violet-500)', borderRadius: 2 }} />Подтверждённый путь</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 22, borderTop: '2px dashed var(--ink-500)' }} />Планируемый маршрут</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--violet-500)', border: '2px solid #fff', boxShadow: '0 0 0 1px var(--ink-200)' }} />Последний подтверждённый город</span>
          <span>Точки — города из событий трекинга, а не GPS-координаты.</span>
        </div>
      </div>
    </div>
  );
}
