import React from 'react';

export const OcaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Oca (Tent) */}
    <path d="M12 2L2 22h20L12 2z" />
    <path d="M12 22v-5a3 3 0 0 0-6 0v5" />
    <path d="M8 12h8" />
    <path d="M9.5 7h5" />
  </svg>
);

export const ArcoFlechaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Bow */}
    <path d="M12 3a9 9 0 0 0 0 18" />
    <path d="M12 3c-3 4-3 14 0 18" />
    {/* Arrow */}
    <path d="M22 12H6" />
    <path d="M10 8l-4 4 4 4" />
  </svg>
);

export const CocarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Headdress / Cocar */}
    <path d="M4 15s4-4 8-4 8 4 8 4" />
    <path d="M12 11v-8" />
    <path d="M8 12L5 5" />
    <path d="M16 12l3-7" />
    <path d="M4 15a4 4 0 1 0 16 0" />
    <path d="M12 15v6" />
  </svg>
);

export const PenaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Feather */}
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
    <line x1="16" x2="2" y1="8" y2="22" />
    <line x1="17.5" x2="9" y1="15" y2="6.5" />
    <line x1="13.5" x2="6.5" y1="13" y2="6" />
  </svg>
);

export const TriboIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Grafismo circular representando união/tribo */}
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20" />
    <path d="M2 12h20" />
    <circle cx="12" cy="12" r="4" />
    <path d="M7.5 7.5l9 9" />
    <path d="M16.5 7.5l-9 9" />
  </svg>
);

export const GuerreiroIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Rosto com pintura indígena */}
    <circle cx="12" cy="10" r="4" />
    <path d="M20 21a8 8 0 0 0-16 0" />
    <path d="M9 10h6" />
    <path d="M10 12h4" />
    <path d="M11 8h2" />
  </svg>
);

export const MaracaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="8" r="5" />
    <path d="M12 13v9" />
    <path d="M10 18h4" />
    <path d="M10 15h4" />
    <path d="M10 10l1 1" />
    <path d="M14 8l-1-1" />
  </svg>
);

export const FogueiraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 22l8-4" />
    <path d="M16 22l-8-4" />
    <path d="M12 18c2-3 4-4 4-8a4 4 0 0 0-8 0c0 4 2 5 4 8z" />
    <path d="M12 18c-1-2-2-3-2-5a2 2 0 0 1 4 0c0 2-1 3-2 5z" />
  </svg>
);

export const MachadoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Machadinha indígena */}
    <path d="M14 4l-4 4-6 12" />
    <path d="M11 7l4 4" />
    <path d="M18 6a2 2 0 0 0-2-2h-3l-2 4h4a2 2 0 0 0 3-2z" />
  </svg>
);
