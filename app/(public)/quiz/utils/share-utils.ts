export const generateWhatsAppLink = (text: string, url?: string) => {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = url ? encodeURIComponent(url) : "";
  return `https://wa.me/?text=${encodedText}${encodedUrl ? `%20${encodedUrl}` : ""}`;
};

export const generateQRCodeUrl = (data: string, size: number = 200) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
};
