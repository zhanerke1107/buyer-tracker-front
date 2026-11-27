import { Button, IconButton, Wordmark } from './ui.jsx';

export function Sidebar({ vm }) {
  return (
    <aside style={{ width: 244, flexShrink: 0, background: '#fff', borderRight: '1px solid var(--ink-200)', display: 'flex', flexDirection: 'column', padding: '22px 14px 16px', position: 'sticky', top: 0, height: '100vh' }}>
      <Wordmark style={{ padding: '0 10px 22px' }} />
      <div style={{ padding: '0 0 16px' }}>
        <Button size="sm" icon="plus" fullWidth onClick={vm.openCreate}>Новый заказ</Button>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {vm.nav.map(n => (
          <button key={n.id} type="button" onClick={n.onClick} className={n.active ? '' : 'h-ink50'} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 42, padding: '0 12px', border: 'none', borderRadius: 10, background: n.active ? 'var(--violet-50)' : 'transparent', color: n.active ? 'var(--violet-500)' : 'var(--ink-600)', font: '500 14px var(--font-sans)', cursor: 'pointer', textAlign: 'left' }}>
            <i className={n.icon} style={{ fontSize: 20 }} />
            <span style={{ flex: 1 }}>{n.label}</span>
            <span style={{ font: '500 12px var(--font-sans)', color: 'var(--ink-500)' }}>{n.count}</span>
          </button>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12, borderRadius: 10, background: 'var(--ink-50)' }}>
          <span style={{ font: '500 12px/1.4 var(--font-sans)', color: 'var(--ink-800)' }}>Трекинг: ручной режим</span>
          <span style={{ font: '400 11px/1.45 var(--font-sans)', color: 'var(--ink-600)' }}>API перевозчиков не подключены. Статусы обновляете вы.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--violet-100)', color: 'var(--violet-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 14px var(--font-sans)' }}>{vm.initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '500 13px/1.3 var(--font-sans)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vm.user.name}</div>
            <div style={{ font: '400 11px/1.3 var(--font-sans)', color: 'var(--ink-600)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Байер · {vm.user.email}</div>
          </div>
          <button type="button" onClick={vm.logout} aria-label="Выйти" className="h-ink100" style={{ width: 32, height: 32, border: 'none', background: 'none', borderRadius: 8, color: 'var(--ink-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ph ph-sign-out" style={{ fontSize: 18 }} />
          </button>
        </div>
        <button type="button" onClick={vm.demo ? vm.clearDemo : vm.loadDemo} style={{ border: 'none', background: 'none', font: '500 12px var(--font-sans)', color: 'var(--ink-600)', cursor: 'pointer', textAlign: 'left', padding: '0 4px' }}>
          {vm.demo ? 'Очистить демо-данные' : 'Загрузить демо-данные'}
        </button>
      </div>
    </aside>
  );
}

export function MobileHeader({ vm }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <Wordmark size={17} style={{ flex: 1 }} />
      <IconButton icon="plus" size={40} label="Новый заказ" onClick={vm.openCreate} />
      <IconButton icon="sign-out" variant="ghost" size={40} label="Выйти" onClick={vm.logout} />
    </div>
  );
}

export function MobileTabBar({ vm }) {
  return (
    <nav style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 900, display: 'flex', background: '#fff', boxShadow: 'var(--shadow-tabbar)', borderRadius: '18px 18px 0 0', padding: '6px 6px 10px' }}>
      {vm.nav.map(n => (
        <button key={n.id} type="button" onClick={n.onClick} style={{ flex: 1, minHeight: 52, border: 'none', background: 'none', color: n.active ? 'var(--violet-500)' : 'var(--ink-600)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, font: '500 11px var(--font-sans)', cursor: 'pointer' }}>
          <i className={n.icon} style={{ fontSize: 22 }} />{n.short}
        </button>
      ))}
    </nav>
  );
}

export function Toast({ text }) {
  if (!text) return null;
  return <div style={{ position: 'fixed', left: '50%', bottom: 88, transform: 'translateX(-50%)', zIndex: 1200, maxWidth: 'calc(100vw - 32px)', padding: '12px 18px', borderRadius: 12, background: 'var(--ink-900)', color: '#fff', font: '500 13px/1.4 var(--font-sans)', boxShadow: 'var(--shadow-raised)' }}>{text}</div>;
}
