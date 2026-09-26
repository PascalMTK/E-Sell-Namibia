import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Megaphone, Pin } from "lucide-react";
import { Container, EmptyState } from "@/components/ui/card";
import { PageHero } from "@/components/ui/page-hero";
import { Badge } from "@/components/ui/badge";
import { getActivePublicAnnouncements } from "@/lib/data/announcements";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Announcements" };
export const dynamic = "force-dynamic";

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const { items, page, pageCount } = await getActivePublicAnnouncements(sp.page ? Number(sp.page) : 1);

  return (
    <>
      <PageHero
        eyebrow="News and updates"
        title="Latest"
        highlight="announcements."
        description="News and updates from ESell Namibia."
        icon={<Megaphone size={44} />}
      />
      <Container className="py-10">
      <div>
        {items.length === 0 ? (
          <EmptyState icon={<Megaphone size={36} />} title="No announcements right now" description="Check back soon." />
        ) : (
          <div className="space-y-4">
            {items.map((announcement) => (
              <div key={announcement.id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5">
                {announcement.image && (
                  <div className="relative hidden h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-off-white sm:block">
                    <Image src={announcement.image} alt="" fill sizes="96px" className="object-cover" />
                  </div>
                )}
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    {announcement.pinned && <Badge variant="yellow"><Pin size={11} /> Pinned</Badge>}
                    <p className="text-xs text-secondary-text">{announcement.createdAt.toLocaleDateString("en-NA")}</p>
                  </div>
                  <h2 className="text-base font-bold text-brand-black">{announcement.title}</h2>
                  <p className="mt-1.5 whitespace-pre-line text-sm text-secondary-text">{announcement.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <Link
                key={pageNum}
                href={`/announcements?page=${pageNum}`}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold",
                  pageNum === page
                    ? "border-brand-black bg-brand-black text-white"
                    : "border-gray-300 bg-white text-brand-black hover:border-brand-black",
                )}
              >
                {pageNum}
              </Link>
            );
          })}
        </nav>
      )}
      </Container>
    </>
  );
}
