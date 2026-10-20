import React, { useEffect } from 'react';
import { syncFromCloud, subscribeToCloud } from '../utils/cloudSync';

const CloudSync: React.FC = () => {
  useEffect(() => {
    void syncFromCloud();
    const unsubscribe = subscribeToCloud();
    return unsubscribe;
  }, []);

  return null;
};

export default CloudSync;
