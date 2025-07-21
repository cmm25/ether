'use client';

import { useState } from 'react';
import { X, AlertTriangle, Zap } from 'lucide-react';
import type { Campaign } from '../types/campaigns';

interface CreateCampaignFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaignData: Campaign) => void;
}

const CREATION_FEE = {
  amount: 0.05,
  currency: 'ETH',
  usdValue: 125 // Mock USD value
};

export default function CreateCampaignForm({ isOpen, onClose, onSubmit }: CreateCampaignFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: 30,
    startDate: '',
    endDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm' | 'payment'>('form');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleConfirm = () => {
    setStep('payment');
  };

  const handlePayment = async () => {
    setIsSubmitting(true);

    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create campaign
    const newCampaign = {
      id: `camp-${Date.now()}`,
      ...formData,
      status: 'upcoming' as const,
      totalSubmissions: 0,
      totalVotes: 0,
      prize: 'Featured in Gallery',
      category: formData.category,
      submissions: []
    };

    onSubmit(newCampaign);
    setIsSubmitting(false);
    onClose();

    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      duration: 30,
      startDate: '',
      endDate: ''
    });
    setStep('form');
  };

  const isFormValid = formData.title.trim() && formData.description.trim() && formData.category && formData.startDate && formData.endDate;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Create Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Campaign Title */}
            <div>
              <label className="block text-white font-medium mb-2">Campaign Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter campaign title..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                maxLength={100}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your campaign theme and goals..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors resize-none"
                maxLength={500}
                required
              />
              <p className="text-gray-500 text-sm mt-1">{formData.description.length}/500 characters</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-white font-medium mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                required
              >
                <option value="">Select category...</option>
                <option value="Digital Art">Digital Art</option>
                <option value="Abstract">Abstract</option>
                <option value="Photography">Photography</option>
                <option value="Mixed Media">Mixed Media</option>
                <option value="3D Art">3D Art</option>
                <option value="AI Art">AI Art</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Gas Fee Warning */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-amber-400" size={20} />
                <h3 className="text-amber-400 font-medium">Creation Fee Required</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Creating a campaign requires a fee to prevent spam and ensure quality campaigns. This fee helps maintain the platform&apos;s integrity.
              </p>
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                <span className="text-white font-medium">Creation Fee:</span>
                <div className="text-right">
                  <div className="text-amber-400 font-bold">{CREATION_FEE.amount} {CREATION_FEE.currency}</div>
                  <div className="text-gray-400 text-sm">≈ ${CREATION_FEE.usdValue}</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${isFormValid
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
            >
              Continue to Review
            </button>
          </form>
        )}

        {step === 'confirm' && (
          <div className="p-6 space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Review Campaign Details</h3>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Title</label>
                <p className="text-white font-medium">{formData.title}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Description</label>
                <p className="text-white">{formData.description}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Category</label>
                <p className="text-white">{formData.category}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Start Date</label>
                  <p className="text-white">{new Date(formData.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">End Date</label>
                  <p className="text-white">{new Date(formData.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Edit
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pay Creation Fee</h3>
              <p className="text-gray-400">Complete the payment to create your campaign</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Campaign Creation</span>
                <span className="text-white">{CREATION_FEE.amount} {CREATION_FEE.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gas Fee (estimated)</span>
                <span className="text-white">0.002 ETH</span>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <div className="text-right">
                    <div className="text-amber-400">{CREATION_FEE.amount + 0.002} ETH</div>
                    <div className="text-gray-400 text-sm">≈ ${CREATION_FEE.usdValue + 5}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-blue-400" size={16} />
                <span className="text-blue-400 text-sm font-medium">Gasless Transaction</span>
              </div>
              <p className="text-gray-300 text-sm">
                This transaction will be executed via Sequence wallet with gasless technology.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('confirm')}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  'Pay & Create Campaign'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}