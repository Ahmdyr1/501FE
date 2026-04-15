

import { PricingTier, TransmissionType, PackageType, Instructor } from './types';
import { Car, MapPin, GraduationCap, Clock, ShieldCheck, Banknote } from 'lucide-react';

export const COMPANY_NAME = "501 drivingschool";
export const CONTACT_PHONE = "07700 900461";
export const CONTACT_EMAIL = "hello@501drivingschool.co.uk";

export const AREAS_COVERED = [
  "Bristol City Centre", "Clifton", "Redland", "Southville",
  "Bedminster", "Horfield", "Filton", "Stoke Gifford", "Bradley Stoke"
];

export const PRICING_PACKAGES: PricingTier[] = [
  {
    id: 'man-single',
    name: PackageType.SINGLE,
    price: 70,
    hours: 2,
    transmission: TransmissionType.MANUAL,
    features: ['2 Hour Lesson', 'Pay as you go', 'Flexible timing', 'Door-to-door service'],
  },
  {
    id: 'man-10',
    name: PackageType.BLOCK_10,
    price: 330,
    hours: 10,
    transmission: TransmissionType.MANUAL,
    features: ['Save £20', '5 x 2 Hour Lessons', 'Structured learning plan', 'Progress tracker app'],
    popular: true,
  },
  {
    id: 'auto-single',
    name: PackageType.SINGLE,
    price: 76,
    hours: 2,
    transmission: TransmissionType.AUTOMATIC,
    features: ['2 Hour Lesson', 'Pay as you go', 'Modern hybrid vehicle', 'Stress-free learning'],
  },
  {
    id: 'auto-10',
    name: PackageType.BLOCK_10,
    price: 360,
    hours: 10,
    transmission: TransmissionType.AUTOMATIC,
    features: ['Save £20', '5 x 2 Hour Lessons', 'Hill start assist mastery', 'Theory support'],
    popular: true,
  },
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: 'mike',
    name: "Mike Thompson",
    role: "Senior Manual Instructor",
    car: "Ford Fiesta ST-Line (Manual)",
    bio: "With over 15 years of experience, Mike specializes in nervous pupils and has one of the highest pass rates in Bristol. He believes in building confidence through calm, structured lessons.",
    qualifications: ["Grade A DVSA Instructor", "Pass Plus Registered", "Nervous Pupil Specialist"],
    areasCovered: ["BS1", "BS8", "Clifton", "Redland", "City Centre"],
    availability: {
      'Monday': ['09:00', '11:00', '13:30'],
      'Wednesday': ['09:00', '13:00', '15:30'],
      'Friday': ['10:00', '12:00']
    },
    activeStudents: 12
  },
  {
    id: 'sarah',
    name: "Sarah Chen",
    role: "Automatic Specialist",
    car: "Toyota Yaris Hybrid (Auto)",
    bio: "Patient, friendly, and meticulous. Sarah makes learning to drive in an automatic effortless. She is particularly great at helping students who have struggled with manual gears in the past.",
    qualifications: ["DVSA Approved", "Eco-Driving Expert", "Refresher Course Pro"],
    areasCovered: ["BS3", "BS4", "Bedminster", "Southville", "Knowle"],
    availability: {
      'Tuesday': ['08:00', '10:00', '15:00'],
      'Thursday': ['12:00', '14:00', '16:00']
    },
    activeStudents: 8
  },
  {
    id: 'david',
    name: "David Wilson",
    role: "Advanced Driving Instructor",
    car: "Volkswagen Golf (Manual)",
    bio: "Focusing on defensive driving techniques, David prepares students not just for the test, but for a lifetime of safe driving. He loves teaching on country roads and dual carriageways.",
    qualifications: ["Grade A DVSA Instructor", "Advanced Motorist", "Fleet Trainer"],
    areasCovered: ["BS5", "BS6", "Easton", "St George", "Hanham"],
    availability: {
      'Saturday': ['09:00', '11:00'],
      'Sunday': ['10:00', '12:00']
    },
    activeStudents: 5
  },
  // Added so the 'ins@gmail.com' login (which has id: instructor-test) has a visible profile
  {
    id: 'instructor-test',
    name: "Test Instructor",
    role: "Manual Instructor",
    car: "Volkswagen Polo",
    bio: "This is a demonstration account. Use the Driver Dashboard to update my availability and see it reflect here instantly.",
    qualifications: ["Fully Qualified"],
    areasCovered: ["BS1", "BS2", "City"],
    email: 'ins@gmail.com',
    availability: {},
    activeStudents: 0
  },
  // Added for Admin to also act as a Driver
  {
    id: 'admin-test',
    name: "Admin User",
    role: "Head Instructor",
    car: "BMW 1 Series",
    bio: "Head instructor and administrator.",
    qualifications: ["Grade A DVSA Instructor", "Admin"],
    areasCovered: ["All Areas"],
    email: 'ad@gmail.com',
    availability: {},
    activeStudents: 0
  }
];

export const REVIEWS = [
  {
    id: 1,
    name: "Sarah Jenkins",
    location: "Clifton",
    text: "Passed first time with 2 minors! My instructor was incredibly patient and made me feel safe from day one. Highly recommend the 10-hour block.",
    stars: 5,
  },
  {
    id: 2,
    name: "James Miller",
    location: "Filton",
    text: "Switched to automatic after struggling with manual gears. Best decision ever. The car was a dream to drive and the instruction was top notch.",
    stars: 5,
  },
  {
    id: 3,
    name: "Priya Patel",
    location: "Bedminster",
    text: "Great value for money. The instructors are incredibly knowledgeable and helped me understand a few tricky road signs I was stuck on!",
    stars: 5,
  }
];

export const FAQS = [
  {
    q: "How many lessons will I need?",
    a: " The DVSA recommends around 45 hours of professional tuition plus 22 hours of private practice. However, everyone learns at a different pace."
  },
  {
    q: "Do you offer intensive courses?",
    a: "Yes, we can arrange semi-intensive courses depending on instructor availability. Please use the contact form to discuss your requirements."
  },
  {
    q: "What car will I learn in?",
    a: "Manual learners use a Ford Fiesta. Automatic learners use a Toyota Yaris Hybrid. All cars are dual-controlled and fully insured."
  }
];

export const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Instructors", path: "/instructors" },
  { label: "Lessons & Prices", path: "/prices" },
  { label: "Contact & Book", path: "/contact" },
];