import { useLocation } from "react-router-dom";

import Header from "@/components/Header";
import CustomerInfo from "@/components/CustomerInfo";
import BillingTable, { type BillingItem } from "@/components/BillingTable";
import TotalsSummary from "@/components/TotalsSummary";
import PaymentActions from "@/components/PaymentActions";
import Notification from "@/components/Notification";
import Footer from "@/components/Footer";

type PickupCartState = {
  pickupItems?: { id: string; name: string; quantity: number; price: string | number }[];
};

const parsePrice = (price: string | number): number => {
  if (typeof price === "number") return price;
  const numeric = price.replace(/[^\d.]/g, "");
  return Number(numeric || "0");
};

const Index = () => {
  const location = useLocation();
  const state = (location.state || {}) as PickupCartState;

  let items: BillingItem[] = [];

  if (state.pickupItems && state.pickupItems.length > 0) {
    items = state.pickupItems.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: parsePrice(item.price),
    }));
  }

  const lastItemName = items.length > 0 ? items[items.length - 1]?.name : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {lastItemName && <Notification lastItemName={lastItemName} />}

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BillingTable items={items} />
          </div>

          <div className="space-y-6">
            <CustomerInfo />
            <TotalsSummary items={items} />
            <PaymentActions />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
