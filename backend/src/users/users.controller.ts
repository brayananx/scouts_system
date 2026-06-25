import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import type { Response } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('assign-section')
  assignSection(@Body() body: { userId: string; sectionId: string }) {
    return this.usersService.assignSection(body.userId, body.sectionId);
  }

  @Patch('assign-patrol')
  assignPatrol(@Body() body: { userId: string; patrolId: string }) {
    return this.usersService.assignPatrol(body.userId, body.patrolId);
  }

  @Post(':id/progress-history')
  addProgress(
    @Param('id') id: string,
    @Body()
    body: {
      type: 'COMPASS' | 'LOGBOOK';
      level: number;
      obtainedDate: string;
    },
  ) {
    return this.usersService.addProgress(id, body);
  }

  @Delete('progress-history/:progressId')
  removeProgress(@Param('progressId') progressId: string) {
    return this.usersService.removeProgress(progressId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.usersService.getHistoryData(id);
  }
  @Public()
  @Get(':id/history-pdf')
    async getHistoryPdf(@Param('id') id: string, @Res() res: Response) {
      const user = await this.usersService.getHistoryData(id);

      if (!user) {
        res.status(404).send('Usuario no encontrado');
        return;
      }

      const doc = new PDFDocument({ margin: 45, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="historial-${user.name.trim()}.pdf"`,
      );

      doc.pipe(res);

      const formatDate = (date: Date | string) =>
        new Date(date).toLocaleDateString('es-CR');

      const frontendPublicPath = path.join(
        process.cwd(),
        '../scouts-frontend/public',
      );

      const imageExists = (imagePath: string) => fs.existsSync(imagePath);

      const checkPageSpace = (neededHeight = 90) => {
        if (doc.y + neededHeight > 760) {
          doc.addPage();
        }
      };

      const drawSectionTitle = (title: string) => {
        checkPageSpace(70);

        doc.moveDown(1);
        doc.fontSize(16).fillColor('#065f46').text(title, 45);
        doc
          .moveTo(45, doc.y + 6)
          .lineTo(550, doc.y + 6)
          .strokeColor('#d1d5db')
          .stroke();

        doc.moveDown(1.2);
        doc.fillColor('#111827');
      };

      const drawCard = (title: string, subtitle: string, imagePath?: string) => {
        checkPageSpace(95);

        const x = 55;
        const y = doc.y;
        const cardWidth = 485;
        const cardHeight = 78;

        doc
          .roundedRect(x, y, cardWidth, cardHeight, 10)
          .strokeColor('#e5e7eb')
          .stroke();

        if (imagePath && imageExists(imagePath)) {
          doc.image(imagePath, x + 15, y + 11, {
            fit: [56, 56],
            align: 'center',
            valign: 'center',
          });
        }

        doc
          .fillColor('#111827')
          .fontSize(11)
          .text(title, x + 88, y + 17, {
            width: 370,
            lineGap: 2,
          });

        doc
          .fillColor('#6b7280')
          .fontSize(9)
          .text(subtitle, x + 88, y + 48, {
            width: 370,
          });

        doc.fillColor('#111827');
        doc.y = y + cardHeight + 12;
      };

      // HEADER
      doc.rect(0, 0, 595, 120).fill('#065f46');

      const logoPath = path.join(frontendPublicPath, 'emblema.png');

      if (imageExists(logoPath)) {
        doc.image(logoPath, 45, 25, {
          fit: [65, 65],
        });
      }

      doc
        .fillColor('#ffffff')
        .fontSize(22)
        .text('Historial Scout', 130, 28);

      doc
        .fontSize(14)
        .text('Grupo 175 - Tropa Coquiva', 130, 57);

      doc
        .fontSize(11)
        .text('Expediente de progresión y especialidades', 130, 78);

      doc.fillColor('#111827');
      doc.y = 145;

      // DATOS PERSONALES
      doc.fontSize(20).text(user.name.trim(), 45);
      doc.moveDown(0.5);

      doc.fontSize(11).fillColor('#374151');

      doc.text(`Identificación: ${user.identityNumber}`, 45);

      doc.text(`Teléfono: ${user.phone || 'No registrado'}`, 45);

      const genderName =
        user.gender === 'MALE'
          ? 'Masculino'
          : user.gender === 'FEMALE'
            ? 'Femenino'
            : user.gender === 'OTHER'
              ? 'Otro'
              : '-';

      doc.text(`Género: ${genderName}`, 45);

      doc.text(`Nacionalidad: ${user.nationality || 'No registrada'}`, 45);

      doc.text(`Religión: ${user.religion || 'No registrada'}`, 45);

      doc.text(`Patrulla: ${user.patrol?.name || 'Sin patrulla'}`, 45);

      doc.text(
        `Fecha de nacimiento: ${
          user.birthDate ? formatDate(user.birthDate) : '-'
        }`,
        45,
      );

      doc.text(
        `Fecha de ingreso: ${
          user.joinDate ? formatDate(user.joinDate) : '-'
        }`,
        45,
      );

      doc.text(`Dirección: ${user.address || 'No registrada'}`, 45);

      doc.moveDown();

      doc.fillColor('#111827');

      // PROGRESIÓN
      drawSectionTitle('Progresión Scout');

      const progress = user.progress || [];

      if (progress.length === 0) {
        doc.fontSize(10).fillColor('#6b7280').text(
          'No hay brújulas o bitácoras registradas.',
          55,
        );
        doc.fillColor('#111827');
      } else {
        progress.forEach((item) => {
          const isCompass = item.type === 'COMPASS';
          const folder = isCompass ? 'brujulas' : 'bitacoras';
          const filename = isCompass
            ? `brujula-${item.level}.png`
            : `bitacora-${item.level}.png`;

          const imagePath = path.join(frontendPublicPath, folder, filename);

          drawCard(
            isCompass ? `Brújula ${item.level}` : `Bitácora ${item.level}`,
            `Obtenida el ${formatDate(item.obtainedDate)}`,
            imagePath,
          );
        });
      }

      // ESPECIALIDADES
      drawSectionTitle('Especialidades');

      const userSpecialties = user.specialties || [];

      if (userSpecialties.length === 0) {
        doc.fontSize(10).fillColor('#6b7280').text(
          'No hay especialidades registradas.',
          55,
        );
        doc.fillColor('#111827');
      } else {
        userSpecialties.forEach((item) => {
          const imagePath = path.join(
            frontendPublicPath,
            'especialidades',
            `${item.specialty.imageKey}.png`,
          );

          drawCard(
            item.specialty.name,
            `Obtenida el ${
              item.obtainedDate ? formatDate(item.obtainedDate) : 'Sin fecha'
            }`,
            imagePath,
          );
        });
      }

      // LÍNEA DE TIEMPO
      drawSectionTitle('Línea de tiempo');

      const history = [
        ...(user.progress || []).map((item) => ({
          date: item.obtainedDate,
          text:
            item.type === 'COMPASS'
              ? `Obtuvo Brújula ${item.level}`
              : `Obtuvo Bitácora ${item.level}`,
        })),
        ...(user.specialties || []).map((item) => ({
          date: item.obtainedDate,
          text: `Obtuvo la especialidad ${item.specialty.name}`,
        })),
      ]
        .filter((item): item is { date: Date; text: string } => item.date !== null)
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

      if (history.length === 0) {
        doc.fontSize(10).fillColor('#6b7280').text('No hay historial registrado.');
      } else {
        history.forEach((item) => {
          checkPageSpace(50);

          const y = doc.y;

          doc
            .fontSize(10)
            .fillColor('#065f46')
            .text(formatDate(item.date), 55, y, {
              width: 90,
            });

          doc
            .fontSize(11)
            .fillColor('#374151')
            .text(item.text, 155, y, {
              width: 360,
            });

          doc.y = y + 35;
        });
      }
      drawSectionTitle('Ficha Médica');

        const medical = user.medicalRecord;

        if (!medical) {
          doc
            .fontSize(10)
            .fillColor('#6b7280')
            .text('No hay ficha médica registrada.', 55);

          doc.fillColor('#111827');
        } else {
          const drawMedicalRow = (label: string, value?: string | null) => {
            checkPageSpace(35);

            const y = doc.y;

            doc
              .fontSize(10)
              .fillColor('#065f46')
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

    @Patch(':id/status')
    updateStatus(
      @Param('id') id: string,
      @Body() body: { isActive: boolean; inactiveReason?: string },
    ) {
      return this.usersService.updateStatus(id, body);
    }
    @Patch(':id/ceremony')
    updateScoutCeremony(
      @Param('id') id: string,
      @Body() body: { isInvested?: boolean; promiseDate?: string | null },
    ) {
      return this.usersService.updateScoutCeremony(id, body);
    }

  @Patch(':id/progress')
  updateProgress(
    @Param('id') id: string,
    @Body()
    body: {
      compassLevel?: number;
      logbookLevel?: number;
    },
  ) {
    return this.usersService.updateProgress(id, body);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }
}