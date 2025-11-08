import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Shield } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function VerificationModal({ isOpen, onClose, onContinue }: VerificationModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
          <DialogTitle className="text-center">Welcome to WingsPay</DialogTitle>
          <DialogDescription className="text-center text-slate-600">
            Use your login credentials to verify your identity and show you custom payment plans
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="your@email.com"
              defaultValue="example@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="+1 (555) 000-0000"
              defaultValue="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input 
              id="dob" 
              type="text" 
              placeholder="MM/DD/YYYY"
              defaultValue="01/01/1990"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ssn">Last 4 of SSN</Label>
            <Input 
              id="ssn" 
              type="text" 
              placeholder="****"
              defaultValue="1234"
              maxLength={4}
            />
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
            Continue to verification
          </Button>

          <p className="text-xs text-center text-slate-500">
            By continuing, you agree to WingsPay's{' '}
            <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}