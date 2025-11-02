import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { billingItems } from "@/components/BillingTable";

const TotalsSummary = () => {
  // Compute totals from the shared billingItems list
  const subtotal = billingItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const grandTotal = subtotal + tax;

  return (
    <Card className="p-6 shadow-lg animate-fade-in">
      <h3 className="text-xl font-semibold text-foreground mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Tax (8%)</span>
          <span className="font-medium text-foreground">{formatCurrency(tax)}</span>
        </div>
        
        <Separator className="my-3" />
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-semibold text-foreground">Grand Total</span>
          <span className="text-2xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-success/10 rounded-lg border border-success/20">
        <div className="flex justify-between items-center">
          <span className="text-sm text-success font-medium">You're saving</span>
          <span className="text-lg font-semibold text-success">{formatCurrency(4.5)}</span>
        </div>
      </div>
    </Card>
  );
};

export default TotalsSummary;
