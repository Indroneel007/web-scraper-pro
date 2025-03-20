import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// Get the Browserless API key from environment variables
const BROWSERLESS_API_KEY = process.env.BROWSERLESS_API_KEY || 'your-browserless-api-key';

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of URLs' },
        { status: 400 }
      );
    }

    let browser;
    
    // Check if we have a valid Browserless API key
    if (BROWSERLESS_API_KEY && BROWSERLESS_API_KEY !== 'your-browserless-api-key') {

      console.log('Connecting to Browserless.io...');
      browser = await puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}`,
      });
    } else {
      // Fallback to local browser if Browserless is not configured
      console.log('Browserless API key not configured, falling back to local browser...');
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
      });
    }

    // Process all URLs in parallel using Promise.all
    const results = await Promise.all(
      urls.map(async (url: string) => {
        try {
          // Create a new page
          const page = await browser.newPage();
          
          // Set viewport for consistency
          await page.setViewport({ width: 1280, height: 800 });
          
          // Set user agent to avoid being blocked
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
          
          // Navigate to the URL with a timeout
          await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
          });
          
          // Get the page title
          const title = await page.title();
          
          // Extract text content
          const textContent = await page.evaluate(() => {
            return document.body.innerText;
          });
          
          // Close the page
          await page.close();
          
          return {
            url,
            title,
            textContent: textContent.substring(0, 1000) + '...', // Limit text content
            success: true,
          };
        } catch (error) {
          return {
            url,
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false,
          };
        }
      })
    );

    // Close the browser
    await browser.close();

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 