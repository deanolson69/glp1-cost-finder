// GA4 affiliate click tracking.
//
// Fires the GA4 `affiliate_click` custom event whenever a user clicks a
// Katalys affiliate link (any <a> whose href contains track.revoffers.com).
// All monetized affiliate links go through this Katalys redirector, so the
// hostname match is the single source of truth for "this click pays us."
//
// Implementation: one document-level click handler attached on first call.
// Idempotent -- calling initAffiliateClickTracking() twice is a no-op. SSR-
// safe: bails if document is undefined.
//
// Provider name resolution is derived from src/data/providers.json at module
// load time so newly added affiliate-linked providers are tracked
// automatically. No hand-maintained map.

import providersData from "../data/providers.json";

// Build {offer_id -> provider name} once at module load.
// Skips providers without a Katalys URL, and skips malformed URLs without
// throwing -- analytics infra should never break the page.
const OFFER_ID_TO_PROVIDER = (() => {
  const map = {};
  for (const p of providersData) {
    if (!p.url || !p.url.includes("track.revoffers.com")) continue;
    try {
      const offerId = new URL(p.url).searchParams.get("offer_id");
      if (offerId) map[offerId] = p.name;
    } catch (e) {
      // malformed URL in providers.json; ignore for tracking purposes
    }
  }
  return map;
})();

let attached = false;

export function initAffiliateClickTracking() {
  if (attached) return;
  if (typeof document === "undefined") return; // SSR / prerender guard
  document.addEventListener("click", handleClick);
  attached = true;
}

function handleClick(e) {
  // Use closest() so the handler catches clicks on child elements (e.g. a
  // span inside the <a>, or an <a> with an icon). Returns null if the click
  // wasn't inside an affiliate link.
  const link = e.target && e.target.closest
    ? e.target.closest('a[href*="track.revoffers.com"]')
    : null;
  if (!link) return;

  // Parse offer_id out of the actual clicked href (not from any cached state)
  // so the firing data matches the navigation that's about to happen.
  let offerId = null;
  let url = link.href;
  try {
    offerId = new URL(url).searchParams.get("offer_id");
  } catch (e) {
    // Malformed href -- still fire the event, just without offer_id, so the
    // anomaly shows up in GA4 rather than being silently dropped.
  }

  const providerName = (offerId && OFFER_ID_TO_PROVIDER[offerId]) || "Unknown";

  // gtag is loaded inline in index.html via the GA4 snippet. typeof check
  // covers cases where the snippet hasn't initialized yet (very early click)
  // or where ad blockers have stripped the script.
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "affiliate_click", {
        provider_name: providerName,
        link_url: url,
        offer_id: offerId,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  } catch (e) {
    // Swallow -- analytics failure must not block the navigation.
  }

  // No preventDefault / no stopPropagation. The link navigates normally;
  // gtag's transport sends the beacon in parallel.
}
