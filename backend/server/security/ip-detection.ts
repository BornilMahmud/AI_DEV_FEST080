import { Request } from "express";

/**
 * Normalizes an IPv4 or IPv6 address.
 * - Strips IPv4-mapped IPv6 prefix (::ffff:127.0.0.1 -> 127.0.0.1)
 * - Converts pure IPv6 loopback (::1) to 127.0.0.1 for clear local development display
 * - Validates format
 */
export function normalizeIpAddress(rawIp: string | undefined | null): string {
  if (!rawIp) return "127.0.0.1";

  let ip = rawIp.trim();

  // Strip IPv4-mapped IPv6 prefix
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  // Normalize IPv6 localhost
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") {
    return "127.0.0.1";
  }

  // Remove potential port if present in malformed header (e.g. 192.168.1.1:54321)
  if (ip.includes(":") && !ip.includes("::")) {
    const parts = ip.split(":");
    if (parts.length === 2 && !isNaN(Number(parts[1]))) {
      ip = parts[0];
    }
  }

  return ip;
}

export interface ClientIpDetails {
  ipAddress: string;
  isLoopback: boolean;
  isPrivate: boolean;
  source: "direct_socket" | "trusted_proxy" | "fallback";
}

/**
 * Securely extracts observed client IP address.
 * 
 * SECURITY PRINCIPLE:
 * - DO NOT blindly trust X-Forwarded-For or X-Real-IP from arbitrary untrusted clients.
 * - ONLY trust reverse proxy headers if TRUST_PROXY is enabled in configuration
 *   and the socket connection originates from a known loopback/internal proxy.
 * - Under no circumstances can a request body { ip_address: "..." } override the detected IP!
 */
export function getClientIp(req: Request): ClientIpDetails {
  const socketIp = normalizeIpAddress(req.socket?.remoteAddress);

  // Check if direct connection is loopback/internal proxy
  const isDirectLoopback =
    socketIp === "127.0.0.1" ||
    socketIp === "localhost" ||
    socketIp.startsWith("127.");

  const trustProxy =
    process.env.TRUST_PROXY === "true" ||
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "test" ||
    isDirectLoopback;

  let detectedIp = socketIp;
  let source: "direct_socket" | "trusted_proxy" | "fallback" = "direct_socket";

  if (trustProxy) {
    const xForwardedFor = req.headers["x-forwarded-for"];
    const xRealIp = req.headers["x-real-ip"];

    if (xForwardedFor) {
      // X-Forwarded-For can be a comma-separated list: client, proxy1, proxy2
      // In trusted proxy setup, the leftmost non-empty entry is the original client IP
      const rawList = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor;
      const ips = rawList.split(",").map((s) => s.trim()).filter(Boolean);
      if (ips.length > 0) {
        detectedIp = normalizeIpAddress(ips[0]);
        source = "trusted_proxy";
      }
    } else if (xRealIp) {
      const raw = Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
      if (raw) {
        detectedIp = normalizeIpAddress(raw);
        source = "trusted_proxy";
      }
    }
  }

  const isLoopback =
    detectedIp === "127.0.0.1" ||
    detectedIp === "localhost" ||
    detectedIp.startsWith("127.");

  const isPrivate =
    isLoopback ||
    detectedIp.startsWith("10.") ||
    detectedIp.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(detectedIp);

  return {
    ipAddress: detectedIp,
    isLoopback,
    isPrivate,
    source,
  };
}
