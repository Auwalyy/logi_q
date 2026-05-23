const router = require('express').Router();
const Driver = require('../models/Driver');
const Queue = require('../models/Queue');
const Emergency = require('../models/Emergency');
const { sendEmergencyVoiceAlert } = require('../services/africasTalking');

// Africa's Talking sends text as concatenated input e.g. "" -> "1" -> "1*2" -> "1*2*Kano"
router.post('/callback', async (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;

  // Always respond with Content-Type: text/plain
  res.set('Content-Type', 'text/plain');

  let response = '';

  // ── Level 0: First request (empty text) ─────────────────────────────────
  if (text === '') {
    response = `CON Welcome to PARKA Transport
1. Join Queue
2. Check Queue Position
3. Confirm Departure
4. Report Emergency`;
  }

  // ── Level 1: Main menu selection ────────────────────────────────────────
  else if (text === '1') {
    const queues = await Queue.find({ status: 'active' }).limit(5);
    if (!queues.length) {
      response = 'END No active queues at this time. Please try again later.';
    } else {
      const list = queues.map((q, i) => `${i + 1}. ${q.route}`).join('\n');
      response = `CON Select your route:\n${list}`;
    }
  }

  else if (text === '2') {
    const driver = await Driver.findOne({ phone: phoneNumber }).populate('currentQueue');
    if (!driver) {
      response = 'END Phone number not registered. Visit the park office to register.';
    } else if (!driver.currentQueue) {
      response = 'END You are not currently in any queue.';
    } else {
      const queue = driver.currentQueue;
      const entry = queue.entries.find(e => e.driver.toString() === driver._id.toString());
      const eta = entry?.estimatedDepartureTime
        ? new Date(entry.estimatedDepartureTime).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
        : 'TBD';
      response = `END Queue: ${queue.route}
Position: #${entry?.position ?? '?'}
Status: ${entry?.status ?? 'waiting'}
Est. Departure: ${eta}
Park: ${queue.park}`;
    }
  }

  else if (text === '3') {
    response = 'CON Enter your 6-digit OTP to confirm departure:';
  }

  else if (text === '4') {
    response = `CON Select emergency type:
1. Accident
2. Breakdown
3. Security Threat
4. Medical Emergency
5. Fire`;
  }

  // ── Level 2: Sub-menu responses ──────────────────────────────────────────

  // 1*N → driver selected a route to join
  else if (text.startsWith('1*')) {
    const parts = text.split('*');
    if (parts.length === 2) {
      const idx = parseInt(parts[1]) - 1;
      const queues = await Queue.find({ status: 'active' }).limit(5);
      const queue = queues[idx];
      if (!queue) {
        response = 'END Invalid selection. Please try again.';
      } else {
        const driver = await Driver.findOne({ phone: phoneNumber });
        if (!driver) {
          response = 'END Your number is not registered as a driver. Visit the park office.';
        } else {
          // Check if already in this queue
          const alreadyIn = queue.entries.find(
            e => e.driver.toString() === driver._id.toString() && e.status !== 'cancelled'
          );
          if (alreadyIn) {
            response = `END You are already in this queue at position #${alreadyIn.position}.`;
          } else {
            const position = queue.entries.filter(e => e.status !== 'cancelled').length + 1;
            const eta = new Date(Date.now() + position * queue.avgLoadTimeMinutes * 60 * 1000);
            queue.entries.push({
              driver: driver._id,
              position,
              estimatedDepartureTime: eta,
              destination: queue.route.split('→')[1]?.trim() || queue.route,
            });
            await queue.save();
            await Driver.findByIdAndUpdate(driver._id, { status: 'in_queue', currentQueue: queue._id });
            const etaStr = eta.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
            response = `END Joined ${queue.route} queue!
Position: #${position}
Est. Departure: ${etaStr}
Park: ${queue.park}
You will receive an SMS update.`;
          }
        }
      }
    }
  }

  // 3*OTP → verify OTP for departure
  else if (text.startsWith('3*')) {
    const otp = text.split('*')[1];
    const driver = await Driver.findOne({ phone: phoneNumber });
    if (!driver) {
      response = 'END Driver not found. Contact park manager.';
    } else if (!driver.otp || driver.otpExpiry < new Date()) {
      response = 'END OTP has expired. Ask the park manager to resend your OTP.';
    } else if (driver.otp !== otp) {
      response = 'END Incorrect OTP. Please check the SMS and try again.';
    } else {
      driver.isVerified = true;
      driver.otp = undefined;
      driver.otpExpiry = undefined;
      await driver.save();
      response = 'END Departure confirmed! Your vehicle is cleared to depart. Safe travels.';
    }
  }

  // 4*N → selected emergency type, now ask for location
  else if (text.startsWith('4*') && text.split('*').length === 2) {
    const types = { '1': 'Accident', '2': 'Breakdown', '3': 'Security Threat', '4': 'Medical Emergency', '5': 'Fire' };
    const type = types[text.split('*')[1]];
    if (!type) {
      response = 'END Invalid selection. Please try again.';
    } else {
      response = `CON ${type} selected.\nEnter your current location\n(e.g. Kano-Kaduna Highway KM 45):`;
    }
  }

  // 4*N*location → submit emergency
  else if (text.startsWith('4*') && text.split('*').length === 3) {
    const parts = text.split('*');
    const typeMap = { '1': 'accident', '2': 'breakdown', '3': 'security', '4': 'medical', '5': 'fire' };
    const type = typeMap[parts[1]];
    const location = parts[2];

    if (!type || !location) {
      response = 'END Invalid input. Please try again.';
    } else {
      const driver = await Driver.findOne({ phone: phoneNumber });
      const severity = ['accident', 'fire', 'security'].includes(type) ? 'high' : 'medium';

      await Emergency.create({
        reporter: driver?._id,
        reporterPhone: phoneNumber,
        type,
        location,
        severity,
        description: `Reported via USSD by ${phoneNumber}`,
      });

      const alertPhones = process.env.EMERGENCY_PHONES?.split(',').filter(Boolean) || [];
      if (alertPhones.length) {
        await sendEmergencyVoiceAlert(alertPhones, type, location);
      }

      response = `END EMERGENCY REPORTED
Type: ${type.toUpperCase()}
Location: ${location}
Severity: ${severity.toUpperCase()}

Help is on the way. Stay safe.
Emergency contacts have been alerted.`;
    }
  }

  // ── Fallback ─────────────────────────────────────────────────────────────
  else {
    response = 'END Invalid input. Please dial *123# to start again.';
  }

  res.send(response);
});

// End-of-session notification (AT posts here when session ends)
router.post('/notification', (req, res) => {
  const { sessionId, phoneNumber, status, input, durationInMillis } = req.body;
  console.log(`USSD Session ended | ${phoneNumber} | status: ${status} | input: ${input} | duration: ${durationInMillis}ms`);
  res.sendStatus(200);
});

module.exports = router;
