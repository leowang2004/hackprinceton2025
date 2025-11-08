# iOS App - Amazon Credit Score

iOS mobile application that connects to a fake Amazon login screen and calculates an alternative credit score based on transaction data.

## Features

- **Fake Amazon Login UI**: Authentic-looking Amazon login screen
- **Backend Integration**: Communicates with Node.js backend
- **Credit Score Display**: Beautiful circular progress indicator showing credit score
- **SwiftUI**: Modern iOS UI framework

## Requirements

- iOS 16.0+
- Xcode 14.0+
- Swift 5.0+

## Installation

1. Open the project in Xcode:
```bash
cd ios-app
open AmazonCreditScore.xcodeproj
```

2. Update the backend URL in `NetworkService.swift`:
```swift
private let baseURL = "http://YOUR_BACKEND_URL:3000"
```

For local development:
- Simulator: Use `http://localhost:3000`
- Physical device: Use your computer's IP address (e.g., `http://192.168.1.100:3000`)

3. Build and run the project in Xcode (Cmd+R)

## Project Structure

```
ios-app/
├── AmazonCreditScore.xcodeproj/
│   └── project.pbxproj
└── AmazonCreditScore/
    ├── AmazonCreditScoreApp.swift  # Main app entry point
    ├── ContentView.swift            # Main view controller
    ├── LoginView.swift              # Amazon login screen
    ├── NetworkService.swift         # Backend API integration
    └── Info.plist                   # App configuration
```

## Usage

1. Launch the app
2. Enter any email and password in the fake Amazon login screen
3. Tap "Sign in"
4. View your alternative credit score based on transaction data

## Network Configuration

The app uses `NSAppTransportSecurity` settings in `Info.plist` to allow HTTP connections during development. For production, ensure you use HTTPS.

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## UI Components

### LoginView
- Amazon-style branding
- Email and password fields
- Loading state during authentication
- Error message display

### CreditScoreView
- Circular progress indicator
- Score out of 850
- Gradient color scheme
- Descriptive text

## Knot API Integration

For production use, integrate the Knot iOS SDK:

1. Add Knot SDK to your project via CocoaPods or Swift Package Manager:
```ruby
pod 'KnotSDK'
```

2. Import and configure Knot SDK:
```swift
import KnotSDK

Knot.configure(clientID: "your_client_id")
```

3. Use Knot to authenticate with Amazon:
```swift
Knot.present(platform: .amazon) { result in
    switch result {
    case .success(let token):
        // Send token to backend
    case .failure(let error):
        // Handle error
    }
}
```

See [Knot iOS SDK documentation](https://docs.knotapi.com/sdk/ios) for more details.

## Testing

To test the app without a backend:

1. Comment out the network call in `NetworkService.swift`
2. Return a mock credit score:
```swift
func sendLogin(email: String, password: String, completion: @escaping (Result<Int, Error>) -> Void) {
    // Mock response
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
        completion(.success(750))
    }
}
```

## Building for Device

1. Connect your iOS device
2. Select your device in Xcode
3. Update the bundle identifier in project settings
4. Add your Apple Developer account in Xcode preferences
5. Build and run (Cmd+R)

## Screenshots

The app features:
- Clean Amazon-style login interface
- Smooth transitions
- Beautiful credit score visualization
- Professional UI/UX

## Future Enhancements

- [ ] Add biometric authentication
- [ ] Implement actual Knot SDK integration
- [ ] Add transaction history view
- [ ] Display credit score breakdown
- [ ] Add dark mode support
- [ ] Implement pull-to-refresh
- [ ] Add animations and transitions
- [ ] Localization support

## Notes

- This is a demonstration app with **fake authentication**
- In production, implement proper OAuth with Amazon
- Ensure backend URL is accessible from your device
- Use HTTPS in production for security

## License

MIT
