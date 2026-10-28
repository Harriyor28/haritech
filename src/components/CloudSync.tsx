import React, { useEffect } from 'react';
import { syncFromCloud, subscribeToCloud } from '../utils/cloudSync';
import { republishCorrectedHaritechContent } from '../utils/haritechContent';
import { getSupabase } from '../utils/supabaseClient';

const CloudSync: React.FC = () => {
  useEffect(() => {
    void syncFromCloud().then(() => republishCorrectedHaritechContent());
    const unsubscribe = subscribeToCloud();

    // The corrected rows can only be written once an admin is signed in, so
    // run the replacement again as soon as a session appears.
    const sb = getSupabase();
    const authSubscription = sb?.auth.onAuthStateChange(() => {
      void republishCorrectedHaritechContent();
    });

    return () => {
      unsubscribe();
      authSubscription?.data.subscription.unsubscribe();
    };
  }, []);

  return null;
};

export default CloudSync;
