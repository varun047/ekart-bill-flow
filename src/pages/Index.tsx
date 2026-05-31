import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { 
  Wifi, WifiOff, Database, Settings, Trash2, 
  Loader2, RefreshCw, Clock, Tag, CreditCard, Sparkles, CheckCircle2
} from "lucide-react";

import Header from "@/components/Header";
import CustomerInfo from "@/components/CustomerInfo";
import BillingTable, { type BillingItem } from "@/components/BillingTable";
import TotalsSummary from "@/components/TotalsSummary";
import PaymentActions from "@/components/PaymentActions";
import Notification from "@/components/Notification";
import Footer from "@/components/Footer";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type PickupCartState = {
  storeId?: string;
  storeName?: string;
  cartCode?: string;
  connectSource?: "scan" | "manual";
  pickupItems?: { id: string; name: string; quantity: number; price: string | number }[];
};

interface RawCloudItem {
  uid: string;
  productName: string;
  price: number;
  timestamp: string;
}

const parsePrice = (price: string | number): number => {
  if (typeof price === "number") return price;
  const numeric = price.replace(/[^\d.]/g, "");
  return Number(numeric || "0");
};

const Index = () => {
  const location = useLocation();
  const state = (location.state || {}) as PickupCartState;
  const { toast } = useToast();

  // URL state loaded from LocalStorage or default
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem("ekart_gas_api_url") || "";
  });
  
  const [showConfig, setShowConfig] = useState(!apiUrl);
  const [isPolling, setIsPolling] = useState(!!apiUrl);
  const [pollingInterval, setPollingInterval] = useState(3000); // 3 seconds default
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "connected" | "error">("idle");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  // Data states
  const [rawScans, setRawScans] = useState<RawCloudItem[]>([]);
  const [items, setItems] = useState<BillingItem[]>([]);
  const [lastItemName, setLastItemName] = useState<string | undefined>(undefined);
  const [isClearing, setIsClearing] = useState(false);

  // Keep track of item counts to trigger toast notifications on new additions
  const prevItemsCountRef = useRef<number>(0);

  // Save API URL changes to localstorage
  const handleSaveUrl = (url: string) => {
    setApiUrl(url);
    localStorage.setItem("ekart_gas_api_url", url);
    toast({
      title: "API Endpoint Saved",
      description: "Smart cart will now poll from this Google Apps Script Web App.",
    });
    setIsPolling(true);
    setSyncStatus("connected");
  };

  // Fetch data from the Google Apps Script Web App
  const fetchCartData = async (silent = false) => {
    if (!apiUrl) return;
    
    if (!silent) setSyncStatus("syncing");
    
    try {
      // Append random parameter to bypass caching in some browsers
      const fetchUrl = `${apiUrl}?action=get&_t=${Date.now()}`;
      const response = await fetch(fetchUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const json = await response.json();
      
      if (json.status === "success") {
        const cloudData: RawCloudItem[] = json.data || [];
        setRawScans(cloudData);
        setLastSyncTime(new Date());
        setSyncStatus("connected");

        // Process and group the items
        // Google Sheet returns raw scans: UID, Product Name, Price, Timestamp
        // We group by UID (or name) to aggregate quantity and price
        const grouped = cloudData.reduce((acc: Record<string, BillingItem>, scan) => {
          const uid = scan.uid.trim();
          const name = scan.productName.trim();
          const price = Number(scan.price) || 0;

          if (!acc[uid]) {
            acc[uid] = {
              id: uid,
              name: name,
              quantity: 0,
              price: price
            };
          }
          acc[uid].quantity += 1;
          return acc;
        }, {});

        const itemsList = Object.values(grouped);
        setItems(itemsList);

        // Check if a new item was scanned to show notification
        if (cloudData.length > prevItemsCountRef.current) {
          const lastScan = cloudData[cloudData.length - 1];
          setLastItemName(lastScan.productName);
          
          // Trigger a beautiful audio-visual feedback (system toast)
          toast({
            title: `🔔 Scanned: ${lastScan.productName}`,
            description: `Added to cart at ₹${lastScan.price}. Total count: ${cloudData.length}`,
          });
        }
        
        prevItemsCountRef.current = cloudData.length;
      } else {
        throw new Error(json.message || "Failed to retrieve database contents.");
      }
    } catch (error: any) {
      console.error("Failed to sync with smart cart API:", error);
      setSyncStatus("error");
      // Stop polling on critical failure to prevent infinite spam errors
      setIsPolling(false);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to Google Apps Script. Check URL or network access.",
      });
    }
  };

  // Clear sheet data (Reset Cart)
  const handleClearCart = async () => {
    if (!apiUrl) return;
    
    setIsClearing(true);
    try {
      const clearUrl = `${apiUrl}?action=clear&_t=${Date.now()}`;
      const response = await fetch(clearUrl);
      const json = await response.json();
      
      if (json.status === "success") {
        toast({
          title: "Cart Reset Successful",
          description: "All products removed from the cloud database.",
        });
        setItems([]);
        setRawScans([]);
        prevItemsCountRef.current = 0;
        setLastItemName(undefined);
      } else {
        throw new Error(json.message || "Error clearing cloud sheet.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: error.message || "Could not clear the cart database.",
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Polling Effect
  useEffect(() => {
    // Initial fetch
    if (apiUrl && isPolling) {
      fetchCartData();
    }

    let intervalId: any;
    if (apiUrl && isPolling) {
      intervalId = setInterval(() => {
        fetchCartData(true);
      }, pollingInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [apiUrl, isPolling, pollingInterval]);

  // Fallback to state pickupItems if no API is connected yet
  useEffect(() => {
    if (!apiUrl && state.pickupItems && state.pickupItems.length > 0) {
      const staticItems = state.pickupItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parsePrice(item.price),
      }));
      setItems(staticItems);
    }
  }, [apiUrl, state.pickupItems]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      
      {lastItemName && <Notification lastItemName={lastItemName} />}

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">
        
        {/* Connection status and Config bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              syncStatus === "connected" ? "bg-emerald-50 text-emerald-600 animate-pulse" :
              syncStatus === "syncing" ? "bg-amber-50 text-amber-600" :
              syncStatus === "error" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"
            }`}>
              {syncStatus === "connected" ? <Wifi className="w-5 h-5" /> : 
               syncStatus === "error" ? <WifiOff className="w-5 h-5" /> : 
               <RefreshCw className={`w-5 h-5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {state.cartCode ? `Cart ID: ${state.cartCode}` : "Smart Cart Sync Panel"}
                </span>
                <Badge variant={syncStatus === "connected" ? "default" : "secondary"}>
                  {syncStatus === "connected" ? "Live Connected" : 
                   syncStatus === "syncing" ? "Syncing..." : 
                   syncStatus === "error" ? "Network Offline" : "Disconnected"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Database className="w-3.5 h-3.5" />
                {apiUrl ? "Syncing with Google Sheets Database" : "Using offline / dummy dataset"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {apiUrl && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsPolling(!isPolling)}
                  className="text-xs h-9"
                >
                  {isPolling ? "Pause Live Poll" : "Resume Poll"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fetchCartData()} 
                  disabled={syncStatus === "syncing"}
                  className="h-9"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                  Sync Now
                </Button>
              </>
            )}
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setShowConfig(!showConfig)}
              className="h-9"
            >
              <Settings className="w-3.5 h-3.5 mr-1" />
              API Settings
            </Button>
          </div>
        </div>

        {/* Expandable Configuration Card */}
        {showConfig && (
          <Card className="mb-8 border-2 border-primary/20 shadow-md animate-slide-down">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Google Apps Script Web App Connection Setup
              </CardTitle>
              <CardDescription>
                Provide the Google Script Executable URL below to link your live hardware database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="flex-1 font-mono text-xs"
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleSaveUrl(apiUrl)} className="text-xs">
                    Save & Test
                  </Button>
                  {apiUrl && (
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        setApiUrl("");
                        localStorage.removeItem("ekart_gas_api_url");
                        setItems([]);
                        setRawScans([]);
                        setIsPolling(false);
                        setSyncStatus("idle");
                        toast({ title: "Configuration reset to default" });
                      }}
                      className="text-xs"
                    >
                      Disconnect
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                <strong>Deployment Guide:</strong> Publish your Apps Script code as a <em>Web App</em>. Configure access to <em>"Anyone"</em>, copy the web app URL, and paste it here.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary Billing Items Table */}
            <BillingTable items={items} />

            {/* Live Scans History Feed (Adds a production feel for students) */}
            {apiUrl && (
              <Card className="shadow-md">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        RFID Scan Activity Log
                      </CardTitle>
                      <CardDescription>
                        Timeline of raw scans received from the ESP32 cart reader.
                      </CardDescription>
                    </div>
                    {rawScans.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleClearCart} 
                        disabled={isClearing}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs h-8"
                      >
                        {isClearing ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                        )}
                        Clear Cart
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {rawScans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                      <Tag className="w-8 h-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Waiting for RFID scan signals...</p>
                      <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                        When the ESP32 scans an RFID tag, it will publish the transaction to the sheet and append here instantly.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[260px] overflow-y-auto divide-y divide-border font-mono text-xs">
                      {rawScans.map((scan, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/80 transition-all">
                          <div className="flex items-center gap-2.5">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-primary font-bold text-[10px]">
                              {rawScans.length - i}
                            </span>
                            <div>
                              <div className="font-semibold text-foreground">{scan.productName}</div>
                              <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <span>Tag UID: <strong className="text-slate-600">{scan.uid}</strong></span>
                                <span>•</span>
                                <span>{scan.timestamp}</span>
                              </div>
                            </div>
                          </div>
                          <div className="font-semibold text-primary">₹{scan.price.toFixed(2)}</div>
                        </div>
                      )).reverse() /* Show newest scan first */}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Smart Project Showcase Footer Badge */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <div>
                  <h4 className="text-xs font-semibold text-foreground">B.Tech Major Project Integration Mode</h4>
                  <p className="text-[11px] text-muted-foreground">IoT-Based Smart RFID Shopping Cart Using ESP32 and Website Integration</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-background text-[10px] tracking-wide border-primary/20 text-primary py-1">
                ESP32 HW SYNC ENABLED
              </Badge>
            </div>

          </div>

          <div className="space-y-6">
            {/* Dynamic Customer Info Block */}
            <CustomerInfo 
              cartId={state.cartCode || (apiUrl ? "CART-LIVE" : "CART-OFFLINE")} 
              itemCount={rawScans.length || items.reduce((sum, item) => sum + item.quantity, 0)} 
            />
            
            {/* Totals Calculation Board */}
            <TotalsSummary items={items} />
            
            {/* Pay Operations */}
            <PaymentActions />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
