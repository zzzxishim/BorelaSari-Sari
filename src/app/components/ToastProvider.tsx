import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)',
        },
      }}
    />
  );
}

