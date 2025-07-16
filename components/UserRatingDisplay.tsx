import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Star } from 'lucide-react-native';
import { supabase } from '~/lib/supabase';

interface UserRatingDisplayProps {
  userId: string;
  rating?: number | null;
  className?: string;
}

const UserRatingDisplay: React.FC<UserRatingDisplayProps> = ({ 
  userId, 
  rating, 
  className 
}) => {
  const [fetchedRating, setFetchedRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof rating === 'number') return;
    if (!userId) return;
    
    setLoading(true);
    supabase
      .from('ratings')
      .select('rating')
      .eq('rated_id', userId)
      .then(({ data, error }) => {
        if (error || !data) {
          setFetchedRating(null);
        } else if (data.length > 0) {
          const avg = data.reduce((acc, curr) => acc + curr.rating, 0) / data.length;
          setFetchedRating(avg);
        } else {
          setFetchedRating(null);
        }
        setLoading(false);
      });
  }, [userId, rating]);

  const displayRating = typeof rating === 'number' ? rating : fetchedRating;

  return (
    <View className={className}>
      {loading ? (
        <Text className="text-gray-400">Loading...</Text>
      ) : displayRating !== null && displayRating > 0 ? (
        <View className="flex-row items-center gap-1">
          <Star 
            size={14} 
            color="#FFB800" 
            fill="#FFB800" 
          />
          <Text className="text-xs font-semibold text-yellow-600">
            {displayRating.toFixed(1)}
          </Text>
        </View>
      ) : (
        <Text className="text-gray-400">No ratings</Text>
      )}
    </View>
  );
};

export default UserRatingDisplay;