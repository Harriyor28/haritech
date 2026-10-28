import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, Shield, Award, Users, Zap, CheckCircle, ArrowRight, Sparkles, Quote, Mail, MessageCircle } from 'lucide-react';
import { getHaritechContent, getTeamMembers, getWhatsAppUrl, HaritechSiteContent, TeamMember } from '../../utils/haritechContent';

/* Working principles rather than slogans: each one describes a habit a
   customer can actually notice, not a claim about scale or awards.      */
const coreValues = [
  { title: 'Say what is available', desc: 'If a service, product or item is not ready, we say so instead of accepting a job we cannot deliver.', icon: CheckCircle, color: 'from-cyan-500 to-blue-600' },
  { title: 'Quote before work', desc: 'Costs and assumptions are written down before anything starts, so a change is visible rather than a surprise.', icon: Award, color: 'from-purple-500 to-pink-600' },
  { title: 'Keep the limits clear', desc: 'Where a task needs a licensed professional or an approval we do not hold, we tell you rather than improvise.', icon: Shield, color: 'from-green-500 to-teal-600' },
  { title: 'Answer in plain terms', desc: 'Plain explanations of what a service involves, what it needs from you and how long each step usually takes.', icon: Heart, color: 'from-blue-500 to-indigo-600' },
  { title: 'Keep the records', desc: 'Enquiries, quotations and documents are kept so the same details are not asked for twice.', icon: Users, color: 'from-pink-500 to-rose-600' },
  { title: 'One point of contact', desc: 'You deal with a named person for the division handling your enquiry.', icon: Sparkles, color: 'from-amber-500 to-orange-600' },
];

const objectives = [
  'Make useful technology easier to access for individuals, businesses and organisations in Nigeria',
  'Help businesses grow with practical support for their operations, sourcing and digital presence',
  'Provide several genuinely useful services through one company, so a customer does not start over each time',
  'Explain importation costs and risks clearly enough that customers can budget realistically',
  'Help customers size solar and project requirements before they spend money',
  'Grow beyond individual services into a technology-driven company serving multiple industries, and eventually international markets',
];

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const About: React.FC = () => {
  const [content, setContent] = useState<HaritechSiteContent>(() => getHaritechContent());
  const [team, setTeam] = useState<TeamMember[]>(() => getTeamMembers());
  useEffect(() => {
    const contentHandler = () => setContent(getHaritechContent());
    const teamHandler = () => setTeam(getTeamMembers());
    window.addEventListener('haritech-content-updated', contentHandler);
    window.addEventListener('haritech-team-updated', teamHandler);
    return () => {
      window.removeEventListener('haritech-content-updated', contentHandler);
      window.removeEventListener('haritech-team-updated', teamHandler);
    };
  }, []);
  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      {/* Hero */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <div className="stone-frame-box inline-block px-5 py-2 rounded-sm mb-6">
                <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase flex items-center justify-center gap-2">
                  <Award className="h-4 w-4" /> Haritech Exclusive Business • Smart Tech, Smart Living.
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 font-syne tracking-tight">
                Technology Access, Business Growth, One Company
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6">
                Haritech Exclusive Business is a Nigerian multi-service company, operating in person and online. We bring technology products
                and computer services, online registration assistance, printing and branding, importation consultation, business consultation,
                solar energy, project management and property monitoring, and epoxy and interior décor together under one roof.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-haritech-cac'))}
                  className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold font-mono flex items-center gap-2 transition-colors"
                >
                  <Shield className="h-4 w-4 text-purple-400" />
                  <span>Business details</span>
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-haritech-estimator'))}
                  className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono flex items-center gap-2 transition-colors"
                >
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <span>Launch Cost Estimator</span>
                </button>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-slate-950/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeInView>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">Our <span className="gradient-text">Story</span></h2>
                <div className="space-y-4 text-slate-400 leading-relaxed">
                  {content.aboutStory.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
            </FadeInView>
            <FadeInView delay={0.2}>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-blue-500/20 border border-white/10 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Quote className="h-12 w-12 text-cyan-400/30 mx-auto mb-4" />
                    <p className="text-lg text-slate-300 italic max-w-sm">"Smart Tech, Smart Living."</p>
                    <div className="mt-6 text-sm text-slate-500 font-medium">— Haritech Exclusive Business</div>
                  </div>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FadeInView>
              <div className="card p-8 md:p-10 h-full glow-border">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 mb-6">
                  <Target className="h-full w-full text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-slate-400 leading-relaxed">{content.mission}</p>
              </div>
            </FadeInView>
            <FadeInView delay={0.1}>
              <div className="card p-8 md:p-10 h-full glow-border">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 mb-6">
                  <Eye className="h-full w-full text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                <p className="text-slate-400 leading-relaxed">{content.vision}</p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-slate-950/20">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Our <span className="gradient-text-pink">Core Values</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">The principles that guide everything we do.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((v, i) => (
              <FadeInView key={v.title} delay={i * 0.08}>
                <div className="card p-6 h-full hover:bg-[#141b35] transition-all glow-border group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${v.color} p-2.5 mb-4 group-hover:scale-110 transition-transform`}>
                    <v.icon className="h-full w-full text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-400">{v.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Who You Will <span className="gradient-text">Deal With</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">Team details are published only for real, consenting members of staff.</p>
            </div>
          </FadeInView>
          {team.length === 0 && (
            <div className="card p-8 max-w-2xl mx-auto text-center">
              <Users className="h-8 w-8 text-cyan-400/50 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-2">Team profiles not published yet</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Rather than invent employees or biographies, this section stays empty until verified team details are supplied. Enquiries are answered by the division handling them.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <FadeInView key={member.id} delay={i * 0.08}>
                <div className="card p-6 h-full text-center hover:bg-[#141b35] transition-all glow-border group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white">{member.name.charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-xs font-semibold text-cyan-400 mb-2">{member.role}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{member.bio}</p>
                  <div className="flex gap-2 justify-center mt-4">
                    <a href={`mailto:${content.email}`} className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"><Mail className="h-3.5 w-3.5" /></a>
                    <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-green-400 hover:border-green-500/30 transition-all"><MessageCircle className="h-3.5 w-3.5" /></a>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeInView>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-cyan-500/20 border border-white/10 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Target className="h-16 w-16 text-cyan-400/30 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white">Our Objectives</h3>
                    <p className="text-sm text-slate-500 mt-2">What we are working towards as a business</p>
                  </div>
                </div>
              </div>
            </FadeInView>
            <FadeInView delay={0.2}>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">What We <span className="gradient-text">Aim to Achieve</span></h2>
              <div className="space-y-4">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="text-slate-300">{obj}</span>
                  </div>
                ))}
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden bg-slate-950/30">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/10 to-purple-600/20" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight font-syne">Start With a Conversation</h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-8 max-w-2xl mx-auto">Tell us what you need and we will explain what the work involves, what it costs and whether it is something we can deliver.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/haritech/request-quote" className="btn-primary text-xs sm:text-sm px-6 py-3"><Zap className="h-4 w-4" /> Make an Enquiry</Link>
              <Link to="/haritech/services" className="btn-secondary text-xs sm:text-sm px-6 py-3">See the Divisions <ArrowRight className="h-4 w-4 text-cyan-400" /></Link>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default About;
