import { useStore } from './lib/useStore.js';
import { buildVM } from './lib/vm.js';
import { MobileHeader, MobileTabBar, Sidebar, Toast } from './components/Layout.jsx';
import OrderDrawer from './components/OrderDrawer.jsx';
import { ConfirmModal, OrderModal, ShipModal, StatusModal } from './components/Modals.jsx';
import AuthScreen from './screens/AuthScreen.jsx';
import TrackScreen from './screens/TrackScreen.jsx';
import Dashboard from './screens/Dashboard.jsx';
import Orders from './screens/Orders.jsx';
import Shipments from './screens/Shipments.jsx';
import MapScreen from './screens/MapScreen.jsx';

export default function App() {
  const self = useStore();
  const vm = buildVM(self);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)', color: 'var(--text-strong)', fontFamily: 'var(--font-sans)' }}>
      {vm.isAuth && <AuthScreen vm={vm} />}
      {vm.isTrack && <TrackScreen vm={vm} />}
      {vm.isApp && (
        <>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            {vm.isDesktop && <Sidebar vm={vm} />}
            <main style={{ flex: 1, minWidth: 0, padding: vm.mainPad }}>
              {vm.isMobile && <MobileHeader vm={vm} />}
              {vm.isDash && <Dashboard vm={vm} />}
              {vm.isOrders && <Orders vm={vm} />}
              {vm.isShips && <Shipments vm={vm} />}
              {vm.isMap && <MapScreen vm={vm} />}
            </main>
          </div>
          {vm.isMobile && <MobileTabBar vm={vm} />}
        </>
      )}
      <OrderDrawer vm={vm} />
      {vm.modalOrder && <OrderModal vm={vm} />}
      {vm.modalShip && <ShipModal vm={vm} />}
      {vm.modalStatus && <StatusModal vm={vm} />}
      {vm.modalConfirm && <ConfirmModal vm={vm} />}
      <Toast text={vm.toast} />
    </div>
  );
}
