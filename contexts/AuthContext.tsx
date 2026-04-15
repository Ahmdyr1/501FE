
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for persisted session in localStorage
    const storedUser = localStorage.getItem('drivesafe_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    // SIMULATION: Fake network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const normalizedEmail = email.toLowerCase().trim();
    let foundUser: User | null = null;

    // --- HARDCODED TEST CREDENTIALS (Priority) ---
    if (password === '123') {
      if (normalizedEmail === 'ad@gmail.com') {
        foundUser = {
          id: 'admin-test',
          email: 'ad@gmail.com',
          firstName: 'Admin',
          lastName: 'User',
          role: UserRole.ADMIN
        };
      } else if (normalizedEmail === 'ins@gmail.com') {
        foundUser = {
          id: 'instructor-test',
          email: 'ins@gmail.com',
          firstName: 'Test',
          lastName: 'Instructor',
          role: UserRole.DRIVER
        };
      } else if (normalizedEmail === 'stu@gmail.com') {
        foundUser = {
          id: 'student-test',
          email: 'stu@gmail.com',
          firstName: 'Test',
          lastName: 'Student',
          role: UserRole.STUDENT
        };
      }
    }

    // --- EXISTING DATABASE LOGIC (Fallback) ---
    if (!foundUser) {
      // 1. Check for Old Hardcoded Admin
      if (normalizedEmail === 'admin@501drivingschool.co.uk') {
        foundUser = {
          id: 'admin-1',
          email: normalizedEmail,
          firstName: 'Admin',
          lastName: 'User',
          role: UserRole.ADMIN
        };
      }
      // 2. Check Instructors "DB" (localStorage)
      else {
        const instructorsStr = localStorage.getItem('drivesafe_instructors');
        if (instructorsStr) {
          const instructors = JSON.parse(instructorsStr);
          // Find instructor where email matches (or defaults if email wasn't set in old data)
          const instructor = instructors.find((i: any) =>
            (i.email && i.email.toLowerCase() === normalizedEmail)
          );

          if (instructor) {
            foundUser = {
              id: instructor.id,
              email: instructor.email,
              firstName: instructor.name.split(' ')[0],
              lastName: instructor.name.split(' ').slice(1).join(' '),
              role: UserRole.DRIVER
            };
          }
        }
      }

      // 3. Check Students "DB" (localStorage)
      if (!foundUser) {
        const studentsStr = localStorage.getItem('drivesafe_students');
        if (studentsStr) {
          const students = JSON.parse(studentsStr);
          const student = students.find((s: User) => s.email.toLowerCase() === normalizedEmail);
          if (student) {
            foundUser = student;
          }
        }
      }
    }

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('drivesafe_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return foundUser;
    } else {
      setIsLoading(false);
      setError('Invalid credentials. Please check your email and password.');
      return null;
    }
  };

  const signup = async (email: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 800));

    const normalizedEmail = email.toLowerCase().trim();

    const newUser: User = {
      id: Date.now().toString(),
      email: normalizedEmail,
      firstName,
      lastName,
      role: UserRole.STUDENT
    };

    // 1. Set Session
    setUser(newUser);
    localStorage.setItem('drivesafe_user', JSON.stringify(newUser));

    // 2. Save to "Student DB" so they can login later
    const existingStudentsStr = localStorage.getItem('drivesafe_students');
    const existingStudents = existingStudentsStr ? JSON.parse(existingStudentsStr) : [];

    // Check if email already exists
    if (!existingStudents.some((s: User) => s.email === normalizedEmail)) {
      existingStudents.push(newUser);
      localStorage.setItem('drivesafe_students', JSON.stringify(existingStudents));
    }

    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('drivesafe_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
