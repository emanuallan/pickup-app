# 🤘 UT Marketplace

> Your campus marketplace awaits - Connect with fellow Longhorns to buy, sell, and discover amazing deals right on campus.

A React Native mobile application built with Expo that provides University of Texas students with a dedicated platform for buying and selling items within the campus community.

## ✨ Features

### 🏪 Marketplace Core
- **Browse & Search** - Discover items with advanced filtering by category, price, condition, and more
- **Create Listings** - Post items for sale with photos, descriptions, and pricing
- **Categories** - Organized sections including Furniture, Tech, Books, Clothing, Housing, and more
- **Real-time Updates** - Live notifications for favorites, messages, and listing interactions

### 💬 Communication
- **In-App Messaging** - Direct chat with buyers and sellers
- **Push Notifications** - Stay updated on messages and listing activity
- **User Ratings** - Rate and review your trading partners

### 👤 User Experience
- **Personalized Feed** - Recent listings and recommendations
- **Favorites & Watchlist** - Save items you're interested in
- **User Profiles** - View seller history and ratings
- **Authentication** - Secure login and registration system

### 🎨 Design & UX
- **UT-Themed UI** - Burnt orange color scheme matching UT branding
- **Intuitive Navigation** - Tab-based navigation with modal flows
- **Responsive Design** - Optimized for both iOS and Android
- **Haptic Feedback** - Enhanced user interactions

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)
- Supabase account for backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ut-marketplace-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### Development Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Build for development
npm run build:dev

# Build for production
npm run build:prod

# Lint code
npm run lint

# Format code
npm run format
```

## 🏗️ Tech Stack

### Frontend
- **React Native** - Mobile app framework
- **Expo** - Development platform and toolchain
- **Expo Router** - File-based routing system
- **TypeScript** - Type-safe JavaScript
- **NativeWind** - Tailwind CSS for React Native
- **Zustand** - State management
- **Lucide React Native** - Icon library

### Backend & Services
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database (via Supabase)
- **Real-time subscriptions** - Live updates
- **Row Level Security** - Data protection

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **EAS Build** - Cloud builds
- **Expo Dev Client** - Custom development builds

## 📱 App Structure

```
app/
├── (auth)/          # Authentication screens
├── (tabs)/          # Main tab navigation
├── (modals)/        # Modal screens
├── chat/            # Messaging system
├── listing/         # Listing details
└── ...

components/
├── ui/              # Reusable UI components
├── forms/           # Form components
├── layout/          # Layout components
├── listing/         # Listing-specific components
└── modals/          # Modal components

lib/
├── supabase.ts      # Database configuration
├── notifications.ts # Notification services
└── ...

contexts/
├── AuthContext.tsx  # Authentication state
└── ...
```

## 🎯 Key Features Implementation

### Authentication & Security
- Supabase Auth integration
- Row Level Security (RLS) policies
- Email-based authentication
- Secure user sessions

### Real-time Features
- Live chat messaging
- Push notifications
- Real-time listing updates
- Instant favorite/watchlist sync

### Data Management
- PostgreSQL with Supabase
- Optimistic UI updates
- Image upload and storage
- Advanced search and filtering

### UI/UX Excellence
- UT brand compliance
- Smooth animations and transitions
- Haptic feedback integration
- Responsive design patterns

## 🔧 Configuration

### Expo Configuration
The app uses Expo with custom development builds enabled. Key configurations:
- File-based routing with Expo Router
- TypeScript paths for clean imports
- Custom splash screen and icons
- Platform-specific configurations

### Database Schema
- Users and authentication
- Listings with categories and images
- Messaging system
- Favorites and watchlist
- Ratings and reviews
- Push notification tokens

## 🚀 Deployment

### Development Build
```bash
npm run build:dev
```

### Production Build
```bash
npm run build:prod
```

The app is configured for deployment through EAS Build with separate profiles for development, preview, and production environments.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Ensure all features work on both iOS and Android

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Built with ❤️ for the University of Texas community

## 🙏 Acknowledgments

- University of Texas for the inspiration
- Expo team for the amazing development platform
- Supabase for the backend infrastructure
- The React Native community

---

**Hook 'em Horns!** 🤘