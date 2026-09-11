import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { NoteCategory } from '../../types';
import {
  FileText,
  Dumbbell,
  Building2,
  AlertCircle,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

const CATEGORIES: {
  id: NoteCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    id: 'general',
    label: 'General',
    icon: Building2,
    description: 'Operational notes, locker requests, general preferences',
  },
  {
    id: 'trainer',
    label: 'Trainer / Workout',
    icon: Dumbbell,
    description: 'Training progression, PRs, form checks, workout adjustments',
  },
  {
    id: 'medical',
    label: 'Medical / Injury',
    icon: AlertCircle,
    description: 'Physio clearances, active injuries, movement restrictions',
  },
  {
    id: 'front_desk',
    label: 'Front Desk',
    icon: FileText,
    description: 'Access issues, gate logs, lost items, reception communications',
  },
  {
    id: 'billing',
    label: 'Billing / Renewal',
    icon: CreditCard,
    description: 'Payment promises, discount agreements, invoice discussions',
  },
];

export const AddMemberNoteModal: React.FC = () => {
  const { addNoteModalData, closeAddNoteModal, addMemberNote, currentUser } = useGym();
  const { isOpen, member } = addNoteModalData;

  const [category, setCategory] = useState<NoteCategory>('trainer');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNote('');
      setCategory(
        currentUser.role === 'trainer'
          ? 'trainer'
          : currentUser.role === 'front_desk'
          ? 'front_desk'
          : 'general'
      );
    }
  }, [isOpen, currentUser.role]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addMemberNote(member.id, note.trim(), category);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAddNoteModal}
      title="Add Staff Note"
      subtitle={`Attach an auditable operational note to ${member.name}'s dossier`}
      maxWidth="lg"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>
              Author: <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.role.toUpperCase()})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={closeAddNoteModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!note.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving Note...' : 'Save Staff Note'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Member Preview Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2 border border-surface-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt={member.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                member.name.split(' ').map((n) => n[0]).join('')
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{member.name}</span>
                <span className="text-xs font-mono text-zinc-500">{member.memberCode}</span>
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {member.planName} • Trainer: <span className="text-zinc-300">{member.assignedTrainer || 'Unassigned'}</span>
              </div>
            </div>
          </div>
          <Badge variant={member.status}>
            {member.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Note Category Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Note Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500/40 text-brand-300 ring-1 ring-brand-500/30'
                      : 'bg-surface-2 border-surface-3 text-zinc-400 hover:text-zinc-200 hover:border-surface-4'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-400' : 'text-zinc-500'}`} />
                    <span className="text-xs font-medium text-white">{cat.label}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 leading-snug">{cat.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note Textarea */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Operational Note Content
          </label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Document relevant client interaction, workout milestone, physical restriction, or staff instructions..."
            className="w-full px-3.5 py-3 rounded-xl bg-surface-2 border border-surface-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 text-sm resize-none transition-colors"
            autoFocus
          />
          <div className="flex justify-between items-center mt-1.5 text-xs text-zinc-500">
            <span>Minimum 3 characters required. Visible to all gym staff & trainers.</span>
            <span>{note.length} characters</span>
          </div>
        </div>
      </form>
    </Modal>
  );
};
