import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Layers, Plus, Trash2, IndianRupee } from 'lucide-react';

export const CreatePlanModal: React.FC = () => {
  const { isCreatePlanModalOpen, setCreatePlanModalOpen, createPlan } = useGym();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [tag, setTag] = useState('');
  const [durationMonths, setDurationMonths] = useState(6);
  const [priceINR, setPriceINR] = useState(12000);
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>([
    'Full facility & locker room access',
    'Initial fitness assessment & goal setting',
    'Free hydration bar & towel access',
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');

  if (!isCreatePlanModalOpen) return null;

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setFeatures([...features, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createPlan({
      name,
      code: code || name.toUpperCase().slice(0, 6).replace(/\s+/g, '-'),
      tag: tag || undefined,
      durationMonths: Number(durationMonths) || 1,
      priceINR: Number(priceINR) || 1000,
      description: description || `${durationMonths}-month tier for fitness members.`,
      features,
    });

    setCreatePlanModalOpen(false);
  };

  return (
    <Modal
      isOpen={isCreatePlanModalOpen}
      onClose={() => setCreatePlanModalOpen(false)}
      title="Create New Membership Tier"
      subtitle="Define pricing structure, duration, and package benefits"
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => setCreatePlanModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<Layers className="w-4 h-4" />}
            onClick={handleSubmit}
          >
            Publish Membership Plan
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input
              label="Plan Name *"
              placeholder="e.g. 1-Year Hybrid Strength & Pilates"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!code) {
                  setCode(e.target.value.toUpperCase().slice(0, 7).replace(/\s+/g, '-'));
                }
              }}
              required
            />
          </div>
          <Input
            label="Plan Code / SKU"
            placeholder="e.g. HYBRID-1Y"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Input
            label="Badge / Highlight Tag (Optional)"
            placeholder="e.g. Best Value, Special Edition"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Duration"
            value={String(durationMonths)}
            onChange={(e) => setDurationMonths(Number(e.target.value))}
            options={[
              { value: '1', label: '1 Month (30 Days)' },
              { value: '3', label: '3 Months (Quarterly)' },
              { value: '6', label: '6 Months (Half-Yearly)' },
              { value: '12', label: '12 Months (Annual)' },
              { value: '24', label: '24 Months (2 Years)' },
            ]}
          />
          <Input
            label="Price (₹ INR) *"
            type="number"
            value={priceINR}
            onChange={(e) => setPriceINR(Number(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Plan Description
          </label>
          <textarea
            rows={2}
            placeholder="Brief value proposition for members..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-200 text-zinc-100 text-sm rounded-xl placeholder:text-zinc-500 p-3 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Included Amenities & Features
          </label>
          <div className="space-y-1.5 mb-2.5">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface-200 text-xs text-zinc-200"
              >
                <span>• {feat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add feature (e.g. 2 Guest Passes, Steam Bath)..."
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              className="flex-1 bg-surface-200 text-zinc-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
            />
            <Button type="button" size="sm" variant="secondary" onClick={handleAddFeature}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
