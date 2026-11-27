import { Button, Field, Input, Segmented, Wordmark } from '../components/ui.jsx';

export default function AuthScreen({ vm }) {
  const inp = { height: 44, padding: '0 14px' };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Wordmark size={22} style={{ textAlign: 'center' }} />
        <form onSubmit={vm.submitAuth} style={{ background: '#fff', borderRadius: 18, boxShadow: 'var(--shadow-raised)', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, font: '600 20px/1.3 var(--font-sans)' }}>{vm.authTitle}</h1>
            <p style={{ margin: '6px 0 0', font: '400 13px/1.5 var(--font-sans)', color: 'var(--ink-600)' }}>Заказы, посылки и маршруты доставки в одном месте.</p>
          </div>
          <Segmented items={vm.authSeg} stretch height={34} fs={13} gap={4} padding={4} />
          {vm.isRegister && (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                {vm.roleSeg.map(r => (
                  <button key={r.label} type="button" onClick={r.onClick} style={{ flex: 1, height: 44, border: '1.5px solid ' + (r.active ? 'var(--violet-300)' : 'var(--ink-200)'), borderRadius: 10, background: r.active ? 'var(--violet-50)' : '#fff', color: r.active ? 'var(--violet-500)' : 'var(--ink-600)', font: '500 13px var(--font-sans)', cursor: 'pointer' }}>{r.label}</button>
                ))}
              </div>
              <Field label="Имя" err={vm.ae.name}>
                <Input value={vm.au.name} onChange={vm.onAuth.name} placeholder="Как к вам обращаться" style={inp} />
              </Field>
            </>
          )}
          <Field label="E-mail" err={vm.ae.email}>
            <Input type="email" value={vm.au.email} onChange={vm.onAuth.email} placeholder="name@company.kz" style={inp} />
          </Field>
          <Field label="Пароль" err={vm.ae.password}>
            <Input type="password" value={vm.au.password} onChange={vm.onAuth.password} placeholder="Минимум 8 символов" style={inp} />
          </Field>
          <Button type="submit" fullWidth>{vm.authCta}</Button>
          <p style={{ margin: 0, font: '400 12px/1.5 var(--font-sans)', color: 'var(--ink-600)', textAlign: 'center' }}>Прототип: аккаунт и данные хранятся только в этом браузере.</p>
        </form>
        <button type="button" onClick={vm.toTrack} style={{ border: 'none', background: 'none', font: '500 13px var(--font-sans)', color: 'var(--violet-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <i className="ph ph-link" />Отследить заказ по ссылке без регистрации
        </button>
      </div>
    </div>
  );
}
