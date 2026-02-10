import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ShoppingBag, Wifi, QrCode, Keyboard, Box } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STORES, type Store } from "@/data/stores";

const Home = () => {
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState<Store | null>(STORES[0] ?? null);
  const [cartCode, setCartCode] = useState("");

  const handleConnect = (source: "scan" | "manual") => {
    // In a real app, you would validate the cart / store connection here.
    // For now we simply navigate to the billing/cart experience.
    navigate("/cart", {
      state: {
        storeId: selectedStore?.id,
        storeName: selectedStore?.name,
        cartCode: cartCode || undefined,
        connectSource: source,
      },
    });
  };

  const handleSubmitManual = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartCode.trim()) return;
    handleConnect("manual");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-10 space-y-10">
        <section className="grid gap-8 lg:grid-cols-[1.6fr,1.1fr] items-start">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground w-fit">
              <Wifi className="h-3 w-3 text-primary" />
              EKART smart billing is available near you
            </p>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                Connect to a{" "}
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  smart EKART
                </span>{" "}
                cart before you start shopping.
              </h1>
              <p className="text-muted-foreground max-w-xl">
                Choose a nearby store that supports EKART and instantly pair with a smart cart using camera
                scanning or a simple manual code. Your billing will update live as you shop.
              </p>
            </div>

            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="h-5 w-5 text-primary" />
                    Nearby EKART stores
                  </CardTitle>
                  <CardDescription>Stores around you that already run EKART smart billing.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  Update location
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {STORES.map((store) => {
                    const isSelected = store.id === selectedStore?.id;
                    return (
                      <button
                        type="button"
                        key={store.id}
                        onClick={() => {
                          setSelectedStore(store);
                          navigate(`/stores/${store.id}`);
                        }}
                        className={[
                          "w-full rounded-lg border px-4 py-3 text-left transition-all flex items-center justify-between gap-4",
                          "hover:border-primary/60 hover:bg-primary/5",
                          isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card",
                        ].join(" ")}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{store.name}</span>
                            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              <ShoppingBag className="mr-1 h-3 w-3" />
                              EKART ID: {store.ekartId}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{store.address}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-xs">
                          <span className="font-medium text-muted-foreground">{store.distance}</span>
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
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-muted-foreground">
                  Don’t see your favourite store? Ask them to enable EKART smart carts and link their billing
                  counters.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  Connect to an EKART cart
                </CardTitle>
                <CardDescription>
                  Pair your phone or kiosk with a smart cart to start live billing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="scan" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="scan" className="flex-1">
                      <QrCode className="mr-2 h-4 w-4" />
                      Scan code
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="flex-1">
                      <Keyboard className="mr-2 h-4 w-4" />
                      Enter code
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="scan" className="space-y-4 pt-4">
                    <div className="rounded-xl border border-dashed bg-secondary/40 p-6 text-center space-y-3">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <QrCode className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Point your camera at the EKART QR code</p>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                          Each smart cart has a unique QR / barcode near the handle. Scan it to instantly pair
                          and open the live bill.
                        </p>
                      </div>
                    </div>

                    <Button className="w-full" size="lg" onClick={() => handleConnect("scan")}>
                      Start scanning & connect
                    </Button>

                    <p className="text-[11px] text-muted-foreground">
                      Camera access and hardware integration can be wired here in the next step. For now this
                      button will take you to the live billing view.
                    </p>
                  </TabsContent>

                  <TabsContent value="manual" className="space-y-4 pt-4">
                    <form className="space-y-4" onSubmit={handleSubmitManual}>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Enter cart or kiosk code
                        </label>
                        <Input
                          value={cartCode}
                          onChange={(event) => setCartCode(event.target.value.toUpperCase())}
                          placeholder="e.g. EK-482917"
                          maxLength={12}
                          className="tracking-[0.18em] text-center text-sm font-semibold"
                        />
                        <p className="text-xs text-muted-foreground">
                          You’ll usually find this printed near the EKART device or on the smart cart handle.
                        </p>
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={!cartCode.trim()}>
                        Connect using code
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Box className="h-5 w-5 text-primary" />
                  Order & pick up
                </CardTitle>
                <CardDescription>
                  Select items from store inventory in advance and let the staff pack and bill them. You just
                  pick up from the counter.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <p>
                  We’ll show you the available items and their locations for{" "}
                  <span className="font-medium text-foreground">
                    {selectedStore?.name ?? "your selected store"}
                  </span>
                  .
                </p>
                <Button
                  className="w-full"
                  size="sm"
                  variant="outline"
                  disabled={!selectedStore}
                  onClick={() => {
                    if (!selectedStore) return;
                    navigate(`/stores/${selectedStore.id}/pickup`);
                  }}
                >
                  Start order & pick up
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-3 py-4 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">How EKART connection works</span>
                </div>
                <ol className="space-y-1.5 list-decimal list-inside">
                  <li>Select the store you are currently shopping in.</li>
                  <li>Connect to a smart cart using scan or manual code.</li>
                  <li>Your cart items and bill will appear in real-time on the next screen.</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;

