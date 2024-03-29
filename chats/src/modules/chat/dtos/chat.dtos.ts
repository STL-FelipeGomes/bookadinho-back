import z from 'zod';

export const ChatValidation = z.object({
  id: z.string().uuid().readonly(),
  sender_id: z.string().uuid().readonly(),
  receiver_id: z.string().uuid().readonly(),
  status: z.string().default('pending'),
});

export const ChatCreate = z.object({
  sender_id: z.string().uuid().readonly(),
  receiver_id: z.string().uuid().readonly(),
  status: z.string().default('pending'),
});

enum StatusChatEnum {
  open = 'open',
  closed = 'closed',
  pending = 'pending',
}

export const ChatStatusUpdate = z.nativeEnum(StatusChatEnum);

export type ChatType = z.infer<typeof ChatCreate>;
