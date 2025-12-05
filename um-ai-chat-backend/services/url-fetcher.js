const cheerio = require('cheerio');
const { PDFParse } = require('pdf-parse');

/**
 * Extract URLs from text
 * @param {string} text - The text to search for URLs
 * @returns {string[]} - Array of found URLs
 */
function extractUrls(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // URL regex pattern - matches http://, https://, or www.
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const urls = text.match(urlPattern) || [];
  
  // Clean up URLs and add https:// to www. URLs
  return urls.map(url => {
    url = url.trim();
    // Remove trailing punctuation that might not be part of the URL
    url = url.replace(/[.,;:!?]+$/, '');
    // Add https:// to www. URLs
    if (url.startsWith('www.')) {
      url = 'https://' + url;
    }
    return url;
  }).filter((url, index, self) => self.indexOf(url) === index); // Remove duplicates
}

/**
 * Fetch and parse content from a URL
 * @param {string} url - The URL to fetch
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<{success: boolean, content?: string, error?: string, title?: string}>}
 */
async function fetchUrlContent(url, timeout = 10000) {
  try {
    console.log(`🌐 Fetching content from: ${url}`);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    // Special handling for Facebook URLs
    const isFacebook = url.includes('facebook.com');
    
    // Fetch the URL
    const fetchPromise = fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': isFacebook 
          ? 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
          : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        ...(isFacebook ? {
          'Referer': 'https://www.facebook.com/',
        } : {}),
      },
      redirect: 'follow',
    });

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    
    // Handle PDF files
    if (contentType.includes('application/pdf') || url.toLowerCase().endsWith('.pdf')) {
      const buffer = await response.arrayBuffer();
      const pdfData = new Uint8Array(buffer);
      const parser = new PDFParse(pdfData, {});
      await parser.load();
      const textResult = await parser.getText();
      
      // Extract text from all pages
      let content = '';
      if (textResult && typeof textResult === 'object' && textResult.pages) {
        content = textResult.pages.map(page => page.text || '').join('\n\n');
      } else if (typeof textResult === 'string') {
        content = textResult;
      } else {
        content = String(textResult || '');
      }
      
      // Clean up the text
      content = content
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
        .trim();
      
      // Limit content length to avoid token limits (keep first 8000 characters for PDFs)
      const maxLength = 8000;
      if (content.length > maxLength) {
        content = content.substring(0, maxLength) + '... [content truncated]';
      }

      const info = parser.getInfo();
      
      console.log(`✅ Successfully fetched PDF content from ${url} (${content.length} characters)`);
      
      return {
        success: true,
        content: content,
        title: info?.Title || url.split('/').pop() || 'PDF Document',
        url: url
      };
    }
    
    // Handle HTML files
    if (!contentType.includes('text/html')) {
      throw new Error(`Content type not supported: ${contentType}`);
    }

    const html = await response.text();
    
    // Parse HTML with cheerio
    const $ = cheerio.load(html);
    
    // Extract title (works for both Facebook and regular pages)
    let title = $('meta[property="og:title"]').attr('content') || 
                $('title').text().trim() || 
                $('h1').first().text().trim() || '';
    
    // Special handling for Facebook
    if (isFacebook) {
      // Facebook uses meta tags and structured data
      // Try to extract post content from meta tags
      let content = '';
      
      // Try to get description from meta tags (often contains post content)
      const metaDescription = $('meta[property="og:description"]').attr('content') || 
                             $('meta[name="description"]').attr('content') || '';
      
      // Try to find post text in common Facebook selectors
      const facebookSelectors = [
        '[data-testid="post_message"]',
        '.userContent',
        '[data-ad-preview="message"]',
        '.text_exposed_root',
        'div[dir="auto"]',
        '[role="article"]'
      ];
      
      for (const selector of facebookSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          // Get text from first few posts
          elements.slice(0, 10).each((i, el) => {
            const text = $(el).text().trim();
            if (text && text.length > 20 && !text.includes('Log in') && !text.includes('Sign up')) {
              content += text + '\n\n';
            }
          });
          if (content.length > 200) break;
        }
      }
      
      // If we found content, use it
      if (content.length > 50) {
        content = content.trim();
      } else if (metaDescription && metaDescription.length > 20) {
        // Fallback to meta description
        content = metaDescription;
      } else {
        // Last resort: try to extract any visible text
        $('script, style, noscript, iframe, embed, object, header, footer, nav').remove();
        const bodyText = $('body').text();
        // Filter out login prompts
        if (!bodyText.includes('Log Into Facebook') && !bodyText.includes('You must log in')) {
          content = bodyText;
        }
      }
      
      // Clean up Facebook-specific text
      content = content
        .replace(/Like|Comment|Share|See more|See less|Follow|Log in|Sign up|Forgot account/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    } else {
      // Regular HTML parsing for non-Facebook pages
      // Remove script and style elements
      $('script, style, noscript, iframe, embed, object').remove();
      
      // Extract main content
      // Try to find main content areas first
      let content = '';
      
      // Try semantic HTML5 elements first
      const mainSelectors = ['main', 'article', '[role="main"]', '.content', '#content', '.main-content', '#main-content'];
      for (const selector of mainSelectors) {
        const mainContent = $(selector).first();
        if (mainContent.length > 0) {
          content = mainContent.text();
          break;
        }
      }
      
      // Fallback to body if no main content found
      if (!content || content.trim().length < 100) {
        content = $('body').text();
      }
    }
    
    // Clean up the text
    content = content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
      .trim();
    
    // Limit content length to avoid token limits (keep first 5000 characters)
    const maxLength = 5000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '... [content truncated]';
    }

    console.log(`✅ Successfully fetched content from ${url} (${content.length} characters)`);
    
    return {
      success: true,
      content: content,
      title: title,
      url: url
    };
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error.message);
    return {
      success: false,
      error: error.message,
      url: url
    };
  }
}

/**
 * Fetch content from multiple URLs
 * @param {string[]} urls - Array of URLs to fetch
 * @returns {Promise<Array<{success: boolean, content?: string, error?: string, title?: string, url: string}>>}
 */
async function fetchMultipleUrls(urls) {
  if (!urls || urls.length === 0) {
    return [];
  }

  // Fetch all URLs in parallel (with limit to avoid overwhelming)
  const maxConcurrent = 3;
  const results = [];
  
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(url => fetchUrlContent(url))
    );
    results.push(...batchResults);
  }

  return results;
}

module.exports = {
  extractUrls,
  fetchUrlContent,
  fetchMultipleUrls,
};

