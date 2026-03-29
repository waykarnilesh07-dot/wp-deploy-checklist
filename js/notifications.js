// ============================================================
//  NOTIFICATIONS.JS — Slack & WhatsApp automation
// ============================================================

function saveNotifConfig() {
  const cfg = {
    waEnabled:      document.getElementById('wa-enabled')?.checked      || false,
    twilioSid:      document.getElementById('twilio-sid')?.value.trim() || '',
    twilioToken:    document.getElementById('twilio-token')?.value.trim()|| '',
    twilioFrom:     document.getElementById('twilio-from')?.value.trim() || '',
    twilioTo:       document.getElementById('twilio-to')?.value.trim()   || '',
    slackEnabled:   document.getElementById('slack-enabled')?.checked    || false,
    slackWebhook:   document.getElementById('slack-webhook')?.value.trim()|| '',
    reminderEnabled:document.getElementById('reminder-enabled')?.checked || false,
    reminderHours:  parseInt(document.getElementById('reminder-hours')?.value) || 24,
    reminderEmail:  document.getElementById('reminder-email')?.value.trim()|| ''
  };
  localStorage.setItem('wpqa-notifcfg', JSON.stringify(cfg));
  showToast('✅', 'Saved', 'Notification settings saved.');
}

function loadNotifConfig() {
  const cfg = JSON.parse(localStorage.getItem('wpqa-notifcfg') || '{}');
  const map = {
    'wa-enabled':       'waEnabled',
    'twilio-sid':       'twilioSid',
    'twilio-token':     'twilioToken',
    'twilio-from':      'twilioFrom',
    'twilio-to':        'twilioTo',
    'slack-enabled':    'slackEnabled',
    'slack-webhook':    'slackWebhook',
    'reminder-enabled': 'reminderEnabled',
    'reminder-hours':   'reminderHours',
    'reminder-email':   'reminderEmail'
  };
  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el || cfg[key] === undefined) return;
    if (el.type === 'checkbox') el.checked = cfg[key];
    else el.value = cfg[key];
  });
}

/* ── SLACK NOTIFICATION ── */
async function sendSlackNotification(report) {
  const cfg = JSON.parse(localStorage.getItem('wpqa-notifcfg') || '{}');
  if (!cfg.slackEnabled || !cfg.slackWebhook) return;

  const color  = report.pct === 100 ? '#2ecc8a' : report.pct > 50 ? '#f5a623' : '#ff5c5c';
  const status = report.pct === 100 ? '✅ COMPLETE' : '⏳ IN PROGRESS';

  const payload = {
    attachments: [{
      color,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `🚀 WP QA Report — ${report.project}`, emoji: true }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Project:*\n${report.project}` },
            { type: 'mrkdwn', text: `*Website:*\n${report.url || '—'}` },
            { type: 'mrkdwn', text: `*Phase:*\n${report.phase}` },
            { type: 'mrkdwn', text: `*Status:*\n${status}` },
            { type: 'mrkdwn', text: `*Completion:*\n${report.pct}% (${report.checked}/${report.total})` },
            { type: 'mrkdwn', text: `*Submitted by:*\n${report.checkedBy || '—'}` }
          ]
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: report.remarks ? `*Remarks:* ${report.remarks}` : '_No remarks_' }
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `Submitted via WP Deploy QA Pro · ${new Date().toLocaleString('en-IN')}` }]
        }
      ]
    }]
  };

  try {
    await fetch(cfg.slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showToast('💬', 'Slack Notified', 'Message posted to Slack channel.');
  } catch (err) {
    console.warn('Slack notification failed:', err);
    showToast('⚠️', 'Slack Failed', 'Could not post to Slack. Check webhook URL.');
  }
}

/* ── WHATSAPP NOTE ── */
// Twilio requires a server-side proxy due to CORS.
// Use n8n, Zapier, or a serverless function.
// The webhook URL should be YOUR proxy endpoint.
async function sendWhatsAppNotification(report) {
  const cfg = JSON.parse(localStorage.getItem('wpqa-notifcfg') || '{}');
  if (!cfg.waEnabled) return;

  // If user has set up an n8n/Zapier webhook proxy:
  const webhookProxy = localStorage.getItem('wpqa-wa-webhook');
  if (!webhookProxy) {
    console.info('WhatsApp: No proxy webhook configured. See README for n8n setup.');
    return;
  }

  const message = `*WP QA Report* 📋\n\nProject: ${report.project}\nWebsite: ${report.url}\nPhase: ${report.phase}\nStatus: ${report.pct === 100 ? '✅ COMPLETE' : '⏳ ' + report.pct + '%'}\nItems: ${report.checked}/${report.total}\n\nChecked by: ${report.checkedBy}`;

  try {
    await fetch(webhookProxy, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: cfg.twilioTo, message })
    });
    showToast('📱', 'WhatsApp Sent', 'Message sent via Twilio.');
  } catch (err) {
    console.warn('WhatsApp notification failed:', err);
  }
}

/* ── FIRE ALL NOTIFICATIONS ── */
async function fireNotifications(report) {
  await sendSlackNotification(report);
  await sendWhatsAppNotification(report);
}
