import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X } from 'lucide-react';

interface ApiLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  api: {
    id: string;
    name: string;
    color: string;
  } | null;
}

const API_LOGOS = {
  Amazon: (
    <svg viewBox="0 0 603 182" className="h-10 w-auto">
      <g fill="currentColor">
        <path d="M374.3 141.6c-31.7 23.4-77.7 35.8-117.3 35.8-55.5 0-105.5-20.5-143.3-54.7-3-2.7-.3-6.3 3.3-4.2 41 23.9 91.7 38.3 144.1 38.3 35.3 0 74.1-7.3 109.9-22.5 5.4-2.3 9.9 3.5 4.6 7.3z"/>
        <path d="M387.5 126.3c-4-5.2-26.9-2.5-37.1-1.3-3.1.4-3.6-2.3-.8-4.3 18.2-12.8 48-9.1 51.5-4.8 3.5 4.3-.9 34.3-18 48.6-2.6 2.2-5.1 1-3.9-1.9 3.8-9.4 12.3-30.5 8.3-36.3z"/>
        <path d="M347.4 20.3v-12c0-1.8 1.4-3 2.9-3h51.7c1.6 0 2.9 1.3 2.9 3v10.3c0 1.7-1.4 3.9-3.9 7.4l-26.8 38.3c10-.2 20.5 1.2 29.5 6.3 2 1.1 2.6 2.8 2.7 4.4v12.8c0 1.8-1.9 3.8-3.9 2.7-16.6-8.7-38.6-9.7-57 .1-1.8 1-3.8-1-3.8-2.8v-12.2c0-1.9.1-5.2 1.9-8.1l31-44.5h-27c-1.7 0-3-1.2-3-2.9zM125.4 90.2h-16.3c-1.6-.1-2.8-1.3-2.9-2.8V8.2c0-1.7 1.4-3 3.1-3h15.2c1.6.1 2.8 1.4 2.9 2.9v10.6h.3c3.9-10.5 11.1-15.2 20.9-15.2 9.9 0 16.1 4.7 20.6 15.2 3.9-10.5 12.8-15.2 21.9-15.2 6.7 0 14 2.7 18.4 8.8 5 6.9 4 17 4 25.8v52.4c0 1.7-1.4 3-3.1 3h-16.3c-1.6-.1-2.9-1.4-2.9-3V38.9c0-3.5.3-12.1-.5-15.4-1.2-5.5-4.8-7.1-9.5-7.1-3.9 0-8 2.6-9.6 6.8-1.7 4.2-1.5 11.2-1.5 15.7v48.6c0 1.7-1.4 3-3.1 3h-16.3c-1.6-.1-2.9-1.4-2.9-3l-.1-48.6c0-10.2 1.7-25.3-10-25.3-11.8 0-11.4 15.5-11.4 25.3v48.6c-.1 1.7-1.5 3-3.2 3zM532.1 3.3c24.2 0 37.3 20.8 37.3 47.3 0 25.6-14.5 45.9-37.3 45.9-23.8 0-36.7-20.8-36.7-46.8 0-26.1 13.1-46.4 36.7-46.4zm.1 17.1c-12 0-12.8 16.4-12.8 26.6 0 10.3-.2 32.1 12.6 32.1 12.7 0 13.3-17.7 13.3-28.5 0-7.1-.3-15.5-2.1-22.2-1.5-5.8-4.5-8-10.9-8zm67.4 69.8h-16.2c-1.6-.1-2.9-1.4-2.9-3l-.1-79.3c.1-1.6 1.4-2.8 3-2.8h15.1c1.4 0 2.6 1 2.9 2.3v12.3h.3c4.5-11 10.8-16.3 21.6-16.3 7.1 0 14.1 2.6 18.6 9.5 4.2 6.4 4.2 17.2 4.2 24.9v50.5c-.2 1.5-1.5 2.7-3 2.7h-16.3c-1.4-.1-2.6-1.1-2.8-2.5V42.8c0-10-1.2-24.8-11.1-24.8-4.3 0-8.3 2.9-10.3 7.3-2.5 5.5-2.8 11-2.8 17.1v44.8c-.3 1.7-1.6 3-3.2 3zM268.5 53.2c0 11.9.3 21.8-5.7 32.4-4.9 8.5-12.6 13.8-21.2 13.8-11.8 0-18.7-9-18.7-22.3 0-26.2 23.5-31 45.7-31v7.1zm16.4 36.8c-1.1.9-2.6 1-3.8.4-5.4-4.5-6.3-6.5-9.3-10.8-8.9 9-15.1 11.7-26.6 11.7-13.6 0-24.1-8.4-24.1-25.2 0-13.1 7.1-22.1 17.3-26.4 8.8-3.9 21.1-4.6 30.5-5.7v-2.1c0-3.9.3-8.4-2-11.9-2-3.1-5.9-4.4-9.4-4.4-6.4 0-12.1 3.3-13.5 10.1-.3 1.5-1.4 3-2.9 3.1l-15.8-1.7c-1.4-.3-2.9-1.4-2.5-3.5 3.7-19.5 21.3-25.4 37.1-25.4 8.1 0 18.6 2.1 25 8.2 8.1 7.6 7.3 17.8 7.3 28.9v26.2c0 7.9 3.3 11.3 6.4 15.6 1.1 1.5 1.3 3.3-.1 4.4-3.5 3-9.8 8.4-13.2 11.5l-.1-.1zm-95.2-73.2v-9.4c0-1.4 1.1-2.5 2.5-2.6h44.8c1.4.1 2.6 1.2 2.6 2.6v8.1c0 1.4-.8 3.3-2.2 6.3l-23.2 33.2c8.6-.2 17.7 1.1 25.5 5.4 1.8.9 2.3 2.3 2.4 3.7v10.1c0 1.4-1.5 3-3.1 2.1-13.1-6.9-30.5-7.6-45 .1-1.4.8-3-.7-3-2.2v-9.6c0-1.6.1-4.3 1.6-6.7l26.9-38.5h-23.4c-1.4-.1-2.5-1.2-2.5-2.6z"/>
      </g>
    </svg>
  ),
  DoorDash: <span className="text-2xl">DoorDash</span>,
  Instacart: <span className="text-2xl">Instacart</span>,
  Uber: <span className="text-2xl">Uber</span>,
  Target: (
    <svg viewBox="0 0 200 200" className="h-10 w-10">
      <circle cx="100" cy="100" r="90" fill="currentColor"/>
      <circle cx="100" cy="100" r="70" fill="white"/>
      <circle cx="100" cy="100" r="50" fill="currentColor"/>
      <circle cx="100" cy="100" r="30" fill="white"/>
      <circle cx="100" cy="100" r="10" fill="currentColor"/>
    </svg>
  ),
  Starbucks: (
    <svg viewBox="0 0 200 200" className="h-10 w-10">
      <circle cx="100" cy="100" r="90" fill="currentColor"/>
      <text x="100" y="120" textAnchor="middle" fill="white" fontSize="80">★</text>
    </svg>
  ),
};

const BRAND_COLORS = {
  Amazon: '#FF9900',
  DoorDash: '#FF3008',
  Instacart: '#43B02A',
  Uber: '#000000',
  Target: '#CC0000',
  Starbucks: '#00704A',
};

export function ApiLoginModal({ isOpen, onClose, onLoginSuccess, api }: ApiLoginModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login process
    setTimeout(() => {
      onLoginSuccess();
      onClose();
    }, 1000);
  };

  const logo = API_LOGOS[api?.name as keyof typeof API_LOGOS] || <span className="text-2xl">{api?.name}</span>;
  const primaryColor = BRAND_COLORS[api?.name as keyof typeof BRAND_COLORS] || api?.color;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogDescription className="sr-only">
          Sign in to {api?.name} to link your account and verify your identity
        </DialogDescription>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Logo Section */}
        <div className="flex items-center justify-center py-8 border-b border-slate-200" style={{ color: primaryColor }}>
          {logo}
        </div>

        {/* Content Section */}
        <div className="px-8 py-6">
          <DialogTitle className="mb-6">Sign in or create account</DialogTitle>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block">
                Enter mobile number or email
              </label>
              <Input
                id="email"
                type="text"
                className="border-cyan-500 focus:border-cyan-500 focus:ring-cyan-500"
                placeholder=""
              />
            </div>

            <Button
              type="submit"
              className="w-full text-black hover:opacity-90"
              style={{ backgroundColor: primaryColor === '#000000' ? '#000000' : '#FFD814' }}
            >
              Continue
            </Button>

            <p className="text-xs text-slate-600">
              By continuing, you agree to {api?.name}'s{' '}
              <a href="#" className="text-blue-600 hover:underline hover:text-orange-600">
                Conditions of Use
              </a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:underline hover:text-orange-600">
                Privacy Notice
              </a>
              .
            </p>

            <a href="#" className="text-blue-600 hover:underline hover:text-orange-600 text-sm block mt-4">
              Need help?
            </a>

            <div className="border-t border-slate-300 my-6" />

            <div>
              <p className="text-slate-600 mb-2">Buying for work?</p>
              <a href="#" className="text-blue-600 hover:underline hover:text-orange-600 text-sm">
                Create a free business account
              </a>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}