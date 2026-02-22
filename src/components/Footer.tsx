import { Link } from "react-router-dom";
import { MapPin, Mail, Instagram } from "lucide-react";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-xl mb-3 gold-accent">Helsingborg United SC</h3>
          <p className="text-primary-foreground/70 text-sm leading-relaxed font-body">
            Leisure cricket for everyone in Helsingborg, Sweden — weekends year-round and weekday sessions in summer. Join our community and enjoy the gentleman's game.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl mb-3 gold-accent">Quick Links</h3>
          <div className="flex flex-col gap-2 font-body text-sm">
            <Link to="/registration" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Join Us</Link>
            <Link to="/schedule" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Training Schedule</Link>
            <Link to="/gallery" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Gallery</Link>
            <Link to="/contact" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Contact Us</Link>
            <Link to="/news" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">News</Link>
            <Link to="/cricket-live" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">India Cricket Live</Link>
            <Link to="/fun" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Fun Zone</Link>
            <Link to="/check-status" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Check Status</Link>
            <Link to="/privacy" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
        <div>
          <h3 className="font-display text-xl mb-3 gold-accent">Contact</h3>
          <div className="flex flex-col gap-2 font-body text-sm text-primary-foreground/70">
            <span className="flex items-center gap-2"><MapPin size={14} /> Helsingborg, Sweden</span>
            <a href="mailto:helsingborgunitedsc@gmail.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors"><Mail size={14} /> helsingborgunitedsc@gmail.com</a>
          </div>
          {/* Social Media */}
          <div className="flex items-center gap-3 mt-4">
            <a
              href="https://www.instagram.com/helsingborgunitedsc/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
            >
              <Instagram size={18} />
            </a>
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
