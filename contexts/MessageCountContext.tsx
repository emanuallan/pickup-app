import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '~/lib/supabase';
import { useAuth } from './AuthContext';

interface MessageCountContextType {
  unreadMessageCount: number;
  refreshMessageCount: () => Promise<void>;
}

const MessageCountContext = createContext<MessageCountContextType>({
  unreadMessageCount: 0,
  refreshMessageCount: async () => {},
});

export const useMessageCount = () => useContext(MessageCountContext);

export const MessageCountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const refreshMessageCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      setUnreadMessageCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      refreshMessageCount();
    }
  }, [user?.id, refreshMessageCount]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel(`global_message_count:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setUnreadMessageCount(prev => prev + 1);
          } else if (payload.eventType === 'UPDATE') {
            const oldMessage = payload.old;
            const newMessage = payload.new;
            
            if (oldMessage?.is_read === false && newMessage?.is_read === true) {
              setUnreadMessageCount(prev => Math.max(0, prev - 1));
            } else if (oldMessage?.is_read === true && newMessage?.is_read === false) {
              setUnreadMessageCount(prev => prev + 1);
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedMessage = payload.old;
            if (!deletedMessage?.is_read) {
              setUnreadMessageCount(prev => Math.max(0, prev - 1));
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  return (
    <MessageCountContext.Provider value={{ unreadMessageCount, refreshMessageCount }}>
      {children}
    </MessageCountContext.Provider>
  );
};