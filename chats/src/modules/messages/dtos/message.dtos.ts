import z from 'zod';

export const messageValidation = z.object({
  id: z.string().uuid().readonly(),
  status: z.string().default('pending'),
  message: z.string().max(2000, { message: 'Must be a maximum of 2000 characters' }),
  chat_id: z.string().uuid().readonly(),
  sender_id: z.string().uuid().readonly(),
  receiver_id: z.string().uuid().readonly(),
});

export const messageCreate = z.object({
  status: z.string().default('pending'),
  message: z.string().max(2000, { message: 'Must be a maximum of 2000 characters' }),
  chat_id: z.string().uuid().readonly(),
  sender_id: z.string().uuid().readonly(),
  receiver_id: z.string().uuid().readonly(),
});

export type MessageType = z.infer<typeof messageValidation>;
