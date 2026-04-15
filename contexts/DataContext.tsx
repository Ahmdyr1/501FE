
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Instructor, Review, ProgressRecord, SYLLABUS_TOPICS, User, Appointment, ScheduleOverride } from '../types';
import { INSTRUCTORS as INITIAL_INSTRUCTORS, REVIEWS as INITIAL_REVIEWS } from '../constants';

interface DataContextType {
  instructors: Instructor[];
  reviews: Review[];
  progressRecords: ProgressRecord[];
  students: User[]; // List of all registered students (mock DB)
  appointments: Appointment[];
  scheduleOverrides: ScheduleOverride[];
  addInstructor: (instructor: Instructor) => void;
  updateInstructor: (id: string, updates: Partial<Instructor>) => void;
  deleteInstructor: (id: string) => void;
  addReview: (review: Review) => void;
  updateStudentProgress: (studentId: string, updates: Partial<ProgressRecord>) => void;
  addAppointment: (appointment: Appointment) => void;
  addScheduleOverride: (overrides: ScheduleOverride[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduleOverrides, setScheduleOverrides] = useState<ScheduleOverride[]>([]);

  useEffect(() => {
    // 1. Load Instructors
    const storedInstructors = localStorage.getItem('drivesafe_instructors');
    let loadedInstructors = storedInstructors ? JSON.parse(storedInstructors) : INITIAL_INSTRUCTORS;

    // Ensure admin-test and instructor-test always exist (merging new constants into old local storage)
    const criticalIds = ['admin-test', 'instructor-test'];
    const missing = INITIAL_INSTRUCTORS.filter(init =>
      criticalIds.includes(init.id) && !loadedInstructors.some((loaded: Instructor) => loaded.id === init.id)
    );

    if (missing.length > 0) {
      loadedInstructors = [...loadedInstructors, ...missing];
    }

    setInstructors(loadedInstructors);

    // 2. Load Reviews
    const storedReviews = localStorage.getItem('drivesafe_reviews');
    setReviews(storedReviews ? JSON.parse(storedReviews) : INITIAL_REVIEWS);

    // 3. Load Students (Mock DB populated by AuthContext)
    // 3. Load Students
    const storedStudents = localStorage.getItem('drivesafe_students');
    // Filter out residual test data from previous runs
    const cleanStudents = (storedStudents ? JSON.parse(storedStudents) : []).filter((s: User) => s.id !== 'student-test');
    setStudents(cleanStudents);

    // 4. Load Progress Records
    const storedProgress = localStorage.getItem('drivesafe_progress');
    if (storedProgress) {
      const cleanProgress = JSON.parse(storedProgress).filter((p: ProgressRecord) => p.studentId !== 'student-test');
      setProgressRecords(cleanProgress);
    } else {
      setProgressRecords([]);
    }

    // 5. Load Appointments
    const storedAppointments = localStorage.getItem('drivesafe_appointments');
    if (storedAppointments) {
      // Need to rehydrate Date objects
      const parsed = JSON.parse(storedAppointments).map((a: any) => ({
        ...a,
        date: new Date(a.date)
      }));
      setAppointments(parsed);
    } else {
      // Initial MOCK Appointments
      // We need to create Dates relative to today for them to show up securely
      const getNextDayOfWeek = (dayName: string, hour: number) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetIndex = days.indexOf(dayName);
        const d = new Date();
        const todayIndex = d.getDay();

        let diff = targetIndex - todayIndex;
        if (diff < 0) diff += 7; // Next occurrence

        d.setDate(d.getDate() + diff);
        d.setHours(hour, 0, 0, 0);
        return d;
      };

      // Initial MOCK Appointments - CLEARED
      setAppointments([]);
      localStorage.setItem('drivesafe_appointments', JSON.stringify([]));
    }

    // 6. Load Schedule Overrides
    const storedOverrides = localStorage.getItem('drivesafe_overrides');
    if (storedOverrides) {
      // Rehydrate Dates
      const parsed = JSON.parse(storedOverrides).map((o: any) => ({
        ...o,
        date: new Date(o.date)
      }));
      setScheduleOverrides(parsed);
    }
  }, []);

  const saveInstructorsToStorage = (newData: Instructor[]) => {
    setInstructors(newData);
    localStorage.setItem('drivesafe_instructors', JSON.stringify(newData));
  };

  const saveReviewsToStorage = (newData: Review[]) => {
    setReviews(newData);
    localStorage.setItem('drivesafe_reviews', JSON.stringify(newData));
  };

  const saveProgressToStorage = (newData: ProgressRecord[]) => {
    setProgressRecords(newData);
    localStorage.setItem('drivesafe_progress', JSON.stringify(newData));
  };

  const saveAppointmentsToStorage = (newData: Appointment[]) => {
    setAppointments(newData);
    localStorage.setItem('drivesafe_appointments', JSON.stringify(newData));
  };

  const saveScheduleOverridesToStorage = (newData: ScheduleOverride[]) => {
    setScheduleOverrides(newData);
    localStorage.setItem('drivesafe_overrides', JSON.stringify(newData));
  };

  const addInstructor = (instructor: Instructor) => {
    const newData = [...instructors, instructor];
    saveInstructorsToStorage(newData);
  };

  const updateInstructor = (id: string, updates: Partial<Instructor>) => {
    const newData = instructors.map(inst =>
      inst.id === id ? { ...inst, ...updates } : inst
    );
    saveInstructorsToStorage(newData);
  };

  const deleteInstructor = (id: string) => {
    const newData = instructors.filter(i => i.id !== id);
    saveInstructorsToStorage(newData);
  };

  const addReview = (review: Review) => {
    const newData = [review, ...reviews];
    saveReviewsToStorage(newData);
  };

  const updateStudentProgress = (studentId: string, updates: Partial<ProgressRecord>) => {
    const existingIndex = progressRecords.findIndex(r => r.studentId === studentId);
    let newData;

    if (existingIndex >= 0) {
      // Update existing
      newData = [...progressRecords];
      newData[existingIndex] = { ...newData[existingIndex], ...updates, lastUpdated: new Date().toISOString() };
    } else {
      // Create new
      const newRecord: ProgressRecord = {
        studentId,
        totalHours: 0,
        skills: {},
        notes: [],
        lastUpdated: new Date().toISOString(),
        ...updates
      };
      newData = [...progressRecords, newRecord];
    }
    saveProgressToStorage(newData);
  };

  const addAppointment = (appointment: Appointment) => {
    // 1. Add Appointment
    const newAppointments = [...appointments, appointment];
    saveAppointmentsToStorage(newAppointments);

    // 2. Add Student if new
    // We assume appointment.studentId is generated by the caller (Contact.tsx)
    const existingStudent = students.find(s => s.id === appointment.studentId);
    if (!existingStudent && appointment.studentId) {
      // Create minimal user record
      const newStudent: User = {
        id: appointment.studentId,
        email: `${appointment.studentName.toLowerCase().replace(/\s/g, '.')}@example.com`, // Artificial email
        firstName: appointment.studentName.split(' ')[0],
        lastName: appointment.studentName.split(' ').slice(1).join(' '),
        role: 'student' as any
      };
      const newStudentsList = [...students, newStudent];
      setStudents(newStudentsList);
      localStorage.setItem('drivesafe_students', JSON.stringify(newStudentsList));
    }

    // 3. Increment Instructor Student Count
    // Only if this student wasn't already learning with them? 
    // For simplicity, we'll increment if it's a new student record to the system, OR just blindly increment?
    // "The student count for the instructor should also increase" - implies unique students.

    // Check if this student already has appointments with this instructor
    const hasPriorBooking = appointments.some(a => a.instructorId === appointment.instructorId && a.studentId === appointment.studentId);

    if (!hasPriorBooking) {
      const targetInstructor = instructors.find(i => i.id === appointment.instructorId);
      if (targetInstructor) {
        updateInstructor(targetInstructor.id, {
          activeStudents: (targetInstructor.activeStudents || 0) + 1
        });
      }
    }
  };

  const addScheduleOverride = (newOverrides: ScheduleOverride[]) => {
    // Filter out existing overrides for the same date/instructor to avoid duplicates/conflicts?
    // Or just append? Logic says "Apply for" overrides previous.

    const newData = [...scheduleOverrides];

    newOverrides.forEach(newItem => {
      // Remove existing for same date & instructor
      const existingIdx = newData.findIndex(o =>
        o.instructorId === newItem.instructorId &&
        o.date.toDateString() === newItem.date.toDateString()
      );
      if (existingIdx >= 0) {
        newData.splice(existingIdx, 1);
      }
      newData.push(newItem);
    });

    saveScheduleOverridesToStorage(newData);
  };

  return (
    <DataContext.Provider value={{ instructors, reviews, progressRecords, students, appointments, scheduleOverrides, addInstructor, updateInstructor, deleteInstructor, addReview, updateStudentProgress, addAppointment, addScheduleOverride }}>
      {children}
    </DataContext.Provider>
  );
};
