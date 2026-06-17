interface HubHeroProps {
  conditionName: string;
  tagline?: string | null;
  heroImageUrl?: string | null;
  partnerCount: number;
}

export function HubHero({
  conditionName,
  tagline,
  heroImageUrl,
  partnerCount,
}: HubHeroProps) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F5D58] to-[#0a4440] text-white p-8 mb-8"
      style={
        heroImageUrl
          ? {
              backgroundImage: `linear-gradient(to bottom right, rgba(15,93,88,0.92), rgba(10,68,64,0.95)), url(${heroImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="max-w-2xl">
        <p className="text-[#5EEAD4] text-xs font-semibold uppercase tracking-widest mb-2">
          Your benefits hub
        </p>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "Cambria, serif" }}
        >
          {conditionName}
        </h1>
        {tagline && (
          <p className="text-white/80 text-sm mb-4">{tagline}</p>
        )}
        <p className="text-white/60 text-xs">
          {partnerCount} vetted partner{partnerCount !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Decorative arc */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 hidden sm:block">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="55" stroke="white" strokeWidth="2" />
          <circle cx="60" cy="60" r="40" stroke="white" strokeWidth="1.5" />
          <circle cx="60" cy="60" r="25" stroke="white" strokeWidth="1" />
          <line x1="5" y1="60" x2="115" y2="60" stroke="white" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
