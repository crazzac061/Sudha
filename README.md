# CircularChain Mobile App

A React Native mobile application for sustainable waste management, connecting waste producers with recyclers and promoting a circular economy.

## 🌟 Features

### 📱 Core Features
- **Waste Management**
  - Create and manage waste listings
  - Track waste materials through QR codes
  - Add detailed descriptions, quantities, and conditions
  - Upload multiple photos of waste materials

### 🎯 Key Functionalities
- **QR Code System**
  - Generate unique QR codes for each waste listing
  - Scan QR codes to view waste details
  - Share QR codes via multiple platforms
  - Save QR codes locally for offline access

- **Location Integration**
  - Automatic location detection
  - GPS coordinates for waste pickup points
  - Location-based waste tracking

- **Image Management**
  - Multi-image upload support
  - High-quality image compression
  - Gallery integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for macOS) or Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd circular-chain-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

## 📁 Project Structure

```
circular-chain-app/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── WasteCard.tsx
│   │   └── WasteDetails.tsx
│   ├── navigation/     # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/       # Main app screens
│   │   ├── AddWasteScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── ScanQRScreen.tsx
│   ├── services/      # API and external services
│   ├── types/         # TypeScript definitions
│   └── utils/         # Utility functions
├── assets/            # Images and static assets
└── App.tsx           # Root component
```

## 🛠️ Technical Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **UI Components**: React Native Elements
- **Navigation**: React Navigation
- **Camera/QR**: Expo Camera & Barcode Scanner
- **File System**: Expo FileSystem
- **Location**: Expo Location

## 📱 Features in Detail

### Waste Listing Creation
- Form validation for required fields
- Multiple image upload support
- Location tagging
- QR code generation

### QR Code Management
- Generate unique QR codes
- Share via system share sheet
- Save to device storage
- Scan and parse waste information

### Location Services
- Request and handle permissions
- Current location detection
- Location storage with waste data

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the development framework
- [React Native Elements](https://reactnativeelements.com/) for UI components
- [React Navigation](https://reactnavigation.org/) for navigation
- Community contributors and supporters
