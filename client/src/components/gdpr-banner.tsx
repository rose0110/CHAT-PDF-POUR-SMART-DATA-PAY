import { Card } from "@/components/ui/card";

const EUFlag = () => (
  <svg width="24" height="16" viewBox="0 0 810 540">
    <rect fill="#003399" width="810" height="540"/>
    <g fill="#FFCC00">
      {[...Array(12)].map((_, i) => (
        <path
          key={i}
          d="M405,96.5l11.9,36.6l38.5,0l-31.1,22.6l11.9,36.6l-31.2-22.6l-31.2,22.6l11.9-36.6l-31.1-22.6l38.5,0z"
          transform={`rotate(${i * 30} 405 270)`}
        />
      ))}
    </g>
  </svg>
);

export default function GDPRBanner() {
  return (
    <div className="bg-white/95 backdrop-blur-sm border-b w-full py-2 px-4 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto flex items-center gap-3" style={{ fontFamily: 'Figtree, sans-serif' }}>
        <EUFlag />
        <p className="text-sm">
          <span className="font-semibold mr-1" style={{ color: '#42D80F' }}>Application conforme au RGPD 🔒</span>
          <span className="text-muted-foreground">
            Vos documents PDF restent en local sur votre appareil - Idéal pour analyser en toute sécurité vos contrats et documents confidentiels
          </span>
        </p>
      </div>
    </div>
  );
}