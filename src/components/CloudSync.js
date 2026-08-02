import { useEffect } from 'react';
import { syncFromCloud, subscribeToCloud } from '../utils/cloudSync';
const CloudSync = () => {
    useEffect(() => {
        void syncFromCloud();
        const unsubscribe = subscribeToCloud();
        return unsubscribe;
    }, []);
    return null;
};
export default CloudSync;
