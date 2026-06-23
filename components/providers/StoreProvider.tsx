'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { makeStore, type AppStore } from '@/lib/store';
import { persistStore, type Persistor } from 'redux-persist';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<AppStore | null>(null);
  const [persistor, setPersistor] = useState<Persistor | null>(null);

  useEffect(() => {
    const nextStore = makeStore();
    setStore(nextStore);
    setPersistor(persistStore(nextStore));
  }, []);

  if (!store || !persistor) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
