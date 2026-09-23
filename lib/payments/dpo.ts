const DPO_API_URL = process.env.DPO_API_URL || "https://secure.3gdirectpay.com/API/v6/";
const DPO_PAY_BASE_URL = "https://secure.3gdirectpay.com/payv2.php";

export function isDpoConfigured(): boolean {
  return Boolean(process.env.DPO_COMPANY_TOKEN && process.env.DPO_SERVICE_TYPE);
}

export function buildDpoPaymentUrl(transToken: string): string {
  return `${DPO_PAY_BASE_URL}?ID=${encodeURIComponent(transToken)}`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Parses DPO's flat, non-nested XML response bodies (<API3G><Field>value</Field>...</API3G>). */
function parseXml(xml: string): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /<(\w+)>([^<]*)<\/\1>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    result[match[1]] = match[2];
  }
  return result;
}

function formatServiceDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface CreateDpoTokenParams {
  order: { id: string; orderNumber: string; total: string };
  customer: { firstName: string; lastName: string; email: string };
  redirectUrl: string;
  backUrl: string;
}

type DpoResult<T> = ({ success: true } & T) | { success: false; error: string };

export async function createDpoToken(params: CreateDpoTokenParams): Promise<DpoResult<{ transToken: string; transRef: string }>> {
  const companyToken = process.env.DPO_COMPANY_TOKEN;
  const serviceType = process.env.DPO_SERVICE_TYPE;
  if (!companyToken || !serviceType) return { success: false, error: "Card payments are not configured." };

  const currency = process.env.DPO_CURRENCY || "NAD";
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${escapeXml(companyToken)}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${params.order.total}</PaymentAmount>
    <PaymentCurrency>${escapeXml(currency)}</PaymentCurrency>
    <CompanyRef>${escapeXml(params.order.orderNumber)}</CompanyRef>
    <RedirectURL>${escapeXml(params.redirectUrl)}</RedirectURL>
    <BackURL>${escapeXml(params.backUrl)}</BackURL>
    <customerFirstName>${escapeXml(params.customer.firstName)}</customerFirstName>
    <customerLastName>${escapeXml(params.customer.lastName)}</customerLastName>
    <customerEmail>${escapeXml(params.customer.email)}</customerEmail>
    <PTL>96</PTL>
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${escapeXml(serviceType)}</ServiceType>
      <ServiceDescription>Order ${escapeXml(params.order.orderNumber)}</ServiceDescription>
      <ServiceDate>${formatServiceDate(new Date())}</ServiceDate>
    </Service>
  </Services>
</API3G>`;

  try {
    const response = await fetch(DPO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/xml; charset=utf-8" },
      body: xml,
    });
    const body = parseXml(await response.text());
    if (body.Result !== "000" || !body.TransToken) {
      return { success: false, error: body.ResultExplanation || "Could not start card payment." };
    }
    return { success: true, transToken: body.TransToken, transRef: body.TransRef || "" };
  } catch (error) {
    console.error("[dpo] createToken failed:", error);
    return { success: false, error: "Could not reach the card payment provider." };
  }
}

export async function verifyDpoToken(
  transToken: string,
): Promise<DpoResult<{ paid: boolean; resultCode: string; approval: string; amount: string; currency: string }>> {
  const companyToken = process.env.DPO_COMPANY_TOKEN;
  if (!companyToken) return { success: false, error: "Card payments are not configured." };

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${escapeXml(companyToken)}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${escapeXml(transToken)}</TransactionToken>
</API3G>`;

  try {
    const response = await fetch(DPO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/xml; charset=utf-8" },
      body: xml,
    });
    const body = parseXml(await response.text());
    const resultCode = body.Result || "";
    // 000 = paid, 001 = authorized; anything else (900 not paid yet, 901 declined, ...) is not a success.
    const paid = resultCode === "000" || resultCode === "001";
    return {
      success: true,
      paid,
      resultCode,
      approval: body.TransactionApproval || "",
      amount: body.TransactionAmount || "",
      currency: body.TransactionCurrency || "",
    };
  } catch (error) {
    console.error("[dpo] verifyToken failed:", error);
    return { success: false, error: "Could not reach the card payment provider." };
  }
}
