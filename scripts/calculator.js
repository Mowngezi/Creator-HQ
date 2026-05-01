// Rate Calculator — STUB.
//
// The real formula is pending. This file exists so server.js has a stable
// interface to import and so the contract is documented in one place.
//
// When the formula arrives, replace the body of `calculateRate` — do not
// change the signature or the response shape. The card template and any
// future media-kit generator will read these fields.

/**
 * @typedef {Object} CalcInput
 * @property {'instagram'|'tiktok'|'youtube'} platform
 * @property {'post'|'reel'|'story'|'carousel'|'video'|'dedicated'} contentType
 * @property {number} followers
 * @property {number} [avgViews]
 * @property {number} engagement      - as a percentage, e.g. 4.2
 * @property {'organic'|'standard'|'exclusive'} [usage]
 *
 * @typedef {Object} CalcResult
 * @property {number} suggested       - single defensible number
 * @property {number} low             - lower end of reasonable range
 * @property {number} high            - upper end of reasonable range
 * @property {string} rationale       - one-line explanation the creator can repeat
 * @property {string[]} assumptions   - what the number depends on
 * @property {boolean} stub           - true until real formula lands
 */

/**
 * @param {CalcInput} input
 * @returns {CalcResult}
 */
export function calculateRate(input) {
  let rough = 0;
  
  if (input.platform === 'youtube') {
      const views = Number(input.avgViews) || 0;
      rough = (views / 10000) * 400;
  } else {
      const followers = Number(input.followers) || 0;
      const engagement = Number(input.engagement) || 0;
      
      rough = (followers / 10000) * 150;
      
      if (engagement > 0 && engagement < 2) rough *= 0.8;
      else if (engagement >= 4.1 && engagement < 8) rough *= 1.2;
      else if (engagement >= 8) rough *= 1.5;
  }
  
  const cType = (input.contentType || '').toLowerCase();
  const isVideo = ['reel', 'tiktok', 'video'].includes(cType);
  const isStory = ['story'].includes(cType);
  const isDedicated = ['dedicated'].includes(cType);
  
  if (isStory) rough *= 0.5;
  else if (isDedicated) rough *= 2.5; 
  else if (isVideo) rough *= 1.5;
  
  // Niche Fit Multiplier
  const fit = input.nicheFit || 'standard';
  if (fit === 'high') rough *= 1.25;
  else if (fit === 'premium') rough *= 1.6;

  if (input.usage === 'standard') rough *= 1.3;
  else if (input.usage === 'exclusive') rough *= 2.0;

  rough = Math.max(100, Math.round(rough));
  rough = Math.round(rough / 50) * 50;

  return {
    suggested: rough,
    low: Math.max(100, Math.round((rough * 0.8) / 50) * 50),
    high: Math.round((rough * 1.2) / 50) * 50,
    rationale: fit === 'premium' 
      ? 'Premium/Specialist niche multiplier applied. Brands pay for your specific audience trust.' 
      : 'Market standard baseline adjusted for formatting effort and engagement depth.',
    assumptions: [
      `platform: ${input.platform || 'unspecified'}`,
      `content type: ${input.contentType || 'unspecified'}`,
      `audience metric: ${input.platform === 'youtube' ? (input.avgViews || 0) + ' avg views' : (input.followers || 0) + ' followers'}`,
      `engagement: ${input.engagement || 0}%`,
      `niche fit: ${fit}`
    ],
    stub: false,
  };
}

/**
 * Overall baseline estimation — one headline number across whichever platforms
 * the creator filled in, plus a per-platform breakdown so they see the math.
 *
 * @param {{ig?: {followers?: number, engagement?: number}, tt?: {followers?: number, engagement?: number}, yt?: {subscribers?: number, avgViews?: number}, nicheFit?: string}} input
 */
export function calculateOverall(input) {
  const { ig = {}, tt = {}, yt = {}, nicheFit = 'standard' } = input || {};
  const breakdown = [];

  if (Number(ig.followers) > 0) {
    const r = calculateRate({
      platform: 'instagram',
      contentType: 'post',
      followers: Number(ig.followers),
      engagement: Number(ig.engagement) || 0,
      nicheFit
    });
    breakdown.push({ platform: 'Instagram', unit: 'per post', ...r });
  }
  if (Number(tt.followers) > 0) {
    const r = calculateRate({
      platform: 'tiktok',
      contentType: 'reel',
      followers: Number(tt.followers),
      engagement: Number(tt.engagement) || 0,
      nicheFit
    });
    breakdown.push({ platform: 'TikTok', unit: 'per reel', ...r });
  }
  if (Number(yt.subscribers) > 0 || Number(yt.avgViews) > 0) {
    const r = calculateRate({
      platform: 'youtube',
      contentType: 'dedicated',
      followers: Number(yt.subscribers) || 0,
      avgViews: Number(yt.avgViews) || 0,
      nicheFit
    });
    breakdown.push({ platform: 'YouTube', unit: 'per dedicated video', ...r });
  }

  if (!breakdown.length) {
    return {
      error: 'Enter stats for at least one platform — Instagram followers, TikTok followers, or YouTube subscribers.',
      breakdown: [],
    };
  }

  const strongest = breakdown.reduce((best, r) => (r.suggested > best.suggested ? r : best), breakdown[0]);

  return {
    baseline: strongest.suggested,
    low: strongest.low,
    high: strongest.high,
    leadPlatform: strongest.platform,
    leadUnit: strongest.unit,
    breakdown,
    rationale: `Your headline rate tracks your strongest channel (${strongest.platform}). Niche fit: ${nicheFit}.`,
    assumptions: [
      'Baseline is a single branded post/reel/video with organic usage rights.',
      'Standard licensing typically adds ~30%; exclusive adds ~100%.',
      'SA market CPMs, adjusted for engagement depth.',
    ],
    stub: false,
  };
}
