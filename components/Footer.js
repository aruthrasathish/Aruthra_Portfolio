"use client";

import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/ui/Icons";
import { contact, footer } from "@/lib/data";

const LINKS = [
  { href: `mailto:${contact.email}`, label: "Email", Icon: MailIcon, external: false },
  { href: contact.github, label: "GitHub", Icon: GitHubIcon, external: true },
  { href: contact.linkedin, label: "LinkedIn", Icon: LinkedInIcon, external: true },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="py-10 px-4 md:px-8"
      style={{ borderTop: "1px solid var(--border-default)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
          <div className="text-center sm:text-left">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              © {currentYear} {footer.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {LINKS.map(({ href, label, Icon, external }) => (
              <a
                key={label}
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="p-2 rounded-lg transition-colors duration-200 hover:bg-[var(--bg-hover)]"
                style={{ color: "var(--text-muted)" }}
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
