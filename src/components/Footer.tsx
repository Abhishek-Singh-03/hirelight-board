import { Briefcase, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "Quick Links": [
      { label: "Home", href: "#" },
      { label: "Browse Jobs", href: "#" },
      { label: "Companies", href: "#" },
      { label: "Career Advice", href: "#" },
    ],
    "Job Categories": [
      { label: "IT & Software", href: "#" },
      { label: "Government Jobs", href: "#" },
      { label: "Fresher Jobs", href: "#" },
      { label: "Remote Work", href: "#" },
    ],
    "Support": [
      { label: "Help Center", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Contact Us", href: "#" },
    ],
  };

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">JobWise</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your trusted partner in finding the perfect career opportunity. Connect with top employers and discover your dream job.
            </p>
            <div className="space-y-2">
              {/* <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@jobwise.com</span>
              </div> */}
              {/* <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 12345 67890</span>
              </div> */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h3 className="font-semibold">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} JobWise. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm">
                Terms of Service
              </Button>
              <Button variant="ghost" size="sm">
                Cookie Policy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}