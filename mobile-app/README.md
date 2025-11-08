# Amazon Credit Score - React Native App

A React Native mobile application that calculates alternative credit scores based on Amazon transaction data using the Knot API.

## Features

- 📱 **Cross-platform**: Works on both iOS and Android
- 🔐 **Fake Amazon Login**: Authentic-looking Amazon login screen
- 📊 **Credit Score Display**: Beautiful circular progress indicator showing credit score (300-850)
- 🔄 **Backend Integration**: Communicates with Node.js backend via REST API
- 🎨 **Native UI**: Built with React Native for optimal performance

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- React Native development environment set up:
  - For iOS: Xcode (macOS only)
  - For Android: Android Studio and Android SDK

## Installation

1. Navigate to the mobile app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

### iOS Setup (macOS only)

3. Install iOS dependencies:
```bash
cd ios
pod install
cd ..
```

4. Run on iOS:
```bash
npm run ios
```

### Android Setup

3. Make sure Android Studio is installed and configured
4. Run on Android:
```bash
npm run android
```

## Configuration

### Backend URL

Update the backend URL in `src/services/NetworkService.js`:

```javascript
const BASE_URL = 'http://YOUR_BACKEND_URL:3000';
```

For development:
- **iOS Simulator**: Use `http://localhost:3000`
- **Android Emulator**: Use `http://10.0.2.2:3000`
- **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:3000`)

## Project Structure

```
mobile-app/
├── src/
│   ├── App.js                      # Main app component with navigation
│   ├── screens/
│   │   ├── LoginScreen.js          # Amazon-style login screen
│   │   └── CreditScoreScreen.js    # Credit score display screen
│   ├── components/
│   │   └── CircularProgress.js     # Circular progress indicator
│   └── services/
│       └── NetworkService.js       # Backend API integration
├── android/                        # Android native code
├── ios/                            # iOS native code
├── index.js                        # App entry point
├── package.json                    # Dependencies
├── babel.config.js                 # Babel configuration
└── README.md
```

## Usage

1. Launch the app on your device or emulator
2. Enter any email and password in the fake Amazon login screen
3. Tap "Sign in"
4. View your alternative credit score based on transaction data

## Components

### LoginScreen
- Amazon-style branding with cart icon
- Email and password input fields
- Loading state during authentication
- Error handling with alerts
- Keyboard-aware scrolling

### CreditScoreScreen
- Circular progress indicator with gradient
- Displays credit score out of 850
- Shows number of transactions analyzed
- Clean, professional UI

### CircularProgress
- SVG-based circular progress bar
- Gradient color scheme (blue to green)
- Animated progress display
- Responsive to score changes

## API Integration

The app communicates with the backend via `NetworkService`:

```javascript
// Login request
const response = await NetworkService.login(email, password);

// Response structure
{
  "success": true,
  "creditScore": 750,
  "transactionCount": 20
}
```

## Development

### Running the Development Server

```bash
npm start
```

This starts the Metro bundler.

### Building for Production

#### iOS

```bash
cd ios
xcodebuild -workspace AmazonCreditScore.xcworkspace -scheme AmazonCreditScore -configuration Release
```

#### Android

```bash
cd android
./gradlew assembleRelease
```

## Testing

Run tests with:
```bash
npm test
```

## Linting

Check code style:
```bash
npm run lint
```

## Troubleshooting

### iOS Build Issues

- Make sure CocoaPods is installed: `sudo gem install cocoapods`
- Clean build: `cd ios && rm -rf Pods Podfile.lock && pod install`

### Android Build Issues

- Clean gradle: `cd android && ./gradlew clean`
- Check Android SDK and environment variables are set correctly

### Network Connection Issues

- For iOS simulator, use `localhost`
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical devices, ensure device and backend are on the same network
- Check backend is running on the correct port

## Dependencies

### Core
- **react**: ^18.2.0
- **react-native**: ^0.72.6

### Navigation
- **@react-navigation/native**: Navigation framework
- **@react-navigation/stack**: Stack navigator

### Network
- **axios**: HTTP client for API calls

### UI
- **react-native-svg**: SVG support for circular progress

## Notes

- This is a demonstration app with **fake authentication**
- In production, implement proper OAuth with Amazon
- Ensure backend URL is accessible from your device/emulator
- Use HTTPS in production for security

## Future Enhancements

- [ ] Add biometric authentication (Face ID/Touch ID/Fingerprint)
- [ ] Implement actual Knot SDK integration
- [ ] Add transaction history view
- [ ] Display credit score breakdown by factors
- [ ] Add dark mode support
- [ ] Implement pull-to-refresh
- [ ] Add animations and transitions
- [ ] Localization support (multiple languages)
- [ ] Offline mode with local caching

## License

MIT
