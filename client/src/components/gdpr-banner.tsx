import { Card } from "@/components/ui/card";

const EUFlag = () => (
  <svg width="40" height="30" viewBox="0 0 810 540">
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
    <Card className="bg-white/95 backdrop-blur-sm p-4 mb-4 flex items-center gap-4">
      <div className="flex-shrink-0">
        <EUFlag />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-sm mb-1">Application conforme au RGPD 🔒</h3>
        <p className="text-sm text-muted-foreground">
          Cette application respecte votre vie privée : vos documents PDF restent en local sur votre appareil, 
          aucune donnée personnelle n'est stockée sur nos serveurs. Vous gardez le contrôle total de vos documents.
          Idéal pour analyser en toute sécurité vos contrats, documents légaux et autres fichiers confidentiels.
        </p>
      </div>
    </Card>
  );
}
