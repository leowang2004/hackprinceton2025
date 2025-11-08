import { Button } from './ui/button';
import { CheckCircle2, Download, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';

interface SuccessScreenProps {
  isVisible: boolean;
  onStartOver: () => void;
}

export function SuccessScreen({ isVisible, onStartOver }: SuccessScreenProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>

        <div>
          <h1 className="mb-2">Payment Approved!</h1>
          <p className="text-slate-600">
            Your order has been confirmed and will be delivered tomorrow
          </p>
        </div>

        <Card className="p-6 text-left space-y-4">
          <div className="flex justify-between">
            <span className="text-slate-600">Order Number</span>
            <span>#FP-2024-8456</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Payment Plan</span>
            <span>Pay in 4</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">First Payment</span>
            <span>$156.25 on Nov 22, 2025</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Total Amount</span>
            <span>$624.99</span>
          </div>
        </Card>

        <div className="space-y-3">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
            View Order Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>

          <Button 
            variant="ghost" 
            className="w-full text-slate-600"
            onClick={onStartOver}
          >
            Start New Order
          </Button>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <p className="text-slate-600 mb-2">What's next?</p>
          <div className="space-y-2 text-left">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-600">1</span>
              </div>
              <div className="text-slate-600">
                Track your package in the WingsPay app
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-600">2</span>
              </div>
              <div className="text-slate-600">
                We'll remind you before each payment
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-600">3</span>
              </div>
              <div className="text-slate-600">
                Pay early anytime with no penalties
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}