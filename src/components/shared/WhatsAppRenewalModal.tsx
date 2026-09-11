import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { MessageSquare, Send, Sparkles, Check, Phone, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const WhatsAppRenewalModal: React.FC = () => {
  const { whatsAppModalData, closeWhatsAppModal, sendWhatsAppRenewal } = useGym();
  const { isOpen, member, defaultMessage } = whatsAppModalData;

  const [message, setMessage] = useState('');
  const [templateType, setTemplateType] = useState<'standard' | 'discount' | 'urgent'>('standard');

  useEffect(() => {
    if (member) {
      if (templateType === 'standard') {
        setMessage(
          `Hi ${member.name.split(' ')[0]}, this is Coach Vikram from Pulse Fitness & Performance. We noticed your ${member.planName} expires in ${member.daysRemaining > 0 ? member.daysRemaining + ' days' : 'recently'}. Renew today to ensure uninterrupted floor access and keep your progress on track! 🏋️‍♂️\n\nClick here to renew online: https://pulsefit.in/renew/${member.memberCode}`
        );
      } else if (templateType === 'discount') {
        setMessage(
          `Hey ${member.name.split(' ')[0]}! 💪 Special renewal offer from Pulse Fitness: Renew your ${member.planName} within the next 48 hours and get ₹1,500 off plus 2 complimentary 1-on-1 PT sessions!\n\nPay securely via UPI: https://pulsefit.in/offer/${member.memberCode}`
        );
      } else if (templateType === 'urgent') {
        setMessage(
          `Urgent Reminder: Hi ${member.name.split(' ')[0]}, your ${member.planName} at Pulse Fitness expires ${member.daysRemaining === 0 ? 'today' : 'in ' + member.daysRemaining + ' days'}. Your locker (${member.lockerNumber || 'Locker'}) and member benefits will be placed on hold if not renewed. Let us know if you need assistance!`
        );
      }
    }
  }, [member, templateType]);

  if (!member) return null;

  const handleSend = () => {
    sendWhatsAppRenewal(member.id, message);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeWhatsAppModal}
      title="Prepare WhatsApp Renewal Outreach"
      subtitle="Log member retention communication with pre-filled payment links"
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={closeWhatsAppModal}>
            Cancel
          </Button>
          <Button
            variant="emerald"
            leftIcon={<Send className="w-4 h-4" />}
            onClick={handleSend}
          >
            Log & Dispatch Outreach
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Member Preview Card */}
        <div className="p-4 rounded-xl bg-surface-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-100 overflow-hidden flex items-center justify-center font-semibold text-zinc-300">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                member.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">{member.name}</h4>
                <Badge variant={member.status} size="xs">
                  {member.status}
                </Badge>
              </div>
              <div className="text-xs text-zinc-400 flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" /> {member.phone}
                </span>
                <span>•</span>
                <span>{member.planName}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-400 block">Days Left</span>
            <span className={`text-sm font-bold tabular-nums ${member.daysRemaining <= 3 ? 'text-rose-400' : 'text-amber-400'}`}>
              {member.daysRemaining > 0 ? `${member.daysRemaining} days` : 'Expired'}
            </span>
          </div>
        </div>

        {/* Template Quick Selectors */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-2">
            Select Message Strategy
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTemplateType('standard')}
              className={`p-3 rounded-xl text-left transition-colors ${
                templateType === 'standard'
                  ? 'bg-brand-500/15 text-brand-300 font-semibold'
                  : 'bg-surface-200 text-zinc-400 hover:text-zinc-200 hover:bg-surface-100'
              }`}
            >
              <div className="text-xs font-semibold">Friendly Reminder</div>
              <div className="text-[10px] opacity-80 mt-0.5">Standard 7-day notice</div>
            </button>
            <button
              type="button"
              onClick={() => setTemplateType('discount')}
              className={`p-3 rounded-xl text-left transition-colors ${
                templateType === 'discount'
                  ? 'bg-brand-500/15 text-brand-300 font-semibold'
                  : 'bg-surface-200 text-zinc-400 hover:text-zinc-200 hover:bg-surface-100'
              }`}
            >
              <div className="text-xs font-semibold">Early Bird Incentive</div>
              <div className="text-[10px] opacity-80 mt-0.5">₹1,500 renewal perk</div>
            </button>
            <button
              type="button"
              onClick={() => setTemplateType('urgent')}
              className={`p-3 rounded-xl text-left transition-colors ${
                templateType === 'urgent'
                  ? 'bg-rose-500/15 text-rose-300 font-semibold'
                  : 'bg-surface-200 text-zinc-400 hover:text-zinc-200 hover:bg-surface-100'
              }`}
            >
              <div className="text-xs font-semibold">Locker Expiry Notice</div>
              <div className="text-[10px] opacity-80 mt-0.5">Urgent final call</div>
            </button>
          </div>
        </div>

        {/* WhatsApp Preview Bubble */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
            <span>WhatsApp Message Preview & Edit</span>
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> WhatsApp Cloud Business API
            </span>
          </label>
          <div className="relative">
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#0d1614] text-emerald-100 text-xs font-mono rounded-xl p-3.5 leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Recipient phone: <span className="font-mono text-zinc-300">{member.phone}</span>. Personalized links include member code authentication.
          </p>
        </div>
      </div>
    </Modal>
  );
};
