// ============================================================
//  PDF.JS — Generate downloadable PDF report
// ============================================================

async function generatePDF() {
  showToast('📄', 'Generating PDF', 'Please wait...');

  try {
    const { jsPDF } = window.jspdf;
    const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const v    = getFormValues();
    const data = getCurrentData();
    const phase = currentPhase === 'before' ? 'BEFORE GO-LIVE' : 'AFTER GO-LIVE';
    const W = 210, margin = 14;
    let y = 0;

    // Helper: add page if needed
    function checkPage(needed = 10) {
      if (y + needed > 280) { doc.addPage(); y = 20; }
    }

    // ── HEADER ──
    doc.setFillColor(15, 20, 32);
    doc.rect(0, 0, W, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('WP Deploy QA Report', margin, 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(139, 147, 170);
    doc.text(phase, margin, 25);

    doc.setTextColor(79, 124, 255);
    doc.setFontSize(9);
    doc.text('Generated: ' + new Date().toLocaleString('en-IN'), margin, 33);

    y = 50;

    // ── PROJECT INFO BOX ──
    doc.setFillColor(24, 29, 40);
    doc.roundedRect(margin, y, W - margin*2, 44, 4, 4, 'F');

    doc.setTextColor(139, 147, 170);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    const info = [
      ['Project', v.project || '—'], ['Website', v.url || '—'],
      ['Client', v.client || '—'],   ['Team', v.team || '—'],
      ['Date', v.date || '—'],        ['Reviewed By', v.checkedBy || '—']
    ];

    info.forEach((pair, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx  = margin + 8 + col * 90;
      const by  = y + 10 + row * 12;
      doc.setTextColor(100, 110, 140);
      doc.setFontSize(7);
      doc.text(pair[0].toUpperCase(), bx, by);
      doc.setTextColor(236, 238, 245);
      doc.setFontSize(9);
      doc.text(pair[1], bx, by + 5);
    });

    y += 52;

    // ── COMPLETION BADGE ──
    let total = 0, checked = 0;
    data.forEach(s => {
      const all = getAllItems(s);
      total   += all.length;
      checked += getChecked(s.id).filter(x => all.includes(x)).length;
    });
    const pct = total ? Math.round(checked/total*100) : 0;

    const badgeColor = pct === 100 ? [46, 204, 138] : pct > 50 ? [245, 166, 35] : [255, 92, 92];
    doc.setFillColor(...badgeColor.map(c => Math.round(c * 0.15)));
    doc.roundedRect(margin, y, W - margin*2, 18, 3, 3, 'F');
    doc.setDrawColor(...badgeColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, W - margin*2, 18, 3, 3, 'S');

    doc.setTextColor(...badgeColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${pct === 100 ? 'COMPLETE ✓' : 'IN PROGRESS'} — ${checked}/${total} items (${pct}%)`, margin + 6, y + 11);

    y += 26;

    // ── SECTIONS ──
    data.forEach(section => {
      const allItems = getAllItems(section);
      const sChecked = getChecked(section.id);
      const sDone    = sChecked.filter(x => allItems.includes(x)).length;
      const allDone  = sDone === allItems.length;

      checkPage(20);

      // Section header
      doc.setFillColor(30, 35, 48);
      doc.roundedRect(margin, y, W - margin*2, 10, 2, 2, 'F');
      doc.setTextColor(79, 124, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${section.icon}  ${section.label.toUpperCase()}`, margin + 4, y + 7);

      // Section badge
      const bText = allDone ? 'COMPLETE' : `${sDone}/${allItems.length}`;
      const bColor = allDone ? [46,204,138] : [245,166,35];
      doc.setTextColor(...bColor);
      doc.setFontSize(8);
      doc.text(bText, W - margin - 4, y + 7, { align: 'right' });

      y += 13;

      // Items
      allItems.forEach(item => {
        checkPage(7);
        const done = sChecked.includes(item);

        // Checkbox
        if (done) {
          doc.setFillColor(46, 204, 138);
          doc.roundedRect(margin + 1, y - 4, 5, 5, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(6);
          doc.text('✓', margin + 2.2, y - 0.5);
        } else {
          doc.setDrawColor(74, 81, 104);
          doc.setLineWidth(0.4);
          doc.roundedRect(margin + 1, y - 4, 5, 5, 1, 1, 'S');
        }

        doc.setTextColor(done ? 74 : 236, done ? 81 : 238, done ? 104 : 245);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', done ? 'normal' : 'normal');
        const lines = doc.splitTextToSize(item, W - margin*2 - 14);
        doc.text(lines, margin + 9, y);
        y += lines.length * 5.5 + 1;
      });
      y += 4;
    });

    checkPage(20);

    // ── REMARKS ──
    if (v.remarks) {
      doc.setFillColor(30, 35, 48);
      doc.roundedRect(margin, y, W - margin*2, 22, 3, 3, 'F');
      doc.setDrawColor(245, 166, 35);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin, y + 22);

      doc.setTextColor(245, 166, 35);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('REMARKS', margin + 4, y + 8);
      doc.setTextColor(200, 205, 220);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const rLines = doc.splitTextToSize(v.remarks, W - margin*2 - 12);
      doc.text(rLines, margin + 4, y + 16);
      y += 28;
    }

    // ── SIGNATURE ──
    const sigData = getSignatureDataURL();
    if (sigData) {
      checkPage(35);
      doc.setFillColor(24, 29, 40);
      doc.roundedRect(margin, y, 80, 30, 3, 3, 'F');
      doc.setTextColor(139, 147, 170);
      doc.setFontSize(8);
      doc.text('DIGITAL SIGNATURE', margin + 4, y + 8);
      doc.addImage(sigData, 'PNG', margin + 4, y + 10, 70, 16);
      doc.setTextColor(74, 81, 104);
      doc.setFontSize(7);
      doc.text(v.checkedBy || 'Signed', margin + 4, y + 28);
      y += 36;
    }

    // ── FOOTER ──
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(15, 20, 32);
      doc.rect(0, 287, W, 10, 'F');
      doc.setTextColor(74, 81, 104);
      doc.setFontSize(7);
      doc.text('WP Deploy QA Pro · Confidential Report', margin, 293);
      doc.text(`Page ${i} of ${pageCount}`, W - margin, 293, { align: 'right' });
    }

    // Save
    const filename = `qa-report-${(v.project || 'report').replace(/\s+/g,'-').toLowerCase()}-${v.date || Date.now()}.pdf`;
    doc.save(filename);
    showToast('✅', 'PDF Downloaded', filename);

  } catch (err) {
    console.error(err);
    showToast('❌', 'PDF Failed', 'Error generating PDF. Try again.');
  }
}
