/**
 * URL Scraper & Article Extractor Service
 * Fetches content from blog posts, tech articles, X/Twitter, Reddit, GitHub, and news links.
 * Cleans HTML to extract title, core thesis, key arguments, and architectural context for Gemini.
 */

// Helper to decode HTML entities
function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

// Clean text by stripping excess whitespace
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00a0]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Extract clean readable content from HTML string
 */
function extractFromHtml(html, sourceUrl) {
  let title = '';
  let description = '';
  let siteName = '';

  // 1. Extract Title
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  if (ogTitleMatch && ogTitleMatch[1]) {
    title = decodeHtmlEntities(ogTitleMatch[1]);
  } else {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = decodeHtmlEntities(titleMatch[1].replace(/<[^>]+>/g, '').trim());
    }
  }

  // 2. Extract Description / Subtitle
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (ogDescMatch && ogDescMatch[1]) {
    description = decodeHtmlEntities(ogDescMatch[1]);
  }

  // 3. Extract Site Name
  const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
  if (ogSiteMatch && ogSiteMatch[1]) {
    siteName = decodeHtmlEntities(ogSiteMatch[1]);
  }

  // 4. Strip boilerplate and noisy tags (scripts, styles, headers, footers, svgs, iframes)
  let cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ');

  // Look for semantic article or main containers
  let articleContent = '';
  const articleMatch = cleanHtml.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i) ||
                       cleanHtml.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) ||
                       cleanHtml.match(/<div[^>]*class=["'][^"']*(?:post-content|article-content|entry-content|markdown-body|story-body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

  const targetHtml = articleMatch ? articleMatch[1] : cleanHtml;

  // Convert headings, paragraphs, lists to structured text
  let structuredText = targetHtml
    .replace(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi, '\n\n### $2\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/g, ' '); // remove remaining tags

  structuredText = decodeHtmlEntities(structuredText);
  let finalBodyText = cleanText(structuredText);

  // If body is unexpectedly short or empty, fallback to title + description
  if (finalBodyText.length < 100) {
    finalBodyText = [title, description].filter(Boolean).join('\n\n');
  }

  // Cap to ~20,000 characters to keep prompt optimal and avoid token waste
  if (finalBodyText.length > 20000) {
    finalBodyText = finalBodyText.slice(0, 20000) + '\n\n[...Content truncated for presentation synthesis...]';
  }

  return {
    title: title || new URL(sourceUrl).hostname,
    description: description || '',
    siteName: siteName || new URL(sourceUrl).hostname,
    textContent: finalBodyText
  };
}

/**
 * Fetch and extract article/post content from any web link
 */
export async function scrapePostUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('A valid post URL is required.');
  }

  let formattedUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(formattedUrl);
  } catch {
    throw new Error('The URL provided is not a valid web address.');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Special Handler: Twitter / X post link (fetch via oEmbed API)
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    try {
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(formattedUrl)}&omit_script=true`;
      const oembedRes = await fetch(oembedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(8000)
      });
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        const tweetText = cleanText(decodeHtmlEntities((data.html || '').replace(/<[^>]+>/g, ' ')));
        return {
          title: `Post by ${data.author_name || 'Author'} on X`,
          description: tweetText.slice(0, 160),
          siteName: 'X / Twitter',
          textContent: `Post by ${data.author_name} (@${data.author_url ? data.author_url.split('/').pop() : 'user'}):\n\n${tweetText}`,
          sourceUrl: formattedUrl
        };
      }
    } catch (twErr) {
      console.warn('[Scraper] Twitter oEmbed notice:', twErr.message);
    }
  }

  // Special Handler: Reddit post link (fetch clean JSON)
  if (hostname.includes('reddit.com') && !formattedUrl.includes('.json')) {
    try {
      const redditJsonUrl = formattedUrl.replace(/\/?$/, '.json');
      const redditRes = await fetch(redditJsonUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PPTxplains/1.0' },
        signal: AbortSignal.timeout(8000)
      });
      if (redditRes.ok) {
        const data = await redditRes.json();
        const postData = data?.[0]?.data?.children?.[0]?.data;
        if (postData) {
          const postTitle = postData.title || '';
          const postText = postData.selftext || '';
          return {
            title: postTitle,
            description: postText.slice(0, 160) || postTitle,
            siteName: `Reddit (r/${postData.subreddit})`,
            textContent: `Reddit Post: ${postTitle}\nSubreddit: r/${postData.subreddit}\nUpvotes: ${postData.ups}\n\nContent:\n${postText || postTitle}`,
            sourceUrl: formattedUrl
          };
        }
      }
    } catch (redErr) {
      console.warn('[Scraper] Reddit JSON notice:', redErr.message);
    }
  }

  // General Web Page / Article Scraper
  try {
    const response = await fetch(formattedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      throw new Error(`Webpage responded with status HTTP ${response.status}`);
    }

    const html = await response.text();
    const extracted = extractFromHtml(html, formattedUrl);

    return {
      title: extracted.title,
      description: extracted.description,
      siteName: extracted.siteName,
      textContent: extracted.textContent,
      sourceUrl: formattedUrl
    };
  } catch (err) {
    console.warn(`[Scraper] Notice for ${formattedUrl}:`, err.message);

    // Smart graceful fallback based on URL structure so user is never blocked
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    const slug = pathParts.pop() || parsedUrl.hostname;
    const inferredTitle = slug
      .replace(/[-_]/g, ' ')
      .replace(/\.(html?|php)$/i, '')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      title: inferredTitle || `Article on ${parsedUrl.hostname}`,
      description: `Analysis and breakdown of publication at ${formattedUrl}`,
      siteName: parsedUrl.hostname,
      textContent: `Subject / Post URL: ${formattedUrl}\nDomain: ${parsedUrl.hostname}\nTopic inferred: ${inferredTitle}\n\nPlease generate a comprehensive technical presentation explaining the subject matter, key engineering principles, and core insights of this post topic.`,
      sourceUrl: formattedUrl,
      isFallback: true
    };
  }
}
