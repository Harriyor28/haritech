import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X } from 'lucide-react';
import { getTeamMembers, setTeamMembers, TeamMember } from '../../utils/haritechContent';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";

const HaritechTeamManager: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>(() => getTeamMembers());
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setMembers(getTeamMembers()); }, []);

  const handleSave = () => {
    setTeamMembers(members);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const saveMember = (m: TeamMember) => {
    if (editing) {
      setMembers(members.map(mm => mm.id === m.id ? m : mm));
    } else {
      setMembers([...members, { ...m, id: Date.now() }]);
    }
    setEditing(null);
    setShowForm(false);
  };

  const deleteMember = (id: number) => setMembers(members.filter(m => m.id !== id));

  const [formData, setFormData] = useState<TeamMember>({ id: 0, name: '', role: '', bio: '', image: '' });

  const openAdd = () => { setFormData({ id: 0, name: '', role: '', bio: '', image: '' }); setEditing(null); setShowForm(true); };
  const openEdit = (m: TeamMember) => { setFormData(m); setEditing(m); setShowForm(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Manage your team members displayed on the About page.</p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> Save</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd} className="flex items-center gap-2 px-4 py-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-sm font-bold hover:bg-cyan-500 hover:text-white transition-all"><Plus className="h-4 w-4" /> Add Member</motion.button>
        </div>
      </div>
      {saved && <div className="text-emerald-400 text-sm font-bold">Saved successfully!</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(m => (
          <div key={m.id} className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">{m.name.charAt(0)}</div>
            <h4 className="font-bold text-white text-sm">{m.name}</h4>
            <p className="text-xs text-cyan-400 mb-2">{m.role}</p>
            <p className="text-xs text-slate-500 mb-4 line-clamp-2">{m.bio}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => openEdit(m)} className="p-2 text-slate-500 hover:text-cyan-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Edit className="h-3.5 w-3.5" /></button>
              <button onClick={() => deleteMember(m.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{editing ? 'Edit' : 'Add'} Team Member</h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); saveMember(formData); }} className="space-y-4">
                <div>
                  <label className={labelClass}>Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Role / Title *</label>
                  <input type="text" required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bio</label>
                  <textarea rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className={labelClass}>Image URL</label>
                  <input type="url" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className={inputClass} placeholder="https://..." />
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> {editing ? 'Update' : 'Add'} Member</button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-sm text-slate-400">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HaritechTeamManager;
