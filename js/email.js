// ============================================================
//  EMAIL.JS — real email sending via EmailJS SDK
//  Docs: https://www.emailjs.com/docs/
// ============================================================

/* ── SEND REPORT ── */
async function sendReport() {
  const project      = document.getElementById('f-project').value.trim();
  const clientEmail  = document.getElementById('f-client-email').value.trim();
  const internalEmail = document.getElementById('f-internal-email').value.trim();

  // Validation
  if (!project)       { showToast('⚠️', 'Missing Field', 'Please enter a Project Name.'); return; }
  if (!internalEmail) { showToast('⚠️', 'Missing Field', 'Please enter Internal Email(s).'); return; }
  if (selectedType === 'external' && !clientEmail) {
    showToast('⚠️', 'Missing Field', 'Please enter the Client Email for external submission.'); return;
  }

  // Build report data
  const report = buildPlainReport();

  // Get EmailJS config
  const cfg = JSON.parse(localStorage.getItem('wpqa-emailcfg') || '{}');
  const hasEmailJS = cfg.serviceId && cfg.publicKey && cfg.templateInternal && cfg.templateExternal;

  // Disable button + show spinner
  const sendBtn = document.getElementById('send-btn');
  document.getElementById('send-btn-text').style.display    = 'none';
  document.getElementById('send-spinner').style.display     = 'inline';
  sendBtn.disabled = true;

  try {
    if (hasEmailJS) {
      await sendViaEmailJS(cfg, report, clientEmail, internalEmail);
    } else {
      // Fallback: mailto link (opens email client)
      sendViaMailto(report, clientEmail, internalEmail);
    }

    // Save to history
    saveSubmission(report);
    closeModal();

    const sentTo = selectedType === 'internal'
      ? `Internal: ${internalEmail}`
      : `Client: ${clientEmail} + Internal: ${internalEmail}`;

    showToast('✅', hasEmailJS ? 'Email Sent!' : 'Draft Opened', sentTo);

  } catch (err) {
    console.error('Email error:', err);
    showToast('❌', 'Send Failed', err.message || 'Check EmailJS config and try again.');
  } finally {
    document.getElementById('send-btn-text').style.display = 'inline';
    document.getElementById('send-spinner').style.display  = 'none';
    sendBtn.disabled = false;
  }
}

/* ── EMAILJS SEND ── */
async function sendViaEmailJS(cfg, report, clientEmail, internalEmail) {
  // Initialise EmailJS with public key
  emailjs.init({ publicKey: cfg.publicKey });

  const templateParams = {
    // These variable names must match your EmailJS template
    project_name:    report.project,
    website_url:     report.url,
    client_name:     report.client,
    team_name:       report.team,
    checked_by:      report.checkedBy,
    date:            report.date,
    phase:           report.phase,
    completion_pct:  report.pct + '%',
    checked_count:   report.checked,
    total_count:     report.total,
    status:          report.pct === 100 ? 'COMPLETE ✓' : 'PENDING',
    remarks:         report.remarks || 'None',
    report_body:     report.text,
    to_email:        selectedType === 'internal' ? internalEmail : clientEmail,
    cc_email:        selectedType === 'external' ? internalEmail : '',
    reply_to:        internalEmail,
    submission_type: selectedType === 'internal' ? 'Internal' : 'Client + Team'
  };

  const templateId = selectedType === 'internal'
    ? cfg.templateInternal
    : cfg.templateExternal;

  const response = await emailjs.send(cfg.serviceId, templateId, templateParams);

  if (response.status !== 200) {
    throw new Error(`EmailJS responded with status ${response.status}`);
  }
}

/* ── MAILTO FALLBACK ── */
function sendViaMailto(report, clientEmail, internalEmail) {
  const subject = `[WP QA Report] ${report.project} — ${report.phase} (${report.pct}% Complete)`;
  const to      = selectedType === 'internal' ? internalEmail : clientEmail;
  const cc      = selectedType === 'external' ? internalEmail : '';
  const body    = encodeURIComponent(report.text);
  const cc_part = cc ? `&cc=${encodeURIComponent(cc)}` : '';
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}${cc_part}&body=${body}`;
}

/* ── SAVE TO HISTORY ── */
function saveSubmission(report) {
  submitHistory.unshift({
    id:      Date.now(),
    project: report.project,
    client:  report.client,
    url:     report.url,
    date:    new Date().toLocaleDateString('en-IN'),
    type:    selectedType,
    phase:   report.phase,
    pct:     report.pct
  });
  saveHistory();
}
