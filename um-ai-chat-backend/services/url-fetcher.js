const cheerio = require('cheerio');
const pdf = require('pdf-parse');

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

    // Fetch the URL
    const fetchPromise = fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
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
      const data = await pdf(Buffer.from(buffer));
      
      let content = data.text || '';
      
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

      console.log(`✅ Successfully fetched PDF content from ${url} (${content.length} characters)`);
      
      return {
        success: true,
        content: content,
        title: data.info?.Title || url.split('/').pop() || 'PDF Document',
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
    
    // Remove script and style elements
    $('script, style, noscript, iframe, embed, object').remove();
    
    // Extract title
    const title = $('title').text().trim() || $('h1').first().text().trim() || '';
    
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

