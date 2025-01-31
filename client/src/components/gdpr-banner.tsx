import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b w-full py-2 px-4 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto flex items-start gap-3" style={{ fontFamily: 'Figtree, sans-serif' }}>
        <EUFlag />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold mr-1" style={{ color: '#42D80F' }}>Application conforme au RGPD 🔒</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
              className="text-xs"
            >
              {expanded ? 'Voir moins' : 'En savoir plus'}
            </Button>
          </div>

          {expanded ? (
            <div className="mt-2 text-sm space-y-2 text-muted-foreground">
              <p>
                <strong>Stockage local :</strong> Les documents PDF sont d'abord chargés localement pour la visualisation.
              </p>
              <p>
                <strong>Service d'analyse :</strong> Pour l'analyse intelligente, nous utilisons ChatPDF qui :
                - Stocke temporairement les documents pour l'analyse
                - Supprime automatiquement les données après 24h
                - Ne partage pas vos données avec des tiers
              </p>
              <p>
                <strong>Vos droits :</strong> Vous pouvez supprimer vos documents à tout moment. Les fichiers sont automatiquement supprimés à la fermeture de l'application.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Vos documents PDF sont traités localement et temporairement via ChatPDF pour l'analyse - Idéal pour vos documents confidentiels
            </p>
          )}
        </div>
      </div>
    </div>
  );
}