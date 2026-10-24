import { useEffect } from 'react';
import { useSession } from '../session';
import { clearInboxCaptureHistory, startInboxCapture } from './capture';

/** A captura acompanha a sessão, mantendo a navegação e o Face ID existentes. */
export function NotificationBridge() {
  const { status } = useSession();
  useEffect(() => {
    if (status === 'signedIn') return startInboxCapture();
    if (status === 'signedOut') clearInboxCaptureHistory().catch(() => {});
  }, [status]);
  return null;
}
