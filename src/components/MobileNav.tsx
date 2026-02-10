import { Home as HomeIcon, ShoppingCart, Info, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg shadow-md md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between px-6 py-2.5 text-xs font-medium">
        <NavLink
          to="/"
          className={({ isActive }) =>
            [
              "flex flex-1 flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors",
              isActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground",
            ].join(" ")
          }
        >
          <HomeIcon className="h-5 w-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            [
              "flex flex-1 flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors",
              isActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground",
            ].join(" ")
          }
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Cart</span>
        </NavLink>

        <a
          href="#about"
          className="flex flex-1 flex-col items-center gap-1 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info className="h-5 w-5" />
          <span>About</span>
        </a>

        <a
          href="#contact"
          className="flex flex-1 flex-col items-center gap-1 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <User className="h-5 w-5" />
          <span>Contact</span>
        </a>
      </div>
    </nav>
  );
};

export default MobileNav;

