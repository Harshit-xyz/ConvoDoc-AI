import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  progress: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#e0e5ec]">
      {/* Minimal pulsing dot cluster */}
      <div className="flex items-center gap-2 mb-10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-gray-400"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Thin progress line */}
      <div className="w-48 h-[3px] bg-gray-300/60 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gray-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <p className="mt-4 text-xs tracking-widest uppercase text-gray-400 font-medium select-none">
        {progress < 100 ? 'Analyzing' : 'Done'}
      </p>
    </div>
  );
};

export default LoadingScreen;
