import Header from "@/components/Header";
import CustomerInfo from "@/components/CustomerInfo";
import BillingTable from "@/components/BillingTable";
import TotalsSummary from "@/components/TotalsSummary";
import PaymentActions from "@/components/PaymentActions";
import Notification from "@/components/Notification";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Notification />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BillingTable />
          </div>
          
          <div className="space-y-6">
            <CustomerInfo />
            <TotalsSummary />
            <PaymentActions />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
