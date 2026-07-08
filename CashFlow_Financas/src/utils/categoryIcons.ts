import { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface IconItem {
    id: string;
    icon: IconName;
}

export const AVAILABLE_ICONS: IconItem[] = [
    { id: 'food', icon: 'food' },
    { id: 'groceries', icon: 'cart-outline' },
    { id: 'coffee', icon: 'coffee' },
    { id: 'fastfood', icon: 'hamburger' },
    { id: 'fuel', icon: 'gas-station' },
    { id: 'car_maintenance', icon: 'car-cog' },
    { id: 'bus', icon: 'bus' },
    { id: 'taxi', icon: 'taxi' },
    { id: 'home', icon: 'home-outline' },
    { id: 'electricity', icon: 'lightning-bolt-outline' },
    { id: 'water', icon: 'water-outline' },
    { id: 'internet', icon: 'router-wireless' },
    { id: 'streaming', icon: 'television-play' },
    { id: 'clothing', icon: 'tshirt-crew-outline' },
    { id: 'shopping', icon: 'hanger' },
    { id: 'pharmacy', icon: 'pill' },
    { id: 'health', icon: 'medical-bag' },
    { id: 'gym', icon: 'dumbbell' },
    { id: 'cinema', icon: 'movie-open-outline' },
    { id: 'games', icon: 'gamepad-variant-outline' },
    { id: 'nightlife', icon: 'beer-outline' },
    { id: 'gifts', icon: 'gift-outline' },
    { id: 'beauty', icon: 'content-cut' },
    { id: 'pets', icon: 'paw' },
    { id: 'education', icon: 'school-outline' },
    { id: 'books', icon: 'book-open-variant' },
    { id: 'salary', icon: 'cash' },
    { id: 'investments', icon: 'trending-up' },
    { id: 'freelance', icon: 'laptop' },
    { id: 'savings', icon: 'piggy-bank-outline' },
    { id: 'bank', icon: 'bank-outline' },
    { id: 'travel', icon: 'airplane' },
    { id: 'hotel', icon: 'bed-outline' },
    { id: 'insurance', icon: 'shield-check-outline' },
    { id: 'taxes', icon: 'file-document-outline' },
    { id: 'others', icon: 'dots-horizontal' }
];