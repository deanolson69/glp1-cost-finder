# Google Search Console Setup Guide for glp1costfinder.com

## Overview
This guide walks you through submitting glp1costfinder.com to Google Search Console so Google can crawl, index, and track your site's search performance.

---

## Step 1: Access Google Search Console

1. Go to **https://search.google.com/search-console**
2. Sign in with your **dean@olsoncoaches.com** Google Workspace account
3. You'll see a "Welcome to Search Console" page with two options for adding a property

---

## Step 2: Add Your Property (URL Prefix Method)

**Why URL Prefix instead of Domain:**
- Since glp1costfinder.com runs on Render (a third-party host) with a custom domain, URL prefix is the right choice
- Domain verification requires more complex DNS changes
- URL prefix verification is simpler and sufficient for your needs

**To add the property:**

1. On the Search Console home page, click **"URL prefix"** (the second option)
2. Enter: `https://glp1costfinder.com/`
3. Click **Continue**
4. You'll be taken to the verification page

---

## Step 3: Verify Your Property (HTML File Upload Method)

**Why HTML file upload:**
- It's the simplest method for a static site on Render
- No DNS changes needed
- Works immediately once the file is in place

**To verify:**

1. On the verification page, select the **"HTML file"** tab
2. Google will give you a file like `google1a2b3c4d5e6f.html`
3. Download this file to your computer
4. **Email this file to Claude Code** with these instructions:
   - Place the verification file in your site's `public/` folder on Render
   - The file path should be: `public/google1a2b3c4d5e6f.html` (using whatever filename Google provided)
   - After Claude Code adds it, deploy your site (Render will auto-deploy if connected to Git)

5. Once Claude Code confirms the file is deployed, return to Google Search Console and click **"Verify"**
6. Wait a few seconds — Google will check for the file and confirm ownership
7. You should see "Verification successful" within moments

---

## Step 4: Submit Your Sitemap

1. Once verified, you'll be in your Search Console dashboard for glp1costfinder.com
2. In the left sidebar, click **"Sitemaps"**
3. In the text box at the top, enter: `https://glp1costfinder.com/sitemap.xml`
4. Click **Submit**
5. Google will acknowledge and begin processing your sitemap

---

## Step 5: Request Indexing for Your Homepage

This tells Google to crawl your site immediately rather than waiting:

1. In the Search Console dashboard, click the **Search box** at the top of the page
2. Enter: `https://glp1costfinder.com/`
3. Click **Enter** or the magnifying glass icon
4. Click the **"Request Indexing"** button that appears
5. Google will queue your homepage for crawling

---

## Step 6: Initial Setup Checklist

Complete these checks in your Search Console dashboard:

- [ ] **Mobile Usability**: Click "Mobile usability" in the left sidebar. Confirm there are no errors. (Your site should be mobile-friendly already since it's a single-page app.)
- [ ] **Core Web Vitals**: Click "Core Web Vitals" in the left sidebar. Check that your homepage shows good performance metrics. (Will populate after a few days of data.)
- [ ] **Coverage**: Click "Coverage" in the left sidebar. You should see your homepage listed as "Indexed". (May take a few hours after your request.)
- [ ] **Enhancements**: Scroll down the left sidebar. Check "Breadcrumbs", "Product", "FAQs" and other schema markup options. (For now, these are optional — you can add structured data later as your site grows.)

---

## Step 7: Monitor and Next Steps

**Weekly checks:**
- Visit the Search Console dashboard and check the **"Performance"** tab to see what search queries are showing your site
- Note which queries drive clicks vs. impressions (clicks = ranking well, impressions = ranking but not getting clicks)

**As you add landing pages:**
- Update your sitemap.xml to uncomment the placeholder entries and add real URLs
- Submit the sitemap again (Google will detect the changes)
- Use the **"Request Indexing"** tool to speed up crawling of new pages

**Content optimization:**
- Use the Performance data to see which search terms are relevant to your site
- Create blog posts or landing pages that target those queries
- Update your sitemap and request indexing for those new pages

---

## Troubleshooting

**"Verification failed"**
- Double-check the verification file is in `public/` and spelled exactly as Google provided
- Confirm the file is deployed (visible at `https://glp1costfinder.com/google1a2b3c4d5e6f.html`)
- Wait 5-10 minutes and try again — Render's CDN may need time to update

**Sitemap not processing**
- Ensure sitemap.xml is valid XML (no syntax errors)
- Confirm the sitemap URL is accessible at `https://glp1costfinder.com/sitemap.xml`
- Check that all URLs in the sitemap are live and return HTTP 200

**Homepage not indexing**
- This can take 24-48 hours even with the request
- Use the "Coverage" report to see if Google found any crawl errors
- If you see errors, review them and fix any issues with your site

---

## Questions or Issues?

If you encounter problems:
1. Share the error message from Search Console
2. Check that your site is live and accessible (visit glp1costfinder.com in your browser)
3. Confirm the verification file or sitemap file is in the right location
4. Email Claude Code with the specific step where you got stuck
