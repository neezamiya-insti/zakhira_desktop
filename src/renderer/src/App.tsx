
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { supabase } from './lib/supabaseClient';

function PasswordRecoveryLinkHandler(): null {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const processRecoveryLink = async (deepLink: string): Promise<void> => {
      if (!active) return;

      try {
        const url = new URL(deepLink);
        const query = url.searchParams;
        const hash = new URLSearchParams(url.hash.slice(1));
        const errorDescription =
          query.get('error_description') || hash.get('error_description');

        if (errorDescription) {
          navigate('/reset-password', {
            replace: true,
            state: { recoveryError: 'invalid_link' },
          });
          return;
        }

        const code = query.get('code');
        const accessToken = hash.get('access_token');
        const refreshToken = hash.get('refresh_token');
        const recoveryType = query.get('type') || hash.get('type');

        if (recoveryType && recoveryType !== 'recovery') {
          navigate('/reset-password', {
            replace: true,
            state: { recoveryError: 'invalid_link' },
          });
          return;
        }

        const { error } = code
          ? await supabase.auth.exchangeCodeForSession(code)
          : accessToken && refreshToken
            ? await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
            : { error: new Error('Recovery link has no session credentials') };

        if (!active) return;

        navigate('/reset-password', {
          replace: true,
          state: { recoveryError: error ? 'invalid_link' : undefined },
        });
      } catch (error) {
        console.error('Could not process password recovery link:', error);
        if (active) {
          navigate('/reset-password', {
            replace: true,
            state: { recoveryError: 'invalid_link' },
          });
        }
      }
    };

    const unsubscribe = window.electronAPI.onAuthDeepLink((url) => {
      void processRecoveryLink(url);
    });

    const pendingLinkTimer = window.setTimeout(() => {
      void window.electronAPI
        .getPendingAuthDeepLink()
        .then((url) => {
          if (url) void processRecoveryLink(url);
        })
        .catch((error: unknown) => {
          console.error('Could not retrieve password recovery link:', error);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(pendingLinkTimer);
      unsubscribe();
    };
  }, [navigate]);

  return null;
}

export default function App(): React.JSX.Element {
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkConnection = async (): Promise<void> => {
      try {
        const { error } = await supabase
          .from('businesses')
          .select('id')
          .limit(1);

        if (!isMounted) return;

        if (error) {
          console.error('Supabase Connection Error:', error);
          setStatus('Database Connection Failed!');
          setIsError(true);
        } else {
          console.log('Supabase Connected Successfully!');
          setStatus('Database Connected Successfully!');
          setIsError(false);
        }

        setShowPopup(true);

        // Popup automatically hide after 3 seconds
        setTimeout(() => {
          if (isMounted) {
            setShowPopup(false);
          }
        }, 3000);

      } catch (err) {
        if (!isMounted) return;

        console.error('Supabase Error:', err);
        setStatus('Unable to connect to database!');
        setIsError(true);
        setShowPopup(true);

        setTimeout(() => {
          if (isMounted) {
            setShowPopup(false);
          }
        }, 3000);
      }
    };

    checkConnection();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <PasswordRecoveryLinkHandler />
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            padding: '14px 22px',
            borderRadius: '10px',
            background: isError ? '#fee2e2' : '#dcfce7',
            color: isError ? '#991b1b' : '#166534',
            border: `1px solid ${isError ? '#fca5a5' : '#86efac'}`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
            fontSize: '14px',
            fontWeight: 600,
            animation: 'popupFadeIn 0.3s ease',
          }}
        >
          {isError ? '❌ ' : '✅ '}
          {status}
        </div>
      )}

      <AppRoutes />

      <style>
        {`
          @keyframes popupFadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </>
  );
}
