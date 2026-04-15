
export enum TransmissionType {
  MANUAL = 'Manual',
  AUTOMATIC = 'Automatic'
}

export enum PackageType {
  SINGLE = 'Single Lesson',
  BLOCK_10 = '10 Hour Block',
  BLOCK_20 = '20 Hour Block',
  PASS_PLUS = 'Pass Plus',
  TEST_DAY = 'Test Day Package'
}

export enum UserRole {
  STUDENT = 'student',
  DRIVER = 'driver',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  hours: number;
  transmission: TransmissionType;
  features: string[];
  popular?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  postcode: string;
  transmission: TransmissionType;
  experienceLevel: string;
  preferredDays: string[];
  message: string;
}

export interface InstructorPreferences {
  lessonTypes: {
    standard: boolean;
    passPlus: boolean;
    shortNotice: boolean;
  };
  travelTime: number; // minutes
  maxLearners: number;
  workingHours: Record<string, {
    active: boolean;
    start: string; // "09:00"
    end: string;   // "17:00"
  }>;
  unavailableHours: Record<string, {
    active: boolean;
    ranges: { start: string; end: string }[]; // Array of unavailable slots
  }>;
}

export interface Instructor {
  id: string;
  name: string;
  role: string;
  car: string;
  bio: string;
  qualifications: string[];
  email?: string;
  phone?: string;
  areasCovered: string[];
  availability?: Record<string, string[]>;
  preferences?: InstructorPreferences;
  scheduleOverrides?: ScheduleOverride[];
  activeStudents: number; // Current number of active learners
}

export interface Review {
  id: string | number;
  name: string;
  location: string;
  text: string;
  stars: number;
}

export interface ScheduleOverride {
  id: string;
  instructorId: string;
  date: Date;
  type: 'available' | 'unavailable';
  ranges: { start: string; end: string }[];
}

export interface Appointment {
  id: string;
  instructorId: string;
  studentId?: string;
  studentName: string; // The name to display on the calendar
  pickupAddress?: string; // Address for pickup
  day: string;         // e.g. "Monday"
  time: string;        // e.g. "10:00" (24h)
  duration: number;    // hours
  date: Date;          // Full date object for uniqueness
}

// --- NEW PROGRESS TRACKING TYPES ---

export const SYLLABUS_TOPICS = [
  "Cockpit Drill & Controls",
  "Moving Off & Stopping",
  "Junctions (Turning)",
  "Crossroads",
  "Roundabouts",
  "Meeting Traffic",
  "Pedestrian Crossings",
  "Dual Carriageways",
  "Parallel Parking",
  "Bay Parking",
  "Emergency Stop",
  "Independent Driving"
];

export interface ProgressRecord {
  studentId: string;
  totalHours: number;
  // Key is the topic name, Value is 1-5 (1=Intro, 5=Independent)
  skills: Record<string, number>;
  notes: string[]; // Instructor notes history
  lastUpdated: string; // ISO Date string
}
