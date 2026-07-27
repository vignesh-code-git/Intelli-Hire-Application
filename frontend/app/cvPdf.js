// Vector PDF export for the built CV.
//
// The previous exporter screenshotted the DOM with html2canvas and embedded a
// JPEG per page. That produced a picture of a CV: blurry when zoomed, ~10x
// larger, and — the part that matters for a job application — invisible to the
// ATS keyword scanners that read uploaded PDFs, since there is no text in it.
//
// This draws the same document with jsPDF's text API instead, so every glyph
// is real, selectable, searchable text. Helvetica is one of the 14 standard
// PDF fonts, so nothing needs embedding and the file stays small.

const PAGE = { margin: 44 };

const FONT = {
  name: 19,
  role: 10.5,
  contact: 8.6,
  section: 9.6,
  body: 9.2,
  meta: 8.6,
};

const COLOR = {
  ink: [15, 23, 42],
  body: [30, 41, 59],
  muted: [71, 85, 105],
  rule: [203, 213, 225],
};

// Strip the markers the on-screen CV uses for emphasis/highlighting — they are
// presentation, not content, and would otherwise show up literally in the PDF.
const clean = (value) =>
  String(value ?? '')
    .replace(/\*\*/g, '')
    .replace(/[[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const asList = (value) => {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean);
  const text = clean(value);
  return text ? [text] : [];
};

export function buildCvPdf(jsPDF, cv = {}, skills = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const left = PAGE.margin;
  const right = pageW - PAGE.margin;
  const width = right - left;

  let y = PAGE.margin;

  const setFont = (size, style = 'normal', color = COLOR.body) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  // Reserve vertical space, starting a new page when the block won't fit.
  const need = (height) => {
    if (y + height > pageH - PAGE.margin) {
      doc.addPage();
      y = PAGE.margin;
      return true;
    }
    return false;
  };

  const paragraph = (text, { size = FONT.body, style = 'normal', color = COLOR.body, indent = 0, gap = 2, align } = {}) => {
    const value = clean(text);
    if (!value) return;
    setFont(size, style, color);
    const lines = doc.splitTextToSize(value, width - indent);
    const lineH = size * 1.35;
    lines.forEach((line) => {
      need(lineH);
      if (align === 'center') doc.text(line, pageW / 2, y + size, { align: 'center' });
      else doc.text(line, left + indent, y + size);
      y += lineH;
    });
    y += gap;
  };

  // A bullet drawn as a filled circle rather than a "•" glyph, so it can't
  // depend on the font's encoding.
  const bullet = (text) => {
    const value = clean(text);
    if (!value) return;
    const indent = 12;
    setFont(FONT.body, 'normal', COLOR.body);
    const lines = doc.splitTextToSize(value, width - indent);
    const lineH = FONT.body * 1.35;
    lines.forEach((line, i) => {
      need(lineH);
      if (i === 0) {
        doc.setFillColor(...COLOR.muted);
        doc.circle(left + 3.4, y + FONT.body * 0.62, 1.5, 'F');
      }
      doc.text(line, left + indent, y + FONT.body);
      y += lineH;
    });
    y += 1.5;
  };

  const sectionHeading = (label) => {
    const block = FONT.section * 1.3 + 12;
    need(block);
    y += 8;
    setFont(FONT.section, 'bold', COLOR.ink);
    doc.text(String(label).toUpperCase(), left, y + FONT.section);
    y += FONT.section * 1.25;
    doc.setDrawColor(...COLOR.rule);
    doc.setLineWidth(0.7);
    doc.line(left, y, right, y);
    y += 7;
  };

  // A heading with a right-aligned date, e.g. a job title and its duration.
  const titleRow = (title, trailing) => {
    const t = clean(title);
    const d = clean(trailing);
    if (!t && !d) return;
    const lineH = FONT.body * 1.4;
    need(lineH);
    setFont(FONT.body, 'bold', COLOR.ink);
    if (d) {
      setFont(FONT.meta, 'normal', COLOR.muted);
      const dw = doc.getTextWidth(d);
      doc.text(d, right, y + FONT.body, { align: 'right' });
      setFont(FONT.body, 'bold', COLOR.ink);
      doc.text(doc.splitTextToSize(t, width - dw - 12)[0] || '', left, y + FONT.body);
    } else {
      doc.text(t, left, y + FONT.body);
    }
    y += lineH;
  };

  const subtitleRow = (label, trailing) => {
    const l = clean(label);
    const t = clean(trailing);
    if (!l && !t) return;
    const lineH = FONT.meta * 1.4;
    need(lineH);
    setFont(FONT.meta, 'italic', COLOR.muted);
    if (l) doc.text(l, left, y + FONT.meta);
    if (t) doc.text(t, right, y + FONT.meta, { align: 'right' });
    y += lineH;
  };

  // ── Header ──────────────────────────────────────────────────
  const name = clean(cv.name) || 'Your Name';
  setFont(FONT.name, 'bold', COLOR.ink);
  doc.text(name.toUpperCase(), pageW / 2, y + FONT.name, { align: 'center' });
  y += FONT.name * 1.25;

  if (clean(cv.position)) {
    paragraph(cv.position, { size: FONT.role, style: 'normal', color: COLOR.muted, align: 'center', gap: 1 });
  }

  const headline = Array.isArray(cv.headerSkills) ? cv.headerSkills.map(clean).filter(Boolean) : [];
  if (headline.length) {
    paragraph(headline.join('  |  '), { size: FONT.contact, color: COLOR.muted, align: 'center', gap: 1 });
  }

  const contacts = [cv.phone, cv.email, cv.location].map(clean).filter(Boolean);
  if (contacts.length) {
    paragraph(contacts.join('  |  '), { size: FONT.contact, color: COLOR.muted, align: 'center', gap: 1 });
  }
  const links = [cv.portfolio, cv.linkedin, cv.github].map(clean).filter(Boolean);
  if (links.length) {
    paragraph(links.join('  |  '), { size: FONT.contact, color: COLOR.muted, align: 'center', gap: 1 });
  }

  y += 4;
  doc.setDrawColor(...COLOR.rule);
  doc.setLineWidth(1);
  doc.line(left, y, right, y);
  y += 2;

  // ── Summary ─────────────────────────────────────────────────
  if (clean(cv.summary)) {
    sectionHeading('Professional Summary');
    paragraph(cv.summary);
  }

  // ── Skills ──────────────────────────────────────────────────
  const skillRows = [
    ['Frontend', skills.frontend],
    ['Backend', skills.backend],
    ['Database', skills.database],
    ['Tools', skills.tools],
    ['AI / ML', skills.ai],
    ['Concepts', skills.concepts],
  ].filter(([, v]) => clean(v));

  if (skillRows.length) {
    sectionHeading('Technical Skills');
    const labelW = 62;
    skillRows.forEach(([label, value]) => {
      setFont(FONT.body, 'normal', COLOR.body);
      const lines = doc.splitTextToSize(clean(value), width - labelW);
      const lineH = FONT.body * 1.35;
      need(lineH);
      setFont(FONT.body, 'bold', COLOR.ink);
      doc.text(label, left, y + FONT.body);
      setFont(FONT.body, 'normal', COLOR.body);
      lines.forEach((line, i) => {
        if (i > 0) need(lineH);
        doc.text(line, left + labelW, y + FONT.body);
        y += lineH;
      });
      y += 1;
    });
  }

  // ── Experience ──────────────────────────────────────────────
  const experience = Array.isArray(cv.experience) ? cv.experience : [];
  if (experience.length) {
    sectionHeading('Work Experience');
    experience.forEach((item) => {
      if (typeof item === 'string') {
        bullet(item);
        return;
      }
      titleRow(item.position, item.duration);
      subtitleRow(item.company, item.place);
      asList(item.bullets).forEach(bullet);
      y += 3;
    });
  }

  // ── Projects ────────────────────────────────────────────────
  const projects = Array.isArray(cv.projects) ? cv.projects : [];
  if (projects.length) {
    sectionHeading('Projects');
    projects.forEach((item) => {
      if (typeof item === 'string') {
        bullet(item);
        return;
      }
      titleRow(item.name, item.duration);
      if (clean(item.tech)) subtitleRow(item.tech, '');
      asList(item.bullets).forEach(bullet);
      y += 3;
    });
  }

  // ── Education ───────────────────────────────────────────────
  const education = String(cv.education ?? '').split('\n').map(clean).filter(Boolean);
  if (education.length) {
    sectionHeading('Education');
    education.forEach((line, i) => {
      if (i === 0) paragraph(line, { style: 'bold', color: COLOR.ink, gap: 0 });
      else paragraph(line, { size: FONT.meta, color: COLOR.muted, gap: 0 });
    });
  }

  // ── Certifications ──────────────────────────────────────────
  const certifications = asList(cv.certifications);
  if (certifications.length) {
    sectionHeading('Certifications & Training');
    certifications.forEach(bullet);
  }

  // ── Achievements ────────────────────────────────────────────
  const achievements = asList(cv.achievements);
  if (achievements.length) {
    sectionHeading('Achievements');
    achievements.forEach(bullet);
  }

  doc.setProperties({
    title: `${name} — CV`,
    subject: clean(cv.position) || 'Curriculum Vitae',
    author: name,
    creator: 'IntelliHire',
  });

  return doc;
}

export const cvFileName = (cv = {}) =>
  `${clean(cv.name).replace(/\s+/g, '_') || 'My'}_CV.pdf`;
