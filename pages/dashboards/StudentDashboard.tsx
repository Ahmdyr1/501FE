
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Calendar, CheckCircle, Clock, TrendingUp, BookOpen } from 'lucide-react';
import { SYLLABUS_TOPICS } from '../../types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { progressRecords } = useData();

  // Find progress for current user
  const myProgress = progressRecords.find(r => r.studentId === user?.id) || {
    totalHours: 0,
    skills: {} as Record<string, number>,
    notes: []
  };

  const totalSkills = SYLLABUS_TOPICS.length;
  const skillsStarted = Object.values(myProgress.skills).filter((v) => (v as number) > 0).length;
  const skillsMastered = Object.values(myProgress.skills).filter((v) => (v as number) === 5).length;
  const readinessPercentage = Math.round((skillsMastered / totalSkills) * 100);

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Hello, {user?.firstName}!</h1>
          <p className="text-slate-600">Here is your driving progress.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-xl text-brand-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Hours Logged</p>
                <p className="text-2xl font-bold text-slate-900">{myProgress.totalHours} <span className="text-sm text-slate-400 font-normal">/ 45 rec.</span></p>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((myProgress.totalHours / 45) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Test Readiness</p>
                <p className="text-2xl font-bold text-slate-900">{readinessPercentage}%</p>
                <p className="text-xs text-slate-400">{skillsMastered} of {totalSkills} skills mastered</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Skill Tree */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-600" /> Syllabus Progress
                </h2>
                <div className="hidden sm:flex gap-3 text-xs">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> 5: Independent</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> 3: Prompted</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> 1: Intro</span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {SYLLABUS_TOPICS.map((topic) => {
                  // Force convert to number to be safe
                  const level = Number(myProgress.skills[topic] || 0);

                  // Precise Color Logic
                  let barColor = 'bg-slate-200'; // Default empty
                  let percentage = (level / 5) * 100;

                  if (level === 5) barColor = 'bg-emerald-500';
                  else if (level >= 3) barColor = 'bg-amber-400';
                  else if (level >= 1) barColor = 'bg-blue-500'; // Use slightly darker blue for better visibility than blue-400

                  return (
                    <div key={topic}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold text-slate-700">{topic}</span>
                        <span className="text-xs font-bold text-slate-500">Level {level}/5</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Recent Notes */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-full">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Instructor Notes</h2>
              </div>
              <div className="p-6">
                {myProgress.notes && myProgress.notes.length > 0 ? (
                  <div className="space-y-4">
                    {myProgress.notes.map((note, i) => (
                      <div key={i} className="p-4 bg-brand-50 rounded-xl text-sm text-slate-700 border border-brand-100 relative">
                        <div className="absolute -left-2 top-4 w-4 h-4 bg-white border-2 border-brand-500 rounded-full"></div>
                        "{note}"
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-12">
                    <CheckCircle className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                    <p>No notes added yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
