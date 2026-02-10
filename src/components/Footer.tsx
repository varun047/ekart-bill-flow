import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-4">About EKART</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              RFID-powered smart shopping cart system for seamless and efficient shopping experiences.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>+91 9914916555</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@ekart.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>NITJ</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EKART. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
