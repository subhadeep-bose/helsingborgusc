import { Link } from "react-router-dom";
import { MapPin, Mail, Phone } from "lucide-react";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-xl mb-3 gold-accent">Helsingborg United SC</h3>
          <p className="text-primary-foreground/70 text-sm leading-relaxed font-body">
            Weekend leisure cricket for everyone in Helsingborg, Sweden. Join our community and enjoy the gentleman's game.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl mb-3 gold-accent">Quick Links</h3>
          <div className="flex flex-col gap-2 font-body text-sm">
            <Link to="/registration" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Join Us</Link>
            <Link to="/schedule" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Training Schedule</Link>
            <Link to="/gallery" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Gallery</Link>
          </div>
        </div>
        <div>
          <h3 className="font-display text-xl mb-3 gold-accent">Contact</h3>
          <div className="flex flex-col gap-2 font-body text-sm text-primary-foreground/70">
            <span className="flex items-center gap-2"><MapPin size={14} /> Helsingborg, Sweden</span>
            <span className="flex items-center gap-2"><Mail size={14} /> info@helsingborgunited.se</span>
            <span className="flex items-center gap-2"><Phone size={14} /> +46 42 000 0000</span>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 mt-8 pt-6 text-center text-primary-foreground/50 text-xs font-body">
        © {new Date().getFullYear()} Helsingborg United Sports Club. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
