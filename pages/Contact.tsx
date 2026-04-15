import React, { useState } from 'react';
import { Button } from '../components/Button';
import { TransmissionType, Instructor, Appointment } from '../types';
import { CONTACT_EMAIL, CONTACT_PHONE, FAQS } from '../constants';
import { Mail, Phone, MapPin, ChevronDown, ChevronUp, Car, Award, Calendar, ArrowRight, X, Clock } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { CalendarView } from '../components/CalendarView';

type UserType = 'trainee' | 'student' | null;
type BookingStep = 'user-type' | 'area' | 'transmission' | 'results';

export const Contact: React.FC = () => {
  const { instructors, addAppointment, scheduleOverrides, appointments } = useData();
  const [currentStep, setCurrentStep] = useState<BookingStep>('user-type');
  const [userType, setUserType] = useState<UserType>(null);
  const [postcode, setPostcode] = useState('');
  const [transmission, setTransmission] = useState<TransmissionType | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string; endTime: string; date: Date } | null>(null);
  const [bookingView, setBookingView] = useState<'availability' | 'form'>('availability');
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    password: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setTimeout(() => setCurrentStep('area'), 300);
  };

  const handleAreaSubmit = () => {
    if (postcode.trim()) {
      setCurrentStep('transmission');
    }
  };

  const handleTransmissionSelect = (trans: TransmissionType) => {
    setTransmission(trans);
    setTimeout(() => setCurrentStep('results'), 300);
  };

  const handleStartOver = () => {
    setCurrentStep('user-type');
    setUserType(null);
    setPostcode('');
    setTransmission(null);
  };

  const resetModal = () => {
    setSelectedInstructor(null);
    setBookingView('availability');
    setSelectedSlot(null);
    setBookingForm({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      password: ''
    });
    setPasswordError('');
  };

  // Filter instructors based on postcode and transmission
  const filteredInstructors = instructors.filter(instructor => {
    // Filter by transmission
    const typeInfo = (instructor.role + ' ' + instructor.car).toLowerCase();
    const matchesTransmission = transmission === TransmissionType.MANUAL
      ? typeInfo.includes('manual')
      : (typeInfo.includes('automatic') || typeInfo.includes('auto'));

    // Filter by area
    let matchesArea = true;
    if (postcode.trim()) {
      const term = postcode.toLowerCase();
      const areas = instructor.areasCovered || [];
      matchesArea = areas.some(area => area.toLowerCase().includes(term));
    }

    // Filter by student capacity
    const maxStudents = instructor.preferences?.maxLearners || 50; // Default limit
    const isFull = (instructor.activeStudents || 0) >= maxStudents;

    return matchesTransmission && matchesArea && !isFull;
  });

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const validatePassword = (pwd: string) => {
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const isLongEnough = pwd.length >= 8;

    if (!isLongEnough) return "Password must be at least 8 characters";
    if (!hasLower) return "Password must contain a lowercase letter";
    if (!hasUpper) return "Password must contain an uppercase letter";
    if (!hasSpecial) return "Password must contain a special character";

    return "";
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validatePassword(bookingForm.password);
    if (error) {
      setPasswordError(error);
      return;
    }

    if (selectedInstructor && selectedSlot) {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        instructorId: selectedInstructor.id,
        studentId: Date.now().toString(), // Generate a unique Student ID
        studentName: `${bookingForm.firstName} ${bookingForm.lastName}`,
        pickupAddress: bookingForm.address,
        day: selectedSlot.day,
        duration: 2, // Hardcoded as per instruction
        date: selectedSlot.date,
        // The `date` object in selectedSlot already contains the correct 24h time
        // We extract it here to store `time` as a "HH:MM" string
        time: `${selectedSlot.date.getHours().toString().padStart(2, '0')}:${selectedSlot.date.getMinutes().toString().padStart(2, '0')}`
      };

      addAppointment(newAppointment);

      // Mock API Call
      console.log("Creating Booking:", {
        instructorId: selectedInstructor?.id,
        slot: selectedSlot,
        user: bookingForm,
        appointment: newAppointment
      });

      alert(`Booking Confirmed for ${selectedSlot?.date.toLocaleDateString()} at ${selectedSlot?.time} - ${selectedSlot?.endTime}! Account created.`);
      resetModal();
    }
  };

  return (
    <div className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Booking Flow */}
          <div className="lg:col-span-7">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Book Your Lessons</h1>
              <p className="text-lg text-slate-600">
                Answer a few quick questions to find your perfect driving instructor.
              </p>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-soft border border-slate-100 min-h-[500px] flex flex-col">

              {/* Step 1: User Type Selection */}
              {currentStep === 'user-type' && (
                <div className="flex-grow flex flex-col items-center justify-center animate-in fade-in duration-500">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Are you a</h2>
                  <p className="text-slate-600 mb-12 text-center">Select the option that best describes you</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    <button
                      onClick={() => handleUserTypeSelect('trainee')}
                      className="group relative overflow-hidden bg-gradient-to-br from-brand-50 to-white border-2 border-brand-200 rounded-3xl p-8 hover:border-brand-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                    >
                      <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Car className="w-10 h-10 text-brand-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Trainee</h3>
                      <p className="text-slate-600 text-sm">I'm learning to drive for the first time</p>
                    </button>

                    <button
                      onClick={() => handleUserTypeSelect('student')}
                      className="group relative overflow-hidden bg-gradient-to-br from-accent-50 to-white border-2 border-accent-200 rounded-3xl p-8 hover:border-accent-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                    >
                      <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Award className="w-10 h-10 text-accent-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Student</h3>
                      <p className="text-slate-600 text-sm">I have some experience and need more practice</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Area Selection */}
              {currentStep === 'area' && (
                <div className="flex-grow flex flex-col items-center justify-center animate-in fade-in duration-500">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Select Your Area</h2>
                  <p className="text-slate-600 mb-12 text-center">Enter your postcode to find instructors near you</p>

                  <div className="w-full max-w-md">
                    <div className="relative mb-8">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                      <input
                        type="text"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAreaSubmit()}
                        placeholder="e.g. BS1, Clifton, Bristol"
                        className="w-full pl-14 pr-6 py-5 text-lg border-2 border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={handleStartOver}
                        variant="outline"
                        fullWidth
                        className="h-14"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleAreaSubmit}
                        disabled={!postcode.trim()}
                        fullWidth
                        className="h-14"
                      >
                        Continue <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Transmission Selection */}
              {currentStep === 'transmission' && (
                <div className="flex-grow flex flex-col items-center justify-center animate-in fade-in duration-500">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Select Transmission</h2>
                  <p className="text-slate-600 mb-12 text-center">Choose the type of car you want to learn in</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-8">
                    <button
                      onClick={() => handleTransmissionSelect(TransmissionType.MANUAL)}
                      className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-3xl p-8 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                    >
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Car className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Manual</h3>
                      <p className="text-slate-600 text-sm">Traditional gearbox with clutch control</p>
                    </button>

                    <button
                      onClick={() => handleTransmissionSelect(TransmissionType.AUTOMATIC)}
                      className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-3xl p-8 hover:border-purple-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                    >
                      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Car className="w-10 h-10 text-purple-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Automatic</h3>
                      <p className="text-slate-600 text-sm">Modern automatic transmission, easier to learn</p>
                    </button>
                  </div>

                  <Button
                    onClick={() => setCurrentStep('area')}
                    variant="outline"
                    className="w-full max-w-md"
                  >
                    Back
                  </Button>
                </div>
              )}

              {/* Step 4: Results - Filtered Instructors */}
              {currentStep === 'results' && (
                <div className="flex-grow animate-in fade-in duration-500">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Available Instructors</h2>
                    <p className="text-slate-600">
                      Found <span className="font-bold text-brand-600">{filteredInstructors.length}</span> {transmission?.toLowerCase()} instructor{filteredInstructors.length !== 1 ? 's' : ''} in <span className="font-bold">{postcode}</span>
                    </p>
                    <button
                      onClick={handleStartOver}
                      className="text-brand-600 hover:text-brand-700 font-medium text-sm mt-2 hover:underline"
                    >
                      ← Start over
                    </button>
                  </div>

                  {filteredInstructors.length > 0 ? (
                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                      {filteredInstructors.map((instructor) => (
                        <div key={instructor.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{instructor.name}</h3>
                                <p className="text-sm text-slate-600">{instructor.role}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-white rounded-lg border border-slate-200">
                                <Car className="w-4 h-4 text-brand-600" />
                              </div>
                              <span className="text-sm font-medium text-slate-700">{instructor.car}</span>
                            </div>

                            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                              {instructor.bio}
                            </p>

                            {instructor.qualifications && instructor.qualifications.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <Award className="w-3 h-3" /> Qualifications
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {instructor.qualifications.map((qual, i) => (
                                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200">
                                      {qual}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {instructor.areasCovered && instructor.areasCovered.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> Areas Covered
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {instructor.areasCovered.slice(0, 5).map((area, i) => (
                                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                      {area}
                                    </span>
                                  ))}
                                  {instructor.areasCovered.length > 5 && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                                      +{instructor.areasCovered.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  setSelectedInstructor(instructor);
                                  setBookingView('availability');
                                  setSelectedSlot(null);
                                }}
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                Check Availability
                              </Button>
                              <Button
                                className="flex-1"
                                onClick={() => window.location.href = `tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
                              >
                                Book with {instructor.name.split(' ')[0]}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                        <MapPin className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">No instructors found</h3>
                      <p className="text-slate-500 max-w-md mx-auto mb-6">
                        We don't have any {transmission?.toLowerCase()} instructors available in {postcode} right now.
                        Try searching for a broader area or contact us directly.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={handleStartOver} variant="outline">
                          Search Again
                        </Button>
                        <Button onClick={() => window.location.href = `tel:${CONTACT_PHONE.replace(/\s/g, '')}`}>
                          Call Us
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Info Side */}
          <div className="lg:col-span-5 flex flex-col h-full pt-10">
            <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 mb-10">
              <h3 className="text-xl font-bold text-slate-900 mb-8">Contact Info</h3>
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Phone</p>
                    <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="text-brand-600 hover:underline block mb-1">{CONTACT_PHONE}</a>
                    <p className="text-xs text-slate-500 font-medium bg-slate-50 inline-block px-2 py-1 rounded">Mon-Fri 9am-6pm</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Email</p>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-600 hover:underline block">{CONTACT_EMAIL}</a>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Office</p>
                    <p className="text-slate-600">14 Drive Lane<br />Bristol, BS1 5TR</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Answers</h3>
              <div className="space-y-4">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-100 overflow-hidden hover:border-brand-200 transition-colors">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-5 py-4 text-left flex justify-between items-center focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                    >
                      <span className="font-bold text-slate-800 text-sm pr-4">{faq.q}</span>
                      {openFaq === idx ? <ChevronUp className="w-4 h-4 text-brand-600 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    </button>
                    {openFaq === idx && (
                      <div className="px-5 pb-4 pt-2 text-slate-600 text-sm leading-relaxed bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Availability & Booking Modal */}
        {selectedInstructor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {bookingView === 'availability' ? selectedInstructor.name : 'Complete Booking'}
                  </h2>
                  <p className="text-slate-500 text-xs">
                    {bookingView === 'availability' ? 'Select a time slot' : 'Create your account'}
                  </p>
                </div>
                <button
                  onClick={resetModal}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-grow">
                {bookingView === 'availability' ? (
                  /* VIEW: AVAILABILITY */
                  (!selectedInstructor.availability || Object.keys(selectedInstructor.availability).length === 0) ? (
                    <div className="text-center py-8 text-slate-500">
                      <Clock className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                      <p>This instructor hasn't published their availability schedule yet.</p>
                      <p className="text-sm mt-1">Please contact us directly to check slots.</p>
                    </div>
                  ) : (
                    <CalendarView
                      instructor={selectedInstructor}
                      selectedSlot={selectedSlot}
                      onSelectSlot={setSelectedSlot}
                      scheduleOverrides={scheduleOverrides.filter(o => o.instructorId === selectedInstructor.id)}
                      hideUnavailable={true}
                      bookedSlots={appointments
                        .filter(a => a.instructorId === selectedInstructor.id)
                        .map(a => ({
                          day: a.day,
                          time: a.time,
                          duration: a.duration,
                          student: a.studentName,
                          date: a.date
                        }))}
                    />
                  )
                ) : (
                  /* VIEW: BOOKING FORM */
                  <form id="booking-form" onSubmit={handleBookingSubmit} className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Instructor</p>
                        <p className="font-bold text-slate-900">{selectedInstructor.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Time</p>
                        <p className="font-bold text-slate-900">
                          {selectedSlot?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {selectedSlot?.time} - {selectedSlot?.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                        <input
                          type="text"
                          required
                          value={bookingForm.firstName}
                          onChange={(e) => setBookingForm({ ...bookingForm, firstName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          required
                          value={bookingForm.lastName}
                          onChange={(e) => setBookingForm({ ...bookingForm, lastName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          required
                          value={bookingForm.phone}
                          onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                        <input
                          type="email"
                          required
                          value={bookingForm.email}
                          onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Pickup Address</label>
                      <input
                        type="text"
                        required
                        value={bookingForm.address}
                        onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="e.g. 123 High Street, Bristol"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                      <input
                        type="password"
                        required
                        value={bookingForm.password}
                        onChange={(e) => {
                          setBookingForm({ ...bookingForm, password: e.target.value });
                          setPasswordError('');
                        }}
                        className={`w-full px-4 py-3 rounded-xl border outline-none ${passwordError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-brand-500'}`}
                      />
                      {passwordError ? (
                        <p className="text-red-500 text-xs mt-2">{passwordError}</p>
                      ) : (
                        <p className="text-slate-400 text-xs mt-2">Must be at least 8 characters with uppercase, lowercase, and special character.</p>
                      )}
                    </div>
                  </form>
                )}
              </div>

              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                {bookingView === 'availability' ? (
                  <>
                    <Button onClick={resetModal} variant="white">Close</Button>
                    <Button
                      onClick={() => setBookingView('form')}
                      disabled={!selectedSlot}
                      className={!selectedSlot ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      Book a Lesson
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => setBookingView('availability')} variant="white">Back</Button>
                    <Button
                      onClick={handleBookingSubmit} // We trigger form submit programmatically or button type="submit" if outside form 
                      // Actually cleaner to put button inside form or use form id. Let's use form id.
                      form="booking-form"
                      type="submit"
                    >
                      Confirm Booking
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};