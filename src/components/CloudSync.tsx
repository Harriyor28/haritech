import React, { useEffect } from 'react';
import { syncFromCloud, subscribeToCloud, pushAllLocal } from '../utils/cloudSync';
import { getSupabase } from '../utils/supabaseClient';

// One heal per full page load (guards against StrictMode double-mount)
let healedThisLoad = false;

const CloudSync: React.FC = () => {
  useEffect(() => {
    let cancelled = false;

    const heal = async (): Promise<void> => {
      // 1. Pull the latest cloud content (also re-pushes strictly-fresher local edits)
      await syncFromCloud();
      if (cancelled) return;
      // 2. If an admin session exists, push everything local so earlier
      //    failed saves and empty tables get healed.
      const sb = getSupabase();
      if (!sb) return;
      const { data } = await sb.auth.getSession();
      if (!cancelled && data.session) await pushAllOnce();
    };

    const pushAllOnce = async (): Promise<void> => {
      if (healedThisLoad) return;
      healedThisLoad = true;
      await pushAllLocal();
    };

    void heal();
    const unsubscribe = subscribeToCloud();

    // When the admin signs in (from the login screen on this tab),
    // immediately sync both directions.
    const sb = getSupabase();
    const sub = sb
      ? sb.auth.onAuthStateChange((_event, session) => {
          if (session) void pushAllOnce();
        })
      : null;

    return () => {
      cancelled = true;
      unsubscribe();
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  return null;
};

export default CloudSync;
