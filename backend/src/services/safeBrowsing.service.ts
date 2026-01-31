// Google Safe Browsing API Service
// Documentation: https://developers.google.com/safe-browsing/v4

interface ThreatMatch {
  threatType: string;
  platformType: string;
  threatEntryType: string;
  threat: { url: string };
  cacheDuration: string;
}

interface SafeBrowsingResponse {
  matches?: ThreatMatch[];
}

interface SafeBrowsingResult {
  isSafe: boolean;
  threats: string[];
  error?: string;
}

const THREAT_TYPES = [
  'MALWARE',
  'SOCIAL_ENGINEERING',
  'UNWANTED_SOFTWARE',
  'POTENTIALLY_HARMFUL_APPLICATION',
];

const PLATFORM_TYPES = ['ANY_PLATFORM'];
const THREAT_ENTRY_TYPES = ['URL'];

/**
 * Check URL safety using Google Safe Browsing API
 */
export async function checkUrlSafety(url: string): Promise<SafeBrowsingResult> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  // If no API key, skip check and allow (with warning in logs)
  if (!apiKey) {
    console.warn('Google Safe Browsing API key not configured. Skipping safety check.');
    return { isSafe: true, threats: [] };
  }

  try {
    const requestBody = {
      client: {
        clientId: 'creative-match',
        clientVersion: '1.0.0',
      },
      threatInfo: {
        threatTypes: THREAT_TYPES,
        platformTypes: PLATFORM_TYPES,
        threatEntryTypes: THREAT_ENTRY_TYPES,
        threatEntries: [{ url }],
      },
    };

    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      console.error('Safe Browsing API error:', response.status, response.statusText);
      // On API error, allow the URL but log the issue
      return { isSafe: true, threats: [], error: 'API error' };
    }

    const data = (await response.json()) as SafeBrowsingResponse;

    if (data.matches && data.matches.length > 0) {
      const threats = data.matches.map((match) => {
        switch (match.threatType) {
          case 'MALWARE':
            return 'Malware';
          case 'SOCIAL_ENGINEERING':
            return 'Phishing/Arnaque';
          case 'UNWANTED_SOFTWARE':
            return 'Logiciel indésirable';
          case 'POTENTIALLY_HARMFUL_APPLICATION':
            return 'Application potentiellement dangereuse';
          default:
            return match.threatType;
        }
      });

      return {
        isSafe: false,
        threats: [...new Set(threats)], // Remove duplicates
      };
    }

    return { isSafe: true, threats: [] };
  } catch (error) {
    console.error('Safe Browsing check error:', error);
    // On error, allow the URL but log the issue
    return { isSafe: true, threats: [], error: 'Check failed' };
  }
}

/**
 * Check multiple URLs at once (more efficient for batch checking)
 */
export async function checkUrlsSafety(urls: string[]): Promise<Map<string, SafeBrowsingResult>> {
  const results = new Map<string, SafeBrowsingResult>();
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  if (!apiKey) {
    console.warn('Google Safe Browsing API key not configured. Skipping safety check.');
    urls.forEach((url) => results.set(url, { isSafe: true, threats: [] }));
    return results;
  }

  try {
    const requestBody = {
      client: {
        clientId: 'creative-match',
        clientVersion: '1.0.0',
      },
      threatInfo: {
        threatTypes: THREAT_TYPES,
        platformTypes: PLATFORM_TYPES,
        threatEntryTypes: THREAT_ENTRY_TYPES,
        threatEntries: urls.map((url) => ({ url })),
      },
    };

    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      urls.forEach((url) => results.set(url, { isSafe: true, threats: [], error: 'API error' }));
      return results;
    }

    const data = (await response.json()) as SafeBrowsingResponse;

    // Initialize all URLs as safe
    urls.forEach((url) => results.set(url, { isSafe: true, threats: [] }));

    // Mark unsafe URLs
    if (data.matches) {
      data.matches.forEach((match) => {
        const url = match.threat.url;
        const existingResult = results.get(url);
        if (existingResult) {
          existingResult.isSafe = false;
          existingResult.threats.push(match.threatType);
        }
      });
    }

    return results;
  } catch (error) {
    console.error('Safe Browsing batch check error:', error);
    urls.forEach((url) => results.set(url, { isSafe: true, threats: [], error: 'Check failed' }));
    return results;
  }
}
