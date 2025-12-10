import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FileUploadService {
  private uploadDir = 'uploads/categories';

  constructor(private configService: ConfigService) {
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Guarda un archivo Base64 en el servidor
   * @param base64String String Base64 de la imagen
   * @param filename Nombre base del archivo (sin extensión)
   * @returns Ruta relativa del archivo guardado
   */
  saveBase64Image(base64String: string, filename: string): string {
    try {
      // Remover data URL prefix si existe
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

      // Crear nombre único
      const uniqueName = `${filename}-${crypto.randomBytes(8).toString('hex')}.jpg`;
      const filePath = path.join(this.uploadDir, uniqueName);

      // Guardar archivo
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

      // Retornar ruta relativa (sin 'uploads/' porque express ya lo sirve desde /uploads)
      return `/uploads/categories/${uniqueName}`;
    } catch (error) {
      console.error('Error saving base64 image:', error);
      throw new Error(`Failed to save image: ${error.message}`);
    }
  }

  /**
   * Elimina un archivo del servidor
   * @param imagePath Ruta del archivo a eliminar
   */
  deleteImage(imagePath: string): void {
    if (!imagePath) return;

    try {
      // Convertir /uploads/... a ruta local
      const localPath = imagePath.replace(/^\/uploads\//, 'uploads/');
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // No lanzar error, solo loguear
    }
  }
}
