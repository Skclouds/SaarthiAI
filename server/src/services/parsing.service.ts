import fs from 'fs/promises';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { AppError } from '../middleware/errorHandler';

export async function parseFile(filePath: string, fileType: string): Promise<string> {
  const buffer = await fs.readFile(filePath);

  switch (fileType) {
    case 'pdf':
      return parsePdf(buffer);
    case 'docx':
      return parseDocx(buffer);
    case 'txt':
    case 'md':
      return parsePlainText(buffer);
    default:
      throw new AppError(`Unsupported file type: ${fileType}`, 400);
  }
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  const text = result.text?.trim();
  if (!text) {
    throw new AppError('No text could be extracted from PDF', 400);
  }
  return text;
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value?.trim();
  if (!text) {
    throw new AppError('No text could be extracted from DOCX', 400);
  }
  return text;
}

function parsePlainText(buffer: Buffer): string {
  const text = buffer.toString('utf-8').trim();
  if (!text) {
    throw new AppError('File is empty', 400);
  }
  return text;
}
