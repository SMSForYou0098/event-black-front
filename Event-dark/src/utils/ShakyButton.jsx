import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CustomBtn from '@/utils/CustomBtn';

const ShakyButton = ({ 
  shake = false, 
  onShakeComplete, 
  duration = 0.5,
  intensity = 10,
  ...btnProps 
}) => {
  const [isShaking, setIsShaking] = useState(shake);

  useEffect(() => {
    setIsShaking(shake);
    if (shake) {
      const timer = setTimeout(() => {
        setIsShaking(false);
        onShakeComplete?.();
      }, duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [shake, duration, onShakeComplete]);

  return (
    <motion.div
      animate={isShaking ? {
        x: [-intensity, intensity, -intensity, intensity, 
            -intensity/2, intensity/2, -intensity/4, intensity/4, 0],
      } : {}}
      transition={{ duration }}
    >
      <CustomBtn {...btnProps} />
    </motion.div>
  );
};

export default ShakyButton;