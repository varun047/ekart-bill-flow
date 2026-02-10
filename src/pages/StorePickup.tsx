import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, ShoppingBag } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { STORE_INVENTORY, STORES, type InventoryItem } from "@/data/stores";
import { useToast } from "@/components/ui/use-toast";

type SelectedItem = {
  id: string;
  quantity: number;
};

const parsePrice = (price: string): number => {
  // Converts "₹620" to 620
  const numeric = price.replace(/[^\d.]/g, "");
  return Number(numeric || "0");
};

const StorePickup = () => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { toast } = useToast();

  const store = useMemo(() => STORES.find((s) => s.id === storeId), [storeId]);
  const inventory: InventoryItem[] = STORE_INVENTORY[storeId ?? ""] ?? [];

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const handleToggleItem = (itemId: string) => {
    setSelectedItems((current) => {
      const existing = current.find((i) => i.id === itemId);
      if (existing) {
        // Deselect item
        return current.filter((i) => i.id !== itemId);
      }
      return [...current, { id: itemId, quantity: 1 }];
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (Number.isNaN(quantity) || quantity <= 0) {
      setSelectedItems((current) => current.filter((i) => i.id !== itemId));
      return;
    }
    setSelectedItems((current) => {
      const existing = current.find((i) => i.id === itemId);
      if (!existing) {
        return [...current, { id: itemId, quantity }];
      }
      return current.map((i) => (i.id === itemId ? { ...i, quantity } : i));
    });
  };

  const selectedWithDetails = selectedItems
    .map((selection) => {
      const item = inventory.find((inv) => inv.id === selection.id);
      if (!item) return null;
      return { item, quantity: selection.quantity };
    })
    .filter(Boolean) as { item: InventoryItem; quantity: number }[];

  const subtotal = selectedWithDetails.reduce(
    (sum, { item, quantity }) => sum + parsePrice(item.price) * quantity,
    0,
  );
  const estimatedTax = Math.round(subtotal * 0.05); // simple 5% estimate
  const total = subtotal + estimatedTax;

  const handlePlaceOrder = () => {
    if (!store || selectedWithDetails.length === 0) return;

    toast({
      title: "Pickup order placed",
      description: `Your order for ${store.name} will be packed and ready at the pickup counter.`,
    });

    // In a real app, you would POST this to a backend instead of just navigating.
    navigate("/cart", {
      state: {
        pickupStoreId: store.id,
        pickupStoreName: store.name,
        pickupItems: selectedWithDetails.map(({ item, quantity }) => ({
          id: item.id,
          name: item.name,
          quantity,
          price: item.price,
        })),
        customerName: customerName || undefined,
        phone: phone || undefined,
      },
    });
  };

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-6 py-10 flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Store not found</p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Go back to home
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>

        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                Order & pick up
                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <ShoppingBag className="mr-1 h-3 w-3" />
                  {store.name}
                </span>
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{store.address}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr,1fr] items-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Select items from inventory</CardTitle>
              <CardDescription>
                Choose what you want us to pack. The store will prepare these items so you can simply pick them up.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {inventory.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No inventory data available for this store yet.
                </p>
              ) : (
                <div className="rounded-lg border bg-card divide-y divide-border overflow-hidden">
                  {inventory.map((item) => {
                    const selected = selectedItems.find((s) => s.id === item.id);
                    return (
                      <div key={item.id} className="grid grid-cols-[minmax(0,2fr),minmax(0,1fr)] gap-3 px-4 py-3 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.id)}
                          className={[
                            "text-left space-y-1 rounded-md px-1 py-0.5 transition-colors",
                            selected ? "bg-primary/5" : "",
                          ].join(" ")}
                        >
                          <p className="font-semibold text-foreground">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.category} · SKU {item.id.toUpperCase()}
                          </p>
                          <p className="text-[11px] text-primary font-medium">{item.location}</p>
                        </button>
                        <div className="text-right space-y-2">
                          <p className="font-semibold text-foreground">{item.price}</p>
                          <p className="text-[11px] text-muted-foreground">In stock: {item.stock}</p>
                          <div className="inline-flex items-center gap-1 justify-end">
                            <span className="text-[11px] text-muted-foreground">Qty</span>
                            <Input
                              type="number"
                              min={0}
                              max={item.stock}
                              value={selected?.quantity ?? ""}
                              onChange={(event) =>
                                handleQuantityChange(item.id, Number(event.target.value || "0"))
                              }
                              className="h-7 w-16 text-xs text-right px-2 py-1"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Pickup details</CardTitle>
                <CardDescription>Tell the store who will pick up and review your estimated bill.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Name for pickup</label>
                  <Input
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Contact number (optional)</label>
                  <Input
                    placeholder="e.g. 98765 43210"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>

                <div className="rounded-lg border bg-secondary/40 p-3 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items selected</span>
                    <span className="font-medium text-foreground">
                      {selectedWithDetails.length} item{selectedWithDetails.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated tax (5%)</span>
                    <span className="font-medium text-foreground">₹{estimatedTax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-1">
                    <span className="text-xs font-semibold text-foreground">Estimated total</span>
                    <span className="text-sm font-bold text-foreground">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={selectedWithDetails.length === 0}
                  onClick={handlePlaceOrder}
                >
                  Place pickup order
                </Button>

                <p className="text-[11px] text-muted-foreground">
                  The final bill may vary slightly based on exact weights, substitutions, and store-level offers.
                  You’ll pay at the pickup counter when you collect your packed order.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StorePickup;

