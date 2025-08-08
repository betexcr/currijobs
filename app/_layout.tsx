import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LocalizationProvider, useLocalization } from '../contexts/LocalizationContext';

export default function Layout() {
  return (
    <LocalizationProvider>
      <ThemeProvider>
        <AuthProvider>
        <LocalizedStack />
        </AuthProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

function LocalizedStack() {
  const { t } = useLocalization();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#1E3A8A' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: t('back' as any) || 'Back',
      }}
    >
          <Stack.Screen 
            name="welcome" 
            options={{ 
              title: t('welcomeToCurriJobs'),
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="index" 
            options={{ 
              title: t('mapView'),
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="tasks" 
            options={{ 
              title: t('taskList'),
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="profile" 
            options={{ 
              title: t('profile'),
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="settings" 
            options={{ 
              title: t('settings'),
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="wallet" 
            options={{ 
              title: t('wallet' as any) || 'Wallet',
              headerShown: false 
            }} 
          />
          <Stack.Screen
            name="payment/[id]"
            options={{
              title: t('paymentDetails' as any) || 'Payment Details',
              headerShown: true,
            }}
          />
          <Stack.Screen 
            name="login" 
            options={{ 
              title: t('login'),
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="register" 
            options={{ 
              title: t('signUp'),
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="create-task" 
            options={{ 
              title: t('createTask'),
              headerShown: true 
            }} 
          />
          <Stack.Screen 
            name="task/[id]" 
            options={{ 
              title: t('viewDetails'),
              headerShown: true 
            }} 
          />
          <Stack.Screen 
            name="make-offer" 
            options={{ 
              title: t('makeOffer'),
              headerShown: true 
            }} 
          />
    </Stack>
  );
}
