import RouteMap from '../components/RouteMap.jsx';
import { Button, Card, H2, History, Input, Muted, Thumb, Timeline, Wordmark } from '../components/ui.jsx';

export default function TrackScreen({ vm }) {
  const tv = vm.tv;
  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '20px 16px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Wordmark style={{ flex: 1 }} />
        <button type="button" onClick={vm.trackBack} style={{ border: 'none', background: 'none', font: '500 13px var(--font-sans)', color: 'var(--violet-500)', cursor: 'pointer' }}>{vm.trackBackLabel}</button>
      </div>

      {vm.trackFound && (
        <>
          <Card radius={18} padding={20} style={{ gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ font: '400 13px var(--font-sans)', color: 'var(--ink-600)' }}>Заказ {tv.id} · для {tv.first}</div>
                <h1 style={{ margin: '4px 0 0', font: '600 22px/1.3 var(--font-sans)' }}>{tv.pill.label}</h1>
                <div style={{ marginTop: 4, font: '400 13px/1.5 var(--font-sans)', color: 'var(--ink-600)' }}>{tv.route}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <span style={{ font: '400 12px var(--font-sans)', color: 'var(--ink-600)' }}>Ожидаемая дата</span>
                <span style={{ font: '600 16px var(--font-sans)' }}>{tv.eta}</span>
                <span style={{ font: '400 12px var(--font-sans)', color: 'var(--ink-600)' }}>{tv.etaRel}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: 'var(--violet-50)' }}>
              <i className="ph-fill ph-map-pin" style={{ fontSize: 22, color: 'var(--violet-500)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 14px/1.3 var(--font-sans)' }}>Последний подтверждённый пункт: {tv.last}</div>
                <div style={{ font: '400 12px/1.4 var(--font-sans)', color: 'var(--ink-600)' }}>{tv.lastAt} · статусы обновляет байер вручную, точное GPS-местоположение недоступно</div>
              </div>
            </div>
            {tv.hasShips && <RouteMap spec={vm.mapSpec} style={{ height: 300 }} />}
          </Card>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
            <Card radius={18} padding={20} style={{ flex: '1 1 280px', minWidth: 0, display: 'block' }}>
              <H2 style={{ margin: '0 0 12px' }}>Этапы доставки</H2>
              <Timeline rows={tv.steps} />
            </Card>
            <div style={{ flex: '1.3 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card radius={18} padding={20} style={{ gap: 10 }}>
                <H2>Товары</H2>
                {tv.items.map(i => (
                  <div key={i.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Thumb x={i} size={52} icon={20} />
                    <div style={{ flex: 1, font: '500 14px/1.3 var(--font-sans)' }}>{i.name}</div>
                    <span style={{ font: '400 13px var(--font-sans)', color: 'var(--ink-600)' }}>{i.qty}</span>
                  </div>
                ))}
                {tv.ships.map(s => (
                  <div key={s.id} style={{ font: '400 12px/1.4 var(--font-sans)', color: 'var(--ink-600)', paddingTop: 8, borderTop: '1px solid var(--ink-100)' }}>{s.id} · {s.carrier} · трек {s.track}</div>
                ))}
              </Card>
              <Card radius={18} padding={20} style={{ gap: 4 }}>
                <H2 style={{ margin: '0 0 8px' }}>История</H2>
                <History list={tv.history} />
                {tv.noHistory && <Muted>Заказ оформлен, отправка ещё не начата.</Muted>}
              </Card>
            </div>
          </div>
        </>
      )}

      {vm.trackEmpty && (
        <form onSubmit={vm.onTrackSubmit} style={{ background: '#fff', borderRadius: 18, boxShadow: 'var(--shadow-card)', padding: 24, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520, width: '100%', margin: '40px auto 0' }}>
          <h1 style={{ margin: 0, font: '600 20px/1.3 var(--font-sans)' }}>Отследить заказ</h1>
          <Muted>Вставьте ссылку или код, который прислал байер. Регистрация не нужна.</Muted>
          <Input value={vm.trackInput} onChange={vm.onTrackInput} placeholder="https://…/#/track/код" style={{ padding: '0 14px' }} />
          <Button type="submit" fullWidth>Показать заказ</Button>
        </form>
      )}

      {vm.trackMissing && (
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: 'var(--shadow-card)', padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 520, margin: '40px auto 0' }}>
          <i className="ph ph-link-break" style={{ fontSize: 32, color: 'var(--ink-400)' }} />
          <span style={{ font: '600 16px var(--font-sans)' }}>Ссылка недействительна</span>
          <span style={{ font: '400 13px/1.5 var(--font-sans)', color: 'var(--ink-600)' }}>Возможно, байер выпустил новую ссылку или заказ перенесён в архив. Запросите актуальную ссылку.</span>
        </div>
      )}
    </div>
  );
}
