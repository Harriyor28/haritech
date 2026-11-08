import React, { useEffect } from 'react';
import { syncFromCloud, subscribeToCloud } from '../utils/cloudSync';
import { republishCorrectedHaritechContent } from '../utils/haritechContent';
import { getSupabase } from '../utils/supabaseClient';

const CloudSync: React.FC = () => {
  useEffect(() => {
    void syncFromCloud().then(() => republishCorrectedHaritechContent());
    const unsubscribe = subscribeToCloud();

    // Writes need an admin session, so as soon as one appears: retry the push
    // of any work that was kept locally, then run the corrected-row restore.
    // This is what turns "saved on this device" into content visitors can see.
    const sb = getSupabase();
    const authSubscription = sb?.auth.onAuthStateChange(() => {
      void syncFromCloud().then(() => republishCorrectedHaritechContent());
    });

    return () => {
      unsubscribe();
      authSubscription?.data.subscription.unsubscribe();
    };
  }, []);

  return null;
};

export default CloudSync;
