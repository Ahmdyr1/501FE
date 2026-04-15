

import React, { useState } from 'react';
import { PRICING_PACKAGES } from '../constants';
import { Button } from '../components/Button';
import { Check, ShieldCheck, Zap } from 'lucide-react';
import { TransmissionType } from '../types';

export const Pricing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TransmissionType>(TransmissionType.MANUAL);

  const filteredPackages = PRICING_PACKAGES.filter(p => p.transmission === activeTab);

  return (
    <div className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose the package that suits you. No hidden fees. 
            All lessons are <span className="font-bold text-brand-600">2 hours</span> long.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex justify-center mb-16">
          <div className="bg-white p-1.5 rounded-full border border-slate-200 shadow-sm inline-flex relative">
             {/* Sliding Background */}
             <div 
               className={`absolute top-1.5 bottom-1.5 w-36 bg-brand-600 rounded-full shadow-md transition-transform duration-300 ease-out left-1.5 ${activeTab === TransmissionType.MANUAL ? 'translate-x-0' : 'translate-x-full'}`}
             ></div>
            
            <button
              onClick={() => setActiveTab(TransmissionType.MANUAL)}
              className={`relative z-10 w-36 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${
                activeTab === TransmissionType.MANUAL ? 'text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setActiveTab(TransmissionType.AUTOMATIC)}
              className={`relative z-10 w-36 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${
                activeTab === TransmissionType.AUTOMATIC ? 'text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Automatic
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {filteredPackages.map((tier) => (
            <div 
              key={tier.id} 
              className={`bg-white rounded-3xl p-10 border transition-all duration-300 flex flex-col relative group ${
                tier.popular 
                ? 'border-brand-500 shadow-glow ring-4 ring-brand-500/10' 
                : 'border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                <p className="text-sm text-slate-500 font-medium bg-slate-50 inline-block px-3 py-1 rounded-full">{tier.transmission} Tuition</p>
              </div>

              <div className="flex items-baseline justify-center mb-8">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">£{tier.price}</span>
                <span className="text-slate-400 ml-2 font-medium">
                  {tier.hours > 2 ? `/ ${tier.hours} hrs` : '/ 2 hrs'}
                </span>
              </div>

              <div className="w-full h-px bg-slate-100 mb-8"></div>

              <ul className="space-y-5 mb-10 flex-grow">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-emerald-100 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <span className="text-slate-600 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                to="/contact" 
                variant={tier.popular ? 'primary' : 'outline'} 
                fullWidth
                className={tier.popular ? 'shadow-lg shadow-brand-500/30' : ''}
              >
                Choose {tier.name}
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
           <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex items-start gap-5">
              <div className="bg-brand-100 p-3 rounded-xl">
                 <ShieldCheck className="w-6 h-6 text-brand-600 flex-shrink-0" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2 text-lg">Block Booking Guarantee</h4>
                <p className="text-slate-600 leading-relaxed">
                  Block bookings are valid for 12 months. Unused hours can be refunded (terms apply) if you pass early!
                </p>
              </div>
           </div>
           <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex items-start gap-5">
              <div className="bg-amber-100 p-3 rounded-xl">
                <Zap className="w-6 h-6 text-amber-600 flex-shrink-0" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2 text-lg">Student Discount</h4>
                <p className="text-slate-600 leading-relaxed">
                  Show a valid student ID on your first lesson to get a free "Theory Test Pro" app subscription.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};