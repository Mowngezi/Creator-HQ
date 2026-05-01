/**
 * lib/whatsapp.mjs — Stub for WhatsApp OTP delivery.
 * 
 * In production, this would interface with Twilio WhatsApp API, 
 * Meta Cloud API, or a ZA-local provider like Infobip/Clickatell.
 */

/**
 * Sends a 6-digit OTP code to a phone number.
 * @param {string} phone - Target phone number in E.164 format
 * @param {string} code - 6-digit verification code
 * @returns {Promise<boolean>} Success status
 */
export async function sendOTP(phone, code) {
  console.log(`[WHATSAPP_STUB] Sending OTP ${code} to ${phone}`);
  
  // Simulated delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // For the Khanyisile test, we always succeed.
  return true;
}

/**
 * Validates if a string looks like a valid phone number.
 */
export function isValidPhone(phone) {
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(phone.replace(/\s+/g, ''));
}
