require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// SerpAPI Configuration
const SERPAPI_KEY = process.env.SERPAPI_KEY || '24e3e5aee53d2cec964d3ad3d0247a63935e4812f096f98097f52fa9fbf3cbf7';
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID || '546c25a59c58ad7';

// Configure multer for image uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.get('/api/health', (_, res) => res.json({ ok: true }));

// Known breaches dictionary
const KNOWN_BREACHES = [
  'ModernBusinessSolutions','RiverCityMedia','AshleyMadison','MyFitnessPal','CollectionOne','ExploitIn','AntiPublic',
  'Dubsmash','Aptoide','Aptoid','LinkedIn','Adobe','Dropbox','Canva','Wattpad','Chegg','Deezer','Houzz','Patreon','Disqus',
  'Forbes','Gawker','Stratfor','LastFm','Bitly','Evony','Zynga','Twitter','Facebook','Yahoo','Tumblr','MySpace',
  'Snapchat','Instagram','TikTok','Minecraft','Roblox','Steam','PlayStation','Xbox','Nintendo'
];

const DICT = KNOWN_BREACHES
  .map(n => ({ raw: n, lower: n.toLowerCase(), len: n.length }))
  .sort((a, b) => b.len - a.len);

// Word-break DP segmentation
function segmentWithDP(token) {
  if (!token || typeof token !== 'string') return [];
  const s = token.toLowerCase();
  const n = s.length;
  const memo = new Map();

  const bestFrom = (i) => {
    if (i >= n) return { covered: 0, parts: [] };
    if (memo.has(i)) return memo.get(i);

    let best = bestFrom(i + 1);

    for (const e of DICT) {
      if (i + e.len <= n && s.startsWith(e.lower, i)) {
        const next = bestFrom(i + e.len);
        const cand = { covered: next.covered + e.len, parts: [e.raw, ...next.parts] };
        if (cand.covered > best.covered || (cand.covered === best.covered && cand.parts.length > best.parts.length)) {
          best = cand;
        }
      }
    }

    memo.set(i, best);
    return best;
  };

  const result = bestFrom(0);
  return result.covered > 0 ? result.parts : [];
}

// Mock dataset for test@gmail.com (10-12 realistic breaches)
const MOCK_BREACHES_FOR_TEST = [
  {
    Name: 'LinkedIn',
    BreachDate: '2021-06-22',
    Description: 'In June 2021, data scraped from 700 million LinkedIn users was posted for sale on a hacking forum. The breach included email addresses, full names, phone numbers, physical addresses, geolocation records, LinkedIn profile information, and other social media details.',
    DataClasses: ['Email addresses', 'Full names', 'Phone numbers', 'Geographic locations', 'Social media profiles']
  },
  {
    Name: 'Adobe',
    BreachDate: '2013-10-04',
    Description: 'In October 2013, 153 million Adobe accounts were breached. Each record contained an internal ID, username, email, encrypted password, and a password hint in plain text. The password cryptography was poorly implemented and many were quickly cracked.',
    DataClasses: ['Email addresses', 'Password hints', 'Passwords', 'Usernames']
  },
  {
    Name: 'Dropbox',
    BreachDate: '2012-07-01',
    Description: 'In mid-2012, Dropbox suffered a data breach which exposed the stored credentials of tens of millions of customers. A total of 68 million records containing email addresses and passwords were subsequently traded online.',
    DataClasses: ['Email addresses', 'Passwords']
  },
  {
    Name: 'MyFitnessPal',
    BreachDate: '2018-02-01',
    Description: 'In February 2018, Under Armour\'s MyFitnessPal suffered a massive data breach affecting 144 million users. The breach exposed usernames, email addresses, and passwords stored as SHA-1 and bcrypt hashes.',
    DataClasses: ['Email addresses', 'Usernames', 'Passwords', 'IP addresses']
  },
  {
    Name: 'Canva',
    BreachDate: '2019-05-24',
    Description: 'In May 2019, the graphic design platform Canva suffered a data breach affecting 137 million users. The breach exposed email addresses, usernames, names, cities of residence, and passwords stored as bcrypt hashes.',
    DataClasses: ['Email addresses', 'Usernames', 'Names', 'Geographic locations', 'Passwords']
  },
  {
    Name: 'Collection #1',
    BreachDate: '2019-01-16',
    Description: 'In January 2019, a massive collection of credential stuffing lists containing 773 million unique email addresses and 21 million unique passwords was discovered being distributed on hacking forums.',
    DataClasses: ['Email addresses', 'Passwords']
  },
  {
    Name: 'Dubsmash',
    BreachDate: '2018-12-01',
    Description: 'In December 2018, the video messaging service Dubsmash suffered a data breach affecting 162 million users. The exposed data included email addresses, usernames, PBKDF2 password hashes, and other account details.',
    DataClasses: ['Email addresses', 'Usernames', 'Passwords', 'Geographic locations']
  },
  {
    Name: 'Yahoo',
    BreachDate: '2013-08-01',
    Description: 'In August 2013, Yahoo suffered one of the largest data breaches in history affecting all 3 billion user accounts. The breach exposed names, email addresses, dates of birth, telephone numbers, and passwords stored as MD5 hashes.',
    DataClasses: ['Email addresses', 'Names', 'Dates of birth', 'Phone numbers', 'Passwords', 'Security questions']
  },
  {
    Name: 'Snapchat',
    BreachDate: '2014-01-01',
    Description: 'In January 2014, 4.6 million Snapchat usernames and phone numbers were leaked online. The data was obtained by exploiting an API vulnerability that allowed bulk queries of user data.',
    DataClasses: ['Usernames', 'Phone numbers', 'Geographic locations']
  },
  {
    Name: 'Tumblr',
    BreachDate: '2013-05-01',
    Description: 'In May 2013, Tumblr suffered a data breach affecting 65 million accounts. The breach exposed email addresses and passwords hashed with SHA-1, which were subsequently cracked and distributed.',
    DataClasses: ['Email addresses', 'Passwords']
  },
  {
    Name: 'Twitter',
    BreachDate: '2022-12-01',
    Description: 'In December 2022, data from over 200 million Twitter users was leaked online. The breach included email addresses, names, usernames, follower counts, and account creation dates obtained through an API vulnerability.',
    DataClasses: ['Email addresses', 'Names', 'Usernames', 'Social media profiles']
  },
  {
    Name: 'Facebook',
    BreachDate: '2019-04-03',
    Description: 'In April 2019, records from 533 million Facebook users were leaked online. The data included phone numbers, account IDs, full names, locations, birth dates, email addresses, and relationship statuses.',
    DataClasses: ['Email addresses', 'Phone numbers', 'Names', 'Geographic locations', 'Dates of birth', 'Relationship statuses']
  }
];

// Shuffle and return 10-12 random breaches
function getRandomMockBreaches() {
  const shuffled = [...MOCK_BREACHES_FOR_TEST].sort(() => Math.random() - 0.5);
  const count = Math.floor(Math.random() * 3) + 10; // Random 10-12
  return shuffled.slice(0, count);
}

const cache = new Map();
const CACHE_MS = 15 * 60 * 1000;

async function callXON(email) {
  const url = `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`;
  const opts = {
    headers: { Accept: 'application/json', 'User-Agent': 'PETRONAS-CIH/1.0' },
    timeout: 10000
  };

  try {
    return await axios.get(url, opts);
  } catch (e) {
    const retriable = e.code === 'ECONNABORTED' || [403, 429, 502, 503, 504].includes(e.response?.status);
    if (retriable) {
      await new Promise(r => setTimeout(r, 1200));
      return await axios.get(url, opts);
    }
    throw e;
  }
}

app.get('/api/breach/:email', async (req, res) => {
  const email = String(req.params.email || '').trim();
  if (!email || !email.includes('@')) return res.status(400).json({ message: 'Invalid email' });

  const key = email.toLowerCase();
  const now = Date.now();

  const cached = cache.get(key);
  if (cached && (now - cached.ts) < CACHE_MS) {
    return res.json(cached.data);
  }

  try {
    const r = await callXON(email);
    let names = [];
    const raw = r.data?.breaches;

    if (Array.isArray(raw)) {
      for (const t of raw) {
        const seg = segmentWithDP(t);
        names.push(...(seg.length ? seg : [t]));
      }
    } else if (typeof raw === 'string') {
      names = segmentWithDP(raw);
    }

    const seen = new Set();
    const unique = [];
    for (const n of names) {
      const k = String(n).toLowerCase();
      if (!seen.has(k)) { seen.add(k); unique.push(String(n)); }
    }
    unique.sort((a, b) => a.localeCompare(b));

    if (!unique.length) {
      return res.status(404).json({ message: 'No breaches found' });
    }

    const payload = unique.map(n => ({
      Name: n,
      BreachDate: 'Date Unknown',
      Description: `This email was found in the ${n} data breach.`,
      DataClasses: ['Email addresses', 'Personal information']
    }));

    cache.set(key, { data: payload, ts: now });
    return res.json(payload);
  } catch (err) {
    if (err.code === 'ECONNABORTED') return res.status(408).json({ message: 'Request timeout. Please try again.' });
    const s = err.response?.status;
    if (s === 404) return res.status(404).json({ message: 'No breaches found' });
    if (s === 403 || s === 429) return res.status(429).json({ message: 'Public API rate limit reached. Please try again in a minute.' });
    return res.status(502).json({ message: 'Upstream API error. Please try again shortly.' });
  }
});

// Employee Breach Database
const BREACH_DATABASE = {
  'aimanhakimi92@gmail.com': { breached: false },
  'syafiqah.razak@yahoo.com': { breached: true },
  'rizalfahmi87@gmail.com': { breached: true },
  'kavitha.mano@outlook.com': { breached: false },
  'js.wong1122@gmail.com': { breached: false },
  'farah.irdinaa@live.com': { breached: false },
  'danish.muhd01@gmail.com': { breached: false },
  'liwei.tan88@yahoo.com': { breached: true },
  'harith.zafran@gmail.com': { breached: false },
  'qalesya.siti@icloud.com': { breached: true },
  'arjun.pk23@gmail.com': { breached: false },
  'aina.sofea@yahoo.com': { breached: false },
  'weihan.lee88@gmail.com': { breached: true },
  'sharmila.dv@outlook.com': { breached: false },
  'zikri.hafiz01@gmail.com': { breached: true }
};

// Digital Shadow - Mock Employee Data (for demo endpoint)
const MOCK_EMPLOYEES = [
  {
    id: 1,
    name: 'Sarah Johnson',
    department: 'Engineering',
    email: 'sarah.johnson@company.com',
    breachCount: 0,
    leakedCredentials: 0,
    publicSocialInfo: 'Low',
    exposureScore: 15,
    riskLevel: 'safe',
    risks: []
  },
  {
    id: 2,
    name: 'Michael Chen',
    department: 'Marketing',
    email: 'michael.chen@company.com',
    breachCount: 2,
    leakedCredentials: 1,
    publicSocialInfo: 'Medium',
    exposureScore: 45,
    riskLevel: 'medium',
    risks: ['Email found in LinkedIn breach', 'Weak password detected']
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    department: 'Finance',
    email: 'emily.rodriguez@company.com',
    breachCount: 0,
    leakedCredentials: 0,
    publicSocialInfo: 'Low',
    exposureScore: 10,
    riskLevel: 'safe',
    risks: []
  },
  {
    id: 4,
    name: 'David Park',
    department: 'IT Security',
    email: 'david.park@company.com',
    breachCount: 5,
    leakedCredentials: 3,
    publicSocialInfo: 'High',
    exposureScore: 82,
    riskLevel: 'high',
    risks: [
      'Multiple credential leaks detected',
      'Found in Collection #1 breach',
      'Password reuse across platforms',
      'Public social media exposure high'
    ]
  },
  {
    id: 5,
    name: 'Jennifer Williams',
    department: 'HR',
    email: 'jennifer.williams@company.com',
    breachCount: 1,
    leakedCredentials: 0,
    publicSocialInfo: 'Low',
    exposureScore: 25,
    riskLevel: 'medium',
    risks: ['Email found in Adobe breach']
  },
  {
    id: 6,
    name: 'Robert Taylor',
    department: 'Sales',
    email: 'robert.taylor@company.com',
    breachCount: 0,
    leakedCredentials: 0,
    publicSocialInfo: 'Low',
    exposureScore: 8,
    riskLevel: 'safe',
    risks: []
  },
  {
    id: 7,
    name: 'Lisa Anderson',
    department: 'Operations',
    email: 'lisa.anderson@company.com',
    breachCount: 3,
    leakedCredentials: 2,
    publicSocialInfo: 'Medium',
    exposureScore: 58,
    riskLevel: 'medium',
    risks: [
      'Credentials leaked in MyFitnessPal breach',
      'Email found in Dropbox breach'
    ]
  },
  {
    id: 8,
    name: 'James Mitchell',
    department: 'Engineering',
    email: 'james.mitchell@company.com',
    breachCount: 7,
    leakedCredentials: 4,
    publicSocialInfo: 'Very High',
    exposureScore: 91,
    riskLevel: 'high',
    risks: [
      'Critical: Multiple active credential leaks',
      'Found in Yahoo, LinkedIn, Adobe breaches',
      'Extensive public profile information available',
      'Weak security practices detected'
    ]
  },
  {
    id: 9,
    name: 'Amanda White',
    department: 'Legal',
    email: 'amanda.white@company.com',
    breachCount: 0,
    leakedCredentials: 0,
    publicSocialInfo: 'Very Low',
    exposureScore: 5,
    riskLevel: 'safe',
    risks: []
  },
  {
    id: 10,
    name: 'Christopher Lee',
    department: 'Product',
    email: 'christopher.lee@company.com',
    breachCount: 4,
    leakedCredentials: 2,
    publicSocialInfo: 'High',
    exposureScore: 67,
    riskLevel: 'high',
    risks: [
      'Email in Collection #1 breach',
      'Password found in plaintext leak',
      'High social media exposure'
    ]
  },
  {
    id: 11,
    name: 'Patricia Brown',
    department: 'Customer Success',
    email: 'patricia.brown@company.com',
    breachCount: 1,
    leakedCredentials: 1,
    publicSocialInfo: 'Medium',
    exposureScore: 38,
    riskLevel: 'medium',
    risks: ['Found in Canva breach']
  },
  {
    id: 12,
    name: 'Kevin Davis',
    department: 'Design',
    email: 'kevin.davis@company.com',
    breachCount: 0,
    leakedCredentials: 0,
    publicSocialInfo: 'Low',
    exposureScore: 12,
    riskLevel: 'safe',
    risks: []
  }
];

// Digital Shadow API endpoint
app.get('/api/digital-shadow/employees', (req, res) => {
  // Simulate a slight delay for realism
  setTimeout(() => {
    res.json(MOCK_EMPLOYEES);
  }, 300);
});

// Process uploaded employee data and check against database
app.post('/api/digital-shadow/upload', async (req, res) => {
  try {
    const { employees } = req.body;
    
    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ message: 'Invalid employee data' });
    }

    // Process each employee and check against breach database
    const processedEmployees = employees.map((emp, index) => {
      const emailLower = emp.email.toLowerCase();
      const dbEntry = BREACH_DATABASE[emailLower];
      
      // Check if email exists in database and if it's breached
      const isBreached = dbEntry ? dbEntry.breached : false;
      
      let riskLevel = 'safe';
      let breachCount = 0;
      let leakedCredentials = 0;
      let exposureScore = 10;
      let risks = [];

      if (isBreached) {
        riskLevel = 'high';
        breachCount = 1;
        leakedCredentials = 1;
        exposureScore = 85;
        risks = ['Gmail account breached - found in database'];
      }

      return {
        id: index + 1,
        name: emp.name,
        department: emp.department || 'Employee',
        email: emp.email,
        location: emp.location || 'Unknown',
        breachCount,
        leakedCredentials,
        publicSocialInfo: isBreached ? 'High' : 'Low',
        exposureScore,
        riskLevel,
        risks
      };
    });

    res.json(processedEmployees);
  } catch (err) {
    console.error('Error processing employee data:', err);
    res.status(500).json({ message: 'Error processing employee data' });
  }
});

// ============================================================================
// VANGUARD MODULE - Reverse Image Search
// ============================================================================

// Upload image to Imgur
async function uploadImageToImgur(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await axios.post(
      'https://api.imgur.com/3/image',
      {
        image: base64Image,
        type: 'base64'
      },
      {
        headers: {
          'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
        }
      }
    );

    return response.data.data.link;
  } catch (error) {
    console.error('Imgur upload failed:', error.message);
    throw error;
  }
}

// Perform SerpAPI Reverse Image Search
async function performSerpAPIReverseSearch(imagePath) {
  try {
    console.log('📤 Uploading image to public URL...');
    const imageUrl = await uploadImageToImgur(imagePath);
    console.log('✅ Image uploaded:', imageUrl);

    console.log('🔍 Starting SerpAPI Google Reverse Image search...');

    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google_reverse_image',
        image_url: imageUrl,
        api_key: SERPAPI_KEY
      },
      timeout: 30000
    });

    console.log('✅ SerpAPI response received');

    const data = response.data;
    const matches = [];
    const seenUrls = new Set();

    // Extract visual matches (pages that actually show the image)
    if (data.image_results && data.image_results.length > 0) {
      console.log(`📊 Found ${data.image_results.length} image results`);
      
      data.image_results.forEach((result, index) => {
        const url = result.link || result.source || result.original;
        
        if (url && url.startsWith('http') && result.thumbnail && !seenUrls.has(url)) {
          seenUrls.add(url);
          matches.push({
            url: url,
            domain: extractDomain(url),
            title: result.title || result.source_name || 'Similar Image Found',
            similarity: 95 - (index * 2),
            context: determineContext(extractDomain(url)),
            thumbnail: result.thumbnail,
            hasImage: true
          });
        }
      });
    }

    // Extract inline images
    if (data.inline_images && data.inline_images.length > 0) {
      console.log(`📊 Found ${data.inline_images.length} inline images`);
      
      data.inline_images.forEach((result, index) => {
        const url = result.source || result.link || result.original;
        
        if (url && url.startsWith('http') && result.thumbnail && !seenUrls.has(url)) {
          seenUrls.add(url);
          matches.push({
            url: url,
            domain: extractDomain(url),
            title: result.title || result.source_name || 'Matching Image',
            similarity: 90 - (index * 2),
            context: determineContext(extractDomain(url)),
            thumbnail: result.thumbnail,
            hasImage: true
          });
        }
      });
    }

    // Extract visual matches section
    if (data.visual_matches && data.visual_matches.length > 0) {
      console.log(`📊 Found ${data.visual_matches.length} visual matches`);
      
      data.visual_matches.forEach((result, index) => {
        const url = result.link || result.source;
        
        if (url && url.startsWith('http') && result.thumbnail && !seenUrls.has(url)) {
          seenUrls.add(url);
          matches.push({
            url: url,
            domain: extractDomain(url),
            title: result.title || 'Visual Match',
            similarity: 92 - (index * 2),
            context: determineContext(extractDomain(url)),
            thumbnail: result.thumbnail,
            hasImage: true
          });
        }
      });
    }

    // Filter out text-only reference sites
    const filteredMatches = matches.filter(match => {
      const domain = match.domain.toLowerCase();
      const excludedDomains = [
        'dictionary.com', 'thefreedictionary.com', 'merriam-webster.com',
        'wikipedia.org', 'wiktionary.org', 'vocabulary.com'
      ];
      
      if (excludedDomains.some(excluded => domain.includes(excluded))) {
        return false;
      }
      if (!match.thumbnail) {
        return false;
      }
      return true;
    });

    console.log(`✅ Processed ${filteredMatches.length} image-containing matches`);

    return {
      matches: filteredMatches,
      totalFound: filteredMatches.length,
      searchMetadata: data.search_metadata,
      searchUrl: imageUrl
    };

  } catch (error) {
    console.error('❌ SerpAPI error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      
      if (error.response.status === 401) {
        throw new Error('Invalid SerpAPI key');
      }
      if (error.response.status === 429) {
        throw new Error('SerpAPI rate limit exceeded');
      }
    }
    
    throw error;
  }
}

// Extract domain from URL
function extractDomain(url) {
  try {
    if (!url) return 'Unknown';
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return 'Unknown';
  }
}

// Determine context based on domain
function determineContext(domain) {
  const contexts = {
    'linkedin.com': 'Professional networking profile',
    'facebook.com': 'Social media profile',
    'instagram.com': 'Social media profile',
    'twitter.com': 'Social media profile',
    'x.com': 'Social media profile',
    'github.com': 'Developer platform',
    'shutterstock.com': 'Stock photography website',
    'istockphoto.com': 'Stock photography website',
    'gettyimages.com': 'Stock photography website',
    'unsplash.com': 'Free stock photography',
    'pexels.com': 'Free stock photography',
    'pixabay.com': 'Free stock photography',
    'flickr.com': 'Photo sharing platform',
    'pinterest.com': 'Image sharing platform',
    'freepik.com': 'Stock graphics website',
    'dreamstime.com': 'Stock photography website',
    'alamy.com': 'Stock photography website',
    '123rf.com': 'Stock photography website'
  };

  for (const [key, value] of Object.entries(contexts)) {
    if (domain.toLowerCase().includes(key)) {
      return value;
    }
  }

  return 'Web page';
}

// Generate AI summary
function generateAISummary(matches) {
  const totalMatches = matches.length;

  const stockPhotoSites = ['shutterstock', 'istock', 'getty', 'unsplash', 'pexels', 'pixabay', 'freepik', 'dreamstime', 'alamy', '123rf'];
  const stockMatches = matches.filter(m => 
    stockPhotoSites.some(site => m.domain.toLowerCase().includes(site))
  );

  const socialMediaSites = ['linkedin', 'facebook', 'instagram', 'twitter', 'x.com'];
  const socialMatches = matches.filter(m =>
    socialMediaSites.some(site => m.domain.toLowerCase().includes(site))
  );

  if (totalMatches === 0) {
    return '✓ No public matches found. This appears to be a unique, non-indexed image. This is a positive indicator for identity verification - the photo is likely authentic and not stolen from public sources.';
  }

  if (stockMatches.length >= 3) {
    return `🚨 CRITICAL WARNING: This image was found on ${stockMatches.length} stock photo websites (${stockMatches.slice(0, 3).map(m => m.domain).join(', ')}). This is a STRONG indicator of fraudulent identity. The photo is a commercially available stock image, NOT an authentic personal photograph. ⛔ REJECT this verification and request alternative proof of identity immediately.`;
  }

  if (stockMatches.length >= 1) {
    return `🚨 WARNING: This image appears on stock photo website "${stockMatches[0].domain}". This suggests potential identity fraud. The photo may be commercially purchased rather than a genuine personal photo. Recommend immediate additional verification steps.`;
  }

  if (totalMatches >= 20) {
    return `🚨 HIGH ALERT: This image appears ${totalMatches} times across the web. This level of distribution is EXTREMELY unusual for genuine personal photos and strongly suggests: (1) stock photography, (2) stolen identity, or (3) widely circulated fake profile. Immediate manual review required.`;
  }

  if (totalMatches >= 10) {
    return `⚠️ CAUTION: Found ${totalMatches} matches across various platforms. This image has significant web presence. ${socialMatches.length > 0 ? `Includes ${socialMatches.length} social media profile(s).` : ''} Cross-reference ALL sources with provided identity information.`;
  }

  if (socialMatches.length >= 2) {
    return `⚠️ Found ${totalMatches} matches including ${socialMatches.length} social media profiles (${socialMatches.map(m => m.domain).join(', ')}). Verify these profiles belong to the SAME person and match ALL provided identity details.`;
  }

  return `ℹ️ Found ${totalMatches} match(es) online. The image appears on: ${matches.slice(0, 3).map(m => m.domain).join(', ')}. This level of presence is typical for real individuals. Recommend verifying these sources match the claimed identity.`;
}

// Mock function as fallback
function generateMockReverseSearchResults(filename) {
  return {
    matches: [],
    totalFound: 0,
    searchEngines: ['Google Reverse Image (Mock Mode)'],
    processingTime: '1.8s',
    aiSummary: '✓ No public matches found. This appears to be a unique, non-indexed image.',
    imageAnalysis: {
      format: 'JPEG',
      dimensions: '1024x768',
      fileSize: '245 KB',
      quality: 'High',
      metadata: 'Stripped'
    },
    timestamp: new Date().toISOString()
  };
}

// Reverse search endpoint
app.post('/api/vanguard/reverse-search', upload.single('image'), async (req, res) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 VANGUARD: Reverse Image Search Request`);
  console.log(`${'='.repeat(60)}`);

  if (!req.file) {
    return res.status(400).json({
      message: 'No image file provided'
    });
  }

  const imagePath = req.file.path;
  console.log(`📸 Image received: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);

  try {
    console.log('🚀 Starting reverse search...');
    const startTime = Date.now();
    const serpResults = await performSerpAPIReverseSearch(imagePath);
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

    const aiSummary = generateAISummary(serpResults.matches);

    const finalResults = {
      matches: serpResults.matches,
      totalFound: serpResults.totalFound,
      searchEngines: ['Google Reverse Image Search'],
      processingTime: `${processingTime}s`,
      searchUrl: serpResults.searchUrl,
      aiSummary: aiSummary,
      imageAnalysis: {
        format: req.file.mimetype.split('/')[1].toUpperCase(),
        dimensions: 'Analyzed',
        fileSize: `${(req.file.size / 1024).toFixed(2)} KB`,
        quality: req.file.size > 500000 ? 'High' : req.file.size > 100000 ? 'Medium' : 'Low',
        metadata: 'Analyzed'
      },
      timestamp: new Date().toISOString(),
      apiStatus: 'success'
    };

    console.log(`✅ Search complete: ${finalResults.totalFound} matches found in ${processingTime}s`);
    console.log(`${'='.repeat(60)}\n`);

    // Cleanup
    fs.unlinkSync(imagePath);

    return res.json(finalResults);

  } catch (error) {
    console.error(`❌ Reverse search error: ${error.message}`);
    console.log(`${'='.repeat(60)}\n`);

    // Cleanup
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    console.log('⚠️ Falling back to mock data...');
    const mockResults = generateMockReverseSearchResults(req.file.originalname);
    return res.json({
      ...mockResults,
      apiStatus: 'fallback',
      error: error.message
    });
  }
});

// ===============================================
// == VANGUARD: CANDIDATE VETTING ==
// ===============================================

// Demo Malaysian Government Data (based on data.gov.my structure)
const DEMO_CANDIDATES = [
  {
    name: 'Mohammed Aiman Khalid',
    icPassport: '900101-01-1234',
    country: 'Malaysia',
    phoneNumber: '+60 01151166354',
    dateOfBirth: '1990-01-01',
    status: 'cleared',
    records: [
      { type: 'Identity Verification', details: 'Valid MyKad registered with NRD', severity: 'low', date: '2024-01-15' },
      { type: 'Criminal Record Check', details: 'No criminal records found', severity: 'low', date: '2024-11-10' },
      { type: 'Employment History', details: 'Registered with SOCSO since 2015', severity: 'low', date: '2024-11-12' }
    ],
    recommendations: [
      'Candidate has clean record',
      'All government checks passed',
      'Proceed with standard hiring process'
    ]
  },
  {
    name: 'Siti binti Rahman',
    icPassport: '850615-10-5678',
    country: 'Malaysia',
    phoneNumber: '+60198765432',
    dateOfBirth: '1985-06-15',
    status: 'review',
    records: [
      { type: 'Identity Verification', details: 'Valid MyKad registered with NRD', severity: 'low', date: '2024-02-20' },
      { type: 'Traffic Violations', details: 'Outstanding summons (RM450) with JPJ', severity: 'medium', date: '2023-08-10' },
      { type: 'Tax Compliance', details: 'All income tax filed up to date', severity: 'low', date: '2024-04-30' }
    ],
    recommendations: [
      'Minor traffic violations detected',
      'Recommend candidate clear outstanding summons',
      'No major concerns for employment'
    ]
  },
  {
    name: 'Chen Wei Ming',
    icPassport: 'A12345678',
    country: 'Singapore',
    phoneNumber: '+6598765432',
    dateOfBirth: '1992-03-22',
    status: 'cleared',
    records: [
      { type: 'Passport Verification', details: 'Valid Singapore passport', severity: 'low', date: '2024-05-12' },
      { type: 'Work Permit Status', details: 'Previous EP approved for Malaysia (2020-2023)', severity: 'low', date: '2023-12-31' },
      { type: 'Immigration Records', details: 'Clean immigration history', severity: 'low', date: '2024-11-08' }
    ],
    recommendations: [
      'Foreign candidate with clean record',
      'Prior work experience in Malaysia',
      'Eligible for new work permit application'
    ]
  }
];

app.post('/api/vanguard/candidate-vetting', async (req, res) => {
  try {
    const { name, country, icPassport, phoneNumber } = req.body;

    console.log(`👤 Candidate Vetting Request:`, { name, icPassport });

    if (!name || !icPassport) {
      return res.status(400).json({ 
        message: 'Name and IC/Passport are required' 
      });
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Search for candidate in demo data
    const candidate = DEMO_CANDIDATES.find(c => 
      c.name.toLowerCase() === name.toLowerCase() || 
      c.icPassport.toLowerCase() === icPassport.toLowerCase()
    );

    if (candidate) {
      console.log(`✅ Candidate found in demo database`);
      return res.json(candidate);
    }

    // If not found, generate a generic cleared response
    console.log(`📝 Candidate not in demo database, generating generic response`);
    
    res.json({
      name,
      icPassport,
      country: country || 'Not specified',
      phoneNumber: phoneNumber || 'Not provided',
      dateOfBirth: 'Not available',
      status: 'cleared',
      records: [
        { 
          type: 'Identity Verification', 
          details: 'Pending manual verification - candidate not found in demo database', 
          severity: 'medium',
          date: new Date().toISOString().split('T')[0]
        }
      ],
      recommendations: [
        'Candidate not found in demo database',
        'Manual verification recommended',
        '📋 Demo Candidate 1: Mohammed Aiman Khalid | Malaysia | IC: 900101-01-1234 | +60 01151166354',
        '📋 Demo Candidate 2: Siti binti Rahman | Malaysia | IC: 850615-10-5678 | +60198765432',
        '📋 Demo Candidate 3: Chen Wei Ming | Singapore | Passport: A12345678 | +6598765432'
      ]
    });

  } catch (error) {
    console.error('❌ Candidate Vetting Error:', error);
    res.status(500).json({ 
      message: 'Vetting failed: ' + error.message 
    });
  }
});

// ===============================================
// == RISK ASSESSMENT MODULE - AI ANALYSIS ==
// ===============================================
app.post('/api/strategic-intel/analyze', async (req, res) => {
  try {
    const { rawText, analysisMode } = req.body;

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ message: 'No text provided for analysis' });
    }

    console.log(`🤖 Risk Assessment Analysis Request:`, {
      mode: analysisMode,
      textLength: rawText.length
    });

    // Check if Cohere API key exists
    const COHERE_API_KEY = process.env.COHERE_API_KEY;
    if (!COHERE_API_KEY) {
      console.error('❌ COHERE_API_KEY not found in environment variables');
      return res.status(500).json({ 
        message: 'Cohere API key not configured. Please add COHERE_API_KEY to your .env file' 
      });
    }

    const { CohereClient } = require('cohere-ai');
    const cohere = new CohereClient({
      token: COHERE_API_KEY,
    });

    let systemPrompt = '';
    
    if (analysisMode === 'public_reaction') {
      systemPrompt = `You are a corporate intelligence analyst. Analyze this announcement and provide a CONCISE briefing using ONLY keywords and short phrases (max 5 words each).

REQUIRED FORMAT (use exact headings):

## Executive Summary
[1 sentence only - overall sentiment]

## Key Themes
- [keyword/phrase]
- [keyword/phrase]
- [keyword/phrase]

## Threat Level
- [threat]: High/Medium/Low
- [threat]: High/Medium/Low
- [threat]: High/Medium/Low

## Actions
- [action item]
- [action item]
- [action item]

## Sentiment Score
[Number from 0-100 where 0=Very Negative, 50=Neutral, 100=Very Positive]

## Risk Distribution
High:[number]% Medium:[number]% Low:[number]%

Keep it SHORT, PUNCHY, and DATA-FOCUSED.

TEXT TO ANALYZE:
${rawText}`;
    } else {
      systemPrompt = `You are a risk analyst. Analyze this plan and provide a CONCISE assessment using ONLY keywords and short phrases (max 5 words each).

REQUIRED FORMAT (use exact headings):

## Executive Summary
[1 sentence only - overall risk]

## Top Risks
- [risk]: High/Medium/Low
- [risk]: High/Medium/Low
- [risk]: High/Medium/Low
- [risk]: High/Medium/Low

## Critical Areas
- [area/concern]
- [area/concern]
- [area/concern]

## Mitigation
- [action]
- [action]
- [action]
- [action]

## Risk Score
[Number from 0-100 where 0=No Risk, 50=Moderate, 100=Critical]

## Risk Distribution
High:[number]% Medium:[number]% Low:[number]%

Keep it SHORT, PUNCHY, and DATA-FOCUSED.

FUTURE PLAN TO ANALYZE:
${rawText}`;
    }

    console.log('📡 Calling Cohere AI API...');
    
    // Use the latest command-r model (as of November 2025)
    const response = await cohere.chat({
      model: 'command-r-08-2024',
      message: systemPrompt,
      temperature: 0.1,
    });

    const aiSummary = response.text;
    
    console.log('✅ Cohere AI Response received');
    console.log('📝 Response preview:', aiSummary.substring(0, 200) + '...');

    res.json({
      success: true,
      ai_summary: aiSummary,
      analysis_mode: analysisMode,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Strategic Intel Analysis Error:', error);
    
    if (error.message?.includes('API key')) {
      return res.status(500).json({ 
        message: 'Invalid Cohere API key. Please check your .env configuration' 
      });
    }
    
    res.status(500).json({ 
      message: 'Analysis failed: ' + error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📡 Using XposedOrNot API for breach checks`);
  console.log(`👥 Digital Shadow GET endpoint: /api/digital-shadow/employees`);
  console.log(`📤 Digital Shadow POST endpoint: /api/digital-shadow/upload`);
  console.log(`🟢 Vanguard Reverse Search POST: /api/vanguard/reverse-search`);
  console.log(`👤 Vanguard Candidate Vetting POST: /api/vanguard/candidate-vetting`);
  console.log(`🤖 Risk Assessment POST endpoint: /api/strategic-intel/analyze`);
});