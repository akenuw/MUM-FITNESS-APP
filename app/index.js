import { Redirect } from 'expo-router';
import { Storage } from '@/utils/storage';

export default function Index() {
  const token = Storage.get('authToken', null);
  if (token) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/login" />;
}
