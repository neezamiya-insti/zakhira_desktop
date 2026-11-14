
import { useEffect, useState } from 'react';
import AppRoutes from './routes/AppRoutes';
import { supabase } from './lib/supabaseClient';

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
