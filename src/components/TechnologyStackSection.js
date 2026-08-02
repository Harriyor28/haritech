import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
const TechnologyStackSection = () => {
    return (_jsxs("section", { id: "tech-stack", className: "section-padding bg-[#070a13] relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none z-0" }), _jsx("div", { className: "absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0" }), _jsxs("div", { className: "container mx-auto relative z-10", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.8 }, className: "text-center mb-20", children: [_jsxs("h2", { className: "text-4xl md:text-5xl font-black mb-6 tracking-tight", children: ["Premium ", _jsx("span", { className: "gradient-text", children: "Engine" }), " Stack"] }), _jsx("p", { className: "text-lg text-slate-400 max-w-3xl mx-auto", children: "We assemble responsive, battle-tested components and database structures to ensure lightning-fast indexation speeds and scalability." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: technologies.map((tech, index) => {
                            const IconComponent = tech.icon;
                            return (_jsx(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay: index * 0.08 }, className: "h-full", children: _jsx(Tilt3D, { maxTilt: 6, className: "h-full", children: _jsxs("div", { className: "card h-full bg-[#0e1326]/80 hover:bg-[#141b35]/90 border-white/5 hover:border-cyan-500/20 overflow-hidden p-8 flex flex-col glow-border", children: [_jsxs("h3", { className: "text-xl font-bold mb-6 flex items-center text-white", children: [_jsx("span", { className: `w-11 h-11 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center mr-4 shadow-md text-white`, children: _jsx(IconComponent, { className: "h-5 w-5" }) }), tech.category] }), _jsx("div", { className: "flex flex-wrap gap-2.5 flex-grow", children: tech.items.map((item, itemIndex) => (_jsx(motion.span, { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true }, transition: { duration: 0.4, delay: index * 0.05 + itemIndex * 0.02 }, whileHover: { scale: 1.05, borderColor: 'rgba(6, 182, 212, 0.4)', color: '#22d3ee' }, className: "px-3 py-1.5 rounded-lg bg-slate-950/40 border border-white/5 text-slate-400 text-xs font-semibold hover:bg-slate-900 transition-all cursor-default", children: item }, item))) })] }) }) }, tech.category));
                        }) })] })] }));
};
export default TechnologyStackSection;
