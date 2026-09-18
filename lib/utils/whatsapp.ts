export function buildProductWhatsappLink(params: {
  productName: string;
  price: string;
  number?: string | null;
}): string | null {
  const number = (params.number ?? process.env.NEXT_PUBLIC_ESELL_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (!number) return null;
  const text = `Hello ESell Namibia, I'm interested in ${params.productName} listed for ${params.price}. Is it still available?`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
