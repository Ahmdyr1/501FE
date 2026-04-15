
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { CheckCircle, Star, Shield, Clock, PenLine, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export const Home: React.FC = () => {
  const { reviews, addReview } = useData();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    location: '',
    description: ''
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.description) return;

    addReview({
      id: Date.now(),
      name: reviewForm.name,
      location: reviewForm.location,
      text: reviewForm.description,
      stars: 5 // Defaulting to 5 stars for simplicity
    });

    // Reset and close
    setReviewForm({ name: '', location: '', description: '' });
    setShowReviewModal(false);
  };

  // Create a duplicated list for the infinite scroll effect
  // We double the data to create a "set", then render that "set" twice to allow for the -50% translation loop
  // If we have very few reviews, we repeat them more times to ensure they fill the screen width
  const minItemsForScreen = 6;
  let baseSet = [...reviews];

  // Safety check: If there are no reviews, use a default empty array to prevent infinite loop
  if (reviews.length > 0) {
    while (baseSet.length < minItemsForScreen) {
      baseSet = [...baseSet, ...reviews];
    }
  }

  // Finally duplicate the full set for the seamless loop
  const marqueeReviews = [...baseSet, ...baseSet];

  return (
    <div className="flex flex-col">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-infinite {
          animation: scroll 40s linear infinite;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-brand-900 overflow-hidden -mt-20 pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Driving Lesson"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-40">
          <div className="md:w-2/3 lg:w-3/5">
            <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-accent-600 text-white font-bold text-sm mb-8 shadow-lg shadow-emerald-900/20 hover:scale-105 transition-transform cursor-default">
              <Star className="w-4 h-4 fill-current" />
              <span>Highest 1st Time Pass Rate in Bristol</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.1] mb-8">
              Master the road with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">confidence</span>.
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-xl leading-relaxed font-light">
              Professional, patient, and friendly driving tuition tailored to you.
              From your first lesson to your driving test, we're with you every mile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button to="/contact" variant="primary" className="h-14 px-8 text-lg shadow-lg shadow-brand-500/25">
                Book Your First Lesson
              </Button>
              <Button to="/prices" variant="white" className="h-14 px-8 text-lg shadow-lg text-brand-900 hover:bg-slate-100">
                View Packages
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-4 text-sm text-slate-400">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700"></div>
                ))}
              </div>
              <p>Join <span className="text-white font-bold">500+</span> happy students this year</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative z-20 rounded-t-[3rem] -mt-16 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Why learn with 501 drivingschool?</h2>
            <p className="text-lg text-slate-600 leading-relaxed">We don't just teach you to pass a test; we coach you with the skills for a lifetime of safe driving.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-soft hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors duration-300">
                <Shield className="w-7 h-7 text-brand-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">DVSA Approved</h3>
              <p className="text-slate-600 leading-relaxed">Fully qualified ADI (Approved Driving Instructor) offering the highest standards of tuition and safety protocols.</p>
            </div>
            <div className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-soft hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-500 transition-colors duration-300">
                <CheckCircle className="w-7 h-7 text-accent-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">High Pass Rates</h3>
              <p className="text-slate-600 leading-relaxed">Our structured, personalized lesson plans are designed to get you test-ready faster and with fewer minors.</p>
            </div>
            <div className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-soft hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                <Clock className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Flexible Hours</h3>
              <p className="text-slate-600 leading-relaxed">We work around your busy schedule, offering early morning, evening and weekend lessons at no extra cost.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (Marquee) */}
      <section className="py-24 bg-slate-50 border-t border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Student Success Stories</h2>
              <p className="text-slate-600">Don't just take our word for it.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(true)}
              className="rounded-full"
            >
              <PenLine className="w-4 h-4 mr-2" /> Write a Review
            </Button>
          </div>
        </div>

        {/* Automated Marquee Container */}
        <div className="relative w-full">
          {/* Fade Gradients */}
          <div className="absolute top-0 left-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

          <div className="flex gap-6 animate-scroll-infinite w-max hover:[animation-play-state:paused]">
            {marqueeReviews.map((review, idx) => (
              <div
                key={`${review.id}-${idx}`}
                className="w-[320px] md:w-[400px] bg-white p-8 rounded-3xl border border-slate-100 relative hover:shadow-soft transition-shadow flex flex-col shadow-sm flex-shrink-0"
              >
                <div className="flex text-amber-400 mb-6">
                  {[...Array(review.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 italic mb-8 text-lg leading-relaxed flex-grow">"{review.text}"</p>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-100 mt-auto">
                  <div>
                    <p className="font-bold text-slate-900">{review.name}</p>
                    {review.location && (
                      <p className="text-xs text-brand-600 font-semibold uppercase tracking-wide">{review.location}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 font-display">Ready to start your journey?</h2>
          <p className="text-slate-300 mb-10 text-xl leading-relaxed">
            Slots fill up fast. Book your first lesson today to get started on your journey to independence.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button to="/contact" variant="white" className="h-14 px-10 text-lg shadow-xl hover:scale-105 transition-transform">Book Now</Button>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Leave a Review</h2>
                <p className="text-slate-500 text-xs">Share your experience with us</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Area / Location</label>
                <input
                  type="text"
                  value={reviewForm.location}
                  onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                  placeholder="e.g. Clifton"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  required
                  rows={4}
                  value={reviewForm.description}
                  onChange={(e) => setReviewForm({ ...reviewForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white resize-none"
                  placeholder="How was your experience?"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" fullWidth>Submit Review</Button>
                <Button type="button" variant="ghost" onClick={() => setShowReviewModal(false)} fullWidth>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
