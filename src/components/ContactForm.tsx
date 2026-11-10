import { Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

const FIELD_CLASS =
  'w-full border border-stone-300 px-3.5 py-2.5 text-xs transition-colors focus:border-black focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2';
const LABEL_CLASS = 'mb-1.5 block text-xs font-medium tracking-wider text-stone-700 uppercase';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
      <div>
        <label htmlFor='contact-name' className={LABEL_CLASS}>
          Full Name <span aria-hidden='true'>*</span>
        </label>
        <input
          id='contact-name'
          name='name'
          type='text'
          required
          autoComplete='name'
          placeholder='e.g. Jean-Luc Dubois'
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor='contact-email' className={LABEL_CLASS}>
          Email Address <span aria-hidden='true'>*</span>
        </label>
        <input
          id='contact-email'
          name='email'
          type='email'
          required
          autoComplete='email'
          spellCheck={false}
          placeholder='name@domain.com'
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor='contact-phone' className={LABEL_CLASS}>
          WhatsApp or Phone Number <span className='text-stone-500 normal-case'>(optional)</span>
        </label>
        <input
          id='contact-phone'
          name='phone'
          type='tel'
          autoComplete='tel'
          placeholder='+1 (555) 012-3456'
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor='contact-subject' className={LABEL_CLASS}>
          Subject of Inquiry
        </label>
        <select id='contact-subject' name='subject' className={`${FIELD_CLASS} bg-white`}>
          <option value='acquisition'>Timepiece Acquisition</option>
          <option value='service'>Servicing &amp; Restoration</option>
          <option value='general'>General Collector Inquiry</option>
        </select>
      </div>

      <div>
        <label htmlFor='contact-message' className={LABEL_CLASS}>
          Message <span aria-hidden='true'>*</span>
        </label>
        <textarea
          id='contact-message'
          name='message'
          rows={4}
          required
          placeholder='Tell us about the watch or reference you are looking for…'
          className={FIELD_CLASS}
        ></textarea>
      </div>

      <button
        type='submit'
        className='flex w-full cursor-pointer items-center justify-center gap-2 bg-black py-3.5 text-xs font-medium tracking-[0.2em] text-white uppercase transition-colors hover:bg-stone-900'
      >
        <Send className='h-4 w-4' aria-hidden='true' />
        <span>Send Message</span>
      </button>

      <p role='status' className='text-xs text-stone-700'>
        {submitted ? 'Thank you. We have received your inquiry.' : ''}
      </p>
    </form>
  );
}
