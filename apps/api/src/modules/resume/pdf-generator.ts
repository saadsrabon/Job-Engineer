import PDFDocument from 'pdfkit';
import type { CareerLibrary } from '@jobos/types';

type PdfDoc = InstanceType<typeof PDFDocument>;

export function generateResumePdf(profile: CareerLibrary, candidateName?: string | null): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const name = candidateName || 'Resume';

    doc.fontSize(22).font('Helvetica-Bold').text(name, { align: 'center' });
    doc.moveDown(0.5);

    if (profile.socialLinks?.length) {
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#444444')
        .text(
          profile.socialLinks.map((l) => `${l.platform}: ${l.url}`).join('  |  '),
          { align: 'center' },
        );
      doc.fillColor('#000000');
      doc.moveDown();
    }

    section(doc, 'Experience', profile.experiences, (e) => {
      doc.font('Helvetica-Bold').text(`${e.title} — ${e.company}`);
      doc.font('Helvetica').fontSize(10).fillColor('#666666');
      doc.text(`${e.startDate} – ${e.current ? 'Present' : e.endDate || ''}`);
      doc.fillColor('#000000').fontSize(11);
      if (e.bullets?.length) {
        e.bullets.forEach((b) => doc.text(`• ${b}`, { indent: 10 }));
      }
      doc.moveDown(0.5);
    });

    section(doc, 'Skills', profile.skills, (s) => {
      doc.font('Helvetica').text(`• ${s.name}${s.level ? ` (${s.level})` : ''}`);
    });

    section(doc, 'Projects', profile.projects, (p) => {
      doc.font('Helvetica-Bold').text(p.name);
      if (p.description) doc.font('Helvetica').text(p.description);
      if (p.technologies?.length) {
        doc.fontSize(10).fillColor('#666666').text(p.technologies.join(', '));
        doc.fillColor('#000000').fontSize(11);
      }
      doc.moveDown(0.5);
    });

    section(doc, 'Education', profile.education, (e) => {
      doc.font('Helvetica-Bold').text(`${e.degree}${e.field ? ` in ${e.field}` : ''}`);
      doc.font('Helvetica').text(e.institution);
      doc.moveDown(0.5);
    });

    section(doc, 'Certifications', profile.certificates, (c) => {
      doc.font('Helvetica').text(`• ${c.name} — ${c.issuer}`);
    });

    doc.end();
  });
}

function section<T>(
  doc: PdfDoc,
  title: string,
  items: T[] | undefined,
  render: (item: T) => void,
) {
  if (!items?.length) return;
  doc.moveDown(0.5);
  doc.fontSize(14).font('Helvetica-Bold').text(title);
  doc.moveDown(0.3);
  doc.fontSize(11);
  items.forEach(render);
}
