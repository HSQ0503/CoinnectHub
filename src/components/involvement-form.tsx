"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  FileText,
  School,
  Users,
} from "lucide-react";

type Interest = "volunteer" | "school";

const interests = {
  volunteer: {
    title: "Volunteering",
    description: "A class visit, design, tutoring, or something else.",
    opening:
      "I want to volunteer with CoinnectHub. I would love to hear about opportunities to help.",
  },
  school: {
    title: "Schools & partnerships",
    description: "A grade, a class, a workshop.",
    opening:
      "I work with a school or community group and I want to talk about a CoinnectHub workshop.",
  },
};

export function InvolvementForm() {
  const [interest, setInterest] = useState<Interest>("volunteer");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  function prepareInquiry() {
    const details = message.trim();
    setPreview(
      `CoinnectHub inquiry: ${interests[interest].title}\n\nHello CoinnectHub,\n\n${interests[interest].opening}${details ? `\n\n${details}` : ""}\n\nThank you!`,
    );
    setDownloaded(false);
  }

  function downloadInquiry() {
    if (!preview) return;
    const url = URL.createObjectURL(
      new Blob([preview], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `coinnecthub-${interest}-inquiry.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  }

  return (
    <div className="inquiry-form">
      <div className="mb-8 flex items-start gap-4 border-b border-navy/15 pb-7">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-yellow">
          <FileText size={24} strokeWidth={1.6} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Prepare an inquiry
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-navy/75">
            Choose an option and write a few lines. You can preview your note
            and download a copy to keep.
          </p>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          prepareInquiry();
        }}
      >
        <fieldset>
          <legend className="mb-4 font-bold">I’m interested in</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["volunteer", "school"] as const).map((option) => {
              const Icon = option === "volunteer" ? Users : School;
              return (
                <label
                  key={option}
                  className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition-colors focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-navy ${interest === option ? "border-blue bg-sky" : "border-navy/15 bg-white hover:border-blue"}`}
                >
                  <span className="mb-5 flex items-center justify-between">
                    <Icon size={25} strokeWidth={1.6} aria-hidden="true" />
                    <input
                      type="radio"
                      name="interest"
                      value={option}
                      checked={interest === option}
                      onChange={() => {
                        setInterest(option);
                        setPreview(null);
                        setDownloaded(false);
                      }}
                      className="size-4 accent-navy"
                    />
                  </span>
                  <span className="font-bold">{interests[option].title}</span>
                  <span className="mt-2 text-sm leading-relaxed text-navy/75">
                    {interests[option].description}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label htmlFor="inquiry-message" className="mt-7 mb-2 block font-bold">
          What would you like to share?{" "}
          <span className="font-normal text-navy/65">(optional)</span>
        </label>
        <p
          id="inquiry-hint"
          className="mb-3 text-sm leading-relaxed text-navy/75"
        >
          A few sentences is enough. Leave out student names and other private
          info.
        </p>
        <textarea
          id="inquiry-message"
          name="message"
          rows={4}
          maxLength={1500}
          value={message}
          aria-describedby="inquiry-hint inquiry-count"
          onChange={(event) => {
            setMessage(event.target.value);
            setPreview(null);
            setDownloaded(false);
          }}
          placeholder="I can help with..."
          className="w-full resize-y rounded-xl border border-navy/30 bg-white p-4 text-base leading-relaxed text-navy placeholder:text-navy/50 focus:border-navy focus:outline-2 focus:outline-offset-2 focus:outline-navy"
        />
        <p id="inquiry-count" className="mt-2 text-right text-xs text-navy/65">
          {message.length} / 1,500 characters
        </p>
        <button
          type="submit"
          className="button-primary mt-5 w-full justify-center"
        >
          Preview inquiry <ArrowRight size={18} aria-hidden="true" />
        </button>
        <p className="mt-3 text-center text-xs leading-relaxed text-navy/70">
          This stays in your browser. We don’t receive it.
        </p>
      </form>

      {preview && (
        <section
          className="mt-8 border-t border-navy/15 pt-7"
          aria-label="Your inquiry preview"
          aria-live="polite"
        >
          <h3 className="mb-4 text-lg font-extrabold">Your inquiry preview</h3>
          <div className="rounded-xl border border-navy/20 p-4 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] text-navy/85">
            {preview}
          </div>
          <button
            type="button"
            onClick={downloadInquiry}
            className="button-secondary mt-5 w-full justify-center"
          >
            <Download size={18} aria-hidden="true" /> Download inquiry
          </button>
          {downloaded && (
            <p
              role="status"
              className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-navy"
            >
              <Check size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              Download started. Keep your note until a contact address is
              available.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
