const AfricasTalking = require('africastalking');
const Notification = require('../models/Notification');

const at = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = at.SMS;
const voice = at.VOICE;

const sendSMS = async (to, message, type = 'sms', meta = {}) => {
  try {
    const result = await sms.send({
      to: Array.isArray(to) ? to : [to],
      message,
      from: process.env.AT_SENDER_ID,
    });
    await Notification.create({
      recipient: Array.isArray(to) ? to.join(',') : to,
      type,
      channel: 'sms',
      message,
      status: 'sent',
      reference: result?.SMSMessageData?.Recipients?.[0]?.messageId,
      ...meta,
    });
    return result;
  } catch (err) {
    console.error('SMS Error:', err.message);
    await Notification.create({
      recipient: Array.isArray(to) ? to.join(',') : to,
      type,
      channel: 'sms',
      message,
      status: 'failed',
      ...meta,
    });
  }
};

const sendQueueUpdate = (phone, position, route, eta) =>
  sendSMS(phone, `[PARKA] Queue Update: You are #${position} in the ${route} queue. Est. departure: ${eta}. Reply *123# for details.`, 'queue_update');

const sendLoadingAlert = (phone, plateNumber) =>
  sendSMS(phone, `[PARKA] Loading Alert: Vehicle ${plateNumber} - proceed to loading bay NOW. You have 15 minutes.`, 'loading_alert');

const sendDepartureNotification = (phone, route, time) =>
  sendSMS(phone, `[PARKA] Departure Confirmed: Your vehicle departs ${route} at ${time}. Safe travels!`, 'departure');

const sendDelayNotification = (phone, route, delayMins) =>
  sendSMS(phone, `[PARKA] Delay Notice: ${route} departure delayed by ${delayMins} minutes. We apologize for the inconvenience.`, 'delay');

const sendOTP = (phone, otp) =>
  sendSMS(phone, `[PARKA] Your departure verification OTP is: ${otp}. Valid for 10 minutes. Do not share.`, 'otp');

const sendBoardingAlert = (phone, route, departureTime, bay) =>
  sendSMS(phone, `[PARKA] Boarding Alert: Your ${route} vehicle departs at ${departureTime} from Bay ${bay}. Please board now!`, 'boarding');

const sendEmergencyVoiceAlert = async (phones, emergencyType, location) => {
  try {
    const result = await voice.call({
      callFrom: process.env.AT_SENDER_ID || '+254711082300',
      callTo: Array.isArray(phones) ? phones : [phones],
    });
    // Also send SMS backup
    await sendSMS(phones, `[PARKA EMERGENCY] ${emergencyType.toUpperCase()} reported at ${location}. Emergency services notified. Stay safe.`, 'emergency');
    return result;
  } catch (err) {
    console.error('Voice Alert Error:', err.message);
  }
};

// USSD response builder
const ussdResponse = (text, isEnd = false) => ({
  response: `${isEnd ? 'END' : 'CON'} ${text}`,
});

module.exports = {
  sendSMS,
  sendQueueUpdate,
  sendLoadingAlert,
  sendDepartureNotification,
  sendDelayNotification,
  sendOTP,
  sendBoardingAlert,
  sendEmergencyVoiceAlert,
  ussdResponse,
};
