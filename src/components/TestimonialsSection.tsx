import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, Quote, Sparkles } from 'lucide-react';
import Tilt3D from './Tilt3D';
import { getStoredTestimonials } from '../utils/testimonials';
import type { Testimonial } from '../utils/testimonials';

const TestimonialCard: React.FC<{ testimonial: Testimonial, index: number }> = ({ testimonial, index }) => {
  return (
    <Tilt3D maxTilt={8} className="h-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="card p-8 bg-[#0e1326]/80 hover:bg-[#141b35]/90 border-white/5 hover:border-cyan-500/25 transition-all duration-300 h-full flex flex-col justify-between glow-border relative"
      >
        <div>
          <Quote className="h-10 w-10 text-cyan-500/10 mb-4" />
          <div className="flex mb-4 gap-0.5">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-4.5 w-4.5 text-yellow-500 fill-current" />
            ))}
          </div>
          <p className="text-slate-300 leading-relaxed text-sm italic mb-6">
            "{testimonial.content}"
          </p>
        </div>
        
        <div className="flex items-center pt-4 border-t border-white/5">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover mr-4 border border-cyan-500/30 shadow-md"
          />
          <div>
            <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
            <p className="text-xs text-slate-400">{testimonial.position}</p>
            <p className="text-xs text-cyan-400 font-semibold">{testimonial.company}</p>
          </div>
        </div>
      </motion.div>
    </Tilt3D>
  );
};

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getStoredTestimonials());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const handler = () => setTestimonials(getStoredTestimonials());
    window.addEventListener('haritech-testimonials-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('haritech-testimonials-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  // Clamp the carousel when the list shrinks (e.g. admin deletes a testimonial)
  useEffect(() => {
    setCurrentIndex((prev) =>
      testimonials.length === 0 ? 0 : Math.min(prev, testimonials.length - 1)
    );
  }, [testimonials.length]);

  const nextTestimonial = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  React.useEffect(() => {
    if (!isAutoPlaying || testimonials.length < 2) return;
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const activeTestimonial = testimonials[currentIndex];

  if (testimonials.length === 0) {
    return (
      <section id="testimonials" className="section-padding bg-[#070a13]">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">Client <span className="gradient-text-pink">Feedback</span></h2>
          <p className="text-slate-400 text-sm">No testimonials yet — check back soon.</p>
        </div>
      </section>
    );
  }
  
  return (
    <section id="testimonials" className="section-padding bg-[#070a13] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Client <span className="gradient-text-pink">Feedback</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Read comments from global businesses that scaled their authority through our web architectural rebranding.
          </p>
        </motion.div>
        
        {/* Desktop View - Grid Layout */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
        
        {/* Carousel View for all sizes/mobile */}
        <div className="lg:hidden relative max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              {activeTestimonial && <TestimonialCard testimonial={activeTestimonial} index={0} />}
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                prevTestimonial();
              }}
              className="p-3 bg-slate-900 border border-white/5 rounded-full shadow-lg hover:shadow-xl hover:border-white/20 transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-cyan-400" />
            </button>
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                nextTestimonial();
              }}
              className="p-3 bg-slate-900 border border-white/5 rounded-full shadow-lg hover:shadow-xl hover:border-white/20 transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-cyan-400" />
            </button>
          </div>
          
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={index === currentIndex}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-cyan-400 w-6' : 'bg-slate-700'}`}
              />
            ))}
          </div>
        </div>
        
        <div className="text-center mt-16">
          <p className="text-slate-400 mb-6 text-sm">Ready to build your company's web experience?</p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/portfolio/contact" className="btn-primary inline-flex px-10 py-4">
              <Sparkles className="h-4.5 w-4.5 text-cyan-300" />
              Start Your Project
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;