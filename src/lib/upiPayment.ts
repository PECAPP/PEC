/**
 * UPI Payment Utility
 * Handles UPI deep links and payment processing
 */
export interface UPIConfig {
  merchantId: string; // UPI ID (e.g., omnifow@okhdfcbank)
  merchantName: string;
  transactionId: string;
  amount: number; // In rupees
  description: string;
}

/**
 * Generates a UPI deep link for payment
 * Format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&tn=<DESCRIPTION>&tr=<TRANSACTION_ID>
 */
export const generateUPILink = (config: UPIConfig): string => {
  const params = new URLSearchParams();
  params.append("pa", config.merchantId); // Payee UPI ID
  params.append("pn", encodeURIComponent(config.merchantName)); // Payee name
  params.append("am", config.amount.toString()); // Amount in rupees
  params.append("tn", encodeURIComponent(config.description)); // Transaction note
  params.append("tr", config.transactionId); // Transaction reference ID

  return `upi://pay?${params.toString()}`;
};

/**
 * Initiates UPI payment by opening the deep link
 * The app will handle redirection to installed UPI apps
 */
export const initiateUPIPayment = (upiLink: string): Promise<void> => {
  return new Promise((resolve) => {
    // For web, we open the UPI link which will trigger app selection on mobile
    const link = document.createElement("a");
    link.href = upiLink;
    link.target = "_self";

    // Track if the app opened
    const timer = setTimeout(() => {
      resolve();
    }, 1500);

    link.click();

    window.addEventListener(
      "blur",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
};

/**
 * Generates a QR code data URL for UPI payment
 * Uses a QR code generation service
 */
export const generateUPIQRCode = async (upiLink: string): Promise<string> => {
  try {
    // Using API.qrserver.com for free QR code generation
    const encodedUPI = encodeURIComponent(upiLink);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUPI}`;
    return qrUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

/**
 * Detects if the user is on mobile
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

/**
 * Validates UPI ID format
 * Valid format: username@bankname
 */
export const validateUPIID = (upiId: string): boolean => {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/;
  return upiRegex.test(upiId);
};
