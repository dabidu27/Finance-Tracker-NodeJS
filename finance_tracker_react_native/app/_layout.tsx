import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>

        {/* hide the header for the entier tab section */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* hide the header for the other files*/}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="forgotpassword" options={{ headerShown: false }} />
        <Stack.Screen name="resetpassword" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
