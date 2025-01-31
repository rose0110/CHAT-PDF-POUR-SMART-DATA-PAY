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
      <div className="max-w-screen-2xl mx-auto flex items-center gap-3" style={{ fontFamily: 'Figtree, sans-serif' }}>
        <div className="flex items-center">
          <EUFlag />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold mr-1" style={{ color: '#42D80F' }}>Application sécurisée 🔒</span>
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
                <strong>Protection de vos données :</strong> Vos documents sont traités en toute sécurité, avec un stockage temporaire limité à la durée de votre session.
              </p>
              <p>
                <strong>Analyse sécurisée :</strong> L'analyse de vos documents est effectuée via des services sécurisés qui :
                - Ne conservent pas vos données au-delà de 24h
                - N'utilisent pas vos données à d'autres fins
                - Respectent les normes de sécurité européennes
              </p>
              <p>
                <strong>Vos droits :</strong> Vous gardez le contrôle total de vos données et pouvez demander leur suppression à tout moment.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Vos documents sont traités de manière sécurisée et temporaire - Protection maximale de vos données sensibles
            </p>
          )}
        </div>
      </div>
    </div>
  );
}