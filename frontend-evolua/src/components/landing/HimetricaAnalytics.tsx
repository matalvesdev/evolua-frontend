'use client';

import { useEffect } from 'react';

export default function HimetricaAnalytics() {
  useEffect(() => {
    import('@himetrica/tracker-js').then(({ HimetricaClient }) => {
      new HimetricaClient({
        apiKey: 'hm_ff13dddce2ecea79562d16c8d56c9545e20aa4deefa79df0',
        trackVitals: true,
        autoTrackErrors: true,
      });
    });
  }, []);

  return null;
}
