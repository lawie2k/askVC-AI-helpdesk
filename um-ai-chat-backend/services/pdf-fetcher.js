const { PDFParse } = require('pdf-parse');

/**
 * Fetch and parse content from a PDF URL
 * @param {string} url 
 * @param {number} timeout - Timeout in milliseconds (default: 30000)
 * @returns {Promise<{success: boolean, content?: string, error?: string}>}
 */
async function fetchPdfContent(url, timeout = 30000) {
  try {
    console.log(`📄 Fetching PDF content from: ${url}`);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    // Fetch the PDF
    const fetchPromise = fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*',
      },
      redirect: 'follow',
    });

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/pdf') && !url.toLowerCase().endsWith('.pdf')) {
      throw new Error(`Content type not supported: ${contentType}`);
    }

    // Get PDF as buffer
    const buffer = await response.arrayBuffer();
    const pdfData = new Uint8Array(buffer);
    
    // Parse PDF
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
    
    // Limit content length to avoid token limits (keep first 10000 characters for better coverage)
    const maxLength = 10000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '... [content truncated]';
    }

    console.log(`✅ Successfully fetched PDF content (${content.length} characters)`);
    
    return {
      success: true,
      content: content,
    };
  } catch (error) {
    console.error(`❌ Error fetching PDF from ${url}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  fetchPdfContent,
};

