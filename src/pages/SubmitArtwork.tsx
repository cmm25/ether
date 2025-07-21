"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { SubmissionFormData } from '../types/artwork';
import { STAKE_INFO } from '../utils/artworkSubmission';
import { campaigns } from '../data/campaignsData';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: SubmissionFormData;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, formData }) => {
  const selectedCampaign = campaigns.find(c => c.id === formData.campaignId);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Confirm Submission</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Title</p>
                <p className="text-white font-medium">{formData.title}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Description</p>
                <p className="text-white">{formData.description}</p>
              </div>
              {selectedCampaign && (
                <div>
                  <p className="text-gray-400 text-sm">Campaign</p>
                  <p className="text-white font-medium">{selectedCampaign.title}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm">Stake Amount</p>
                <p className="text-white font-medium">{STAKE_INFO.amount} {STAKE_INFO.tokenSymbol} tokens</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-blue-400" size={16} />
                <p className="text-blue-400 text-sm font-medium">Gasless Transaction</p>
              </div>
              <p className="text-gray-300 text-sm">
                This transaction will be executed gaslessly via Sequence. You&apos;ll only need to approve the token stake.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Approve & Submit
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SuccessScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Check size={32} className="text-white" />
        </motion.div>

        <h3 className="text-2xl font-bold text-white mb-4">Artwork Submitted!</h3>
        <p className="text-gray-400 mb-6">
          Your artwork has been successfully submitted to the campaign. Your submission NFT has been minted and the stake has been processed.
        </p>

        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
};

const SubmitArtworkPage: React.FC = () => {
  const [formData, setFormData] = useState<SubmissionFormData>({
    title: '',
    description: '',
    image: null,
    campaignId: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get available campaigns (active and upcoming)
  const availableCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'upcoming');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isFormValid = formData.title.trim() && formData.description.trim() && formData.image && formData.campaignId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSubmission = async () => {
    setIsSubmitting(true);
    setShowConfirmation(false);
    
    // Simulate API call and blockchain interaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Reset form
    setFormData({ title: '', description: '', image: null, campaignId: '' });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedCampaign = campaigns.find(c => c.id === formData.campaignId);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Submit Your Artwork
          </h1>
          <p className="text-gray-400 text-lg">
            Share your creative vision with the community and participate in active campaigns.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Campaign Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-lg font-semibold mb-4">Select Campaign</label>
            <select
              value={formData.campaignId}
              onChange={(e) => setFormData(prev => ({ ...prev, campaignId: e.target.value }))}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            >
              <option value="">Choose a campaign...</option>
              {availableCampaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title} ({campaign.status === 'active' ? 'Active' : 'Upcoming'})
                </option>
              ))}
            </select>
            {selectedCampaign && (
              <div className="mt-3 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                <p className="text-gray-300 text-sm mb-2">{selectedCampaign.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-purple-400">Prize: {selectedCampaign.prize}</span>
                  <span className="text-blue-400">Category: {selectedCampaign.category}</span>
                  <span className={`${selectedCampaign.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                    Status: {selectedCampaign.status}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-lg font-semibold mb-4">Artwork Image</label>
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                dragActive
                  ? 'border-purple-500 bg-purple-500/10'
                  : imagePreview
                  ? 'border-green-500 bg-green-500/5'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-xl mb-2">Drop your artwork here</p>
                  <p className="text-gray-400 mb-4">or click to browse files</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Choose File
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </motion.div>

          {/* Title Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-lg font-semibold mb-4">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter artwork title..."
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              maxLength={100}
            />
          </motion.div>

          {/* Description Textarea */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-lg font-semibold mb-4">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your artwork, inspiration, or technique..."
              rows={6}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none"
              maxLength={1000}
            />
            <p className="text-gray-500 text-sm mt-2">
              {formData.description.length}/1000 characters
            </p>
          </motion.div>

          {/* Staking Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Staking Information
            </h3>
            <p className="text-gray-300 mb-4">
              To submit your artwork to the campaign, you need to stake <span className="text-purple-400 font-semibold">{STAKE_INFO.amount} {STAKE_INFO.tokenSymbol} tokens</span>. 
              This helps maintain quality and prevents spam submissions.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <AlertCircle size={16} />
              <span>Your tokens will be returned when your artwork is approved or after the review period.</span>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-4"
          >
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/25'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                'Submit to Campaign'
              )}
            </button>
          </motion.div>
        </form>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmission}
        formData={formData}
      />

      <AnimatePresence>
        {showSuccess && <SuccessScreen onClose={handleSuccessClose} />}
      </AnimatePresence>
    </div>
  );
};

export default SubmitArtworkPage;