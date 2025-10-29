import { Button } from "@/components/ui/button";
import { CreditCard, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PaymentActions = () => {
  const { toast } = useToast();

  const handleProceedToPay = () => {
    toast({
      title: "Processing Payment",
      description: "Redirecting to payment gateway...",
    });
  };

  const handleDownloadBill = () => {
    toast({
      title: "Downloading Bill",
      description: "Your bill PDF will be downloaded shortly.",
    });
  };

  return (
    <div className="space-y-3 animate-slide-up">
      <Button 
        onClick={handleProceedToPay}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all"
      >
        <CreditCard className="w-5 h-5 mr-2" />
        Proceed to Pay
      </Button>
      
      <Button 
        onClick={handleDownloadBill}
        variant="outline"
        className="w-full h-12 text-base font-medium border-2 hover:bg-secondary"
      >
        <Download className="w-5 h-5 mr-2" />
        Download Bill (PDF)
      </Button>
    </div>
  );
};

export default PaymentActions;
