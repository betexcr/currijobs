import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { db } from './supabase-lightweight';

export type PushPayload = {
  screen?: string;
  params?: Record<string, any>;
  type?: 'offer' | 'cancel' | 'completed';
  taskId?: string;
};

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    if (!Device.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return null;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }
    return token;
  } catch {
    return null;
  }
}

export async function saveExpoPushToken(userId: string, token: string | null): Promise<boolean> {
  try {
    if (!token) return false;
    // Save to profiles.expo_push_token if the column exists; ignore errors
    await db.from('profiles').update({ expo_push_token: token }).eq('id', userId);
    return true;
  } catch {
    return false;
  }
}

export async function sendPushNotification(
  to: string | string[],
  title: string,
  body: string,
  data?: PushPayload
): Promise<void> {
  const tokens = Array.isArray(to) ? to : [to];
  if (tokens.length === 0) return;
  const messages = tokens
    .filter(t => typeof t === 'string' && t.startsWith('ExponentPushToken'))
    .map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));
  if (messages.length === 0) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
  } catch {
    // ignore best-effort
  }
}


