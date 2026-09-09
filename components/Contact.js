"use client";

import { useRef, useState } from "react";
import { Check, MapPin, Loader2, AlertCircle } from "lucide-react";
import Reveal, { SectionHeading } from "@/components/ui/Reveal";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/ui/Icons";
import { contact } from "@/lib/data";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELDS = [
  { name: "name", label: "Your Name", type: "text", autoComplete: "name" },
  { name: "email", label: "Your Email", type: "email", autoComplete: "email" },
  { name: "message", label: "Your Message", type: "textarea" },
];

/** Client-side mirror of the server's rules - fast feedback, not the real gate. */
function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.email.trim()) errors.email = "Please enter your email.";
  else if (!EMAIL_RE.test(values.email.trim()))
    errors.email = "That email address looks incomplete.";
  if (!values.message.trim()) errors.message = "Please enter a message.";
  return errors;
}

const EMPTY = { name: "", email: "", message: "" };

/** Left column: the direct routes. Email and location are not links out. */
function ContactChannels() {
  const rows = [
    {
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
      icon: <MailIcon className="w-[18px] h-[18px]" />,
    },
    {
      label: "LinkedIn",
      value: "aruthrasathish",
      href: contact.linkedin,
      external: true,
      icon: <LinkedInIcon className="w-[18px] h-[18px]" />,
    },
    {
      label: "GitHub",
      value: "aruthrasathish",
      href: contact.github,
      external: true,
      icon: <GitHubIcon className="w-[18px] h-[18px]" />,
    },
    {
      label: "Location",
      value: contact.location,
      icon: <MapPin className="w-[18px] h-[18px]" />,
    },
  ];

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const body = (
          <>
            <span
              className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl"
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent-light)",
              }}
            >
              {row.icon}
            </span>
            <span className="min-w-0">
              <span
                className="block text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {row.label}
              </span>
              <span
                className="block text-sm mt-0.5 truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {row.value}
              </span>
            </span>
          </>
        );

        return (
          <li key={row.label}>
            {row.href ? (
              <a
                href={row.href}
                {...(row.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="card accent-card p-3.5 flex items-center gap-3.5 w-full"
                style={{ "--proj-accent": "var(--accent)" }}
              >
                {body}
              </a>
            ) : (
              <div
                className="card p-3.5 flex items-center gap-3.5 w-full"
                style={{ "--proj-accent": "var(--accent)" }}
              >
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [notice, setNotice] = useState("");
  const formRef = useRef(null);

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    // Clear a field's error as soon as the visitor starts fixing it.
    setErrors((current) =>
      current[field] ? { ...current, [field]: undefined } : current
    );
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (status === "sending") return;

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus("idle");
      setNotice("");
      // Move focus to the first problem so keyboard and screen reader users
      // land on it rather than hunting for the red text.
      formRef.current?.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }

    setStatus("sending");
    setErrors({});
    setNotice("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok) {
        setStatus("sent");
        setValues(EMPTY);
        return;
      }

      if (data.errors) {
        setErrors(data.errors);
        setStatus("idle");
        return;
      }

      setStatus("error");
      setNotice(
        data.configured === false
          ? `The form is not wired to a mail service yet - please email ${contact.email} directly.`
          : `Something went wrong sending that. You can email ${contact.email} instead.`
      );
    } catch {
      setStatus("error");
      setNotice(
        `Could not reach the server. You can email ${contact.email} instead.`
      );
    }
  };

  return (
    <section id="contact" className="section">
      <div className="container-main">
        <SectionHeading label="Contact" title="Get in Touch" subtitle={contact.cta} />

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <Reveal className="lg:col-span-5">
            <ContactChannels />
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-7">
            <div className="card p-5 md:p-6">
              {status === "sent" ? (
                <div
                  className="flex flex-col items-center text-center py-8"
                  role="status"
                >
                  <span
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                    style={{
                      background: "var(--success-dim)",
                      color: "var(--success)",
                    }}
                  >
                    <Check className="w-6 h-6" aria-hidden="true" />
                  </span>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Message sent
                  </p>
                  <p
                    className="text-sm mt-1.5 max-w-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Thanks for reaching out - I&apos;ll get back to you soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="btn-secondary text-sm py-2 mt-5"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={onSubmit} noValidate>
                  <p
                    className="text-sm font-semibold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Send a Message
                  </p>

                  <div className="space-y-4">
                    {FIELDS.map((field) => {
                      const error = errors[field.name];
                      const errorId = `${field.name}-error`;
                      const shared = {
                        id: field.name,
                        name: field.name,
                        value: values[field.name],
                        onChange: update(field.name),
                        "aria-invalid": error ? true : undefined,
                        "aria-describedby": error ? errorId : undefined,
                        className: "form-input",
                        style: error
                          ? { borderColor: "var(--danger, #f87171)" }
                          : undefined,
                      };

                      return (
                        <div key={field.name}>
                          <label htmlFor={field.name} className="form-label">
                            {field.label}
                          </label>

                          {field.type === "textarea" ? (
                            <textarea {...shared} rows={5} />
                          ) : (
                            <input
                              {...shared}
                              type={field.type}
                              autoComplete={field.autoComplete}
                            />
                          )}

                          {error ? (
                            <p id={errorId} className="form-error">
                              <AlertCircle
                                className="w-3.5 h-3.5 flex-shrink-0"
                                aria-hidden="true"
                              />
                              {error}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="btn-primary w-full sm:w-auto mt-5 disabled:opacity-70"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2
                          className="w-4 h-4 animate-spin"
                          aria-hidden="true"
                        />
                        Sending
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>

                  {/* Delivery problems are announced, never silently swallowed. */}
                  {status === "error" && notice ? (
                    <p
                      className="flex items-start gap-2 text-sm mt-4"
                      style={{ color: "var(--text-secondary)" }}
                      role="alert"
                    >
                      <AlertCircle
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: "var(--danger, #f87171)" }}
                        aria-hidden="true"
                      />
                      <span>{notice}</span>
                    </p>
                  ) : null}
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
