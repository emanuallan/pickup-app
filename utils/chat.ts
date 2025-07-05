import { Message } from '../types/chat';

export const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Yesterday ' + date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
           date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
};

export const shouldShowTimestamp = (currentMsg: Message, prevMsg: Message | null) => {
  if (!prevMsg) return true;

  const currentTime = new Date(currentMsg.created_at).getTime();
  const prevTime = new Date(prevMsg.created_at).getTime();
  const timeDiffMinutes = (currentTime - prevTime) / (1000 * 60);

  return timeDiffMinutes > 60 || currentMsg.sender_id !== prevMsg.sender_id;
};

export const buildMessageQuery = (supabase: any, user_email: string, other_user_id: string, listing_id: string) => {
  let query = supabase
    .from('messages')
    .select('*');

  if (listing_id === "general") {
    query = query.or(
      `and(sender_id.eq.${user_email},receiver_id.eq.${other_user_id}),` +
      `and(sender_id.eq.${other_user_id},receiver_id.eq.${user_email})`
    ).is('listing_id', null);
  } else {
    query = query.or(
      `and(sender_id.eq.${user_email},receiver_id.eq.${other_user_id},listing_id.eq.${listing_id}),` +
      `and(sender_id.eq.${other_user_id},receiver_id.eq.${user_email},listing_id.eq.${listing_id})`
    );
  }

  return query.order('created_at', { ascending: true });
};

export const isRelevantMessage = (
  message: Message, 
  user_email: string, 
  other_user_id: string, 
  listing_id: string
) => {
  return (
    (message.sender_id === user_email && message.receiver_id === other_user_id) ||
    (message.sender_id === other_user_id && message.receiver_id === user_email)
  ) && (
    listing_id === "general" ? !message.listing_id : message.listing_id === listing_id
  );
}; 