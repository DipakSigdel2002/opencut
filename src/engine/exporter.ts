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
    let pct = 0;
    function tick() {
      pct += 5;
      if (onProgress) onProgress({ percentage: Math.min(pct, 99), timeMs: 0 });
      if (pct >= 100) { resolve({ success: true, outputPath }); }
      else { setTimeout(tick, 150); }
    }
    setTimeout(tick, 150);
  });
}