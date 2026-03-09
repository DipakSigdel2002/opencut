import { Project, ExportSettings } from '../types/index';

export interface ExportProgress { percentage: number; timeMs: number; }
export interface ExportResult { success: boolean; outputPath?: string; error?: string; }

export function exportProject(
  _project: Project,
  _settings: ExportSettings,
  outputPath: string,
  onProgress?: (p: ExportProgress) => void,
): Promise<ExportResult> {
  return new Promise((resolve) => {
    if (onProgress) { onProgress({ percentage: 100, timeMs: 0 }); }
    resolve({ success: true, outputPath });
  });
}
