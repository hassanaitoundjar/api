/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#E50914'; // Netflix red

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    
    // Not used in dark theme app
    accent: '#2f95dc',
    buttonPrimary: '#2f95dc',
    buttonSecondary: '#555',
    buttonDisabled: '#ccc',
    textPrimary: '#000',
    textSecondary: '#666',
    border: '#ddd',
    backgroundSecondary: '#f5f5f5',
    backgroundTertiary: '#eee',
    inputBackground: '#fff',
    error: '#d32f2f',
  },
  dark: {
    text: '#fff',
    background: '#121212', // Netflix dark
    tint: tintColorDark,
    tabIconDefault: '#666',
    tabIconSelected: tintColorDark,
    
    // Custom colors for our dark theme
    accent: '#E50914', // Netflix red
    buttonPrimary: '#E50914', // Netflix red
    buttonSecondary: '#333',
    buttonDisabled: '#222',
    textPrimary: '#fff',
    textSecondary: '#999',
    border: '#333',
    backgroundSecondary: '#1f1f1f',
    backgroundTertiary: '#292929',
    inputBackground: '#1f1f1f',
    error: '#CF6679',
  },
};
