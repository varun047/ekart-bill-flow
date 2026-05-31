import { Button } from "@/components/ui/button";
import { CreditCard, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { BillingItem } from "@/components/BillingTable";

interface PaymentActionsProps {
  items: BillingItem[];
  cartId?: string;
  customerName?: string;
}

const formatINR = (amount: number) =>
  `Rs. ${amount.toFixed(2)}`;

const PaymentActions = ({
  items,
  cartId = "CART-OFFLINE",
  customerName = "NEETU SOOD",
}: PaymentActionsProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleProceedToPay = () => {
    toast({
      title: "Processing Payment",
      description: "Redirecting to payment gateway...",
    });
  };

  const handleDownloadBill = async () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is Empty",
        description: "Add items to your cart before downloading a bill.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Dynamically import jsPDF to keep the initial bundle lean
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 18;
      const contentW = pageW - margin * 2;

      // ── Colour palette ───────────────────────────────────────────
      const primaryR = 37, primaryG = 99, primaryB = 235; // blue-600

      // ── Header band ──────────────────────────────────────────────
      doc.setFillColor(primaryR, primaryG, primaryB);
      doc.rect(0, 0, pageW, 38, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("eKart Smart Bill", margin, 16);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("IoT-Based Smart RFID Shopping Cart System", margin, 23);
      doc.text("Powered by ESP32 + Google Sheets", margin, 29);

      // Bill #, date on right side of header
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit",
      });
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`Date: ${dateStr}`, pageW - margin, 16, { align: "right" });
      doc.text(`Time: ${timeStr}`, pageW - margin, 22, { align: "right" });
      doc.text(`Cart ID: ${cartId}`, pageW - margin, 28, { align: "right" });

      // ── Customer info band ───────────────────────────────────────
      let y = 46;
      doc.setTextColor(30, 30, 30);
      doc.setFillColor(243, 244, 246); // gray-100
      doc.rect(margin, y - 5, contentW, 16, "F");

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Customer:", margin + 3, y + 2);
      doc.setFont("helvetica", "normal");
      doc.text(customerName, margin + 28, y + 2);

      doc.setFont("helvetica", "bold");
      doc.text("Bill No.:", pageW / 2 + 5, y + 2);
      doc.setFont("helvetica", "normal");
      const billNo = `BL-${Date.now().toString().slice(-6)}`;
      doc.text(billNo, pageW / 2 + 22, y + 2);

      y += 18;

      // ── Table header ─────────────────────────────────────────────
      doc.setFillColor(primaryR, primaryG, primaryB);
      doc.rect(margin, y, contentW, 9, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);

      const col = {
        sno:   margin + 2,
        uid:   margin + 10,
        name:  margin + 42,
        qty:   margin + 110,
        rate:  margin + 128,
        total: margin + 154,
      };

      doc.text("#",           col.sno,   y + 6);
      doc.text("Tag UID",     col.uid,   y + 6);
      doc.text("Product",     col.name,  y + 6);
      doc.text("Qty",         col.qty,   y + 6);
      doc.text("Rate",        col.rate,  y + 6);
      doc.text("Total",       col.total, y + 6);

      y += 12;

      // ── Table rows ───────────────────────────────────────────────
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);

      items.forEach((item, idx) => {
        const rowH = 9;
        const isEven = idx % 2 === 0;

        // Alternating row background
        doc.setFillColor(isEven ? 249 : 255, isEven ? 250 : 255, isEven ? 251 : 255);
        doc.rect(margin, y - 1, contentW, rowH, "F");

        doc.setTextColor(60, 60, 60);
        doc.text(String(idx + 1),                       col.sno,   y + 6);
        doc.text(item.id.substring(0, 12),              col.uid,   y + 6); // truncate long UIDs
        doc.text(item.name.substring(0, 30),            col.name,  y + 6);
        doc.text(String(item.quantity),                 col.qty,   y + 6);
        doc.text(formatINR(item.price),                 col.rate,  y + 6);

        doc.setFont("helvetica", "bold");
        doc.text(formatINR(item.quantity * item.price), col.total, y + 6);
        doc.setFont("helvetica", "normal");

        y += rowH;
      });

      // ── Divider ──────────────────────────────────────────────────
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y + 2, margin + contentW, y + 2);
      y += 8;

      // ── Totals ───────────────────────────────────────────────────
      const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
      const tax = subtotal * 0.08;
      const grandTotal = subtotal + tax;

      const totalsX = margin + contentW - 55;
      const valX    = margin + contentW;

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");

      const addRow = (label: string, value: string, bold = false) => {
        if (bold) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(primaryR, primaryG, primaryB);
        }
        doc.text(label, totalsX, y);
        doc.text(value, valX, y, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        y += 7;
      };

      addRow("Subtotal:", formatINR(subtotal));
      addRow("GST / Tax (8%):", formatINR(tax));

      // Grand total box
      doc.setFillColor(primaryR, primaryG, primaryB);
      doc.roundedRect(totalsX - 4, y - 5, valX - totalsX + 8, 10, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("Grand Total:", totalsX, y + 2);
      doc.text(formatINR(grandTotal), valX, y + 2, { align: "right" });
      y += 14;

      // ── Thank you footer ─────────────────────────────────────────
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, margin + contentW, y);
      y += 8;

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "italic");
      doc.text("Thank you for shopping with eKart!", pageW / 2, y, { align: "center" });
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(
        "This is a system-generated bill from the IoT Smart Shopping Cart project.",
        pageW / 2, y, { align: "center" }
      );
      y += 4;
      doc.text(
        "For queries, contact the store management.",
        pageW / 2, y, { align: "center" }
      );

      // ── Page border ───────────────────────────────────────────────
      doc.setDrawColor(primaryR, primaryG, primaryB);
      doc.setLineWidth(0.6);
      doc.rect(5, 5, pageW - 10, doc.internal.pageSize.getHeight() - 10);

      // ── Save ──────────────────────────────────────────────────────
      const fileName = `eKart_Bill_${billNo}_${dateStr.replace(/ /g, "-")}.pdf`;
      doc.save(fileName);

      toast({
        title: "✅ Bill Downloaded",
        description: `Saved as ${fileName}`,
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast({
        variant: "destructive",
        title: "PDF Error",
        description: "Could not generate the bill. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3 animate-slide-up">
      <Button
        onClick={handleProceedToPay}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all"
      >
        <CreditCard className="w-5 h-5 mr-2" />
        Proceed to Pay
      </Button>

      <Button
        onClick={handleDownloadBill}
        disabled={isGenerating}
        variant="outline"
        className="w-full h-12 text-base font-medium border-2 hover:bg-secondary"
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Download className="w-5 h-5 mr-2" />
        )}
        {isGenerating ? "Generating PDF…" : "Download Bill (PDF)"}
      </Button>
    </div>
  );
};

export default PaymentActions;
