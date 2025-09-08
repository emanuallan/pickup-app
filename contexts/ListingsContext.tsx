import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '~/lib/supabase';
import { useAuth } from './AuthContext';

interface Listing {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  location: string;
  category: string;
  condition: string;
  created_at: string;
  user_id: string;
  user_name?: string;
  user_image?: string | null;
  is_sold: boolean;
  is_draft: boolean;
  status: 'pending' | 'approved' | 'denied';
  denial_reason?: string;
}

interface UserSettings {
  email: string;
  display_name: string | null;
  profile_image_url: string | null;
}

interface UserMap {
  [key: string]: {
    name: string;
    image: string | null;
  };
}

interface ListingsContextType {
  allListings: Listing[];
  loading: boolean;
  refreshListings: () => Promise<void>;
  getUserListings: (userId: string) => Listing[];
  getRecentListings: (limit?: number) => Listing[];
  getListingsByCategory: (category: string) => Listing[];
  lastFetchTime: number;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingsProvider');
  }
  return context;
};

export const ListingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  // Cache for 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const fetchAllListings = async (force = false) => {
    const now = Date.now();
    
    // Skip if we have fresh data and not forcing refresh
    if (!force && allListings.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all approved, non-sold, non-draft listings
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('is_sold', false)
        .eq('is_draft', false)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user settings for all unique user_ids
      const userIds = [...new Set((data || []).map(l => l.user_id))];
      const { data: userSettings } = await supabase
        .from('users')
        .select('id, email, display_name, profile_image_url')
        .in('id', userIds);

      const userMap: UserMap = {};
      (userSettings || []).forEach((u: UserSettings & { id: string }) => {
        userMap[u.id] = {
          name: u.display_name || (u.email ? u.email.split('@')[0] : 'User'),
          image: u.profile_image_url || null,
        };
      });

      const listingsWithUser = (data || []).map(listing => ({
        ...listing,
        user_name: userMap[listing.user_id]?.name || listing.user_id,
        user_image: userMap[listing.user_id]?.image || null,
      }));

      setAllListings(listingsWithUser);
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchAllListings();
  }, []);

  // Utility functions to get filtered data
  const getUserListings = (userId: string): Listing[] => {
    return allListings.filter(listing => listing.user_id === userId);
  };

  const getRecentListings = (limit = 6): Listing[] => {
    return allListings.slice(0, limit);
  };

  const getListingsByCategory = (category: string): Listing[] => {
    if (category === 'All') return allListings;
    return allListings.filter(listing => 
      listing.category?.toLowerCase() === category.toLowerCase()
    );
  };

  const refreshListings = async (): Promise<void> => {
    await fetchAllListings(true);
  };

  const value: ListingsContextType = {
    allListings,
    loading,
    refreshListings,
    getUserListings,
    getRecentListings,
    getListingsByCategory,
    lastFetchTime,
  };

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
};