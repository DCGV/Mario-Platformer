interface SponsorBannerProps {
  sponsorName: string;
  partnerName?: string;
  message?: string;
}

export function SponsorBanner({ sponsorName, partnerName, message }: SponsorBannerProps) {
  return (
    <div className="rounded-xl border border-[#5EEAD4]/30 bg-[#5EEAD4]/10 p-4 mb-6 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold text-[#0F5D58] mb-1">
          {partnerName ? `${partnerName} — Featured` : "Featured"}
        </p>
        {message && (
          <p className="text-sm text-gray-600">{message}</p>
        )}
      </div>
      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">
        Sponsored by {sponsorName}
      </span>
    </div>
  );
}
