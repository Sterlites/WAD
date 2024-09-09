import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { url } = req.body;

  if (!url || !isValidUrl(url)) {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }

  let browser;
  let isLocal = process.env.NODE_ENV === 'development';

  try {
    const executablePath = isLocal
      ? puppeteer.executablePath() // Local environment
      : await chromium.executablePath; // Vercel environment

    browser = await puppeteer.launch({
      executablePath,
      args: chromium.args,
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Placeholder: Add logic to analyze the page and create the architecture diagram data
    const diagramData = await page.evaluate(() => {
      // Example: Find all links on the page
      const links = Array.from(document.querySelectorAll('a')).map(anchor => ({
        text: anchor.textContent,
        href: anchor.href
      }));

      return {
        nodes: [
          { id: '1', label: 'Root' },
          ...links.map((link, index) => ({ id: `${index + 2}`, label: link.text, url: link.href }))
        ],
        edges: links.map((link, index) => ({ from: '1', to: `${index + 2}`, label: 'links to' }))
      };
    });

    res.status(200).json(diagramData);
  } catch (error) {
    console.error('Error generating diagram:', error);
    res.status(500).json({ error: 'Failed to generate architecture diagram', details: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}