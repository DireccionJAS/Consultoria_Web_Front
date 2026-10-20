// Enforce the independent restrictions now. The full resource inventory is
// initially report-only until authenticated payment flows have been observed.
export const enforcedCsp = "object-src 'none'; base-uri 'self'; frame-ancestors 'none'";

export function candidateCsp(apiUrl) {
  let apiOrigin = 'https://backconsultoria-production-525d.up.railway.app';
  if (apiUrl) {
    const parsed = new URL(apiUrl);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') throw new Error('La API debe usar HTTPS');
    apiOrigin = parsed.origin;
  }
  return [
    "default-src 'self'",
    "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'",
    "script-src 'self' https://js.stripe.com https://*.js.stripe.com https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com https://accounts.google.com/gsi/client https://maps.googleapis.com",
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com/gsi/style",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src 'self' ${apiOrigin} https://api.stripe.com https://maps.googleapis.com https://accounts.google.com/gsi/ https://www.paypal.com https://www.sandbox.paypal.com https://*.paypal.com https://*.paypalobjects.com https://link.com https://*.link.com`,
    "frame-src 'self' blob: https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com https://www.paypal.com https://www.sandbox.paypal.com https://*.paypal.com https://accounts.google.com/gsi/ https://maps.google.com https://www.google.com/maps/ https://link.com https://*.link.com",
    "worker-src 'self' blob:", "media-src 'self' blob: https:",
    "form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com",
  ].join('; ');
}
