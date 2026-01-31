// URL Validator Utility
// Validates external URLs for security and content policy

import { checkUrlSafety } from '../services/safeBrowsing.service.js';

// Blacklisted domains (adult content, malware, etc.)
const BLACKLISTED_DOMAINS = [
  // Adult content
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'redtube.com',
  'youporn.com', 'tube8.com', 'spankbang.com', 'eporner.com', 'porn.com',
  'brazzers.com', 'bangbros.com', 'realitykings.com', 'naughtyamerica.com',
  'onlyfans.com', 'fansly.com', 'chaturbate.com', 'stripchat.com', 'cam4.com',
  'livejasmin.com', 'bongacams.com', 'myfreecams.com', 'camsoda.com',
  'xxxvideos.com', 'sex.com', 'hentai.com', 'rule34.xxx', 'e621.net',
  // Gambling
  'bet365.com', 'unibet.com', 'pokerstars.com', '888casino.com',
  // Known malware/phishing domains patterns will be caught by other checks
];

// Blacklisted keywords in URLs
const BLACKLISTED_KEYWORDS = [
  'porn', 'xxx', 'sex', 'adult', 'nsfw', 'hentai', 'nude', 'naked',
  'escort', 'webcam', 'camgirl', 'onlyfan', 'fansly', 'chaturbate',
  'stripchat', 'livejasmin', 'casino', 'gambling', 'betting',
  'malware', 'phishing', 'hack', 'crack', 'warez', 'torrent',
];

// Whitelisted domains (always allowed)
const WHITELISTED_DOMAINS = [
  // Portfolio/Design platforms
  'behance.net', 'dribbble.com', 'figma.com', 'sketch.com', 'framer.com',
  'invisionapp.com', 'adobe.com', 'canva.com', 'miro.com',
  // Code platforms
  'github.com', 'gitlab.com', 'bitbucket.org', 'codepen.io', 'codesandbox.io',
  // Social/Professional
  'linkedin.com', 'twitter.com', 'x.com', 'instagram.com', 'facebook.com',
  // Media platforms
  'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com',
  // Art platforms
  'artstation.com', 'deviantart.com', 'pinterest.com', 'flickr.com',
  // Documentation/Notes
  'notion.so', 'medium.com', 'substack.com',
  // Website builders
  'wix.com', 'squarespace.com', 'webflow.io', 'carrd.co', 'linktree.com',
  // Cloud storage (for sharing files)
  'google.com', 'drive.google.com', 'dropbox.com',
];

interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedUrl?: string;
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Check if URL contains blacklisted keywords
 */
function containsBlacklistedKeywords(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return BLACKLISTED_KEYWORDS.some(keyword => lowerUrl.includes(keyword));
}

/**
 * Check if domain is in blacklist
 */
function isDomainBlacklisted(domain: string): boolean {
  return BLACKLISTED_DOMAINS.some(blacklisted =>
    domain === blacklisted || domain.endsWith('.' + blacklisted)
  );
}

/**
 * Check if domain is in whitelist
 */
function isDomainWhitelisted(domain: string): boolean {
  return WHITELISTED_DOMAINS.some(whitelisted =>
    domain === whitelisted || domain.endsWith('.' + whitelisted)
  );
}

/**
 * Validate and sanitize external URL
 */
export function validateExternalUrl(url: string): ValidationResult {
  // Empty URL is valid (optional field)
  if (!url || url.trim() === '') {
    return { isValid: true, sanitizedUrl: '' };
  }

  const trimmedUrl = url.trim();

  // Must start with https://
  if (!trimmedUrl.startsWith('https://')) {
    // Try to fix http:// to https://
    if (trimmedUrl.startsWith('http://')) {
      return validateExternalUrl(trimmedUrl.replace('http://', 'https://'));
    }
    // Add https:// if missing
    if (!trimmedUrl.includes('://')) {
      return validateExternalUrl('https://' + trimmedUrl);
    }
    return {
      isValid: false,
      error: 'L\'URL doit commencer par https://',
    };
  }

  // Validate URL format
  let urlObj: URL;
  try {
    urlObj = new URL(trimmedUrl);
  } catch {
    return {
      isValid: false,
      error: 'Format d\'URL invalide',
    };
  }

  // Block dangerous protocols
  if (!['https:', 'http:'].includes(urlObj.protocol)) {
    return {
      isValid: false,
      error: 'Protocole non autorisé',
    };
  }

  const domain = extractDomain(trimmedUrl);
  if (!domain) {
    return {
      isValid: false,
      error: 'Domaine invalide',
    };
  }

  // Check blacklisted domains
  if (isDomainBlacklisted(domain)) {
    return {
      isValid: false,
      error: 'Ce domaine n\'est pas autorisé',
    };
  }

  // Check for blacklisted keywords in URL (unless whitelisted domain)
  if (!isDomainWhitelisted(domain) && containsBlacklistedKeywords(trimmedUrl)) {
    return {
      isValid: false,
      error: 'Cette URL contient du contenu non autorisé',
    };
  }

  // URL is valid
  return {
    isValid: true,
    sanitizedUrl: trimmedUrl,
  };
}

/**
 * Check if a domain is allowed (for quick frontend check)
 */
export function isUrlAllowed(url: string): boolean {
  return validateExternalUrl(url).isValid;
}

/**
 * Extended validation result with Safe Browsing info
 */
interface ExtendedValidationResult extends ValidationResult {
  safeBrowsingChecked?: boolean;
  threats?: string[];
}

/**
 * Validate URL with Google Safe Browsing API check (async)
 * Use this for thorough validation when saving URLs
 */
export async function validateExternalUrlWithSafeBrowsing(url: string): Promise<ExtendedValidationResult> {
  // First, do basic validation
  const basicResult = validateExternalUrl(url);

  if (!basicResult.isValid || !basicResult.sanitizedUrl) {
    return basicResult;
  }

  // Skip Safe Browsing for whitelisted domains
  const domain = extractDomain(basicResult.sanitizedUrl);
  if (domain && isDomainWhitelisted(domain)) {
    return {
      ...basicResult,
      safeBrowsingChecked: false, // Skipped for whitelisted domain
    };
  }

  // Check with Google Safe Browsing API
  try {
    const safeBrowsingResult = await checkUrlSafety(basicResult.sanitizedUrl);

    if (!safeBrowsingResult.isSafe) {
      return {
        isValid: false,
        error: `URL signalée comme dangereuse: ${safeBrowsingResult.threats.join(', ')}`,
        safeBrowsingChecked: true,
        threats: safeBrowsingResult.threats,
      };
    }

    return {
      ...basicResult,
      safeBrowsingChecked: true,
      threats: [],
    };
  } catch (error) {
    // If Safe Browsing check fails, allow the URL but mark as unchecked
    console.error('Safe Browsing check failed:', error);
    return {
      ...basicResult,
      safeBrowsingChecked: false,
    };
  }
}

export { WHITELISTED_DOMAINS };
