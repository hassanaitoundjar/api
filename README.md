# IPTV Xtream Player

A modern Netflix-style IPTV player app built with Expo (React Native) that supports both Xtream Codes and M3U playlist formats.

## Features

- **Multiple Login Methods**: 
  - Xtream Codes API (Server URL, Username, Password)
  - M3U URL Playlist
  
- **Multi-User Profile System**:
  - Save multiple IPTV accounts/playlists
  - Quick profile switching
  - Delete profiles
  
- **Modern Netflix-inspired UI**:
  - Dark theme optimized for TV viewing
  - Smooth animations and transitions
  - User-friendly interface

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- A physical device or emulator for testing

### Installation

1. Clone this repository:
```
git clone https://github.com/yourusername/iptv-xtream-player.git
cd iptv-xtream-player
```

2. Install dependencies:
```
npm install
```

3. Start the Expo development server:
```
npx expo start
```

4. Scan the QR code with the Expo Go app (Android) or the Camera app (iOS) to run the app on your device.

## Built With

- [Expo](https://expo.dev/) - React Native framework
- [React Navigation](https://reactnavigation.org/) - Navigation library
- [React Hook Form](https://react-hook-form.com/) - Form validation
- [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/) - Secure storage
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - Local storage
- [Yup](https://github.com/jquense/yup) - Schema validation

## IPTV Specifics

This app supports:

- **Xtream Codes Login**: Authenticate with IPTV providers using the Xtream Codes API
- **M3U Playlist Support**: Load playlists from M3U URLs
- **Playlist Management**: Add multiple playlists and switch between them

## Privacy & Security

- Credentials are stored securely on the device
- No data is sent to any servers except to authenticate with your IPTV provider
- No analytics or tracking

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application is for educational purposes only. Users should only use this with content they have legal rights to access.
