// Buyer-Track design-system primitives (ported from _ds_bundle.js) + small shared pieces.
import { useState } from 'react';

const SZ = { sm: { h: 32, px: 16, fs: 13 }, md: { h: 44, px: 22, fs: 14 }, lg: { h: 54, px: 28, fs: 16 } };

export function Icon({ name, weight = 'regular', size = 20, color, style }) {
  const cls = weight === 'regular' ? 'ph' : 'ph-' + weight;
  return <i className={cls + ' ph-' + name} aria-hidden="true" style={{ fontSize: size, color, lineHeight: 1, display: 'inline-flex', flexShrink: 0, ...style }} />;
}

export function Button({ children, variant = 'primary', size = 'md', icon, disabled, fullWidth, onClick, type = 'button', style }) {
  const s = SZ[size];
  const [p, setP] = useState(false);
  const V = {
    primary: { background: 'var(--brand)', color: '#fff', border: 'none' },
    soft: { background: 'var(--brand-soft)', color: 'var(--brand)', border: 'none' },
    white: { background: '#fff', color: 'var(--brand)', border: 'none' },
    outlineOnBrand: { background: 'transparent', color: '#fff', border: '1.5px solid #fff' },
    outline: { background: '#fff', color: 'var(--brand)', border: '1.5px solid var(--brand)' },
  }[variant];
  const r = variant === 'outlineOnBrand' ? 'var(--radius-xs)' : 'var(--radius-pill)';
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onPointerDown={() => setP(true)}
      onPointerUp={() => setP(false)}
      onPointerLeave={() => setP(false)}
      style={{ ...V, height: s.h, padding: '0 ' + s.px + 'px', borderRadius: r, font: '500 ' + s.fs + 'px/1 var(--font-sans)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? .4 : 1, width: fullWidth ? '100%' : undefined, transform: p ? 'scale(.97)' : 'none', transition: 'transform var(--dur-fast) var(--ease-standard)', ...style }}
    >
      {icon && <Icon name={icon} weight="fill" size={s.fs + 4} />}
      {children}
    </button>
  );
}

export function IconButton({ icon, variant = 'brand', size = 48, badge, onClick, label, style }) {
  const V = {
    brand: { background: 'var(--brand)', color: '#fff' },
    soft: { background: 'var(--brand-soft)', color: 'var(--brand)' },
    ghost: { background: 'transparent', color: 'var(--text-strong)' },
    glass: { background: 'rgba(255,255,255,.18)', color: '#fff' },
    white: { background: '#fff', color: 'var(--brand)' },
  }[variant];
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} style={{ ...V, width: size, height: size, borderRadius: '50%', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', padding: 0, ...style }}>
      <Icon name={icon} weight={variant === 'ghost' ? 'regular' : 'fill'} size={Math.round(size * 0.5)} />
      {badge && <span style={{ position: 'absolute', top: size * 0.18, right: size * 0.18, width: 8, height: 8, borderRadius: '50%', background: 'var(--negative)', border: '1.5px solid #fff' }} />}
    </button>
  );
}

export function SearchBar({ placeholder = 'Search for anything...', value, onChange, onFilter, showFilter = true }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
      <label style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12, height: 56, padding: '0 18px', background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)' }}>
        <Icon name="magnifying-glass" size={22} color="var(--brand)" />
        <input value={value} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', font: '400 15px var(--font-sans)', color: 'var(--text-strong)', minWidth: 0 }} />
      </label>
      {showFilter && (
        <button type="button" onClick={onFilter} aria-label="Filters" style={{ width: 56, height: 56, border: 'none', borderRadius: 'var(--radius-md)', background: '#fff', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="sliders-horizontal" size={24} color="var(--brand)" />
        </button>
      )}
    </div>
  );
}

// ---- shared app pieces ----

export const Opts = ({ list }) => list.map(x => <option key={x.v} value={x.v}>{x.l}</option>);

export function Segmented({ items, height = 30, pad = '0 14px', fs = 12, gap = 2, padding = 3, stretch, style }) {
  return (
    <div style={{ display: 'flex', gap, padding, background: 'var(--ink-100)', borderRadius: 999, ...style }}>
      {items.map(s => (
        <button key={s.label} type="button" onClick={s.onClick} style={{ flex: stretch ? 1 : undefined, height, padding: pad, border: 'none', borderRadius: 999, background: s.active ? '#fff' : 'transparent', color: s.active ? 'var(--ink-900)' : 'var(--ink-600)', boxShadow: s.active ? 'var(--shadow-card)' : 'none', font: '500 ' + fs + 'px var(--font-sans)', cursor: 'pointer' }}>{s.label}</button>
      ))}
    </div>
  );
}

export function Pill({ pill, fs = 12, pad = '4px 10px', nowrap, style }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: pad, borderRadius: 999, background: pill.bg, font: '500 ' + fs + 'px/1.2 var(--font-sans)', color: 'var(--ink-800)', whiteSpace: nowrap ? 'nowrap' : undefined, ...style }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: pill.dot, flexShrink: 0 }} />{pill.label}
    </span>
  );
}

export function Thumb({ x, size = 44, radius = 10, icon = 18, bg = 'var(--ink-100)' }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: bg, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {x.hasPhoto ? <img src={x.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="ph ph-t-shirt" style={{ fontSize: icon, color: 'var(--ink-400)' }} />}
    </div>
  );
}

export const Card = ({ children, style, radius = 14, padding = 16, ...rest }) => (
  <section {...rest} style={{ background: '#fff', borderRadius: radius, boxShadow: 'var(--shadow-card)', padding, display: 'flex', flexDirection: 'column', ...style }}>{children}</section>
);

export const H2 = ({ children, style }) => <h2 style={{ margin: 0, font: '600 16px/1.3 var(--font-sans)', ...style }}>{children}</h2>;
export const H3 = ({ children, style }) => <h3 style={{ margin: 0, font: '600 14px/1.3 var(--font-sans)', ...style }}>{children}</h3>;
export const Muted = ({ children, style }) => <p style={{ margin: 0, font: '400 13px/1.5 var(--font-sans)', color: 'var(--ink-600)', ...style }}>{children}</p>;

export const LinkBtn = ({ children, onClick, color = 'var(--violet-500)', fs = 13, style }) => (
  <button type="button" onClick={onClick} style={{ border: 'none', background: 'none', padding: 0, font: '500 ' + fs + 'px var(--font-sans)', color, cursor: 'pointer', ...style }}>{children}</button>
);

export const AttIcon = ({ size, style }) => <i className="ph-fill ph-warning-circle" style={{ fontSize: size, color: 'var(--red-500)', ...style }} />;

export const AttChip = ({ reason }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: 'var(--red-100)', font: '500 12px/1.2 var(--font-sans)', color: 'var(--ink-900)' }}>
    <AttIcon />{reason}
  </span>
);

export const DangerBtn = ({ children, onClick, solid, style }) => (
  <button type="button" onClick={onClick} style={{ height: 32, padding: solid ? '0 16px' : '0 12px', border: 'none', borderRadius: 999, background: solid ? 'var(--red-500)' : 'var(--red-100)', color: solid ? '#fff' : 'var(--ink-900)', font: '500 13px var(--font-sans)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, ...style }}>{children}</button>
);

// form controls
const labelSt = { display: 'flex', flexDirection: 'column', gap: 6, font: '500 12px/1.3 var(--font-sans)', color: 'var(--ink-600)' };
export const Field = ({ label, err, hint, children }) => (
  <label style={labelSt}>
    {label}
    {children}
    {hint && <span style={{ font: '400 11px/1.4 var(--font-sans)', color: 'var(--ink-600)' }}>{hint}</span>}
    {err !== undefined && <span style={{ color: 'var(--red-500)', font: '400 12px var(--font-sans)' }}>{err}</span>}
  </label>
);
export const inputSt = (h = 44) => ({ height: h, padding: '0 12px', border: '1px solid var(--ink-200)', borderRadius: 10, font: '400 14px var(--font-sans)', color: 'var(--ink-900)', outline: 'none', background: '#fff' });
export const Input = ({ h, style, ...p }) => <input className="f-violet" {...p} style={{ ...inputSt(h), ...style }} />;
export const Select = ({ h, opts, style, ...p }) => <select {...p} style={{ ...inputSt(h), ...style }}><Opts list={opts} /></select>;
export const Check = ({ checked, onChange, children, size = 16 }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 8, font: '400 13px var(--font-sans)', color: 'var(--ink-800)', cursor: 'pointer' }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ width: size, height: size, accentColor: 'var(--violet-500)' }} />{children}
  </label>
);

// vertical timeline (stages / route)
export function Timeline({ rows, minLine = 16, pb = 10, inline }) {
  return rows.map((r, i) => (
    <div key={i} style={{ display: 'flex', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 14 }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: r.dot, border: '2px solid ' + r.ring, flexShrink: 0, marginTop: 3 }} />
        {r.showLine && <span style={{ flex: 1, width: 2, background: r.line, minHeight: minLine }} />}
      </div>
      {inline ? (
        <div style={{ paddingBottom: pb, display: 'flex', gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ flex: 1, font: r.fw + ' 13px/1.35 var(--font-sans)', color: r.fg }}>{r.label}</span>
          <span style={{ font: '400 11px/1.6 var(--font-sans)', color: 'var(--ink-600)', whiteSpace: 'nowrap' }}>{r.at}</span>
        </div>
      ) : (
        <div style={{ paddingBottom: pb, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ font: r.fw + ' 13px/1.35 var(--font-sans)', color: r.fg || 'var(--ink-900)' }}>{r.label != null ? r.label : r.city}</span>
          <span style={{ font: '400 11px/1.35 var(--font-sans)', color: 'var(--ink-600)' }}>{r.state != null ? r.state + ' ' + r.at : r.at}</span>
        </div>
      )}
    </div>
  ));
}

// status history list
export function History({ list, suffix = '', withShip }) {
  return list.map((h, i) => (
    <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderTop: '1px solid var(--ink-100)' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: h.dot, marginTop: 6, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '500 13px/1.35 var(--font-sans)' }}>{h.title} · {h.city}</div>
        {withShip
          ? <div style={{ font: '400 12px/1.4 var(--font-sans)', color: 'var(--ink-600)' }}>{h.ship} · {h.note}</div>
          : h.hasNote && <div style={{ font: '400 12px/1.4 var(--font-sans)', color: 'var(--ink-600)' }}>{h.note}</div>}
      </div>
      <span style={{ font: '400 12px var(--font-sans)', color: 'var(--ink-600)', whiteSpace: 'nowrap' }}>{h.at}{suffix}</span>
    </div>
  ));
}

export const Wordmark = ({ size = 19, style }) => <div style={{ font: '600 ' + size + 'px/1 var(--font-sans)', color: 'var(--violet-500)', ...style }}>buyer-track</div>;
