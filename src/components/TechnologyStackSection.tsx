import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Database, Globe, Cloud, Cpu, Terminal } from 'lucide-react';
import Tilt3D from './Tilt3D';

const technologies = [
  { 
    category: 'Frontend', 
    items: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular', 'Tailwind CSS', 'Framer Motion'],
    icon: Globe,
    color: 'from-cyan-500 to-blue-600'
  },
  { 
    category: 'Backend', 
    items: ['Node.js', 'Express', 'Python', 'Django', 'PHP', 'Laravel', 'Go', 'Java', 'Spring Boot', '.NET'],
    icon: Terminal,
    color: 'from-indigo-500 to-purple-600'
  },
  { 
    category: 'Databases', 
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase', 'Prisma', 'TypeORM', 'GraphQL'],
    icon: Database,
    color: 'from-emerald-500 to-teal-600'
  },
  { 
    category: 'DevOps & Cloud', 
    items: ['AWS', 'Google Cloud', 'Vercel', 'Netlify', 'Docker', 'Kubernetes', 'GitHub Actions', 'CI/CD', 'Nginx'],
    icon: Cloud,
    color: 'from-blue-600 to-violet-600'
  },
  { 
    category: 'CMS & Platforms', 
    items: ['WordPress', 'Shopify', 'Webflow', 'Ghost', 'Strapi', 'Sanity', 'Contentful', 'Netlify CMS'],
    icon: Layers,
    color: 'from-orange-500 to-pink-600'
  },
  { 
    category: 'Tools & Diagnostics', 
    items: ['Git', 'GitHub', 'Figma', 'Postman', 'ESLint', 'Prettier', 'Jest', 'Cypress', 'Vite', 'VS Code'],
    icon: Cpu,
    color: 'from-pink-500 to-rose-600'
  }
];

const TechnologyStackSection: React.FC = () => {
  return (
    <section id="tech-stack" className="section-padding bg-[#070a13] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Premium <span className="gradient-text">Engine</span> Stack
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            We assemble responsive, battle-tested components and database structures to ensure lightning-fast indexation speeds and scalability.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {technologies.map((tech, index) => {
            const IconComponent = tech.icon;
            return (
              <motion.div
                key={tech.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="h-full"
              >
                <Tilt3D maxTilt={6} className="h-full">
                  <div className="card h-full bg-[#0e1326]/80 hover:bg-[#141b35]/90 border-white/5 hover:border-cyan-500/20 overflow-hidden p-8 flex flex-col glow-border">
                    <h3 className="text-xl font-bold mb-6 flex items-center text-white">
                      <span className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center mr-4 shadow-md text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </span>
                      {tech.category}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2.5 flex-grow">
                      {tech.items.map((item, itemIndex) => (
                        <motion.span
                          key={item}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.05 + itemIndex * 0.02 }}
                          whileHover={{ scale: 1.05, borderColor: 'rgba(6, 182, 212, 0.4)', color: '#22d3ee' }}
                          className="px-3 py-1.5 rounded-lg bg-slate-950/40 border border-white/5 text-slate-400 text-xs font-semibold hover:bg-slate-900 transition-all cursor-default"
                        >
                          {item}
                        </motion.span>
                      ))}
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

export default TechnologyStackSection;