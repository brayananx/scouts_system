import { Body, Controller, Get, Param, Put, Res } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import type { Response } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.medicalRecordsService.findOne(userId);
  }
  @Get(':userId/pdf')
    async getMedicalPdf(@Param('userId') userId: string, @Res() res: Response) {
      const user = await this.medicalRecordsService.getUserMedicalData(userId);

      if (!user) {
        res.status(404).send('Usuario no encontrado');
        return;
      }

      const doc = new PDFDocument({ margin: 45, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="ficha-medica-${user.name.trim()}.pdf"`,
      );

      doc.pipe(res);

      const formatDate = (date: Date | string) =>
        new Date(date).toLocaleDateString('es-CR');

      const calculateAge = (birthDate: Date | string) => {
        const birth = new Date(birthDate);
        const today = new Date();

        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();

        if (today.getDate() < birth.getDate()) {
          months--;
        }

        if (months < 0) {
          years--;
          months += 12;
        }

        return `${years} años y ${months} meses`;
      };

      const frontendPublicPath = path.join(
        process.cwd(),
        '../scouts-frontend/public',
      );

      const logoPath = path.join(frontendPublicPath, 'emblema_gys.png');

      doc.rect(0, 0, 595, 120).fill('#991b1b');

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 45, 25, {
          fit: [65, 65],
        });
      }

      doc.fillColor('#ffffff').fontSize(22).text('Ficha Médica', 130, 28);
      doc.fontSize(14).text('Grupo 175 - Tropa Coquiva', 130, 57);
      doc.fontSize(11).text('Información médica del scout', 130, 78);

      doc.fillColor('#111827');
      doc.y = 145;

      doc.fontSize(20).text(user.name.trim(), 45);
      doc.moveDown(0.5);

      doc.fontSize(11).fillColor('#374151');
      doc.text(`Identificación: ${user.identityNumber || 'No registrada'}`, 45);
      doc.text(
        `Fecha de nacimiento: ${
          user.birthDate ? formatDate(user.birthDate) : 'No registrada'
        }`,
        45,
      );
      doc.text(
        `Edad: ${
          user.birthDate ? calculateAge(user.birthDate) : 'No registrada'
        }`,
        45,
      );
      doc.text(`Patrulla: ${user.patrol?.name || 'Sin patrulla'}`, 45);

      doc.moveDown(1.5);

      doc.fontSize(16).fillColor('#991b1b').text('Datos médicos', 45);
      doc.moveTo(45, doc.y + 6).lineTo(550, doc.y + 6).strokeColor('#d1d5db').stroke();
      doc.moveDown(1.2);

      const medical = user.medicalRecord;

      const drawMedicalRow = (label: string, value?: string | null) => {
        const y = doc.y;

        doc
          .fontSize(10)
          .fillColor('#991b1b')
          .text(label, 55, y, { width: 150 });

        doc
          .fontSize(10)
          .fillColor('#374151')
          .text(value || 'No registrado', 210, y, {
            width: 320,
            lineGap: 2,
          });

        doc.y = y + 28;
      };

      if (!medical) {
        doc
          .fontSize(10)
          .fillColor('#6b7280')
          .text('No hay ficha médica registrada.', 55);
      } else {
        drawMedicalRow('Tipo de sangre', medical.bloodType);
        drawMedicalRow('Encargado', medical.guardianName);
        drawMedicalRow('Contacto emergencia', medical.emergencyContact);
        drawMedicalRow('Teléfono emergencia', medical.emergencyPhone);
        drawMedicalRow('Alergias', medical.allergies);
        drawMedicalRow('Medicamentos', medical.medications);
        drawMedicalRow('Condiciones médicas', medical.medicalConditions);
        drawMedicalRow('Observaciones', medical.notes);
      }

      doc.end();
    }

  @Put(':userId')
  update(@Param('userId') userId: string, @Body() body: any) {
    return this.medicalRecordsService.update(userId, body);
  }
}