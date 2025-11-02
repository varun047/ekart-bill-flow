import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export interface BillingItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// Shared sample billing items (source of truth for table + totals)
export const billingItems: BillingItem[] = [
  { id: "RFID-001", name: "Organic Milk (1L)", quantity: 2, price: 60 },
  { id: "RFID-002", name: "Whole Wheat Bread", quantity: 1, price: 50 },
  { id: "RFID-003", name: "Fresh Bananas (1kg)", quantity: 3, price: 150 },
  { id: "RFID-004", name: "Greek Yogurt", quantity: 2, price: 30 },
  { id: "RFID-005", name: "Orange Juice (2L)", quantity: 1, price: 200 },
];

const BillingTable = () => {
  const items = billingItems;

  return (
    <Card className="p-6 shadow-lg animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Shopping Cart Items</h2>
        <Badge variant="secondary" className="px-4 py-1 text-sm">
          {items.length} items
        </Badge>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-2">
              <TableHead className="font-semibold text-foreground">Item ID</TableHead>
              <TableHead className="font-semibold text-foreground">Product Name</TableHead>
              <TableHead className="text-center font-semibold text-foreground">Quantity</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Price/Item</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow 
                key={item.id} 
                className="hover:bg-muted/50 transition-colors animate-slide-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <TableCell className="font-mono text-sm text-muted-foreground">{item.id}</TableCell>
                <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-medium">
                    {item.quantity}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(item.price)}
                </TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  {formatCurrency(item.quantity * item.price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default BillingTable;
