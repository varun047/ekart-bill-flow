import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, ShoppingBag, Car, Box } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { STORE_CARTS, STORE_INVENTORY, STORES, type CartInfo, type InventoryItem } from "@/data/stores";

const getStatusStyles = (status: CartInfo["status"]) => {
  if (status === "available") {
    return {
      badge: "bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
      label: "Available",
    };
  }
  if (status === "in_use") {
    return {
      badge: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
      label: "In use",
    };
  }
  return {
    badge: "bg-slate-100 text-slate-700",
    dot: "bg-slate-500",
    label: "Offline / charging",
  };
};

const StoreDetails = () => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();

  const store = useMemo(() => STORES.find((s) => s.id === storeId), [storeId]);
  const inventory: InventoryItem[] = STORE_INVENTORY[storeId ?? ""] ?? [];
  const carts: CartInfo[] = STORE_CARTS[storeId ?? ""] ?? [];

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-6 py-10 flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Store not found</p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Go back to stores
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
          Back to nearby stores
        </button>

        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                {store.name}
                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <ShoppingBag className="mr-1 h-3 w-3" />
                  EKART ID: {store.ekartId}
                </span>
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{store.address}</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>{store.distance} away</span>
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
                    store.isOpen ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "mr-1 h-1.5 w-1.5 rounded-full",
                      store.isOpen ? "bg-emerald-500" : "bg-slate-400",
                    ].join(" ")}
                  />
                  {store.isOpen ? "Open now" : "Closed"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/stores/${store.id}/pickup`)}
                >
                  <Box className="h-3.5 w-3.5 mr-1" />
                  Order & pick up
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`,
                      "_blank",
                    )
                  }
                >
                  <Car className="h-3.5 w-3.5 mr-1" />
                  Drive there
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/cart", { state: { storeId: store.id } })}
                >
                  Go to billing
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr] items-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Inventory & locations</CardTitle>
              <CardDescription>
                Browse key items with price, stock and the exact aisle / shelf location to help shoppers and staff.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {inventory.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No inventory data available for this store yet.</p>
              ) : (
                <div className="divide-y divide-border rounded-lg border bg-card overflow-hidden">
                  {inventory.map((item) => (
                    <div key={item.id} className="grid grid-cols-[minmax(0,2fr),minmax(0,1fr)] gap-3 px-4 py-3 text-xs">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.category} · SKU {item.id.toUpperCase()}
                        </p>
                        <p className="text-[11px] text-primary font-medium">{item.location}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold text-foreground">{item.price}</p>
                        <p className="text-[11px] text-muted-foreground">In stock: {item.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Smart EKART carts</CardTitle>
              <CardDescription>Live status and locations of all EKART-enabled carts in this store.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {carts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No smart carts registered for this store yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {carts.map((cart) => {
                    const styles = getStatusStyles(cart.status);
                    return (
                      <div key={cart.id} className="rounded-lg border bg-card px-3 py-2.5 text-xs space-y-1 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">{cart.label}</span>
                          <span
                            className={["inline-flex items-center rounded-full px-2 py-0.5", styles.badge].join(" ")}
                          >
                            <span className={["mr-1 h-1.5 w-1.5 rounded-full", styles.dot].join(" ")} />
                            {styles.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{cart.location}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StoreDetails;

