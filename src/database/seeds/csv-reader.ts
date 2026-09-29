import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

export function readCsv<T>(filePath: string): T[] {
  const file = readFileSync(filePath, 'utf-8');

  return parse(file, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as T[];
}