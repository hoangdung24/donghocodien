import { Effect, Schema } from 'effect';

export interface ConsignmentPayload {
  readonly clientName: string;
  readonly email: string;
  readonly phone: string;
  readonly brand: string;
  readonly model: string;
  readonly price: string;
  readonly description?: string;
  readonly image?: File | null;
}

export interface ConsignmentResponse {
  readonly contact_form_id: number;
  readonly status: 'mail_sent' | 'validation_failed' | 'mail_failed' | string;
  readonly message: string;
  readonly invalid_fields?: ReadonlyArray<{ readonly field: string; readonly message: string }>;
}

export class NetworkError extends Schema.TaggedError<NetworkError, { readonly brand: unique symbol }>()('NetworkError', {
  message: Schema.String,
}) {}

export class HttpError extends Schema.TaggedError<HttpError, { readonly brand: unique symbol }>()('HttpError', {
  status: Schema.Finite,
  statusText: Schema.String,
}) {}

export class ConsignmentError extends Schema.TaggedError<ConsignmentError, { readonly brand: unique symbol }>()('ConsignmentError', {
  status: Schema.String,
  message: Schema.String,
  invalid_fields: Schema.optional(Schema.Array(Schema.Struct({
    field: Schema.String,
    message: Schema.String,
  }))),
}) {}

const CF7_CONSIGNMENT_ENDPOINT =
  'https://donghocodien.com/wp-json/contact-form-7/v1/contact-forms/1372/feedback';

export function submitConsignment(
  payload: ConsignmentPayload
): Effect.Effect<ConsignmentResponse, NetworkError | HttpError | ConsignmentError> {
  return Effect.gen(function* () {
    const formData = new FormData();
    formData.append('_wpcf7', '1372');
    formData.append('_wpcf7_version', '6.1.6');
    formData.append('_wpcf7_locale', 'vi');
    formData.append('_wpcf7_unit_tag', 'wpcf7-f1372-p1368-o1');
    formData.append('_wpcf7_container_post', '1368');

    formData.append('client-name', payload.clientName);
    formData.append('email', payload.email);
    formData.append('phone', payload.phone);
    formData.append('brand', payload.brand);
    formData.append('model', payload.model);
    formData.append('price', payload.price);
    if (payload.description) {
      formData.append('description', payload.description);
    }
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(CF7_CONSIGNMENT_ENDPOINT, {
          method: 'POST',
          body: formData,
        }),
      catch: (err) => new NetworkError({ message: String(err) }),
    });

    if (!response.ok) {
      return yield* new HttpError({
        status: response.status,
        statusText: response.statusText,
      });
    }

    const json = (yield* Effect.tryPromise({
      try: () => response.json() as Promise<ConsignmentResponse>,
      catch: (err) => new NetworkError({ message: String(err) }),
    })) as ConsignmentResponse;

    if (json.status !== 'mail_sent') {
      return yield* new ConsignmentError({
        status: json.status,
        message: json.message || 'Consignment submission failed',
        invalid_fields: json.invalid_fields ? [...json.invalid_fields] : undefined,
      });
    }

    return json;
  });
}
