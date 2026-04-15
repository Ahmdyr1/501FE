
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

// Mock Data Types
interface TimeSlot {
    id: string;
    dayIndex: number; // 0 = Mon, 6 = Sun
    startHour: number;
    duration: number;
    status: 'available' | 'booked' | 'unavailable';
}

const VISIBLE_START_HOUR = 8; // 8 AM
const VISIBLE_END_HOUR = 20; // 8 PM
const HOURS = Array.from({ length: VISIBLE_END_HOUR - VISIBLE_START_HOUR + 1 }, (_, i) => i + VISIBLE_START_HOUR);

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CalendarPrototype: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Mock Slots Data (Would come from API)
    const slots: TimeSlot[] = [
        { id: '1', dayIndex: 0, startHour: 9, duration: 2, status: 'available' },
        { id: '2', dayIndex: 0, startHour: 13, duration: 2, status: 'booked' },
        { id: '3', dayIndex: 1, startHour: 10, duration: 2, status: 'available' },
        { id: '4', dayIndex: 2, startHour: 9, duration: 1, status: 'unavailable' }, // Lunch?
        { id: '5', dayIndex: 3, startHour: 15, duration: 2, status: 'available' },
        { id: '6', dayIndex: 4, startHour: 9, duration: 2, status: 'available' },
        { id: '7', dayIndex: 4, startHour: 11.5, duration: 1.5, status: 'booked' },
        { id: '8', dayIndex: 5, startHour: 10, duration: 4, status: 'available' }, // Weekend slot
    ];

    const handlePrevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    // Helper to get actual date of the Monday of current view
    const getMonday = (d: Date) => {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    const currentMonday = getMonday(new Date(currentDate));

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Navigation & Header */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <Button to="/" variant="outline" className="mb-4 text-xs h-8">
                            <ArrowLeft className="w-3 h-3 mr-2" /> Back to Home
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <CalendarIcon className="w-8 h-8 text-brand-600" />
                            Book a Session
                        </h1>
                        <p className="text-slate-600 mt-2">Mockup of the premium calendar booking interface.</p>
                    </div>

                    <div className="flex items-center bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5">
                        <button
                            onClick={handlePrevWeek}
                            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-500"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="px-6 font-bold text-slate-700 min-w-[140px] text-center">
                            {currentMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' - '}
                            {new Date(new Date(currentMonday).setDate(currentMonday.getDate() + 6)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <button
                            onClick={handleNextWeek}
                            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-500"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* The Calendar Grid */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">

                    {/* Header Row (Days) */}
                    <div className="grid grid-cols-[60px_1fr] bg-slate-50 border-b border-slate-200">
                        <div className="p-4 border-r border-slate-200"></div> {/* Time axis header */}
                        <div className="grid grid-cols-7 divide-x divide-slate-200">
                            {DAYS.map((day, i) => {
                                const dayDate = new Date(currentMonday);
                                dayDate.setDate(dayDate.getDate() + i);
                                const isToday = dayDate.toDateString() === new Date().toDateString();

                                return (
                                    <div key={day} className={`p-4 text-center ${isToday ? 'bg-blue-50/50' : ''}`}>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{day}</div>
                                        <div className={`text-xl font-bold ${isToday ? 'text-brand-600' : 'text-slate-900'}`}>
                                            {dayDate.getDate()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time Grid */}
                    <div className="relative grid grid-cols-[60px_1fr] overflow-y-auto max-h-[600px] scrollbar-hide">

                        {/* Left Axis: Times */}
                        <div className="border-r border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-400 text-right py-4 space-y-[44px]"> {/* space needs fine tuning or use grid rows */}
                            {HOURS.map(hour => (
                                <div key={hour} className="h-10 pr-2 flex items-center justify-end relative">
                                    <span className="-mt-14">{hour}:00</span> {/* trick to align with line */}
                                </div>
                            ))}
                        </div>

                        {/* Main Grid Content */}
                        <div className="relative">

                            {/* Horizontal Grid Lines */}
                            {HOURS.map(hour => (
                                <div key={hour} className="absolute w-full border-t border-slate-100" style={{ top: `${(hour - VISIBLE_START_HOUR) * 60}px` }}></div>
                            ))}

                            {/* Vertical Day Separators (Background) */}
                            <div className="absolute inset-0 grid grid-cols-7 divide-x divide-slate-100 pointer-events-none">
                                {DAYS.map((_, i) => <div key={i} className="h-full"></div>)}
                            </div>

                            {/* SLOTS RENDERER */}
                            <div className="relative h-[720px]" style={{ height: `${(VISIBLE_END_HOUR - VISIBLE_START_HOUR + 1) * 60}px` }}>
                                {slots.map((slot) => {
                                    const top = (slot.startHour - VISIBLE_START_HOUR) * 60;
                                    const height = slot.duration * 60;
                                    const left = `${(slot.dayIndex / 7) * 100}%`;
                                    const width = `${100 / 7}%`;

                                    return (
                                        <div
                                            key={slot.id}
                                            className={`absolute p-1 transition-all hover:z-10`}
                                            style={{ top: `${top}px`, height: `${height}px`, left, width }}
                                        >
                                            <button
                                                className={`w-full h-full rounded-lg text-left px-2 py-1 text-xs shadow-sm border flex flex-col justify-center transition-all ${slot.status === 'available'
                                                        ? 'bg-brand-50 border-brand-200 hover:bg-brand-100 hover:border-brand-300 text-brand-700'
                                                        : slot.status === 'booked'
                                                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                                                            : 'bg-red-50 border-red-100 text-red-400 cursor-not-allowed striped-bg'
                                                    }`}
                                                disabled={slot.status !== 'available'}
                                                onClick={() => alert(`Selected slot on ${DAYS[slot.dayIndex]} at ${slot.startHour}:00`)}
                                            >
                                                <span className="font-bold">
                                                    {slot.startHour}:00 - {slot.startHour + slot.duration}:00
                                                </span>
                                                <span className="font-medium opacity-80">
                                                    {slot.status === 'available' ? 'Available' : slot.status === 'booked' ? 'Booked' : 'Unavailable'}
                                                </span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Current Time Indicator Line (example position) */}
                            <div className="absolute left-0 w-full border-t-2 border-red-400 z-20 pointer-events-none flex items-center" style={{ top: '340px' }}>
                                <div className="w-2 h-2 bg-red-400 rounded-full -ml-1"></div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 mb-4">Note: This is a static prototype. Real integration would fetch slots for the specific week displayed.</p>
                    <Button to="/contact" size="lg" variant="primary">
                        Return to Original Form
                    </Button>
                </div>

            </div>
        </div>
    );
};
