# Mailchimp Integration Specification
## GLP-1 Cost Finder — Email Capture & Price Alert System

**Project:** glp1costfinder.com  
**Stack:** React 18 + Vite (static site on Render)  
**Current Status:** Email form exists in src/App.jsx but does not integrate with Mailchimp  
**Date:** April 18, 2026

---

## 1. Executive Summary

The GLP-1 Cost Finder website has a functional email capture form but currently only logs captures to browser console. This spec provides a complete, client-side Mailchimp integration that works within the constraints of a static Vite site deployed on Render.

**Key constraint:** No backend server. All integrations must work client-side only or use Mailchimp's hosted infrastructure.

**Recommended approach:** Mailchimp's Forms API with CORS proxy configuration (requires minimal server-side support or workaround).

---

## 2. Current Email Form Implementation

### Location
**File:** `src/App.jsx`  
**Lines:** 198–267 (state management) and 473–510 (UI rendering)

### Current Code Structure
```jsx
// State management (lines 198–200)
const [email, setEmail] = useState("");
const [emailSubmitted, setEmailSubmitted] = useState(false);
const [emailError, setEmailError] = useState("");

// Handler function (lines 259–262)
const handleEmail = () => {
  if (!email || !email.includes("@") || !email.includes(".")) {
    setEmailError("Please enter a valid email");
    return;
  }
  setEmailError("");
  setEmailSubmitted(true);
  console.log("Email captured:", {email, state:selectedState, insurance, condition});
};

// Reset function (lines 267–268)
const startOver = () => {
  // ... other resets
  setEmail("");
  setEmailSubmitted(false);
  setEmailError("");
};
```

### UI Rendering (lines 473–510)
- Email input field with placeholder "Your email address"
- Submit button labeled "Unlock"
- Error state display for invalid emails
- Confirmation message after submission with captured email

### Data Captured
Currently captures to console only:
- `email` — user's email address
- `state` — selected state (if Medicaid)
- `insurance` — selected insurance type (commercial, medicaid, medicare, uninsured)
- `condition` — selected condition (diabetes, weightloss, heart, kidney, liver, sleep, skip)

---

## 3. Integration Approach Comparison

### Option A: Mailchimp Forms API (Recommended)
**Best for:** List management, double opt-in, custom fields, price alerts

**Pros:**
- Built-in GDPR compliance, double opt-in workflows
- Rich subscriber data (custom fields for state, insurance type, condition)
- Native Mailchimp automation (price alert emails, welcome series)
- Explicit list management; easy to segment users

**Cons:**
- CORS restrictions; requires proxy workaround OR Mailchimp's Forms API embed
- Need to configure Mailchimp account and audience manually
- Slightly more complex than client-side capture

**Cost:** Free (Mailchimp free tier supports up to 500 contacts)

---

### Option B: Mailchimp Hosted Form Embed
**Best for:** Quick setup, minimal configuration

**Pros:**
- Zero CORS issues; Mailchimp handles everything
- Mailchimp UI includes unsubscribe link, GDPR compliance
- No client-side code changes needed (drop-in embed)

**Cons:**
- Cannot capture state/insurance/condition custom fields client-side
- Less control over form styling to match site design
- Separate form modal/popup; disrupts UX flow

**Cost:** Free

---

### Option C: Backend Proxy (Not Recommended for Static Site)
**Why not:** Requires a backend server; defeats the purpose of a static site on Render. Render's static hosting does not support Node/Python backends without upgrading to a Web Service.

---

### **Recommendation: Option A (Forms API) with CORS Workaround**

Use Mailchimp's Forms API directly with the `cors-anywhere` pattern (or a lightweight serverless function). This allows:
- Capture email + custom fields (state, insurance, condition)
- Server-side double opt-in configuration
- Native Mailchimp automation

---

## 4. Implementation Plan: Forms API Approach

### 4.1 Mailchimp Account Setup (Manual — Dean's responsibility)

#### Step 1: Create an Audience
1. Log in to [mailchimp.com](https://mailchimp.com)
2. Navigate to **Audience** (left sidebar)
3. Click **Create Audience**
4. Fill in:
   - **Audience name:** "GLP-1 Cost Finder"
   - **Email address:** Your sending email (e.g., dean@olsoncoaches.com)
   - **Default from name:** "GLP-1 Cost Finder Team"
   - **Audience notes:** "Email captures from glp1costfinder.com cost comparison tool"
5. Click **Save**

#### Step 2: Add Custom Fields
In the new audience, go to **Audience fields and *|MERGE|* tags**:
1. Click **Add a Field**
2. Add three fields:
   - **Field name:** "STATE"  
     **Type:** Dropdown  
     **Options:** AL, AK, AZ, ..., WY (all 50 states + DC)  
     **Tag:** STATE
   - **Field name:** "INSURANCE_TYPE"  
     **Type:** Dropdown  
     **Options:** Commercial, Medicaid, Medicare, Uninsured  
     **Tag:** INSTYPE
   - **Field name:** "CONDITION"  
     **Type:** Dropdown  
     **Options:** Diabetes, Weight Loss, Cardiovascular, Kidney Disease, Liver Disease, Sleep Apnea, Not Sure  
     **Tag:** CONDITION

#### Step 3: Generate API Key
1. Go to **Account** (bottom left) → **Extras** → **API keys**
2. Click **Create A Key**
3. Copy the new API key and store it securely
4. Note your **Data Center** (e.g., `us1`, `us2`, etc.) from the API key suffix

#### Step 4: Find Audience ID
1. Go back to **Audience** dashboard
2. Click **Settings** → **Audience name and defaults**
3. Under **Audience ID**, copy the ID (e.g., `a1b2c3d4e5`)

### 4.2 Environment Variables (Vite)

Create a `.env.local` file in the project root:
```env
VITE_MAILCHIMP_API_KEY=your-api-key-here
VITE_MAILCHIMP_AUDIENCE_ID=your-audience-id-here
VITE_MAILCHIMP_SERVER=us1
```

**Why `.env.local`?**
- Vite automatically loads `.env.local` in development
- Not committed to git (add to `.gitignore` if not already)
- Safely contains sensitive API keys

**For production on Render:**
Add these as Environment Variables in Render dashboard:
1. Go to your Render service
2. **Settings** → **Environment**
3. Add the three variables above

---

### 4.3 CORS Consideration

**Problem:** Mailchimp API is CORS-protected; direct fetch from browser is blocked.

**Solution Options:**

#### Option A: Use CORS Proxy (Simplest)
Use a public CORS proxy service (e.g., `https://cors-anywhere.herokuapp.com`):
```javascript
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const mailchimpUrl = `${proxyUrl}https://YOUR-DATACENTER.api.mailchimp.com/3.0/lists/YOUR-AUDIENCE-ID/members`;
```

**Caveat:** Public proxies are unreliable and rate-limited. Only suitable for low-volume testing.

#### Option B: Serverless Function (Recommended)
Deploy a lightweight serverless function (e.g., Vercel, Netlify) as a CORS proxy:

**Netlify Functions example:**
```javascript
// netlify/functions/subscribe.js
export const handler = async (event) => {
  const { email, state, insurance, condition } = JSON.parse(event.body);
  const MAILCHIMP_API = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
  const SERVER = process.env.MAILCHIMP_SERVER;

  try {
    const response = await fetch(
      `https://${SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_address: email,
          status: 'pending',
          merge_fields: {
            STATE: state || null,
            INSTYPE: insurance || null,
            CONDITION: condition || null
          }
        })
      }
    );
    return { statusCode: 200, body: JSON.stringify(await response.json()) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
```

Deploy on Netlify (free tier) and call from React:
```javascript
await fetch('/.netlify/functions/subscribe', {
  method: 'POST',
  body: JSON.stringify({ email, state, insurance, condition })
});
```

**Advantage:** Handles CORS server-side; API key never exposed to browser.

#### Option C: Hybrid Approach (Best for Static Site)
If adding serverless functions is too complex, use Mailchimp's Forms API endpoint with a simple workaround:

Render's static sites support **custom headers** via a `_headers` file (Netlify style) or manual configuration. Contact Render support to enable CORS headers for Mailchimp API domain.

Alternatively, use a free service like [https://mailchimp.com/developer/api/marketing/lists/](mailchimp list API docs) with a third-party CORS proxy for development only, then add serverless function for production.

---

### 4.4 Code Changes to src/App.jsx

#### Import and Configuration (top of file)
```javascript
import { useState, useRef, useEffect } from "react";

// Mailchimp configuration
const MAILCHIMP_API_KEY = import.meta.env.VITE_MAILCHIMP_API_KEY || '';
const MAILCHIMP_AUDIENCE_ID = import.meta.env.VITE_MAILCHIMP_AUDIENCE_ID || '';
const MAILCHIMP_SERVER = import.meta.env.VITE_MAILCHIMP_SERVER || 'us1';
```

#### Replace handleEmail function (lines 259–262)
```javascript
const handleEmail = async () => {
  // Validation
  if (!email || !email.includes("@") || !email.includes(".")) {
    setEmailError("Please enter a valid email");
    return;
  }

  setEmailError("");
  
  try {
    // Option 1: Direct API call (requires CORS proxy)
    // const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    // const mailchimpUrl = `${proxyUrl}https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;
    
    // Option 2: Serverless function call (recommended)
    const response = await fetch('/.netlify/functions/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        state: selectedState || null,
        insurance: insurance || null,
        condition: condition || null
      })
    });

    if (!response.ok) {
      const error = await response.json();
      setEmailError(error.message || "Failed to subscribe. Please try again.");
      return;
    }

    setEmailSubmitted(true);
    console.log("Email subscribed successfully:", { email, state: selectedState, insurance, condition });
  } catch (err) {
    console.error("Mailchimp subscription error:", err);
    setEmailError("Network error. Please check your connection.");
  }
};
```

---

### 4.5 Double Opt-In Configuration

**Recommended:** Enable double opt-in in Mailchimp to comply with email marketing best practices.

#### In Mailchimp:
1. Go to **Audience** → **Settings** → **Audience name and defaults**
2. Scroll to **Email marketing**
3. Set **Confirmation email setting** to **Pending**
4. Under **Confirmation email**, customize the message:
   - Subject: "Confirm your email for GLP-1 Price Alerts"
   - Body: "Click the link below to confirm you want to receive price drop alerts and GLP-1 updates."

#### In React code:
Set `status: 'pending'` in the API payload (shown above). Mailchimp will automatically send confirmation email.

**Note:** Users will only be added to list after clicking the confirmation link. This reduces spam and ensures list quality.

---

## 5. CORS and Environment Variable Details

### 5.1 Why CORS is an Issue

Mailchimp's API has CORS restrictions. When the browser makes a fetch request to Mailchimp's API domain (`us1.api.mailchimp.com`), Mailchimp's servers reject it because the request comes from a different origin (`glp1costfinder.com`).

### 5.2 Solution: Serverless Function

**Netlify Deployment (Free tier, includes 125K free function invocations/month):**

1. Add a functions directory and serverless function (as shown in 4.3 Option B)
2. Deploy on Netlify instead of Render, or keep Render for static assets and use Netlify Functions as API endpoint
3. Call from React using relative path (`/.netlify/functions/subscribe`)

**Vercel Alternative:**
```javascript
// api/subscribe.js
export default async (req, res) => {
  const { email, state, insurance, condition } = req.body;
  // Same Mailchimp API logic as above
};
```

### 5.3 Environment Variables in Vite

Vite automatically loads `.env.local` and prefixes with `VITE_`:
```javascript
// In src/App.jsx
const apiKey = import.meta.env.VITE_MAILCHIMP_API_KEY;
const audienceId = import.meta.env.VITE_MAILCHIMP_AUDIENCE_ID;
```

**Important:** Only variables prefixed with `VITE_` are exposed to the browser. This is secure for non-sensitive variables but **API keys should never be in client-side code**. Always use a serverless function.

---

## 6. Step-by-Step Implementation Roadmap

### Phase 1: Mailchimp Setup (30 minutes)
- [ ] Create Mailchimp audience for GLP-1 Cost Finder
- [ ] Add custom fields: STATE, INSTYPE, CONDITION
- [ ] Generate API key and audience ID
- [ ] Configure double opt-in confirmation email
- [ ] Save credentials securely

### Phase 2: Choose Integration Method (15 minutes)
- [ ] Decide between Netlify Functions (recommended) or CORS proxy
- [ ] If Netlify: Deploy serverless function for subscription handler
- [ ] Test CORS handling in development

### Phase 3: Update App.jsx (45 minutes)
- [ ] Add Mailchimp environment variables to `.env.local`
- [ ] Replace `handleEmail()` function with async Mailchimp call
- [ ] Add error handling for failed subscriptions
- [ ] Update UI to show loading state during subscription
- [ ] Test locally with mock data

### Phase 4: Deployment (30 minutes)
- [ ] Add environment variables to Render dashboard
- [ ] Deploy serverless function (if using Netlify)
- [ ] Test on production domain
- [ ] Verify subscriber appears in Mailchimp audience
- [ ] Verify confirmation email is sent

### Phase 5: Automation (1 hour)
- [ ] Create Mailchimp automation workflow for price alerts
- [ ] Draft welcome email sequence
- [ ] Set up abandoned price-check email (optional)

---

## 7. Testing Checklist

### Local Development
- [ ] `.env.local` file created with all three variables
- [ ] Form submission triggers Mailchimp API call
- [ ] Successful submission shows confirmation message
- [ ] Invalid email shows error message
- [ ] Custom fields (state, insurance, condition) are sent to Mailchimp
- [ ] Browser console shows no CORS errors

### Production (glp1costfinder.com)
- [ ] Environment variables set in Render dashboard
- [ ] Form submission works on live domain
- [ ] Subscriber appears in Mailchimp audience within 30 seconds
- [ ] Confirmation email is delivered to test address
- [ ] Multiple subscribers with different data are properly segmented
- [ ] Unsubscribe link in Mailchimp emails works

---

## 8. Mailchimp Automation Recommendations

Once subscribers are captured, set up these automations:

### Welcome Series
1. **Welcome email** (immediate): Confirm subscription, link to privacy policy, thank them
2. **State-specific email** (day 2): Show Medicaid coverage for their state
3. **Price alert education** (day 5): Explain how price alerts work, show examples

### Price Drop Alerts
- Segment audience by insurance type and condition
- Send email when a medication's price drops 10%+ on the captured channels (TrumpRx, GoodRx, LillyDirect, etc.)
- Monthly price update email with top deals for their segment

### Conditional Logic
Use Mailchimp's conditional content blocks to show:
- State-specific Medicaid coverage info
- Insurance-type-specific pricing
- Condition-specific medication recommendations

---

## 9. Troubleshooting Guide

### Problem: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Cause:** Direct API call to Mailchimp without proxy  
**Solution:** Use serverless function (Netlify/Vercel) instead of direct fetch

### Problem: "Invalid audience ID" or "401 Unauthorized"
**Cause:** Wrong API key, audience ID, or data center  
**Solution:** 
- Verify API key in Mailchimp → Account → API keys
- Verify audience ID matches the audience you created
- Verify data center code (us1, us2, etc.) matches your account

### Problem: Email appears in Mailchimp with status "Pending" indefinitely
**Cause:** Double opt-in enabled, but user didn't click confirmation email  
**Solution:** Check Mailchimp's confirmation email (spam folder), resend confirmation, or disable double opt-in (not recommended)

### Problem: Custom fields (state, insurance, condition) not appearing in Mailchimp
**Cause:** 
- Field names don't match (e.g., "STATE" vs "State")
- Fields not sent in API payload
**Solution:**
- Verify custom field names are UPPERCASE in Mailchimp
- Verify merge_fields in API call use correct names (STATE, INSTYPE, CONDITION)

---

## 10. Security Considerations

### API Key Protection
- Never commit API keys to git
- Use `.env.local` and `.env.production` (not committed)
- In serverless functions, store keys as environment variables (not code)
- Render environment variables are encrypted at rest

### GDPR Compliance
- Double opt-in enabled (confirmed in setup step 4.1)
- Unsubscribe link in all emails (Mailchimp default)
- Privacy policy linked in subscription confirmation
- Clear data handling: "No spam. Unsubscribe anytime. We never share your email."

### Rate Limiting
- Mailchimp free tier: 10 requests/second
- Render static site: no rate limiting needed (each form submission = 1 API call)
- Consider adding client-side debounce to prevent double-clicks

---

## 11. File Reference Summary

**Files to modify:**
- `src/App.jsx` — Add Mailchimp integration to handleEmail() function

**Files to create:**
- `.env.local` — Store API credentials (development only)
- `netlify/functions/subscribe.js` — Serverless CORS proxy (if using Netlify Functions)

**Files to update in Render:**
- Environment variables in Render dashboard (VITE_MAILCHIMP_API_KEY, VITE_MAILCHIMP_AUDIENCE_ID, VITE_MAILCHIMP_SERVER)

**No changes needed:**
- `package.json` — No new dependencies required
- `vite.config.js` — No config changes
- `index.html` — No changes

---

## 12. Alternative: Mailchimp Hosted Form Embed

If the above approach is too complex, Mailchimp provides a hosted form embed:

### Quick Setup
1. In Mailchimp, go to **Automations** → **Signup Forms**
2. Create a new signup form
3. Customize the form design to match glp1costfinder.com
4. Mailchimp provides an embed code (iframe)
5. Drop the iframe into `src/App.jsx` where the current form is

### Trade-offs
- **Pros:** Zero code changes, instant GDPR compliance, no CORS issues
- **Cons:** Cannot capture state/insurance/condition data in hosted form; separate UI from main app; less control over styling

---

## 13. Success Metrics

After implementation, track:
- **Subscription rate:** Emails submitted / total site visitors
- **Confirmation rate:** Confirmed subscribers / emails submitted
- **List growth:** Weekly subscriber count
- **Email engagement:** Open rate, click-through rate on price alert emails
- **Churn:** Unsubscribe rate

---

## Appendix: Quick Reference

| Item | Value |
|------|-------|
| **Mailchimp API Version** | v3.0 |
| **Endpoint** | `https://{SERVER}.api.mailchimp.com/3.0/lists/{AUDIENCE_ID}/members` |
| **Method** | POST |
| **Auth** | Bearer token (API key) |
| **Custom Fields** | STATE, INSTYPE, CONDITION (merge_fields in request) |
| **Double Opt-In** | Enabled (status: 'pending') |
| **CORS Solution** | Serverless function (Netlify/Vercel) |
| **Env Prefix** | VITE_ |
| **Free Tier Limit** | 500 contacts, 10 requests/second |

---

## Questions for Dean

Before implementation, confirm:
1. Do you want to use Netlify Functions for serverless CORS proxy, or would you prefer a different approach?
2. Should the privacy policy mention "price drop alerts" as a feature?
3. Do you want to segment users by state/insurance/condition for targeted emails, or send uniform updates to all subscribers?
4. What frequency for price alerts? (daily, weekly, monthly)
5. Should the form capture consent for both price alerts AND general GLP-1 updates, or just price alerts?
