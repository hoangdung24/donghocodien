import React, { useRef, useState } from 'react';
import { Effect } from 'effect';
import { submitConsignment, type ConsignmentPayload } from '@/lib/services/consignment';
import { Upload, CheckCircle2, AlertCircle, Loader2, MessageCircle, Send, X } from 'lucide-react';

const QUALITY_FIELD_CLASS =
  'w-full border border-stone-300 bg-white px-3.5 py-2.5 text-xs transition-colors focus:border-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2';

const labels = {
  clientName: 'Your full name',
  email: 'Email address',
  phone: 'Phone or WhatsApp number',
  brand: 'Watch brand',
  model: 'Model or reference',
  price: 'Expected price (USD or VND)',
  description: 'Timepiece condition and details',
  photo: 'Watch photograph, maximum 4 MB',
} as const;

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

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('Image size exceeds the 4 MB limit. Please choose a smaller photograph.');
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
        'Unable to submit the consignment form. Please try again or reach out directly via WhatsApp (+84 94 162 5653).'
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
      <div
        role='status'
        className='flex flex-col gap-5 border border-stone-200 bg-stone-50 p-8 text-center motion-safe:animate-fade-in sm:p-10'
      >
        <div
          aria-hidden='true'
          className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-800'
        >
          <CheckCircle2 className='h-8 w-8' />
        </div>
        <div className='flex flex-col gap-2'>
          <h3 className='text-xl tracking-wide text-stone-900 uppercase'>
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
            <MessageCircle className='h-4 w-4' aria-hidden='true' />
            <span>Send extra photos on WhatsApp</span>
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
            Submit another timepiece
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-label='Consign a watch' className='flex flex-col gap-6'>
      <p className='text-xs text-stone-600'>
        <span className='font-medium text-stone-900'>Required fields</span> are marked with an
        asterisk.
      </p>

      {errorMessage && (
        <div
          role='alert'
          className='flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-xs text-red-800'
        >
          <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' aria-hidden='true' />
          <div className='flex-1'>{errorMessage}</div>
        </div>
      )}

      <div>
        <label
          htmlFor='consignment-client-name'
          className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'
        >
          {labels.clientName} *
        </label>
        <input
          id='consignment-client-name'
          type='text'
          name='clientName'
          required
          autoComplete='name'
          value={formData.clientName}
          onChange={handleInputChange}
          placeholder='e.g. Jean-Luc Dubois'
          className={QUALITY_FIELD_CLASS}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label
            htmlFor='consignment-email'
            className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'
          >
            {labels.email} *
          </label>
          <input
            id='consignment-email'
            type='email'
            name='email'
            required
            autoComplete='email'
            spellCheck={false}
            value={formData.email}
            onChange={handleInputChange}
            placeholder='e.g. collector@spacetime.com'
            className={QUALITY_FIELD_CLASS}
          />
        </div>
        <div>
          <label
            htmlFor='consignment-phone'
            className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'
          >
            {labels.phone} *
          </label>
          <input
            id='consignment-phone'
            type='tel'
            name='phone'
            required
            autoComplete='tel'
            value={formData.phone}
            onChange={handleInputChange}
            placeholder='e.g. +84 94 162 5653'
            className={QUALITY_FIELD_CLASS}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label
            htmlFor='consignment-brand'
            className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'
          >
            {labels.brand} *
          </label>
          <input
            id='consignment-brand'
            type='text'
            name='brand'
            required
            value={formData.brand}
            onChange={handleInputChange}
            placeholder='e.g. Rolex, Cartier, Omega'
            className={QUALITY_FIELD_CLASS}
          />
        </div>
        <div>
          <label
            htmlFor='consignment-model'
            className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'
          >
            {labels.model} *
          </label>
          <input
            id='consignment-model'
            type='text'
            name='model'
            required
            value={formData.model}
            onChange={handleInputChange}
            placeholder='e.g. Cellini ref 4127 18K Gold'
            className={QUALITY_FIELD_CLASS}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor='consignment-price'
          className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'
        >
          {labels.price} *
        </label>
        <input
          id='consignment-price'
          type='text'
          name='price'
          required
          inputMode='decimal'
          value={formData.price}
          onChange={handleInputChange}
          placeholder='e.g. $4,500 or 110,000,000 VND'
          className={QUALITY_FIELD_CLASS}
        />
      </div>

      <div>
        <label
          htmlFor='consignment-description'
          className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'
        >
          {labels.description}
        </label>
        <textarea
          id='consignment-description'
          name='description'
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          placeholder='Please describe case condition, dial state, servicing history, presence of original box and papers…'
          className={QUALITY_FIELD_CLASS}
        />
      </div>

      <div>
        <label
          htmlFor='consignment-photo'
          className='mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase'
        >
          {labels.photo}
        </label>
        <div className='mt-1'>
          {filePreview ? (
            <div className='relative inline-block border border-stone-200 bg-stone-50 p-2'>
              <img
                src={filePreview}
                alt={`Preview of ${selectedFile?.name ?? 'the selected watch photograph'}`}
                className='h-32 w-32 border border-stone-100 object-cover'
              />
              <button
                type='button'
                onClick={handleRemoveFile}
                className='absolute -top-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-stone-900 text-white transition-colors hover:bg-stone-700'
                aria-label='Remove the selected photograph'
              >
                <X className='h-3.5 w-3.5' aria-hidden='true' />
              </button>
              <p className='mt-1 max-w-32 truncate text-[10px] text-stone-500'>
                {selectedFile?.name}
              </p>
            </div>
          ) : (
            <div className='relative flex cursor-pointer flex-col items-center border border-dashed border-stone-300 bg-stone-50 p-6 text-center transition-colors focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-brand-dark focus-within:ring-offset-2 hover:border-stone-900 hover:bg-stone-100/50'>
              <Upload className='mb-2 h-6 w-6 text-stone-500' aria-hidden='true' />
              <p className='text-xs font-medium text-stone-700'>Choose a watch photograph</p>
              <p className='mt-1 text-[10px] text-stone-500'>JPG, PNG or JPEG, up to 4 MB</p>
              <input
                ref={fileInputRef}
                id='consignment-photo'
                type='file'
                name='photo'
                accept='image/png,image/jpeg,image/jpg'
                onChange={handleFileChange}
                aria-describedby='consignment-photo-hint'
                className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
              />
              <span id='consignment-photo-hint' className='sr-only'>
                Photos stay on your device until you submit the form.
              </span>
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
              <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
              <span>Transmitting…</span>
            </>
          ) : (
            <>
              <Send className='h-4 w-4' aria-hidden='true' />
              <span>Submit consignment</span>
            </>
          )}
        </button>

        <a
          href={getWhatsAppLink()}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center justify-center gap-2 border border-green-700 px-5 py-3.5 text-xs font-medium tracking-wider text-green-800 uppercase transition-colors hover:bg-green-50'
        >
          <MessageCircle className='h-4 w-4' aria-hidden='true' />
          <span>Consign via WhatsApp</span>
        </a>
      </div>
    </form>
  );
}
