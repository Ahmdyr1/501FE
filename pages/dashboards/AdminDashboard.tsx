
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Users, UserPlus, Trash2, Shield, ChevronLeft, Calendar, Car, Phone, Mail, MapPin, Clock, Award } from 'lucide-react';
import { Button } from '../../components/Button';
import { TransmissionType, Instructor } from '../../types';
import { PostcodeSelector } from '../../components/PostcodeSelector';
import { PostcodeGroup } from '../../postcodeData';

// Helper to extend the base Instructor type with dashboard-specific mock stats
interface ManagedDriver extends Instructor {
  status: 'Active' | 'On Leave' | 'Inactive';
  totalStudents: number;
}

const formatTime12h = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { instructors, addInstructor, deleteInstructor, students } = useData();
  const [view, setView] = useState<'list' | 'add' | 'details'>('list');
  const [selectedDriver, setSelectedDriver] = useState<ManagedDriver | null>(null);

  // Convert global instructors to managed drivers (Adding mock stats for display)
  const drivers: ManagedDriver[] = instructors.map(inst => ({
    ...inst,
    // These fields aren't in the global 'Instructor' type yet, so we mock them for the dashboard view
    status: 'Active',
    totalStudents: inst.activeStudents || 0,
    email: inst.email || `${inst.name.split(' ')[0].toLowerCase()}@501drivingschool.co.uk`,
    phone: inst.phone || '07700 900461',
    areasCovered: inst.areasCovered || [] // Ensure array exists
  }));

  // Form State for Adding Driver
  const [newDriver, setNewDriver] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    car: '',
    transmission: TransmissionType.MANUAL,
    qualifications: ''
  });
  const [selectedPostcodes, setSelectedPostcodes] = useState<PostcodeGroup[]>([]);

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();

    // Process comma-separated qualifications
    const qualsList = newDriver.qualifications
      .split(',')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    // Process PostcodeGroup[] to string array for areasCovered
    const areasList: string[] = [];
    selectedPostcodes.forEach(group => {
      areasList.push(...group.children);
    });

    // Fallback if empty
    const finalQuals = qualsList.length > 0 ? qualsList : ['DVSA Approved'];
    const finalAreas = areasList.length > 0 ? areasList : ['All Bristol'];

    const instructorToAdd: Instructor = {
      id: Date.now().toString(),
      name: `${newDriver.firstName} ${newDriver.lastName}`,
      role: `${newDriver.transmission} Instructor`,
      car: newDriver.car,
      bio: `A professional ${newDriver.transmission.toLowerCase()} driving instructor helping students pass with confidence.`,
      qualifications: finalQuals,
      areasCovered: finalAreas,
      email: newDriver.email,
      phone: newDriver.phone,
      activeStudents: 0
    };

    addInstructor(instructorToAdd);
    setView('list');
    // Reset form
    setNewDriver({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      car: '',
      transmission: TransmissionType.MANUAL,
      qualifications: ''
    });
    setSelectedPostcodes([]);
  };

  const handleDeleteDriver = (id: string) => {
    if (window.confirm('Are you sure you want to remove this driver?')) {
      deleteInstructor(id);
      if (selectedDriver?.id === id) setView('list');
    }
  };

  const openDriverDetails = (driver: ManagedDriver) => {
    setSelectedDriver(driver);
    setView('details');
  };

  // Mock Schedule Generator
  const renderMockSchedule = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const slots = ['09:00', '11:00', '13:30', '15:30'];

    return (
      <div className="space-y-6">
        {days.map((day, dayIdx) => (
          <div key={day} className="border-b border-slate-100 pb-4 last:border-0">
            <h4 className="font-bold text-slate-900 mb-3">{day}, 2{dayIdx + 4} Aug</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {slots.map((time, slotIdx) => {
                const isBooked = (dayIdx + slotIdx) % 3 === 0;
                const isUnavailable = (dayIdx + slotIdx) % 7 === 0;

                if (isUnavailable) return null;

                return (
                  <div key={time} className={`p-3 rounded-xl border text-sm ${isBooked
                    ? 'bg-brand-50 border-brand-200'
                    : 'bg-white border-slate-200'
                    }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-700">{formatTime12h(time)}</span>
                      {isBooked ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700">
                          BOOKED
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          OPEN
                        </span>
                      )}
                    </div>
                    {isBooked ? (
                      <div>
                        <div className="flex items-center gap-1 text-slate-600 text-xs mb-1">
                          <Users className="w-3 h-3" /> Student #{slotIdx + 10}
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <MapPin className="w-3 h-3" /> BS{slotIdx + 1} 4TG
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-xs italic">
                        Available for booking
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-brand-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Admin Portal</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              {view === 'list' && 'Overview'}
              {view === 'add' && 'Register New Driver'}
              {view === 'details' && `${selectedDriver?.name}'s Dashboard`}
            </h1>
          </div>

          {view === 'list' ? (
            <Button onClick={() => setView('add')}>
              <UserPlus className="w-4 h-4 mr-2" /> Register New Driver
            </Button>
          ) : (
            <Button variant="white" onClick={() => setView('list')}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Back to List
            </Button>
          )}
        </div>

        {/* VIEW: LIST OVERVIEW */}
        {view === 'list' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-slate-500 text-sm font-medium mb-1">Total Students</p>
                <p className="text-3xl font-bold text-slate-900">{students.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-slate-500 text-sm font-medium mb-1">Active Instructors</p>
                <p className="text-3xl font-bold text-slate-900">{drivers.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-slate-500 text-sm font-medium mb-1">Total Revenue (Aug)</p>
                <p className="text-3xl font-bold text-slate-900">£12,450</p>
              </div>
            </div>

            {/* Instructor Management Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-10">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Registered Instructors</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Instructor</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Role / Car</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Contact</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {drivers.map((inst) => (
                      <tr
                        key={inst.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => openDriverDetails(inst)}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-bold text-slate-900 block">{inst.name}</span>
                            <span className="text-xs text-slate-500">{inst.totalStudents} Active Students</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">{inst.car}</div>
                          <div className="text-xs text-slate-500">{inst.role}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 flex items-center gap-1"><Mail className="w-3 h-3" /> {inst.email}</div>
                          <div className="text-sm text-slate-600 flex items-center gap-1"><Phone className="w-3 h-3" /> {inst.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inst.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                            {inst.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); openDriverDetails(inst); }}
                              className="text-brand-600 hover:text-brand-800 p-2 hover:bg-brand-50 rounded-lg transition-colors text-sm font-bold"
                            >
                              View
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteDriver(inst.id); }}
                              className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* VIEW: ADD DRIVER */}
        {view === 'add' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">New Instructor Details</h2>
                  <p className="text-slate-500 text-sm">Create a login and profile for a new staff member.</p>
                </div>
              </div>

              <form onSubmit={handleAddDriver} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                    <input
                      type="text"
                      required
                      value={newDriver.firstName}
                      onChange={e => setNewDriver({ ...newDriver, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      required
                      value={newDriver.lastName}
                      onChange={e => setNewDriver({ ...newDriver, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newDriver.email}
                      onChange={e => setNewDriver({ ...newDriver, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={newDriver.phone}
                      onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Vehicle Model</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ford Fiesta"
                      value={newDriver.car}
                      onChange={e => setNewDriver({ ...newDriver, car: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Transmission</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                      value={newDriver.transmission}
                      onChange={e => setNewDriver({ ...newDriver, transmission: e.target.value as TransmissionType })}
                    >
                      <option value={TransmissionType.MANUAL}>Manual</option>
                      <option value={TransmissionType.AUTOMATIC}>Automatic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Qualifications</label>
                  <input
                    type="text"
                    placeholder="e.g. Grade A, Pass Plus, Nervous Pupil Specialist"
                    value={newDriver.qualifications}
                    onChange={e => setNewDriver({ ...newDriver, qualifications: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                  />
                  <p className="text-xs text-slate-400 mt-2 ml-1">Separate multiple tags with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Areas Covered</label>
                  <PostcodeSelector
                    value={selectedPostcodes}
                    onChange={setSelectedPostcodes}
                    placeholder="Enter postcode (e.g. BS1)..."
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <Button type="submit" fullWidth>Create Account</Button>
                  <Button type="button" variant="outline" onClick={() => setView('list')} fullWidth>Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW: DRIVER DETAILS */}
        {view === 'details' && selectedDriver && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Sidebar: Profile */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col items-center text-center">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedDriver.name}</h2>
                  <p className="text-slate-500 mb-4">{selectedDriver.role}</p>

                  <div className="flex gap-2 mb-6">
                    <button className="p-2 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100"><Mail className="w-5 h-5" /></button>
                    <button className="p-2 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100"><Phone className="w-5 h-5" /></button>
                  </div>

                  <div className="w-full space-y-4 text-left">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">Vehicle</p>
                      <div className="flex items-center gap-2 font-semibold text-slate-700">
                        <Car className="w-4 h-4" /> {selectedDriver.car}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">Contact</p>
                      <div className="flex flex-col gap-1 font-semibold text-slate-700 text-sm">
                        <span>{selectedDriver.email}</span>
                        <span>{selectedDriver.phone}</span>
                      </div>
                    </div>

                    {selectedDriver.qualifications && selectedDriver.qualifications.length > 0 && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-2 flex items-center gap-1">
                          <Award className="w-3 h-3" /> Qualifications
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDriver.qualifications.map((q, i) => (
                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600">
                              {q}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDriver.areasCovered && selectedDriver.areasCovered.length > 0 && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Areas Covered
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDriver.areasCovered.map((area, i) => (
                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content: Schedule & Availability */}
            <div className="lg:col-span-2 space-y-6">

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Weekly Hours</p>
                    <p className="text-2xl font-bold text-slate-900">32.5</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Clock className="w-6 h-6" /></div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Students</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedDriver.totalStudents}</p>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><Users className="w-6 h-6" /></div>
                </div>
              </div>

              {/* Calendar View */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">Weekly Schedule</h3>
                  </div>
                  <div className="flex gap-2 text-xs font-medium">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-brand-100 border border-brand-200"></div> Booked</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-white border border-slate-300"></div> Open</span>
                  </div>
                </div>

                <div className="p-6">
                  {renderMockSchedule()}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
