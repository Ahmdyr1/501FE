import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Instructor, ScheduleOverride } from '../types';

interface CalendarViewProps {
    instructor: Instructor;
    selectedSlot: { day: string; time: string; endTime: string; date: Date } | null;
    onSelectSlot: (slot: { day: string; time: string; endTime: string; date: Date } | null) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOT_DURATION_HOURS = 2; // Fixed 2 hour slots
const VISIBLE_START_HOUR = 8;  // 8 AM
const VISIBLE_END_HOUR = 20;   // 8 PM
const HOURS = Array.from({ length: VISIBLE_END_HOUR - VISIBLE_START_HOUR + 1 }, (_, i) => i + VISIBLE_START_HOUR);

// Helper to format time in 12-hour format (e.g., "14:00" -> "2:00 PM")
const formatTime12h = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Helper to check if a time is within a range
const isTimeInRange = (time: string, range: { start: string, end: string }) => {
    const [h, m] = time.split(':').map(Number);
    const timeMins = h * 60 + m;
    const [sH, sM] = range.start.split(':').map(Number);
    const [eH, eM] = range.end.split(':').map(Number);
    const startMins = sH * 60 + sM;
    const endMins = eH * 60 + eM;
    return timeMins >= startMins && timeMins < endMins;
};

export const CalendarView: React.FC<CalendarViewProps & {
    bookedSlots?: { day: string; time: string; duration: number; student?: string; date: Date }[];
    unavailableSlots?: Record<string, { start: string; end: string }[]>;
    scheduleOverrides?: ScheduleOverride[];
    hideUnavailable?: boolean;
}> = ({ instructor, selectedSlot, onSelectSlot, bookedSlots = [], unavailableSlots = {}, scheduleOverrides = [], hideUnavailable = false }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Get the start of the week (Monday) for the current view
    const startOfWeek = useMemo(() => {
        const d = new Date(currentDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    }, [currentDate]);

    // Navigate weeks
    const nextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
    };

    const prevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
    };

    // Generate slots for the week using absolute positioning logic
    const weekSlots = useMemo(() => {
        const slots: any[] = [];

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            const dayName = DAYS[i];

            // 1. Render Booked Slots (Blue)
            const dayBookings = bookedSlots.filter(b =>
                b.day === dayName &&
                b.date.getDate() === dayDate.getDate() &&
                b.date.getMonth() === dayDate.getMonth() &&
                b.date.getFullYear() === dayDate.getFullYear()
            );

            dayBookings.forEach(booking => {
                const [h, m] = booking.time.split(':').map(Number);
                const startHour = h + (m / 60);

                if (startHour >= VISIBLE_START_HOUR && startHour < VISIBLE_END_HOUR) {
                    const endH = startHour + booking.duration;
                    const endHourInt = Math.floor(endH);
                    const endMinInt = Math.round((endH % 1) * 60);
                    const endTime = `${endHourInt.toString().padStart(2, '0')}:${endMinInt.toString().padStart(2, '0')}`;

                    const slotDate = new Date(dayDate);
                    slotDate.setHours(h, m, 0, 0);

                    slots.push({
                        id: `booked-${dayName}-${booking.time}`,
                        dayIndex: i,
                        dayName,
                        date: slotDate,
                        time: booking.time,
                        endTime,
                        startHour,
                        duration: booking.duration,
                        type: 'booked',
                        label: booking.student || 'Booked'
                    });
                }
            });

            // 2. Render Unavailable Slots (Red)
            let dayUnavailable = [...(unavailableSlots[dayName] || [])];

            // Override Unavailable
            const unavailableOverrides = scheduleOverrides.filter(o =>
                o.type === 'unavailable' &&
                o.date.getDate() === dayDate.getDate() &&
                o.date.getMonth() === dayDate.getMonth() &&
                o.date.getFullYear() === dayDate.getFullYear()
            );
            unavailableOverrides.forEach(o => {
                dayUnavailable.push(...o.ranges);
            });

            dayUnavailable.forEach(range => {
                const [sH, sM] = range.start.split(':').map(Number);
                const [eH, eM] = range.end.split(':').map(Number);
                const startHour = sH + (sM / 60);
                const endHour = eH + (eM / 60);
                const duration = endHour - startHour;

                if (startHour >= VISIBLE_START_HOUR && startHour < VISIBLE_END_HOUR) {
                    slots.push({
                        id: `unavailable-${dayName}-${range.start}`,
                        dayIndex: i,
                        dayName,
                        date: dayDate,
                        time: range.start,
                        endTime: range.end,
                        startHour,
                        duration,
                        type: 'unavailable',
                        label: 'Unavailable'
                    });
                }
            });

            // 3. Generate Available Slots (Dynamic Gap Logic)

            // A. Define Working Windows (Default or Override)
            let workWindows: { start: number; end: number }[] = [];

            const availableOverride = scheduleOverrides.find(o =>
                o.type === 'available' &&
                o.date.getDate() === dayDate.getDate() &&
                o.date.getMonth() === dayDate.getMonth() &&
                o.date.getFullYear() === dayDate.getFullYear()
            );

            if (availableOverride) {
                // Use override ranges
                workWindows = availableOverride.ranges.map(r => {
                    const [sH, sM] = r.start.split(':').map(Number);
                    const [eH, eM] = r.end.split(':').map(Number);
                    return { start: sH + (sM / 60), end: eH + (eM / 60) };
                });
            } else if (instructor.preferences?.workingHours?.[dayName]?.active) {
                // Use defined working hours from preferences
                const workingHours = instructor.preferences.workingHours[dayName];
                const [sH, sM] = workingHours.start.split(':').map(Number);
                const [eH, eM] = workingHours.end.split(':').map(Number);

                workWindows = [{
                    start: sH + (sM / 60),
                    end: eH + (eM / 60)
                }];
            } else if (instructor.availability?.[dayName]) {
                // Legacy support: If availability is just a list of slots, we might default to full day 
                // OR we could try to infer, but safer to respect the new preferences model above.
                // Keep this as fallback for instructors without preferences yet.
                workWindows = [{ start: VISIBLE_START_HOUR, end: VISIBLE_END_HOUR }];
            } else {
                // No availability defined?
                workWindows = [];
            }

            // B. Collect & Buffer Blocks (Bookings + Unavailable)
            const travelBufferMins = instructor.preferences?.travelTime || 0;
            const buffer = travelBufferMins / 60;

            const bufferedBlocks: { start: number; end: number }[] = [];

            // Add Bookings (Buffer BEFORE & AFTER)
            dayBookings.forEach(b => {
                const [h, m] = b.time.split(':').map(Number);
                const start = h + (m / 60);
                const end = start + b.duration;
                bufferedBlocks.push({ start: start - buffer, end: end + buffer });
            });

            // Add Unavailable (Buffer AFTER only - No Pre-buffer)
            dayUnavailable.forEach(u => {
                const [sH, sM] = u.start.split(':').map(Number);
                const [eH, eM] = u.end.split(':').map(Number);
                const start = sH + (sM / 60);
                const end = eH + (eM / 60);
                bufferedBlocks.push({ start: start, end: end + buffer });
            });

            // Sort Blocks
            bufferedBlocks.sort((a, b) => a.start - b.start);

            const mergedBlocks: { start: number; end: number }[] = [];
            if (bufferedBlocks.length > 0) {
                let current = { ...bufferedBlocks[0] }; // Create a copy to avoid modifying original
                for (let j = 1; j < bufferedBlocks.length; j++) {
                    if (bufferedBlocks[j].start < current.end) {
                        current.end = Math.max(current.end, bufferedBlocks[j].end);
                    } else {
                        mergedBlocks.push(current);
                        current = { ...bufferedBlocks[j] }; // Create a new copy
                    }
                }
                mergedBlocks.push(current);
            }

            // D. Generate Slots within Free Windows
            workWindows.forEach(window => {
                let currentParams = window.start;
                const windowEnd = window.end;

                // While we have room for a slot
                while (currentParams + SLOT_DURATION_HOURS <= windowEnd) {
                    const slotStart = currentParams;
                    const slotEnd = slotStart + SLOT_DURATION_HOURS;

                    // Check collision with any Merged Block
                    // Since mergedBlocks are sorted, we could optimize, but simple check is fine for limited daily items
                    const isBlocked = mergedBlocks.some(b =>
                        (slotStart < b.end) && (slotEnd > b.start)
                    );

                    if (!isBlocked) {
                        // Valid Slot!
                        const hInt = Math.floor(slotStart);
                        const mInt = Math.round((slotStart % 1) * 60);
                        const timeStr = `${hInt.toString().padStart(2, '0')}:${mInt.toString().padStart(2, '0')}`;

                        const endH = slotStart + SLOT_DURATION_HOURS;
                        const endHInt = Math.floor(endH);
                        const endMInt = Math.round((endH % 1) * 60);
                        const endTime = `${endHInt.toString().padStart(2, '0')}:${endMInt.toString().padStart(2, '0')}`;

                        const slotDate = new Date(dayDate);
                        slotDate.setHours(hInt, mInt, 0, 0);
                        const isPast = slotDate < new Date() && slotDate.getDate() !== new Date().getDate();

                        if (!isPast) {
                            slots.push({
                                id: `available-${dayName}-${timeStr}`,
                                dayIndex: i,
                                dayName,
                                date: slotDate,
                                time: timeStr,
                                endTime,
                                startHour: slotStart,
                                duration: SLOT_DURATION_HOURS,
                                type: 'available',
                                label: 'Available'
                            });
                        }

                        // Move to next slot
                        currentParams += SLOT_DURATION_HOURS;
                    } else {
                        // If blocked, we need to jump forward.
                        // We can't just jump +2h, we should jump to the end of the blocking block to find the NEXT free gap.
                        // Find the block that blocked us
                        const blockingBlock = mergedBlocks.find(b => (slotStart < b.end) && (slotEnd > b.start));
                        if (blockingBlock) {
                            // Move pointer to end of this block
                            // (Ensure we don't get stuck if end is same/smaller, strictly move forward)
                            currentParams = Math.max(currentParams + 0.25, blockingBlock.end);
                            // Align to 15 min grid? Or keep exact decimal? 
                            // User example 10:15 implies exact minutes.
                        } else {
                            currentParams += SLOT_DURATION_HOURS; // Should not happen if isBlocked
                        }
                    }
                }
            });
        }
        return slots;
    }, [startOfWeek, instructor.availability, bookedSlots, unavailableSlots, scheduleOverrides, instructor.preferences?.travelTime]);

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white z-10">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-brand-600" />
                    <span className="font-bold text-slate-800">
                        {startOfWeek.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={prevWeek}
                        className="p-1 rounded-md hover:bg-white text-slate-500 transition-all shadow-sm disabled:opacity-50"
                        disabled={startOfWeek < new Date(new Date().setDate(new Date().getDate() - 7))}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-bold text-slate-600 px-2">
                        {startOfWeek.getDate()} - {new Date(new Date(startOfWeek).getTime() + 6 * 86400000).getDate()}
                    </span>
                    <button
                        onClick={nextWeek}
                        className="p-1 rounded-md hover:bg-white text-slate-500 transition-all shadow-sm"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-grow overflow-hidden relative">

                {/* Header Row: Days */}
                <div className="flex border-b border-slate-200 bg-slate-50/50">
                    <div className="w-[60px] flex-shrink-0 border-r border-slate-200 bg-white"></div> {/* Time Axis Spacer */}
                    <div className="flex-grow grid grid-cols-7 divide-x divide-slate-200">
                        {DAYS.map((day, i) => {
                            const d = new Date(startOfWeek);
                            d.setDate(startOfWeek.getDate() + i);
                            const isToday = d.toDateString() === new Date().toDateString();
                            return (
                                <div key={i} className={`text-center py-3 ${isToday ? 'bg-brand-50/50' : ''}`}>
                                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">{day.substring(0, 3)}</div>
                                    <div className={`text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center mx-auto ${isToday ? 'bg-brand-600 text-white' : 'text-slate-700'}`}>
                                        {d.getDate()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Scrollable Grid */}
                <div className="flex-grow overflow-y-auto relative bg-white">
                    <div className="flex relative min-h-[720px]" style={{ height: `${HOURS.length * 60}px` }}>

                        {/* Time Axis */}
                        <div className="w-[60px] flex-shrink-0 border-r border-slate-200 bg-white z-10 sticky left-0">
                            {HOURS.map(hour => (
                                <div key={hour} className="h-[60px] border-b border-transparent relative">
                                    <span className="absolute -top-2.5 right-2 text-xs text-slate-400 font-medium bg-white px-1">
                                        {formatTime12h(`${hour}:00`)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Grid Lines & Content */}
                        <div className="flex-grow relative">
                            {/* Horizontal Lines */}
                            {HOURS.map(hour => (
                                <div key={hour} className="absolute w-full border-t border-slate-100" style={{ top: `${(hour - VISIBLE_START_HOUR) * 60}px` }}></div>
                            ))}

                            {/* Vertical Lines */}
                            <div className="absolute inset-0 grid grid-cols-7 divide-x divide-slate-100 h-full pointer-events-none">
                                {Array.from({ length: 7 }).map((_, i) => <div key={i}></div>)}
                            </div>

                            {weekSlots.map(slot => {
                                if (hideUnavailable && (slot.type === 'unavailable' || slot.type === 'booked')) return null;

                                const top = (slot.startHour - VISIBLE_START_HOUR) * 60;
                                const height = slot.duration * 60; // 60px per hour
                                const left = `${(slot.dayIndex / 7) * 100}%`;
                                const width = `${100 / 7}%`;

                                const isActive = selectedSlot?.date.getTime() === slot.date.getTime() && slot.type === 'available';

                                // Color Coding Logic
                                let wrapperClass = '';
                                if (slot.type === 'booked') {
                                    wrapperClass = 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';
                                } else if (slot.type === 'unavailable') {
                                    wrapperClass = 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 italic';
                                } else if (isActive) {
                                    wrapperClass = 'bg-brand-600 border-brand-600 text-white z-20 shadow-md scale-105 ring-2 ring-brand-200';
                                } else {
                                    // Available default
                                    wrapperClass = 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-400 hover:shadow-md hover:bg-emerald-100';
                                }

                                return (
                                    <div
                                        key={slot.id}
                                        className="absolute px-1 z-10 transition-all duration-200"
                                        style={{ top: `${top}px`, height: `${height}px`, left, width }}
                                    >
                                        <button
                                            disabled={slot.type !== 'available'}
                                            onClick={() => {
                                                if (slot.type === 'available') {
                                                    if (isActive) {
                                                        onSelectSlot(null);
                                                    } else {
                                                        onSelectSlot({
                                                            day: slot.dayName,
                                                            time: formatTime12h(slot.time),
                                                            endTime: formatTime12h(slot.endTime),
                                                            date: slot.date
                                                        });
                                                    }
                                                }
                                            }}
                                            className={`w-full h-[calc(100%-4px)] mt-[2px] rounded-lg border flex flex-col items-center justify-center shadow-sm transition-all overflow-hidden ${wrapperClass} ${(slot.type !== 'available') ? 'cursor-default' : 'cursor-pointer'}`}
                                        >
                                            <span className="text-xs font-bold leading-tight px-1 text-center truncate w-full">
                                                {slot.type === 'available' ? formatTime12h(slot.time) : slot.label}
                                            </span>
                                            {slot.type === 'available' && (
                                                <span className={`text-[10px] ${isActive ? 'text-brand-100' : 'text-emerald-600'}`}>
                                                    - {formatTime12h(slot.endTime)}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
