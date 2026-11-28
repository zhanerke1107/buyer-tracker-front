import { useCallback, useEffect, useRef, useState } from 'react';
import A from './actions.js';

// App store with class-style setState (shallow merge, functional updaters).
// Returns a stable `self` object whose `.state` always points at the latest state.
export function useStore() {
  const [state, setRaw] = useState(A.init);
  const ref = useRef(null);
  const selfRef = useRef(null);

  const setState = useCallback(u => {
    setRaw(s => {
      const patch = typeof u === 'function' ? u(s) : u;
      const next = Object.assign({}, s, patch);
      selfRef.current.state = next; // keep reads in the same tick consistent
      return next;
    });
  }, []);

  if (!selfRef.current) selfRef.current = { state, setState };
  selfRef.current.state = state;
  ref.current = state;
  const self = selfRef.current;

  // persist the signed-in user (data lives in the backend)
  useEffect(() => { A.persist(self, state); }, [state.user]); // eslint-disable-line react-hooks/exhaustive-deps

  // load workspace from the API on start
  useEffect(() => { if (self.state.user) A.refresh(self); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // public tracking page: fetch the order by its link token
  useEffect(() => { A.loadTrack(self, state.trackToken); }, [state.trackToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // viewport width + public tracking hash
  useEffect(() => {
    const rs = () => setState({ w: window.innerWidth });
    const hc = () => { const h = location.hash.match(/#\/track\/([\w-]+)/); if (h) setState({ screen: 'track', trackToken: h[1], openOrder: null }); };
    window.addEventListener('resize', rs);
    window.addEventListener('hashchange', hc);
    return () => { window.removeEventListener('resize', rs); window.removeEventListener('hashchange', hc); };
  }, [setState]);

  return self;
}
