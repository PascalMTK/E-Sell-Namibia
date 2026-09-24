import Image from "next/image";
import { Linkedin, Mail, Twitter } from "lucide-react";

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

export function TeamCard({ member }: { member: TeamCardData }) {
  const initials = member.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="team-card relative flex flex-col items-center overflow-hidden rounded-xl border border-gray-200 bg-off-white p-6 pb-16 text-center">
      <div className="team-avatar mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand-yellow text-xl font-extrabold text-brand-black">
        {member.photo ? (
          <Image src={member.photo} alt={member.name} width={96} height={96} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <h3 className="text-base font-bold text-brand-black">{member.name}</h3>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-yellow-hover">{member.position}</p>
      {member.bio && <p className="text-xs leading-relaxed text-secondary-text">{member.bio}</p>}

      {(member.linkedin || member.twitter || member.email) && (
        <div className="team-social-bar absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 border-t border-gray-200 bg-brand-charcoal py-3">
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} on LinkedIn`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border text-brand-yellow hover:bg-brand-yellow hover:text-brand-black"
            >
              <Linkedin size={13} />
            </a>
          )}
          {member.twitter && (
            <a
              href={member.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} on X`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border text-brand-yellow hover:bg-brand-yellow hover:text-brand-black"
            >
              <Twitter size={13} />
            </a>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              aria-label={`Email ${member.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border text-brand-yellow hover:bg-brand-yellow hover:text-brand-black"
            >
              <Mail size={13} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
