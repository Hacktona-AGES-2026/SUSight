import { Redirect } from 'expo-router';
import { useSession } from '../session';

export default function Index() {
  return <Redirect href={useSession().status === 'signedIn' ? '/home' : '/login'} />;
}
