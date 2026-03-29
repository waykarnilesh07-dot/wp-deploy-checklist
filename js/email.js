// ============================================================
//  EMAIL.JS — EmailJS sending + fallback mailto
// ============================================================

async function sendReport() {
  const v = getFormValues();
  if (!v.project)       { showToast('⚠️','Missing','Please enter Project Name.'); return; }
  if (!v.internalEmail) { showToast('⚠️','Missing','Please enter Internal Email(s).'); return; }
  if (selectedType === 'external' && !v.clientEmail) {
    showToast('⚠️','Missing','Please enter Client Email for external submission.'); return;
  }

  const report = buildPlainReport();
  const cfg    = JSON.parse(localStorage.getItem('wpqa-emailcfg') || '{}');
  const hasEJS = cfg.serviceId && cfg.publicKey && cfg.templateInternal && cfg.templateExternal;

  // Disable button
  const btn = document.getElementById('send-btn');
  btn.disabled = true;
  document.getElementById('send-btn-text').textContent = 'Sending...';

  try {
    if (hasEJS) {
      await sendViaEmailJS(cfg, report, v);
    } else {
      sendViaMailto(report, v);
    }

    // Fire Slack / WhatsApp
    await fireNotifications(report);

    // Save history
    saveSubmission(report);
    closeModal('submit-modal');
    updateDashboard();
    renderHistory();

    const sentTo = selectedType === 'internal'
      ? `Sent to: ${v.internalEmail}`
      : `Sent to: ${v.clientEmail} + ${v.internalEmail}`;

    showToast('✅', hasEJS ? 'Report Sent!' : 'Email Draft Opened', sentTo);

  } catch (err) {
    console.error(err);
    showToast('❌','Send Failed', err.message || 'Check EmailJS config.');
  } finally {
    btn.disabled = false;
    document.getElementById('send-btn-text').textContent =
      selectedType === 'internal' ? 'Send to Internal Team' : 'Send to Client & Team';
  }
}

async function sendViaEmailJS(cfg, report, v) {
  emailjs.init({ publicKey: cfg.publicKey });
  const sigData = getSignatureDataURL();

  const params = {
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
    to_email:        selectedType === 'internal' ? v.internalEmail : v.clientEmail,
    cc_email:        selectedType === 'external' ? v.internalEmail : '',
    reply_to:        v.internalEmail,
    submission_type: selectedType === 'internal' ? 'Internal' : 'Client + Team',
    has_signature:   sigData ? 'Yes' : 'No'
  };

  const templateId = selectedType === 'internal' ? cfg.templateInternal : cfg.templateExternal;
  const res = await emailjs.send(cfg.serviceId, templateId, params);
  if (res.status !== 200) throw new Error('EmailJS error: ' + res.status);
}

function sendViaMailto(report, v) {
  const subject = `[WP QA] ${report.project} — ${report.phase} (${report.pct}%)`;
  const to      = selectedType === 'internal' ? v.internalEmail : v.clientEmail;
  const cc      = selectedType === 'external' ? `&cc=${encodeURIComponent(v.internalEmail)}` : '';
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}${cc}&body=${encodeURIComponent(report.text)}`;
}
