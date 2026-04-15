
import React from 'react';
import { CarAnimation } from '../components/CarAnimation';

export const AnimationPreview: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 bg-slate-50 relative overflow-hidden">
      
      {/* 1. BACKGROUND LAYER (Z-INDEX 0) */}
      <div className="absolute inset-0 bg-slate-50 z-0 flex items-end pb-20 opacity-50">
        {/* Road Line for context */}
        <div className="w-full h-px bg-slate-300"></div>
      </div>

      {/* 2. ANIMATION LAYER (Z-INDEX 10) */}
      {/* This component has z-index: 10 inside it */}
      <CarAnimation />

      {/* 3. FOREGROUND LAYER (Z-INDEX 20) */}
      {/* The mock login box */}
      <div className="relative z-20 max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Preview Mode</h1>
        <p className="text-slate-500 mb-8">
          The car should drive <strong>behind</strong> this box.
        </p>
        <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto mb-4"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto mb-8"></div>
        <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">
          Login Button
        </button>
        <p className="mt-8 text-xs text-brand-600 font-mono">
          Modify components/CarAnimation.tsx to tweak speed/style
        </p>
      </div>

    </div>
  );
};
