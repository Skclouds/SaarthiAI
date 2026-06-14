import { Types } from 'mongoose';
import { AppError } from '../middleware/errorHandler';
import { Conversation, Message, MessageRating } from '../models';

export async function submitMessageFeedback(
  messageId: string,
  rating: MessageRating,
  businessId: string,
): Promise<{ messageId: string; rating: MessageRating }> {
  if (!Types.ObjectId.isValid(messageId) || !Types.ObjectId.isValid(businessId)) {
    throw new AppError('Invalid id', 400);
  }

  const message = await Message.findById(messageId);
  if (!message || message.role !== 'ASSISTANT') {
    throw new AppError('Assistant message not found', 404);
  }

  const conversation = await Conversation.findById(message.conversationId);
  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  if (!conversation.businessId.equals(new Types.ObjectId(businessId))) {
    throw new AppError('Forbidden', 403);
  }

  if (message.rating) {
    if (message.rating === rating) {
      return { messageId: message._id.toString(), rating: message.rating };
    }
    throw new AppError('Feedback already submitted for this message', 409);
  }

  message.rating = rating;
  await message.save();

  console.log('[Feedback] Recorded:', {
    messageId: message._id.toString(),
    conversationId: conversation._id.toString(),
    businessId: conversation.businessId.toString(),
    rating,
  });

  return { messageId: message._id.toString(), rating };
}
