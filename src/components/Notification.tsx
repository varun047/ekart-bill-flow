import { X, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

interface NotificationProps {
  lastItemName?: string;
}

const Notification = ({ lastItemName }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible || !lastItemName) return null;

  return (
    <div className="fixed top-20 right-6 z-50 animate-slide-in">
      <div className="bg-card border border-border rounded-lg shadow-xl p-4 flex items-start gap-3 min-w-[300px] max-w-md">
        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-success" />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">Item added</h4>
          <p className="text-sm text-muted-foreground">
            {lastItemName} has been added to your cart.
          </p>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
