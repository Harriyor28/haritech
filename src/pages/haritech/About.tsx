import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, Shield, Award, Users, Zap, CheckCircle, ArrowRight, Sparkles, Quote, Mail, MessageCircle } from 'lucide-react';
import { getHaritechContent, getTeamMembers, getWhatsAppUrl, HaritechSiteContent, TeamMember } from '../../utils/haritechContent';

const coreValues = [
  { title: 'Innovation', desc: 'We stay ahead with cutting-edge technologies and creative solutions.', icon: Sparkles, color: 'from-cyan-500 to-blue-600' },
  { title: 'Excellence', desc: 'We deliver nothing short of exceptional quality in every project.', icon: Award, color: 'from-purple-500 to-pink-600' },
  { title: 'Integrity', desc: 'Honesty and transparency form the foundation of every relationship.', icon: Shield, color: 'from-green-500 to-teal-600' },
  { title: 'Reliability', desc: 'We deliver on our promises, every time, on time.', icon: CheckCircle, color: 'from-blue-500 to-indigo-600' },
  { title: 'Customer Satisfaction', desc: 'Your success is our ultimate measure of achievement.', icon: Heart, color: 'from-pink-500 to-rose-600' },
  { title: 'Professionalism', desc: 'We maintain the highest standards of conduct and expertise.', icon: Users, color: 'from-amber-500 to-orange-600' },
];

const objectives = [
  'Empower businesses with affordable, high-quality digital solutions',
  'Bridge the technology gap for SMEs in emerging markets',
  'Create lasting partnerships built on trust and delivered value',
  'Drive digital transformation across all industries we serve',
  'Foster innovation through continuous learning and adaptation',
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
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
                <Award className="h-4 w-4" /> About Us
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-poppins">
                Empowering Businesses Through <span className="gradient-text">Digital Excellence</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Haritech Exclusive Services is a premier digital solutions company dedicated to helping businesses establish, grow, and manage their digital presence with professional technology solutions.
              </p>
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
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Our <span className="gradient-text">Story</span></h2>
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
                    <p className="text-lg text-slate-300 italic max-w-sm">"We don't just build websites — we build digital ecosystems that drive real business growth."</p>
                    <div className="mt-6 text-sm text-slate-500 font-medium">— Haritech Team</div>
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
              <h2 className="text-3xl md:text-5xl font-black mb-4">Our <span className="gradient-text-pink">Core Values</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">The principles that guide everything we do.</p>
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
              <h2 className="text-3xl md:text-5xl font-black mb-4">Meet Our <span className="gradient-text">Team</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">The passionate experts behind Haritech Exclusive Services.</p>
            </div>
          </FadeInView>
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
                    <p className="text-sm text-slate-500 mt-2">Strategic goals that drive our mission forward</p>
                  </div>
                </div>
              </div>
            </FadeInView>
            <FadeInView delay={0.2}>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-8">What We <span className="gradient-text">Aim to Achieve</span></h2>
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
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Let's Work Together</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Ready to take your business to the next level? Partner with Haritech and experience the difference.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/haritech/request-quote" className="btn-primary text-base px-10 py-4"><Zap className="h-5 w-5" /> Get Started</Link>
              <Link to="/haritech/services" className="btn-secondary text-base px-10 py-4">Explore Services <ArrowRight className="h-4 w-4 text-cyan-400" /></Link>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default About;
