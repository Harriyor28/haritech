import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, MessageCircle, Mail, Phone, MapPin, Clock, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';
import { getHaritechContent, setHaritechContent, getSocialLinks, setSocialLinks, HaritechSiteContent, SocialLinks } from '../../utils/haritechContent';
import { syncSettingsFromContent } from '../../utils/settings';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";

const HaritechContactManager: React.FC = () => {
  const [content, setContent] = useState<HaritechSiteContent>(() => getHaritechContent());
  const [social, setSocial] = useState<SocialLinks>(() => getSocialLinks());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setContent(getHaritechContent());
    setSocial(getSocialLinks());
  }, []);

  const handleSave = () => {
    if (!setHaritechContent(content)) return;
    if (!setSocialLinks(social)) return;
    // Mirror contact fields into site settings so Footer/portfolio show the same details
    if (!syncSettingsFromContent()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Manage contact details, social links, and business hours displayed across all Haritech pages.</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm">
          <Save className="h-4 w-4" /> Save All
        </motion.button>
      </div>
      {saved && <div className="text-emerald-400 text-sm font-bold">Contact info saved!</div>}

      <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
        <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
        <div className="space-y-5 max-w-2xl">
          <div>
            <label className={labelClass}><MessageCircle className="h-3 w-3 inline mr-1 text-green-400" /> WhatsApp Number</label>
            <input type="text" value={content.whatsapp} onChange={e => setContent({ ...content, whatsapp: e.target.value })} className={inputClass} placeholder="234800000000" />
            <p className="text-[10px] text-slate-500 mt-1">Country code + number (digits only, no + sign).</p>
          </div>
          <div>
            <label className={labelClass}><Mail className="h-3 w-3 inline mr-1 text-cyan-400" /> Email Address</label>
            <input type="email" value={content.email} onChange={e => setContent({ ...content, email: e.target.value })} className={inputClass} placeholder="info@haritech.com" />
          </div>
          <div>
            <label className={labelClass}><Phone className="h-3 w-3 inline mr-1 text-green-400" /> Phone Number</label>
            <input type="text" value={content.phone} onChange={e => setContent({ ...content, phone: e.target.value })} className={inputClass} placeholder="+234 XXX XXX XXXX" />
          </div>
          <div>
            <label className={labelClass}><MapPin className="h-3 w-3 inline mr-1 text-red-400" /> Office Address</label>
            <textarea rows={3} value={content.address} onChange={e => setContent({ ...content, address: e.target.value })} className={`${inputClass} resize-none`} placeholder="Your Office Address Here, City, State, Nigeria" />
          </div>
        </div>
      </div>

      <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
        <h3 className="text-xl font-bold text-white mb-6">Social Links & Business Hours</h3>
        <div className="space-y-5 max-w-2xl">
          <div>
            <label className={labelClass}><Twitter className="h-3 w-3 inline mr-1 text-cyan-400" /> Twitter / X URL</label>
            <input type="url" value={social.twitter} onChange={e => setSocial({ ...social, twitter: e.target.value })} className={inputClass} placeholder="https://x.com/haritech" />
          </div>
          <div>
            <label className={labelClass}><Linkedin className="h-3 w-3 inline mr-1 text-blue-400" /> LinkedIn URL</label>
            <input type="url" value={social.linkedin} onChange={e => setSocial({ ...social, linkedin: e.target.value })} className={inputClass} placeholder="https://linkedin.com/company/haritech" />
          </div>
          <div>
            <label className={labelClass}><Facebook className="h-3 w-3 inline mr-1 text-blue-500" /> Facebook URL</label>
            <input type="url" value={social.facebook} onChange={e => setSocial({ ...social, facebook: e.target.value })} className={inputClass} placeholder="https://facebook.com/haritech" />
          </div>
          <div>
            <label className={labelClass}><Instagram className="h-3 w-3 inline mr-1 text-pink-400" /> Instagram URL</label>
            <input type="url" value={social.instagram} onChange={e => setSocial({ ...social, instagram: e.target.value })} className={inputClass} placeholder="https://instagram.com/haritech" />
            <p className="text-[10px] text-slate-500 mt-1">Leave any link as "#" to hide its icon on the Contact page.</p>
          </div>
          <div>
            <label className={labelClass}><Clock className="h-3 w-3 inline mr-1 text-amber-400" /> Business Hours</label>
            <textarea rows={4} value={social.businessHours} onChange={e => setSocial({ ...social, businessHours: e.target.value })} className={`${inputClass} resize-none`} placeholder={"Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 4:00 PM\nSunday: Closed"} />
            <p className="text-[10px] text-slate-500 mt-1">One line per period of operation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HaritechContactManager;
