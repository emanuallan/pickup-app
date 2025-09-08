import { View, Text } from 'react-native';
import { Clock, CheckCircle, XCircle } from 'lucide-react-native';

type ListingStatus = 'pending' | 'approved' | 'denied';

interface StatusBadgeProps {
  status: ListingStatus;
  denialReason?: string | null;
  size?: 'small' | 'medium' | 'large';
}

export default function StatusBadge({ status, denialReason, size = 'medium' }: StatusBadgeProps) {
  const getStatusConfig = (status: ListingStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Under Review',
          backgroundColor: '#FEF3C7', // yellow-100
          textColor: '#92400E', // yellow-800
          iconColor: '#D97706', // yellow-600
        };
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Live',
          backgroundColor: '#D1FAE5', // green-100
          textColor: '#065F46', // green-800
          iconColor: '#059669', // green-600
        };
      case 'denied':
        return {
          icon: XCircle,
          label: 'Denied',
          backgroundColor: '#FEE2E2', // red-100
          textColor: '#991B1B', // red-800
          iconColor: '#DC2626', // red-600
        };
      default:
        return {
          icon: Clock,
          label: 'Under Review',
          backgroundColor: '#FEF3C7',
          textColor: '#92400E',
          iconColor: '#D97706',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  const sizeConfig = {
    small: {
      iconSize: 12,
      textSize: 'text-xs',
      paddingX: 'px-2',
      paddingY: 'py-1',
    },
    medium: {
      iconSize: 14,
      textSize: 'text-sm',
      paddingX: 'px-3',
      paddingY: 'py-1.5',
    },
    large: {
      iconSize: 16,
      textSize: 'text-base',
      paddingX: 'px-4',
      paddingY: 'py-2',
    },
  };

  const currentSize = sizeConfig[size];

  return (
    <View 
      className={`flex-row items-center rounded-full ${currentSize.paddingX} ${currentSize.paddingY}`}
      style={{ backgroundColor: config.backgroundColor }}
    >
      <Icon 
        size={currentSize.iconSize} 
        color={config.iconColor} 
        style={{ marginRight: 4 }}
      />
      <Text 
        className={`font-semibold ${currentSize.textSize}`}
        style={{ color: config.textColor }}
      >
        {config.label}
      </Text>
    </View>
  );
}

export function StatusDescription({ status, denialReason }: { status: ListingStatus; denialReason?: string | null }) {
  if (status === 'pending') {
    return (
      <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
        <Text className="text-yellow-800 text-sm font-medium mb-1">Under Review</Text>
        <Text className="text-yellow-700 text-sm">
          Your listing is being reviewed by our team. This usually takes 24-48 hours.
        </Text>
      </View>
    );
  }

  if (status === 'approved') {
    return (
      <View className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
        <Text className="text-green-800 text-sm font-medium mb-1">Approved & Live</Text>
        <Text className="text-green-700 text-sm">
          Your listing is now visible to other students on the marketplace.
        </Text>
      </View>
    );
  }

  if (status === 'denied') {
    return (
      <View className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
        <Text className="text-red-800 text-sm font-medium mb-1">Listing Denied</Text>
        <Text className="text-red-700 text-sm mb-2">
          Your listing couldn't be approved for the following reason:
        </Text>
        <Text className="text-red-800 text-sm font-medium">
          {denialReason || 'No reason provided. Please contact support for more information.'}
        </Text>
      </View>
    );
  }

  return null;
}