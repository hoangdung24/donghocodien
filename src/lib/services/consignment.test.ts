import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Effect, Cause } from 'effect';
import { submitConsignment, ConsignmentPayload, ConsignmentError } from './consignment';

describe('Consignment Service', () => {
  const samplePayload: ConsignmentPayload = {
    clientName: 'Collector Philippe',
    email: 'philippe@example.com',
    phone: '+84941625653',
    brand: 'Cartier',
    model: 'Tank Louis Cartier',
    price: '$4,500',
    description: '18k yellow gold manual-wind in mint condition.',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('submits consignment payload successfully and returns mail_sent', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        contact_form_id: 1372,
        status: 'mail_sent',
        message: 'Thank you for your submission.',
        invalid_fields: [],
      }),
    });

    const program = submitConsignment(samplePayload);
    const result = await Effect.runPromise(program);

    expect(result.status).toBe('mail_sent');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://donghocodien.com/wp-json/contact-form-7/v1/contact-forms/1372/feedback',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('fails with ConsignmentError when CF7 reports invalid_fields or validation_failed', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        contact_form_id: 1372,
        status: 'validation_failed',
        message: 'One or more fields have an error.',
        invalid_fields: [{ field: 'email', message: 'The e-mail address entered is invalid.' }],
      }),
    });

    const program = submitConsignment(samplePayload);
    const exit = await Effect.runPromiseExit(program);

    expect(exit._tag).toBe('Failure');
    if (exit._tag === 'Failure') {
      const err = Cause.findErrorOption(exit.cause);
      expect(err._tag).toBe('Some');
      if (err._tag === 'Some') {
        expect(err.value).toBeInstanceOf(ConsignmentError);
        const consignmentError = err.value as ConsignmentError;
        expect(consignmentError.status).toBe('validation_failed');
        expect(consignmentError.invalid_fields?.[0]?.field).toBe('email');
      }
    }
  });
});
