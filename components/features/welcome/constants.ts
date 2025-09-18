import { Search, MessageCircle, DollarSign, ShieldCheck } from 'lucide-react-native';

export const slides = [
  {
    id: 1,
    title: 'Welcome to PickUp',
    subtitle: 'Your community game hub',
    description:
      'Find and organize local pickup runs with neighbors and friends. Starting with soccer today—basketball, volleyball, and more are on the way.',
    icon: ShieldCheck,
    color: '#0EA5E9',
    background: 'linear-gradient(135deg, #0EA5E9 0%, #22D3EE 100%)',
  },
  {
    id: 2,
    title: 'Find Games Near You',
    subtitle: 'Filter by sport & skill',
    description:
      'Browse upcoming pickup sessions by sport, date, skill level, and location. See player caps, field info, and who’s already RSVP’d.',
    icon: Search,
    color: '#22C55E',
    background: 'linear-gradient(135deg, #22C55E 0%, #86EFAC 100%)',
  },
  {
    id: 3,
    title: 'Join & Chat',
    subtitle: 'Coordinate quickly',
    description:
      'Message hosts and teammates, share directions, and get real-time updates if fields change or teams need one more.',
    icon: MessageCircle,
    color: '#F59E0B',
    background: 'linear-gradient(135deg, #F59E0B 0%, #FDE68A 100%)',
  },
  {
    id: 4,
    title: 'Host a Match',
    subtitle: 'Set the rules in minutes',
    description:
      'Create a run, choose the field and player cap, set skill level, and (optionally) collect small contributions for lights or rentals—transparent and hassle-free.',
    icon: DollarSign,
    color: '#8B5CF6',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #C4B5FD 100%)',
  },
];
