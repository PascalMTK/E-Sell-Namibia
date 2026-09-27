"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Crown, Linkedin, Mail, RotateCw, Twitter } from "lucide-react";
import "./team-card.css";

export interface TeamCardData {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  photo: string | null;
  linkedin: string | null;
  twitter: string | null;
  email: string | null;
}

/** `featured` gives the leader (CEO / founder) a gold-trimmed card. */
export function TeamCard({ member, featured = false }: { member: TeamCardData; featured?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const detailsId = useId();
  const frontRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const interacted = useRef(false);
  const initials = member.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  useEffect(() => {
    if (interacted.current) {
      (flipped ? backRef : frontRef).current?.focus({ preventScroll: true });
    }
  }, [flipped]);

  function flip(showDetails: boolean) {
    interacted.current = true;
    setFlipped(showDetails);
  }

  return (
    <article className="team-flip" data-flipped={flipped} data-featured={featured || undefined} aria-label={member.name}
      onKeyDown={(event) => {
        if (event.key === "Escape" && flipped) { event.preventDefault(); flip(false); }
      }}>
      <div className="team-flip-rotor">
        <button ref={frontRef} type="button" className="team-flip-face team-flip-front"
          onClick={() => flip(true)} aria-label={`Meet ${member.name}, ${member.position}. Show profile`}
          aria-expanded={flipped} aria-controls={detailsId} aria-hidden={flipped} inert={flipped} tabIndex={flipped ? -1 : 0}>
          <span className="team-flip-portrait">
            {member.photo ? (
              <Image src={member.photo} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
            ) : <span className="team-flip-initials">{initials}</span>}
          </span>
          <span className="team-flip-caption">
            <span>
              <span className="block text-xl font-extrabold text-brand-black">{member.name}</span>
              {featured ? (
                <span className="team-flip-title mt-2">
                  <Crown size={14} aria-hidden="true" />
                  {member.position}
                </span>
              ) : (
                <span className="mt-1 block text-sm font-semibold text-[#8a6500]">{member.position}</span>
              )}
            </span>
            <span className="team-flip-arrow"><ArrowUpRight size={21} aria-hidden="true" /></span>
          </span>
        </button>
        <div id={detailsId} className="team-flip-face team-flip-back" aria-hidden={!flipped} inert={!flipped}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-brand-yellow">The people behind ESell</span>
            <RotateCw size={20} className="text-brand-yellow" aria-hidden="true" />
          </div>
          <div className="my-7">
            <h3 className="text-2xl font-extrabold text-white">{member.name}</h3>
            <p className="mt-2 text-sm font-semibold text-brand-yellow">{member.position}</p>
            <div className="my-5 h-1 w-10 rounded-full bg-brand-yellow" />
            <p className="whitespace-pre-line break-words text-sm leading-7 text-white/80">
              {member.bio?.trim() || `${member.name} is part of the ESell Namibia team. More about this team member will be available soon.`}
            </p>
          </div>
          <div className="mt-auto">
            {(member.linkedin || member.twitter || member.email) && (
              <div className="mb-5 flex flex-wrap gap-2">
                {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="team-flip-social" aria-label={`${member.name} on LinkedIn`}><Linkedin size={17} aria-hidden="true" /></a>}
                {member.twitter && <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="team-flip-social" aria-label={`${member.name} on X`}><Twitter size={17} aria-hidden="true" /></a>}
                {member.email && <a href={`mailto:${member.email}`} className="team-flip-social" aria-label={`Email ${member.name}`}><Mail size={17} aria-hidden="true" /></a>}
              </div>
            )}
            <button ref={backRef} type="button" onClick={() => flip(false)} className="team-flip-return">
              <ArrowLeft size={16} aria-hidden="true" /> Back to photo
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
