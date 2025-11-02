import { User, CreditCard, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

const CustomerInfo = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <Card className="p-6 space-y-4 animate-fade-in shadow-lg">
      <h2 className="text-xl font-semibold text-foreground mb-4">Customer Details</h2>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Customer Name</p>
            <p className="font-medium text-foreground">NEETU SOOD</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Cart ID</p>
            <p className="font-medium text-foreground font-mono">CART-2847</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium text-foreground">{currentDate}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-medium text-foreground">{currentTime}</p>
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Items in Cart</span>
          <span className="font-semibold text-lg text-primary">5</span>
        </div>
      </div>
    </Card>
  );
};

export default CustomerInfo;
