import React, { useEffect } from 'react';
import { syncFromCloud, subscribeToCloud } from '../utils/cloudSync';
import { republishCorrectedHaritechContent } from '../utils/haritechContent';

const CloudSync: React.FC = () => {
  useEffect(() => {
    void syncFromCloud().then(() => republishCorrectedHaritechContent());
    const unsubscribe = subscribeToCloud();
    return unsubscribe;
  }, []);

  return null;
};

export default CloudSync;
