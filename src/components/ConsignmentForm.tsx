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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      <div className='animate-fade-in space-y-5 border border-stone-200 bg-stone-50 p-8 text-center sm:p-10'>
        <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-800'>
          <CheckCircle2 className='h-8 w-8' />
        </div>
        <div className='space-y-2'>
          <h3 className='font-serif text-xl tracking-wide text-stone-900 uppercase'>
            Consignment Inquiry Received
          </h3>
          <p className='mx-auto max-w-md text-xs leading-relaxed text-stone-600'>
            Thank you for entrusting Spacetime with your timepiece. Our horology specialists will
            review your submission and contact you via email or WhatsApp within 24 hours.
          </p>
        </div>
        <div className='flex flex-col justify-center gap-3 border-t border-stone-200 pt-4 sm:flex-row'>
          <a
            href={getWhatsAppLink()}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center justify-center gap-2 bg-green-800 px-5 py-3 text-xs tracking-wider text-white uppercase transition-colors hover:bg-green-700'
          >
            <MessageCircle className='h-4 w-4' />
            <span>Send Extra Photos on WhatsApp</span>
          </a>
          <button
            type='button'
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
            className='cursor-pointer border border-stone-300 px-5 py-3 text-xs tracking-wider text-stone-700 uppercase transition-colors hover:bg-stone-100'
          >
            Submit Another Timepiece
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {errorMessage && (
        <div className='flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-xs text-red-800'>
          <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
          <div className='flex-1'>{errorMessage}</div>
        </div>
      )}

      <div>
        <label className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'>
          Your Full Name *
        </label>
        <input
          type='text'
          name='clientName'
          required
          value={formData.clientName}
          onChange={handleInputChange}
          placeholder='e.g. Jean-Luc Dubois'
          className='w-full border border-stone-300 bg-white px-3.5 py-2.5 text-xs transition-colors focus:border-stone-900 focus:outline-none'
        />
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'>
            Email Address *
          </label>
          <input
            type='email'
            name='email'
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder='e.g. collector@spacetime.com'
            className='w-full border border-stone-300 bg-white px-3.5 py-2.5 text-xs transition-colors focus:border-stone-900 focus:outline-none'
          />
        </div>
        <div>
          <label className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'>
            Phone / WhatsApp *
          </label>
          <input
            type='tel'
            name='phone'
            required
            value={formData.phone}
            onChange={handleInputChange}
            placeholder='e.g. +84 94 162 5653'
            className='w-full border border-stone-300 bg-white px-3.5 py-2.5 text-xs transition-colors focus:border-stone-900 focus:outline-none'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'>
            Watch Brand *
          </label>
          <input
            type='text'
            name='brand'
            required
            value={formData.brand}
            onChange={handleInputChange}
            placeholder='e.g. Rolex, Cartier, Omega'
            className='w-full border border-stone-300 bg-white px-3.5 py-2.5 text-xs transition-colors focus:border-stone-900 focus:outline-none'
          />
        </div>
        <div>
          <label className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'>
            Model / Reference *
          </label>
          <input
            type='text'
            name='model'
            required
            value={formData.model}
            onChange={handleInputChange}
            placeholder='e.g. Cellini ref 4127 18K Gold'
            className='w-full border border-stone-300 bg-white px-3.5 py-2.5 text-xs transition-colors focus:border-stone-900 focus:outline-none'
          />
        </div>
      </div>

      <div>
        <label className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'>
          Expected Price (USD or VND) *
        </label>
        <input
          type='text'
          name='price'
          required
          value={formData.price}
          onChange={handleInputChange}
          placeholder='e.g. $4,500 or 110,000,000 VND'
          className='w-full border border-stone-300 bg-white px-3.5 py-2.5 text-xs transition-colors focus:border-stone-900 focus:outline-none'
        />
      </div>

      <div>
        <label className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'>
          Timepiece Condition &amp; Details
        </label>
        <textarea
          name='description'
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          placeholder='Please describe case condition, dial state, servicing history, presence of original box/papers...'
          className='w-full border border-stone-300 bg-white px-3.5 py-2.5 text-xs transition-colors focus:border-stone-900 focus:outline-none'
        />
      </div>

      <div>
        <label className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'>
          Watch Photograph (Max 4MB)
        </label>
        <div className='mt-1'>
          {filePreview ? (
            <div className='relative inline-block border border-stone-200 bg-stone-50 p-2'>
              <img
                src={filePreview}
                alt='Selected watch preview'
                className='h-32 w-32 border border-stone-100 object-cover'
              />
              <button
                type='button'
                onClick={handleRemoveFile}
                className='absolute -top-2 -right-2 cursor-pointer rounded-full bg-stone-900 p-1 text-white transition-colors hover:bg-stone-700'
                aria-label='Remove image'
              >
                <X className='h-3.5 w-3.5' />
              </button>
              <p className='mt-1 max-w-[128px] truncate text-[10px] text-stone-500'>
                {selectedFile?.name}
              </p>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className='cursor-pointer border border-dashed border-stone-300 bg-stone-50 p-6 text-center transition-colors hover:border-stone-900 hover:bg-stone-100/50'
            >
              <Upload className='mx-auto mb-2 h-6 w-6 text-stone-400' />
              <p className='text-xs font-medium text-stone-700'>Click or drag watch image here</p>
              <p className='mt-1 text-[10px] text-stone-400'>JPG, PNG, or JPEG up to 4MB</p>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/png,image/jpeg,image/jpg'
                onChange={handleFileChange}
                className='hidden'
              />
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-3 pt-2 sm:flex-row'>
        <button
          type='submit'
          disabled={status === 'submitting'}
          className='flex flex-1 cursor-pointer items-center justify-center gap-2 bg-black py-3.5 text-xs font-medium tracking-[0.2em] text-white uppercase transition-colors hover:bg-stone-800 disabled:opacity-50'
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span>Transmitting...</span>
            </>
          ) : (
            <>
              <Send className='h-4 w-4' />
              <span>Submit Consignment</span>
            </>
          )}
        </button>

        <a
          href={getWhatsAppLink()}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center justify-center gap-2 border border-green-700 px-5 py-3.5 text-xs font-medium tracking-wider text-green-800 uppercase transition-colors hover:bg-green-50'
        >
          <MessageCircle className='h-4 w-4' />
          <span>Consign via WhatsApp</span>
        </a>
      </div>
    </form>
  );
}
