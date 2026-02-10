import { ShoppingCart } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              EKART
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                [
                  "text-foreground font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:transition-all",
                  isActive ? "text-primary after:w-full" : "hover:text-primary after:w-0 hover:after:w-full",
                ].join(" ")
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                [
                  "text-foreground font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:transition-all",
                  isActive ? "text-primary after:w-full" : "hover:text-primary after:w-0 hover:after:w-full",
                ].join(" ")
              }
            >
              Cart
            </NavLink>
            <a
              href="#about"
              className="text-foreground font-medium hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-foreground font-medium hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
