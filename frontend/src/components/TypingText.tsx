import React, { useState, useEffect, useMemo } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  className?: string;
  highlightKeywords?: boolean;
}

// Keywords to highlight in orange (project-related terms)
const KEYWORDS = [
  // Project types
  'logo', 'logos', 'site web', 'site internet', 'application', 'app', 'vidéo', 'video',
  'animation', 'illustration', 'illustrations', 'photographie', 'photo', 'photos',
  'branding', 'identité visuelle', 'charte graphique', 'packaging', 'affiche', 'flyer',
  'motion design', 'montage', '3D', 'modélisation', 'infographie',
  // Style terms
  'moderne', 'minimaliste', 'épuré', 'coloré', 'dynamique', 'élégant', 'professionnel',
  'créatif', 'original', 'unique', 'sobre', 'ludique', 'vintage', 'rétro', 'futuriste',
  // Budget & timing
  'budget', 'tarif', 'prix', 'devis', 'délai', 'deadline', 'urgent', 'rapidement',
  // Audience
  'cible', 'audience', 'public', 'clients', 'utilisateurs', 'jeunes', 'entreprises',
  'particuliers', 'B2B', 'B2C',
  // Project elements
  'projet', 'marque', 'entreprise', 'startup', 'société', 'produit', 'service',
  'portfolio', 'référence', 'expérience',
];

// Function to highlight keywords in text
function highlightText(text: string): React.ReactNode[] {
  if (!text) return [];

  // Create a regex pattern that matches any keyword (case insensitive)
  const pattern = new RegExp(
    `\\b(${KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
    'gi'
  );

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add the highlighted keyword
    parts.push(
      <span key={`kw-${keyIndex++}`} className="text-orange-500 font-medium">
        {match[0]}
      </span>
    );
    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export default function TypingText({
  text,
  speed = 15,
  onComplete,
  className = '',
  highlightKeywords = true
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    setDisplayedText('');
    setIsComplete(false);
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        // Add characters in small chunks for smoother animation
        const chunkSize = Math.random() > 0.7 ? 2 : 1; // Occasionally add 2 chars for natural feel
        const nextChunk = text.slice(currentIndex, currentIndex + chunkSize);
        setDisplayedText(prev => prev + nextChunk);
        currentIndex += chunkSize;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  // Memoize the highlighted content
  const highlightedContent = useMemo(() => {
    if (highlightKeywords) {
      return highlightText(displayedText);
    }
    return displayedText;
  }, [displayedText, highlightKeywords]);

  return (
    <span className={className}>
      {highlightedContent}
      {!isComplete && (
        <span className="inline-block w-0.5 h-5 bg-gray-400 ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}

// Export the highlight function for use in non-typing contexts
export { highlightText };
