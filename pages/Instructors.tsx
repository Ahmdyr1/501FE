
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/Button';
import { Car, Award, Search, MapPin, Calendar, X, Clock } from 'lucide-react';
import { TransmissionType, Instructor } from '../types';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatTime12h = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const Instructors: React.FC = () => {
  const { instructors } = useData();
  const [activeFilter, setActiveFilter] = useState<TransmissionType>(TransmissionType.MANUAL);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  // Filter instructors based on the active filter (Manual/Automatic) AND the search term (Area)
  const filteredInstructors = instructors.filter(instructor => {
    // 1. Transmission Filter
    const typeInfo = (instructor.role + ' ' + instructor.car).toLowerCase();

    const matchesTransmission = activeFilter === TransmissionType.MANUAL
      ? typeInfo.includes('manual')
      : (typeInfo.includes('automatic') || typeInfo.includes('auto'));

    // 2. Area Search Filter
    let matchesArea = true;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const areas = instructor.areasCovered || [];
      const hasMatchingArea = areas.some(area => area.toLowerCase().includes(term));
      matchesArea = hasMatchingArea;
    }

    return matchesTransmission && matchesArea;
  });

  return (
    <div className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Meet The Team</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Our friendly, DVSA-approved instructors are here to guide you every step of the way.
          </p>
        </div>

        {/* Filters Container */}
        <div className="max-w-2xl mx-auto mb-12 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm transition-all"
              placeholder="Enter your postcode or area (e.g. BS1, Clifton)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Toggle Switch */}
          <div className="flex justify-center">
            <div className="bg-white p-1.5 rounded-full border border-slate-200 shadow-sm inline-flex relative">
              {/* Sliding Background */}
              <div
                className={`absolute top-1.5 bottom-1.5 w-36 bg-brand-600 rounded-full shadow-md transition-transform duration-300 ease-out left-1.5 ${activeFilter === TransmissionType.MANUAL ? 'translate-x-0' : 'translate-x-full'}`}
              ></div>

              <button
                onClick={() => setActiveFilter(TransmissionType.MANUAL)}
                className={`relative z-10 w-36 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${activeFilter === TransmissionType.MANUAL ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Manual
              </button>
              <button
                onClick={() => setActiveFilter(TransmissionType.AUTOMATIC)}
                className={`relative z-10 w-36 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${activeFilter === TransmissionType.AUTOMATIC ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Automatic
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredInstructors.length > 0 ? (
            filteredInstructors.map((instructor) => (
              <div key={instructor.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                <div className="p-8 border-b border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{instructor.name}</h3>
                  <p className="text-sm text-slate-500">{instructor.role}</p>
                </div>

                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                      <Car className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-700">{instructor.car}</span>
                  </div>

                  <p className="text-slate-600 mb-8 leading-relaxed flex-grow">
                    {instructor.bio}
                  </p>

                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Qualifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {instructor.qualifications.map((qual, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {qual}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Areas Covered Tags */}
                  {instructor.areasCovered && instructor.areasCovered.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Areas Covered
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {instructor.areasCovered.slice(0, 5).map((area, i) => (
                          <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {area}
                          </span>
                        ))}
                        {instructor.areasCovered.length > 5 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500">
                            +{instructor.areasCovered.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-3">
                    <Button
                      onClick={() => setSelectedInstructor(instructor)}
                      variant="white"
                      fullWidth
                      className="rounded-xl text-sm"
                    >
                      <Calendar className="w-4 h-4 mr-2" /> Check Availability
                    </Button>
                    <Button to="/contact" fullWidth className="rounded-xl group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600">
                      Book with {instructor.name.split(' ')[0]}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-100 border-dashed">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No instructors found</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                We don't have any {activeFilter.toLowerCase()} instructors available in that area right now.
                Try searching for a broader area (e.g. "Bristol") or check back later.
              </p>
            </div>
          )}
        </div>

        {/* Availability View Modal */}
        {selectedInstructor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedInstructor.name}</h2>
                  <p className="text-slate-500 text-xs">Typical Weekly Availability</p>
                </div>
                <button
                  onClick={() => setSelectedInstructor(null)}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-grow">
                {(!selectedInstructor.availability || Object.keys(selectedInstructor.availability).length === 0) ? (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                    <p>This instructor hasn't published their availability schedule yet.</p>
                    <p className="text-sm mt-1">Please contact us directly to check slots.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {DAYS_OF_WEEK.map(day => {
                      const slots = selectedInstructor.availability?.[day] || [];
                      if (slots.length === 0) return null; // Don't show days with no slots? Or show as "Unavailable"?
                      // Let's only show available days to keep it clean
                      return (
                        <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-4 border-b border-slate-50 pb-4 last:border-0">
                          <div className="w-32 pt-1.5 flex-shrink-0">
                            <span className="font-bold text-slate-700">{day}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {slots.sort().map(time => (
                              <span key={time} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100">
                                {formatTime12h(time)}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end flex-shrink-0">
                <Button onClick={() => setSelectedInstructor(null)} variant="white">Close</Button>
                <Button to="/contact" className="ml-3">Book a Lesson</Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-24 relative overflow-hidden rounded-[3rem] bg-brand-900">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

          <div className="relative z-10 p-10 md:p-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Not sure who to choose?</h2>
            <p className="text-brand-100 mb-10 max-w-2xl mx-auto text-lg">
              Don't worry! Fill out our booking form and tell us about your availability and preferences.
              We'll match you with the perfect instructor to help you pass fast.
            </p>
            <Button to="/contact" variant="white" className="px-8 h-12">Find My Instructor</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
