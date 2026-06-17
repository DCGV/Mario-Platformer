import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export function generateReferralCode(userId: string, benefitId: string): string {
  const timestamp = Date.now().toString();
  const payload = `${userId}:${benefitId}:${timestamp}`;
  const hmac = createHmac("sha256", process.env.AFFILIATE_TRACKING_SECRET!)
    .update(payload)
    .digest("hex")
    .slice(0, 16);
  const nonce = randomBytes(4).toString("hex");
  return `${userId.slice(-6)}-${benefitId.slice(-6)}-${nonce}-${hmac}`;
}

export function buildAffiliateUrl(
  affiliateBaseUrl: string,
  params: {
    conditionSlug: string;
    benefitId: string;
    referralCode: string;
  }
): string {
  const url = new URL(affiliateBaseUrl);
  url.searchParams.set("utm_source", "velahealth");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", params.conditionSlug);
  url.searchParams.set("utm_content", params.benefitId);
  url.searchParams.set("ref", params.referralCode);
  return url.toString();
}

export function hashIp(ip: string): string {
  return createHmac("sha256", process.env.AFFILIATE_TRACKING_SECRET!)
    .update(ip)
    .digest("hex")
    .slice(0, 16);
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
