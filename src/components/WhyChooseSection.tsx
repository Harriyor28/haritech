import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Code, Users, CheckCircle, ArrowRight, Calendar, MessageCircle, Clock } from 'lucide-react';
import Tilt3D from './Tilt3D';

const WhyChooseSection: React.FC = () => {
  const reasons = [
    {
      id: 1,
      icon: Globe,
      title: "Professional Architecture",
      description: "We craft custom, state-of-the-art designs that immediately build high user trust and domain authority.",
      color: "from-cyan-500/20 to-blue-500/10 text-cyan-400"
    },
    {
      id: 2,
      icon: Code,
      title: "Fast-Track Delivery",
      description: "We optimize our codebase and layout models for rapid deployment cycles without structural quality cuts.",
      color: "from-indigo-500/20 to-purple-500/10 text-purple-400"
    },
    {
      id: 3,
      icon: Users,
      title: "SEO Engineered",
      description: "Every module includes semantic HTML, schema tags, and high-performance metrics for organic indexing.",
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400"
    },
    {
      id: 4,
      icon: CheckCircle,
      title: "Device Independent",
      description: "Our components utilize fluid media query grids, resizing instantly on mobile, tablet, and desktop views.",
      color: "from-blue-500/20 to-indigo-500/10 text-blue-400"
    },
    {
      id: 5,
      icon: ArrowRight,
      title: "Hardened Security",
      description: "Built with secure token setups, content safety policy configurations, and encrypted transaction models.",
      color: "from-pink-500/20 to-rose-500/10 text-pink-400"
    },
    {
      id: 6,
      icon: Calendar,
      title: "Future-Proof Models",
      description: "We deploy TypeScript and reactive code modules, ensuring easy maintenance and scaling support.",
      color: "from-orange-500/20 to-yellow-500/10 text-orange-400"
    },
    {
      id: 7,
      icon: MessageCircle,
      title: "Budget Optimizations",
      description: "We provide professional enterprise configurations at scale with pricing adapted to your specific ROI targets.",
      color: "from-indigo-500/20 to-cyan-500/10 text-cyan-400"
    },
    {
      id: 8,
      icon: Clock,
      title: "Long-Term Retention",
      description: "Our contracts feature ongoing database backups, speed auditing, and support cycles to preserve site speed.",
      color: "from-purple-500/20 to-pink-500/10 text-purple-400"
    }
  ];

  return (
    <section id="why-choose" className="section-padding bg-[#070a13] relative overflow-hidden">
      {/* Background glow dots */}
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
            Why Partner with <span className="gradient-text">HARITECH</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            We don't just write scripts—we construct high-performance digital environments that multiply user conversions.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => {
            const IconComponent = reason.icon;
            return (
              <motion.div
                key={reason.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="h-full"
              >
                <Tilt3D maxTilt={10} className="h-full">
                  <div className="card h-full bg-[#0e1326]/80 hover:bg-[#141b35]/90 border-white/5 hover:border-cyan-500/25 p-8 flex flex-col justify-between glow-border transition-all duration-300">
                    <div>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className={`rounded-2xl p-4 w-14 h-14 flex items-center justify-center mb-6 bg-gradient-to-br ${reason.color} border border-white/5`}
                      >
                        <IconComponent className="h-6 w-6" />
                      </motion.div>
                      <h3 className="text-lg font-bold mb-3 text-white">{reason.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{reason.description}</p>
                    </div>
                  </div>
                </Tilt3D>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;