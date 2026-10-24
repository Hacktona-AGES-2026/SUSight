import { Redirect } from 'expo-router';
import { useSession } from '../session';

export default function Index() {
  const { status } = useSession();
  if (status === 'loading') return null;
  return <Redirect href={status === 'signedOut' ? '/login' : '/home'} />;
}
