

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { CalendarDays, Users, MapPin, Settings, Car, Save, User, X, Clock, CheckCircle, GraduationCap, ChevronRight, Sliders, Check, Briefcase, Coffee, Plus, Trash2, Copy, ChevronDown, Calendar } from 'lucide-react';
import { Button } from '../../components/Button';
import { TransmissionType, SYLLABUS_TOPICS, ProgressRecord, InstructorPreferences } from '../../types';
import { PostcodeSelector } from '../../components/PostcodeSelector';
import { PostcodeGroup } from '../../postcodeData';
import { CalendarView } from '../../components/CalendarView';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatTime12h = (time24: string): string => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Time options generator for 15-minute intervals (Full 24h to support 00:00 default)
const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h <= 23; h++) {
        for (let m = 0; m < 60; m += 15) {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            options.push(`${hour}:${minute}`);
        }
    }
    return options;
};

const TIME_OPTIONS = generateTimeOptions();

// Mock appointments for demonstration since we don't have a full booking DB yet
const MOCK_APPOINTMENTS = [
    { day: 'Monday', time: '10:00', student: 'Sarah J.', duration: 2 },
    { day: 'Wednesday', time: '14:00', student: 'Mike T.', duration: 2 },
    { day: 'Friday', time: '09:00', student: 'Emma W.', duration: 2 },
];

// --- CUSTOM COMPONENT: Styled Checkbox ---
interface CustomCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onChange, className }) => {
    return (
        <label className={`relative flex items-center cursor-pointer ${className}`}>
            <input
                type="checkbox"
                className="peer sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div className="w-5 h-5 bg-slate-100 border-2 border-slate-200 rounded transition-all peer-checked:bg-brand-600 peer-checked:border-brand-600 peer-focus:ring-2 peer-focus:ring-brand-500/20"></div>
            <Check className="absolute w-3.5 h-3.5 text-slate-100 left-[3px] top-[3px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
        </label>
    );
};

// --- CUSTOM COMPONENT: Time Select Dropdown ---
interface TimeSelectProps {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
    className?: string;
}

const TimeSelect: React.FC<TimeSelectProps> = ({ value, onChange, disabled, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium border rounded-lg transition-colors bg-white ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400' : 'border-slate-200 hover:border-brand-500 text-slate-700'
                    } ${isOpen ? 'ring-2 ring-brand-500/20 border-brand-500' : ''}`}
            >
                <span>{value ? formatTime12h(value) : "12:00 AM"}</span>
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''} ${disabled ? 'text-slate-300' : 'text-slate-400'}`} />
            </button>

            {isOpen && !disabled && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-[220px] overflow-y-auto w-24 sm:w-full">
                    {/* max-h-[220px] is roughly 8 items (approx 28px each) */}
                    {TIME_OPTIONS.map((time) => (
                        <button
                            key={time}
                            type="button"
                            onClick={() => {
                                onChange(time);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-brand-50 hover:text-brand-700 transition-colors ${value === time ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600'
                                }`}
                        >
                            {formatTime12h(time)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const DriverDashboard: React.FC = () => {
    const { user } = useAuth();
    const { instructors, updateInstructor, students, progressRecords, updateStudentProgress, appointments, scheduleOverrides, addScheduleOverride } = useData();
    const [activeTab, setActiveTab] = useState<'schedule' | 'students' | 'profile' | 'preferences'>('schedule');

    // Filter appointments for this instructor
    const myAppointments = appointments.filter(a => a.instructorId === user?.id);

    // Student Management State
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [editingProgress, setEditingProgress] = useState<Partial<ProgressRecord>>({});
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

    // Calendar Modal State
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showEditAvailabilityModal, setShowEditAvailabilityModal] = useState(false);

    // Edit Availability Form State
    const [editAvailForm, setEditAvailForm] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'unavailable' as 'available' | 'unavailable',
        startTime: '09:00',
        endTime: '17:00',
        applyFor: 'date' as 'date' | 'week' | 'month' | 'custom',
        customStartDate: '',
        customEndDate: ''
    });

    const handleApplyAvailability = () => {
        if (!user?.id) return;

        const overrides: any[] = [];
        const baseDate = new Date(editAvailForm.date);

        // Determine start and end dates based on selection
        let startDate = new Date(baseDate);
        let endDate = new Date(baseDate);

        if (editAvailForm.applyFor === 'week') {
            // Monday to Sunday of that week
            const day = startDate.getDay();
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
            startDate.setDate(diff);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
        } else if (editAvailForm.applyFor === 'month') {
            // Start of month to End of month
            startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
            endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
        } else if (editAvailForm.applyFor === 'custom') {
            if (!editAvailForm.customStartDate || !editAvailForm.customEndDate) {
                alert("Please select custom range");
                return;
            }
            startDate = new Date(editAvailForm.customStartDate);
            endDate = new Date(editAvailForm.customEndDate);
        }

        // Loop through dates and create overrides
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            overrides.push({
                id: Math.random().toString(36).substr(2, 9),
                instructorId: user.id,
                date: new Date(d),
                type: editAvailForm.type,
                ranges: [{ start: editAvailForm.startTime, end: editAvailForm.endTime }]
            });
        }

        addScheduleOverride(overrides);
        setShowEditAvailabilityModal(false);
        alert("Availability Updated!");
    };

    // Profile State
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        carModel: '',
        transmission: TransmissionType.MANUAL,
        bio: ''
    });
    const [selectedPostcodes, setSelectedPostcodes] = useState<PostcodeGroup[]>([]);

    // Preferences State
    const [preferences, setPreferences] = useState<InstructorPreferences>({
        lessonTypes: { standard: true, passPlus: false, shortNotice: false },
        travelTime: 30,
        maxLearners: 5,
        workingHours: DAYS_OF_WEEK.reduce((acc, day) => ({
            ...acc,
            [day]: { active: true, start: '09:00', end: '17:00' }
        }), {} as Record<string, { active: boolean, start: string, end: string }>),
        unavailableHours: DAYS_OF_WEEK.reduce((acc, day) => ({
            ...acc,
            [day]: { active: false, ranges: [{ start: '12:00', end: '13:00' }] }
        }), {} as Record<string, { active: boolean, ranges: { start: string, end: string }[] }>)
    });

    const [hoursView, setHoursView] = useState<'working' | 'unavailable'>('working');

    // Find current instructor data based on logged in user
    const currentInstructor = instructors.find(i => i.id === user?.id);

    useEffect(() => {
        if (currentInstructor) {
            setProfileData({
                firstName: currentInstructor.name.split(' ')[0] || '',
                lastName: currentInstructor.name.split(' ').slice(1).join(' ') || '',
                phone: currentInstructor.phone || '',
                carModel: currentInstructor.car || '',
                transmission: currentInstructor.role.toLowerCase().includes('auto') ? TransmissionType.AUTOMATIC : TransmissionType.MANUAL,
                bio: currentInstructor.bio || ''
            });

            // Parse areasCovered into PostcodeGroup format
            const areas = currentInstructor.areasCovered || [];
            const groups: PostcodeGroup[] = [];
            const parentMap = new Map<string, string[]>();

            areas.forEach(area => {
                const trimmed = area.trim();
                // Check if it's a district code (e.g., "BS1 2") or parent (e.g., "BS1")
                const parts = trimmed.split(' ');
                if (parts.length === 2) {
                    // District code
                    const parent = parts[0];
                    if (!parentMap.has(parent)) {
                        parentMap.set(parent, []);
                    }
                    parentMap.get(parent)!.push(trimmed);
                } else if (parts.length === 1) {
                    // Parent code only
                    if (!parentMap.has(trimmed)) {
                        parentMap.set(trimmed, []);
                    }
                }
            });

            parentMap.forEach((children, parent) => {
                groups.push({ parent, children });
            });

            setSelectedPostcodes(groups);

            // Load existing preferences if available
            if (currentInstructor.preferences) {
                let safeUnavailable = currentInstructor.preferences.unavailableHours;

                // Migration check for old structure
                const sampleDay = Object.values(safeUnavailable || {})[0] as any;
                if (sampleDay && sampleDay.start && !sampleDay.ranges) {
                    safeUnavailable = DAYS_OF_WEEK.reduce((acc, day) => {
                        const oldData = (currentInstructor.preferences?.unavailableHours as any)?.[day] || { active: false, start: '12:00', end: '13:00' };
                        return {
                            ...acc,
                            [day]: {
                                active: oldData.active,
                                ranges: [{ start: oldData.start, end: oldData.end }]
                            }
                        };
                    }, {});
                } else if (!safeUnavailable) {
                    safeUnavailable = DAYS_OF_WEEK.reduce((acc, day) => ({
                        ...acc,
                        [day]: { active: false, ranges: [{ start: '12:00', end: '13:00' }] }
                    }), {});
                }

                setPreferences({
                    ...currentInstructor.preferences,
                    unavailableHours: safeUnavailable
                });
            }
        }
    }, [currentInstructor]);

    // Load student data when selected
    useEffect(() => {
        if (selectedStudentId) {
            const record = progressRecords.find(p => p.studentId === selectedStudentId) || {
                studentId: selectedStudentId,
                totalHours: 0,
                skills: {},
                notes: [],
                lastUpdated: ''
            };
            setEditingProgress(record);
        }
    }, [selectedStudentId, progressRecords]);

    // Reset save status ONLY when switching students
    useEffect(() => {
        setSaveStatus('idle');
    }, [selectedStudentId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (user?.id) {
            // Convert PostcodeGroup[] to string array for storage
            const areasList: string[] = [];
            selectedPostcodes.forEach(group => {
                areasList.push(...group.children);
            });

            updateInstructor(user.id, {
                name: `${profileData.firstName} ${profileData.lastName}`,
                phone: profileData.phone,
                car: profileData.carModel,
                bio: profileData.bio,
                areasCovered: areasList
            });
            alert("Profile updated successfully!");
        }
    };

    const handleSkillUpdate = (topic: string, level: number) => {
        setEditingProgress(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                [topic]: level
            }
        }));
        setSaveStatus('idle');
    };

    const saveStudentProgress = () => {
        if (selectedStudentId && editingProgress) {
            updateStudentProgress(selectedStudentId, editingProgress);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    // --- Preferences Handlers ---

    const handleWorkingScheduleChange = (day: string, field: 'active' | 'start' | 'end', value: any) => {
        setPreferences(prev => ({
            ...prev,
            workingHours: {
                ...prev.workingHours,
                [day]: {
                    ...prev.workingHours[day],
                    [field]: value
                }
            }
        }));
    };

    const handleUnavailableScheduleChange = (day: string, type: 'active' | 'range', value: any, rangeIndex: number = 0, rangeField: 'start' | 'end' = 'start') => {
        setPreferences(prev => {
            const currentDayConfig = prev.unavailableHours[day];

            if (type === 'active') {
                return {
                    ...prev,
                    unavailableHours: {
                        ...prev.unavailableHours,
                        [day]: { ...currentDayConfig, active: value }
                    }
                };
            } else {
                const newRanges = [...currentDayConfig.ranges];
                newRanges[rangeIndex] = {
                    ...newRanges[rangeIndex],
                    [rangeField]: value
                };
                return {
                    ...prev,
                    unavailableHours: {
                        ...prev.unavailableHours,
                        [day]: { ...currentDayConfig, ranges: newRanges }
                    }
                };
            }
        });
    };

    const addUnavailableRange = (day: string) => {
        setPreferences(prev => {
            const currentDayConfig = prev.unavailableHours[day];
            return {
                ...prev,
                unavailableHours: {
                    ...prev.unavailableHours,
                    [day]: {
                        ...currentDayConfig,
                        ranges: [...currentDayConfig.ranges, { start: '12:00', end: '13:00' }]
                    }
                }
            };
        });
    };

    const removeUnavailableRange = (day: string, index: number) => {
        setPreferences(prev => {
            const currentDayConfig = prev.unavailableHours[day];
            const newRanges = currentDayConfig.ranges.filter((_, i) => i !== index);
            return {
                ...prev,
                unavailableHours: {
                    ...prev.unavailableHours,
                    [day]: { ...currentDayConfig, ranges: newRanges }
                }
            };
        });
    };

    const handleApplyToAll = (dayToCopy: string) => {
        if (hoursView === 'working') {
            const sourceConfig = preferences.workingHours[dayToCopy];
            const newWorkingHours = { ...preferences.workingHours };
            DAYS_OF_WEEK.forEach(day => {
                newWorkingHours[day] = { ...sourceConfig };
            });
            setPreferences(prev => ({ ...prev, workingHours: newWorkingHours }));
        } else {
            const sourceConfig = preferences.unavailableHours[dayToCopy];
            const newUnavailableHours = { ...preferences.unavailableHours };
            DAYS_OF_WEEK.forEach(day => {
                newUnavailableHours[day] = {
                    active: sourceConfig.active,
                    ranges: sourceConfig.ranges.map(r => ({ ...r }))
                };
            });
            setPreferences(prev => ({ ...prev, unavailableHours: newUnavailableHours }));
        }
    };

    // Generate public slots based on Working Hours MINUS Unavailable Hours
    const generateSlotsFromPreferences = (prefs: InstructorPreferences): Record<string, string[]> => {
        const availability: Record<string, string[]> = {};
        const SLOT_DURATION = 120; // 2 hours
        const TRAVEL_TIME = prefs.travelTime || 0;

        Object.entries(prefs.workingHours).forEach(([day, workingSettings]) => {
            if (!workingSettings.active) {
                availability[day] = [];
                return;
            }

            const slots: string[] = [];
            const [startH, startM] = workingSettings.start.split(':').map(Number);
            const [endH, endM] = workingSettings.end.split(':').map(Number);
            let currentTotalMins = startH * 60 + startM;
            const endTotalMins = endH * 60 + endM;

            const unavailableConfig = prefs.unavailableHours[day];
            const blockedRanges: { start: number, end: number }[] = [];

            if (unavailableConfig && unavailableConfig.active) {
                unavailableConfig.ranges.forEach(range => {
                    const [uStartH, uStartM] = range.start.split(':').map(Number);
                    const [uEndH, uEndM] = range.end.split(':').map(Number);
                    blockedRanges.push({
                        start: uStartH * 60 + uStartM,
                        end: uEndH * 60 + uEndM
                    });
                });
            }

            // Sort blocked ranges by start time to handle jumps correctly
            blockedRanges.sort((a, b) => a.start - b.start);

            while (currentTotalMins + SLOT_DURATION <= endTotalMins) {
                const slotStart = currentTotalMins;
                const slotEnd = currentTotalMins + SLOT_DURATION;

                // Find the first blocking range that overlaps
                const conflict = blockedRanges.find(blocked => {
                    return (slotStart < blocked.end) && (slotEnd > blocked.start);
                });

                if (conflict) {
                    // If conflict, jump to the end of the conflict
                    // We DO NOT add travel time here, assuming unavailability (like lunch) ends exactly when stated.
                    // However, we must ensure we don't jump backward or stay stuck.
                    currentTotalMins = Math.max(currentTotalMins + 15, conflict.end);
                } else {
                    // No conflict, add slot
                    const h = Math.floor(currentTotalMins / 60);
                    const m = currentTotalMins % 60;
                    const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    slots.push(timeString);

                    // Advance by duration + travel time
                    currentTotalMins += SLOT_DURATION + TRAVEL_TIME;
                }
            }

            availability[day] = slots;
        });

        return availability;
    };

    const savePreferences = () => {
        if (user?.id) {
            const generatedAvailability = generateSlotsFromPreferences(preferences);
            updateInstructor(user.id, {
                preferences: preferences,
                availability: generatedAvailability
            });
            alert("Availability & Preferences saved!");
            setActiveTab('schedule');
        }
    };

    const getSlotStatus = (day: string, hour: number) => {
        const SLOT_DURATION = 120; // 2 hours

        // 1. Check if Booked
        const hourStr = `${hour.toString().padStart(2, '0')}:00`;
        const booking = myAppointments.find(a => a.day === day && parseInt(a.time) === hour);
        if (booking) return { status: 'booked', label: booking.studentName };

        // 2. Check if Unavailable
        const unavailableConfig = preferences.unavailableHours[day];
        const timeMins = hour * 60;
        if (unavailableConfig && unavailableConfig.active) {
            const isBlocked = unavailableConfig.ranges.some(r => {
                const [sH, sM] = r.start.split(':').map(Number);
                const [eH, eM] = r.end.split(':').map(Number);
                const startMins = sH * 60 + sM;
                const endMins = eH * 60 + eM;
                // Check overlap with 2-hour block
                const slotEndMins = timeMins + SLOT_DURATION;
                return (timeMins < endMins) && (slotEndMins > startMins);
            });
            if (isBlocked) return { status: 'unavailable', label: 'Unavailable' };
        }

        // 3. Check if Available (Working Hours)
        const workingConfig = preferences.workingHours[day];
        if (workingConfig && workingConfig.active) {
            const [sH, sM] = workingConfig.start.split(':').map(Number);
            const [eH, eM] = workingConfig.end.split(':').map(Number);
            const startMins = sH * 60 + sM;
            const endMins = eH * 60 + eM;

            // Is this 2-hour slot fully inside working hours?
            if (timeMins >= startMins && timeMins + SLOT_DURATION <= endMins) {
                return { status: 'available', label: 'Available' };
            }
        }

        return { status: 'inactive', label: '' };
    };

    return (
        <div className="py-24 bg-slate-50 min-h-screen relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header & Tabs */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Instructor Dashboard</h1>
                        <p className="text-slate-600">Welcome back, {user?.firstName}.</p>
                    </div>

                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('schedule')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'schedule' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <CalendarDays className="w-4 h-4" /> Schedule
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'students' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <GraduationCap className="w-4 h-4" /> My Students
                        </button>
                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'preferences' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <Sliders className="w-4 h-4" /> Availability
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <Settings className="w-4 h-4" /> Profile
                        </button>
                    </div>
                </div>

                {activeTab === 'schedule' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="bg-brand-100 p-3 rounded-xl text-brand-600">
                                        <CalendarDays className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Upcoming Lessons</p>
                                        <p className="text-2xl font-bold text-slate-900">{myAppointments.length}</p>
                                        <p className="text-xs text-slate-400">This Week</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Active Students</p>
                                        <p className="text-2xl font-bold text-slate-900">{students.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center">
                                {/* CALENDAR PREVIEW CARD (REPLACING THE BUTTON) */}
                                <button
                                    onClick={() => setShowCalendarModal(true)}
                                    className="w-full h-full bg-white p-4 rounded-2xl shadow-md border border-slate-100 hover:shadow-lg hover:border-brand-200 transition-all group flex flex-col items-center justify-center"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-5 h-5 text-brand-600 group-hover:scale-110 transition-transform" />
                                        <span className="font-bold text-slate-700">View Full Calendar</span>
                                    </div>
                                    {/* Mini visual representation of a calendar week */}
                                    <div className="flex gap-1 h-6 items-end">
                                        {[40, 70, 30, 80, 50, 20, 0].map((h, i) => (
                                            <div key={i} className="w-2 bg-brand-100 rounded-sm overflow-hidden relative" style={{ height: '100%' }}>
                                                <div className="absolute bottom-0 w-full bg-brand-400" style={{ height: `${h}%` }}></div>
                                            </div>
                                        ))}
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Today's Schedule */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-900">Today's Schedule</h2>
                                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {myAppointments.filter(a => a.day === DAYS_OF_WEEK[(new Date().getDay() + 6) % 7]).length === 0 && (
                                    <p className="p-6 text-slate-500 text-sm italic">No lessons scheduled for today.</p>
                                )}
                                {myAppointments.filter(a => a.day === DAYS_OF_WEEK[(new Date().getDay() + 6) % 7]).map((appt) => (
                                    <div key={appt.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="text-center min-w-[60px]">
                                                <span className="block text-lg font-bold text-slate-900">
                                                    {formatTime12h(appt.time).replace(' AM', '').replace(' PM', '')}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {formatTime12h(appt.time).includes('PM') ? 'PM' : 'AM'}
                                                </span>
                                            </div>
                                            <div className="h-10 w-px bg-slate-200"></div>
                                            <div>
                                                <p className="font-bold text-slate-900">{appt.studentName}</p>
                                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {appt.pickupAddress || 'Pick up point not specified'}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">{appt.duration} Hour Lesson</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Confirmed</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* FULL CALENDAR MODAL */}
                {showCalendarModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-5 h-5" /> Weekly Schedule
                                    </h2>
                                    <p className="text-slate-500 text-xs mt-1">
                                        <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span> Booked
                                        <span className="inline-block w-2 h-2 rounded-full bg-brand-400 mr-1 ml-3"></span> Available
                                        <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1 ml-3"></span> Unavailable
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="h-10 text-xs px-4 rounded-lg"
                                        onClick={() => setShowEditAvailabilityModal(true)}
                                    >
                                        <Settings className="w-3 h-3 mr-2" /> Edit Availability
                                    </Button>
                                    <button
                                        onClick={() => setShowCalendarModal(false)}
                                        className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-auto bg-white flex-grow">
                                <CalendarView
                                    instructor={currentInstructor || {
                                        id: user?.id || 'admin',
                                        name: `${user?.firstName} ${user?.lastName}`,
                                        role: 'Instructor',
                                        car: '',
                                        bio: '',
                                        qualifications: [],
                                        areasCovered: [],
                                        availability: {}, // Fallback empty availability
                                        preferences: preferences // Use local preferences
                                    }}
                                    selectedSlot={null}
                                    onSelectSlot={() => { }}
                                    bookedSlots={myAppointments.map(a => ({
                                        day: a.day,
                                        time: a.time,
                                        duration: a.duration,
                                        student: a.studentName,
                                        date: a.date
                                    }))}
                                    unavailableSlots={DAYS_OF_WEEK.reduce((acc, day) => {
                                        const config = preferences?.unavailableHours?.[day];
                                        if (config && config.active) {
                                            acc[day] = config.ranges;
                                        }
                                        return acc;
                                    }, {} as Record<string, { start: string, end: string }[]>)}
                                    scheduleOverrides={scheduleOverrides.filter(o => o.instructorId === user?.id)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* EDIT AVAILABILITY POPUP */}
                {showEditAvailabilityModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Availability</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Select Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                        value={editAvailForm.date}
                                        onChange={e => setEditAvailForm({ ...editAvailForm, date: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">State</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                        value={editAvailForm.type}
                                        onChange={e => setEditAvailForm({ ...editAvailForm, type: e.target.value as 'available' | 'unavailable' })}
                                    >
                                        <option value="available">Available</option>
                                        <option value="unavailable">Unavailable</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                            value={editAvailForm.startTime}
                                            onChange={e => setEditAvailForm({ ...editAvailForm, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                            value={editAvailForm.endTime}
                                            onChange={e => setEditAvailForm({ ...editAvailForm, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Apply For</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                        value={editAvailForm.applyFor}
                                        onChange={e => setEditAvailForm({ ...editAvailForm, applyFor: e.target.value as any })}
                                    >
                                        <option value="date">Specific Date</option>
                                        <option value="week">Whole Week</option>
                                        <option value="month">Whole Month</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>

                                {editAvailForm.applyFor === 'custom' && (
                                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">From</label>
                                            <input
                                                type="date"
                                                className="w-full px-2 py-1 border border-slate-200 rounded bg-white"
                                                value={editAvailForm.customStartDate}
                                                onChange={e => setEditAvailForm({ ...editAvailForm, customStartDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">To</label>
                                            <input
                                                type="date"
                                                className="w-full px-2 py-1 border border-slate-200 rounded bg-white"
                                                value={editAvailForm.customEndDate}
                                                onChange={e => setEditAvailForm({ ...editAvailForm, customEndDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <Button variant="white" onClick={() => setShowEditAvailabilityModal(false)}>Cancel</Button>
                                    <Button onClick={handleApplyAvailability}>Apply Changes</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Student List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <h2 className="text-lg font-bold text-slate-900">Your Students</h2>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {students.length === 0 && (
                                        <p className="p-6 text-slate-500 text-sm italic">No students registered yet.</p>
                                    )}
                                    {students
                                        .filter(student =>
                                            myAppointments.some(appt => appt.studentId === student.id)
                                        )
                                        .map((student) => {
                                            const record = progressRecords.find(p => p.studentId === student.id);
                                            const isSelected = selectedStudentId === student.id;
                                            return (
                                                <button
                                                    key={student.id}
                                                    onClick={() => setSelectedStudentId(student.id)}
                                                    className={`w-full text-left p-5 flex items-center justify-between transition-colors ${isSelected ? 'bg-brand-50' : 'hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold ${isSelected ? 'text-brand-700' : 'text-slate-900'}`}>
                                                                {student.firstName} {student.lastName}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {record ? `${record.totalHours} hrs logged` : 'No logs yet'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-300'}`} />
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>

                        {/* Right: Logbook */}
                        <div className="lg:col-span-2">
                            {selectedStudentId ? (
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">Digital Logbook</h2>
                                            <p className="text-slate-500">Update progress for student.</p>
                                        </div>
                                        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Total Hours</label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditingProgress(p => ({ ...p, totalHours: Math.max(0, (p.totalHours || 0) - 1) }))}
                                                    className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-brand-50"
                                                >-</button>
                                                <span className="text-xl font-bold w-8 text-center">{editingProgress.totalHours || 0}</span>
                                                <button
                                                    onClick={() => setEditingProgress(p => ({ ...p, totalHours: (p.totalHours || 0) + 1 }))}
                                                    className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-brand-50"
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 mb-8">
                                        {SYLLABUS_TOPICS.map((topic) => {
                                            const currentLevel = editingProgress.skills?.[topic] || 0;
                                            return (
                                                <div key={topic} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                                    <span className="font-medium text-slate-700">{topic}</span>
                                                    <div className="flex items-center gap-2">
                                                        {[1, 2, 3, 4, 5].map((level) => (
                                                            <button
                                                                key={level}
                                                                onClick={() => handleSkillUpdate(topic, level)}
                                                                className={`w-8 h-8 rounded-full text-xs font-bold transition-all border ${currentLevel >= level
                                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm scale-105'
                                                                    : 'bg-white border-slate-200 text-slate-300 hover:border-brand-300'
                                                                    }`}
                                                                title={`Level ${level}`}
                                                            >
                                                                {level}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-4">
                                        {saveStatus === 'saved' && (
                                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold animate-in fade-in duration-300">
                                                <CheckCircle className="w-5 h-5" />
                                                Saved Successfully!
                                            </div>
                                        )}
                                        <Button onClick={saveStudentProgress} className="gap-2">
                                            <Save className="w-4 h-4" /> Update Progress
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                                    <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center text-brand-300 mb-6">
                                        <GraduationCap className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Student</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto">
                                        Choose a student from the list on the left to view and update their driving progress logbook.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW: PREFERENCES & AVAILABILITY */}
                {activeTab === 'preferences' && (
                    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">My preferences</h2>
                            <p className="text-slate-600">Manage lesson types and availability.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Card 1: Lesson Types */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-full">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">My lesson types</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900">Standard lessons</p>
                                            <p className="text-xs text-slate-500">Learner, Refresher & Motorway lesson</p>
                                        </div>
                                        <button
                                            onClick={() => setPreferences(p => ({ ...p, lessonTypes: { ...p.lessonTypes, standard: !p.lessonTypes.standard } }))}
                                            className={`w-12 h-7 rounded-full transition-colors relative ${preferences.lessonTypes.standard ? 'bg-brand-600' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${preferences.lessonTypes.standard ? 'left-6' : 'left-1'}`}></div>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900">Pass Plus lessons</p>
                                            <p className="text-xs text-slate-500">Qualified instructors only</p>
                                        </div>
                                        <button
                                            onClick={() => setPreferences(p => ({ ...p, lessonTypes: { ...p.lessonTypes, passPlus: !p.lessonTypes.passPlus } }))}
                                            className={`w-12 h-7 rounded-full transition-colors relative ${preferences.lessonTypes.passPlus ? 'bg-brand-600' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${preferences.lessonTypes.passPlus ? 'left-6' : 'left-1'}`}></div>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900">Short notice tests</p>
                                            <p className="text-xs text-slate-500">Test is already booked within 14 days</p>
                                        </div>
                                        <button
                                            onClick={() => setPreferences(p => ({ ...p, lessonTypes: { ...p.lessonTypes, shortNotice: !p.lessonTypes.shortNotice } }))}
                                            className={`w-12 h-7 rounded-full transition-colors relative ${preferences.lessonTypes.shortNotice ? 'bg-brand-600' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${preferences.lessonTypes.shortNotice ? 'left-6' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Lesson Preferences */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-full">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Lesson preferences</h3>

                                <div className="mb-10">
                                    <div className="flex justify-between mb-4">
                                        <label className="text-sm font-bold text-slate-700">Travel time to lesson (mins)</label>
                                        <span className="text-sm font-bold text-slate-900">{preferences.travelTime}m</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="15" max="60" step="15"
                                        value={preferences.travelTime}
                                        onChange={(e) => setPreferences(p => ({ ...p, travelTime: parseInt(e.target.value) }))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                    />
                                    <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                                        <span>15m</span>
                                        <span>30m</span>
                                        <span>45m</span>
                                        <span>60m</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="text-sm font-bold text-slate-700">Learner capacity</label>
                                        <span className="text-sm font-bold text-slate-900">Current: {students.length} of {preferences.maxLearners}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            min="1" max="20"
                                            value={preferences.maxLearners}
                                            onChange={(e) => setPreferences(p => ({ ...p, maxLearners: parseInt(e.target.value) }))}
                                            className="w-16 px-3 py-2 border border-slate-200 rounded-lg text-center font-bold bg-slate-50"
                                        />
                                        <div className="flex-grow h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${students.length >= preferences.maxLearners ? 'bg-red-500' : 'bg-brand-500'}`}
                                                style={{ width: `${Math.min((students.length / preferences.maxLearners) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${students.length < preferences.maxLearners ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {students.length < preferences.maxLearners ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Working Hours / Availability */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8 overflow-visible">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-4">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {hoursView === 'working' ? 'My working hours' : 'Recurrent Unavailability'}
                                </h3>

                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setHoursView('working')}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${hoursView === 'working' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <Briefcase className="w-4 h-4" /> Working Hours
                                    </button>
                                    <button
                                        onClick={() => setHoursView('unavailable')}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${hoursView === 'unavailable' ? 'bg-white shadow-sm text-amber-700' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <Coffee className="w-4 h-4" /> Unavailable
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase mb-4 px-4">
                                <div className="col-span-3 md:col-span-2">Day of week</div>
                                <div className="col-span-5 md:col-span-6 text-center">{hoursView === 'working' ? 'Set working hours' : 'Set unavailable time'}</div>
                                <div className="col-span-4 md:col-span-4 text-right">Start / End</div>
                            </div>

                            <div className="space-y-4">
                                {DAYS_OF_WEEK.map((day) => {
                                    const isWorkingView = hoursView === 'working';
                                    const workingConfig = preferences.workingHours[day];
                                    const unavailableConfig = preferences.unavailableHours[day];

                                    const startStr = isWorkingView ? workingConfig.start : (unavailableConfig.ranges[0]?.start || '00:00');
                                    const endStr = isWorkingView ? workingConfig.end : (unavailableConfig.ranges[0]?.end || '00:00');

                                    const isActive = isWorkingView ? workingConfig.active : unavailableConfig.active;

                                    const startIdx = TIME_OPTIONS.indexOf(startStr);
                                    const endIdx = TIME_OPTIONS.indexOf(endStr);
                                    const totalSlots = TIME_OPTIONS.length;
                                    const safeStartIdx = startIdx === -1 ? 0 : startIdx;
                                    const safeEndIdx = endIdx === -1 ? totalSlots - 1 : endIdx;
                                    const leftPct = (safeStartIdx / totalSlots) * 100;
                                    const widthPct = ((safeEndIdx - safeStartIdx) / totalSlots) * 100;

                                    const barColor = isWorkingView ? 'bg-brand-500' : 'bg-amber-500';
                                    const handleColor = isWorkingView ? 'bg-brand-700' : 'bg-amber-700';

                                    return (
                                        <div key={day} className="grid grid-cols-12 gap-4 items-start p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                            {/* Column 1: Custom Checkbox & Name */}
                                            <div className="col-span-3 md:col-span-2 flex items-center gap-3 pt-2">
                                                <CustomCheckbox
                                                    checked={isActive}
                                                    onChange={(val) => isWorkingView
                                                        ? handleWorkingScheduleChange(day, 'active', val)
                                                        : handleUnavailableScheduleChange(day, 'active', val)
                                                    }
                                                />
                                                <span className={`font-medium ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{day}</span>
                                            </div>

                                            {/* Column 2: Timeline Visualization */}
                                            <div className="col-span-5 md:col-span-6 px-2 pt-4">
                                                <div className="h-1.5 bg-slate-200 rounded-full relative w-full">
                                                    {isActive && (
                                                        <>
                                                            <div
                                                                className={`absolute top-0 h-full rounded-full opacity-80 ${barColor}`}
                                                                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                                                            ></div>
                                                            <div className={`absolute top-1/2 -mt-1.5 w-3 h-3 rounded-full shadow-sm ${handleColor}`} style={{ left: `${leftPct}%` }}></div>
                                                            <div className={`absolute top-1/2 -mt-1.5 w-3 h-3 rounded-full shadow-sm ${handleColor}`} style={{ left: `${leftPct + widthPct}%` }}></div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Column 3: Controls (Custom Dropdowns) */}
                                            <div className="col-span-4 md:col-span-4 flex flex-col items-end gap-2">
                                                {isWorkingView ? (
                                                    /* WORKING HOURS CONTROLS */
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20">
                                                            <TimeSelect
                                                                disabled={!isActive}
                                                                value={workingConfig.start}
                                                                onChange={(val) => handleWorkingScheduleChange(day, 'start', val)}
                                                            />
                                                        </div>
                                                        <span className="text-slate-300">-</span>
                                                        <div className="w-20">
                                                            <TimeSelect
                                                                disabled={!isActive}
                                                                value={workingConfig.end}
                                                                onChange={(val) => handleWorkingScheduleChange(day, 'end', val)}
                                                            />
                                                        </div>

                                                        {/* Apply to All Button */}
                                                        {isActive && (
                                                            <button
                                                                onClick={() => handleApplyToAll(day)}
                                                                className="ml-2 text-[10px] font-bold text-brand-600 hover:bg-brand-50 px-2 py-1 rounded transition-colors"
                                                                title="Apply these hours to all days"
                                                            >
                                                                Apply All
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    /* UNAVAILABLE HOURS CONTROLS (MULTIPLE) */
                                                    <div className="flex flex-col gap-2 w-full items-end">
                                                        {unavailableConfig.ranges.map((range, index) => (
                                                            <div key={index} className="flex items-center gap-2">
                                                                {index === 0 && (
                                                                    <button
                                                                        onClick={() => addUnavailableRange(day)}
                                                                        className="w-6 h-6 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-600 flex items-center justify-center transition-colors flex-shrink-0"
                                                                        title="Add another time slot"
                                                                        disabled={!isActive}
                                                                    >
                                                                        <Plus className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                                {index > 0 && (
                                                                    <button
                                                                        onClick={() => removeUnavailableRange(day, index)}
                                                                        className="w-6 h-6 rounded-full bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 flex items-center justify-center transition-colors flex-shrink-0"
                                                                        title="Remove slot"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                )}

                                                                <div className="w-[85px]">
                                                                    <TimeSelect
                                                                        disabled={!isActive}
                                                                        value={range.start}
                                                                        onChange={(val) => handleUnavailableScheduleChange(day, 'range', val, index, 'start')}
                                                                    />
                                                                </div>
                                                                <span className="text-slate-300">-</span>
                                                                <div className="w-[85px]">
                                                                    <TimeSelect
                                                                        disabled={!isActive}
                                                                        value={range.end}
                                                                        onChange={(val) => handleUnavailableScheduleChange(day, 'range', val, index, 'end')}
                                                                    />
                                                                </div>

                                                                {index === 0 && isActive && (
                                                                    <button
                                                                        onClick={() => handleApplyToAll(day)}
                                                                        className="ml-1 text-slate-400 hover:text-amber-600 transition-colors flex-shrink-0"
                                                                        title="Apply these unavailable slots to all days"
                                                                    >
                                                                        <Copy className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 pb-12">
                            <Button onClick={savePreferences} className="px-8 h-12 text-lg shadow-xl shadow-brand-500/20">
                                <Save className="w-5 h-5 mr-2" /> Save & Update Availability
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    /* PROFILE SETTINGS VIEW */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sidebar Info */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
                                <h2 className="text-xl font-bold text-slate-900">{profileData.firstName} {profileData.lastName}</h2>
                                <p className="text-brand-600 font-medium text-sm mb-4">Approved Instructor (ADI)</p>
                                <div className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                    Active Status
                                </div>
                            </div>
                        </div>

                        {/* Main Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                                    <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Profile Details</h2>
                                        <p className="text-slate-500 text-sm">This information is visible to admins and students.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={profileData.firstName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={profileData.lastName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Vehicle Model</label>
                                            <div className="relative">
                                                <Car className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="carModel"
                                                    value={profileData.carModel}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Transmission</label>
                                            <select
                                                name="transmission"
                                                value={profileData.transmission}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white appearance-none"
                                            >
                                                <option value={TransmissionType.MANUAL}>Manual Gearbox</option>
                                                <option value={TransmissionType.AUTOMATIC}>Automatic Gearbox</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Areas Covered
                                        </label>
                                        <PostcodeSelector
                                            value={selectedPostcodes}
                                            onChange={setSelectedPostcodes}
                                            placeholder="Enter postcode (e.g. BS1)..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Instructor Bio</label>
                                        <textarea
                                            name="bio"
                                            rows={4}
                                            value={profileData.bio}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white resize-none"
                                        ></textarea>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button type="submit" className="gap-2">
                                            <Save className="w-4 h-4" /> Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};