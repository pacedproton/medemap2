'use client';

import { useEffect, useRef, useState } from 'react';
import Cesium from '../components/Cesium';
import BottomNavigation from '../components/BottomNavigation';

const ThreeDimensionalView = () => {
  const [renderCesium, setRenderCesium] = useState(false);
  const cesiumRef = useRef(null);

  useEffect(() => {
    setRenderCesium(true);
  }, []);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <div ref={cesiumRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {renderCesium && <Cesium />}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <BottomNavigation />
      </div>
    </div>
  );
};

export default ThreeDimensionalView;