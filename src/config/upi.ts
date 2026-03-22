/**
 * UPI Configuration
 * Update these values with your actual merchant UPI ID
 */
export const UPI_CONFIG = {
  // Replace with your actual UPI ID from your bank
  merchantId: import.meta.env.VITE_UPI_ID || "9580711960@ybl",

  // Your business name as it appears in UPI apps
  merchantName: import.meta.env.VITE_UPI_NAME || "ananay dubey",

  // Transaction prefix for generating unique transaction IDs
  transactionPrefix: "OMNI",
};

/**
 * Get UPI configuration with validation
 */
export const getUPIConfig = () => {
  const merchantId = UPI_CONFIG.merchantId;

  if (!merchantId || !merchantId.includes("@")) {
    console.warn(
      "Invalid UPI ID configured. Please set VITE_UPI_ID in .env.local",
    );
  }

  return UPI_CONFIG;
};

/**
 * Generate a unique transaction reference ID
 */
export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${UPI_CONFIG.transactionPrefix}${timestamp}${random}`;
};
