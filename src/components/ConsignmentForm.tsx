import React, { useState, useRef } from 'react';
import { Effect } from 'effect';
import { submitConsignment, type ConsignmentPayload } from '../lib/services/consignment';
import { Upload, CheckCircle2, AlertCircle, Loader2, MessageCircle, Send, X } from 'lucide-react';

export function ConsignmentForm() {
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    brand: '',
    model: '',
    price: '',
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 4MB limit. Please choose a smaller photo.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);

    const payload: ConsignmentPayload = {
      clientName: formData.clientName,
      email: formData.email,
      phone: formData.phone,
      brand: formData.brand,
      model: formData.model,
      price: formData.price,
      description: formData.description,
      image: selectedFile,
    };

    const result = await Effect.runPromiseExit(submitConsignment(payload));

    if (result._tag === 'Success') {
      setStatus('success');
    } else {
      setStatus('error');
      const err = result.cause;
      setErrorMessage(
        'Unable to submit consignment form. Please try again or reach out directly via WhatsApp (+84 94 162 5653).'
      );
    }
  };

  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Hello Spacetime Vintage Watch, I would like to consign a watch:\n\nBrand: ${formData.brand || 'N/A'}\nModel: ${formData.model || 'N/A'}\nExpected Price: ${formData.price || 'N/A'}\nDescription: ${formData.description || 'N/A'}\nName: ${formData.clientName || 'N/A'}`
    );
    return `https://wa.me/84941625653?text=${text}`;
  };

  if (status === 'success') {
    return (
      <div className="bg-stone-50 border border-stone-200 p-8 sm:p-10 text-center space-y-5 animate-fade-in">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-serif text-stone-900 tracking-wide uppercase">
            Consignment Inquiry Received
          </h3>
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            Thank you for entrusting Spacetime with your timepiece. Our horology specialists will review your submission and contact you via email or WhatsApp within 24 hours.
          </p>
        </div>
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-800 text-white text-xs uppercase tracking-wider hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send Extra Photos on WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setStatus('idle');
              setFormData({
                clientName: '',
                email: '',
                phone: '',
                brand: '',
                model: '',
                price: '',
                description: '',
              });
              setSelectedFile(null);
              setFilePreview(null);
            }}
            className="px-5 py-3 border border-stone-300 text-stone-700 text-xs uppercase tracking-wider hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Submit Another Timepiece
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {/* Row 1: Name */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-stone-700 mb-1.5 font-medium">
          Your Full Name *
        </label>
        <input
          type="text"
          name="clientName"
          required
          value={formData.clientName}
          onChange={handleInputChange}
          placeholder="e.g. Jean-Luc Dubois"
          className="w-full px-3.5 py-2.5 text-xs border border-stone-300 focus:outline-none focus:border-stone-900 bg-white transition-colors"
        />
      </div>

      {/* Row 2: Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-700 mb-1.5 font-medium">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder="e.g. collector@spacetime.com"
            className="w-full px-3.5 py-2.5 text-xs border border-stone-300 focus:outline-none focus:border-stone-900 bg-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-700 mb-1.5 font-medium">
            Phone / WhatsApp *
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="e.g. +84 94 162 5653"
            className="w-full px-3.5 py-2.5 text-xs border border-stone-300 focus:outline-none focus:border-stone-900 bg-white transition-colors"
          />
        </div>
      </div>

      {/* Row 3: Brand & Model */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-700 mb-1.5 font-medium">
            Watch Brand *
          </label>
          <input
            type="text"
            name="brand"
            required
            value={formData.brand}
            onChange={handleInputChange}
            placeholder="e.g. Rolex, Cartier, Omega"
            className="w-full px-3.5 py-2.5 text-xs border border-stone-300 focus:outline-none focus:border-stone-900 bg-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-700 mb-1.5 font-medium">
            Model / Reference *
          </label>
          <input
            type="text"
            name="model"
            required
            value={formData.model}
            onChange={handleInputChange}
            placeholder="e.g. Cellini ref 4127 18K Gold"
            className="w-full px-3.5 py-2.5 text-xs border border-stone-300 focus:outline-none focus:border-stone-900 bg-white transition-colors"
          />
        </div>
      </div>

      {/* Row 4: Expected Price */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-stone-700 mb-1.5 font-medium">
          Expected Price (USD or VND) *
        </label>
        <input
          type="text"
          name="price"
          required
          value={formData.price}
          onChange={handleInputChange}
          placeholder="e.g. $4,500 or 110,000,000 VND"
          className="w-full px-3.5 py-2.5 text-xs border border-stone-300 focus:outline-none focus:border-stone-900 bg-white transition-colors"
        />
      </div>

      {/* Row 5: Description */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-stone-700 mb-1.5 font-medium">
          Timepiece Condition &amp; Details
        </label>
        <textarea
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Please describe case condition, dial state, servicing history, presence of original box/papers..."
          className="w-full px-3.5 py-2.5 text-xs border border-stone-300 focus:outline-none focus:border-stone-900 bg-white transition-colors"
        />
      </div>

      {/* Row 6: Image Upload */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-stone-700 mb-1.5 font-medium">
          Watch Photograph (Max 4MB)
        </label>
        <div className="mt-1">
          {filePreview ? (
            <div className="relative inline-block border border-stone-200 p-2 bg-stone-50">
              <img
                src={filePreview}
                alt="Selected watch preview"
                className="w-32 h-32 object-cover border border-stone-100"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 bg-stone-900 text-white p-1 rounded-full hover:bg-stone-700 transition-colors cursor-pointer"
                aria-label="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <p className="text-[10px] text-stone-500 mt-1 truncate max-w-[128px]">
                {selectedFile?.name}
              </p>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-stone-300 hover:border-stone-900 p-6 text-center cursor-pointer transition-colors bg-stone-50 hover:bg-stone-100/50"
            >
              <Upload className="w-6 h-6 mx-auto text-stone-400 mb-2" />
              <p className="text-xs text-stone-700 font-medium">
                Click or drag watch image here
              </p>
              <p className="text-[10px] text-stone-400 mt-1">
                JPG, PNG, or JPEG up to 4MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="flex-1 py-3.5 bg-brand-dark text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Transmitting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Consignment</span>
            </>
          )}
        </button>

        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3.5 border border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Consign via WhatsApp</span>
        </a>
      </div>
    </form>
  );
}
