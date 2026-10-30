import React, { useState } from 'react';
import { Cloud, Copy, KeyRound, Loader2, Trash2 } from 'lucide-react';
import {
  adoptRecoveryCode,
  createRecoveryCode,
  getRecoveryCode,
} from '../../utils/solar/cloudHistory';
import { retentionLabel } from '../../utils/solar/ownerToken';
import type {
  BackupResult,
  DeleteCloudResult,
  RestoreResult,
} from '../../utils/solar/historySync';

interface CloudHistoryPanelProps {
  noun: 'assessment' | 'reading';
  onBackup: () => Promise<BackupResult>;
  onRestore: () => Promise<RestoreResult>;
  onDeleteCloud: () => Promise<DeleteCloudResult>;
  onChanged: () => void;
  onMessage: (message: string) => void;
  compact?: boolean;
}

const plural = (noun: string, count: number): string =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;

const NOT_READY =
  'Cloud backup is not available yet. The database step has not been applied.';

const buttonClass =
  'rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-200 hover:bg-cyan-400/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

export const CloudHistoryPanel: React.FC<CloudHistoryPanelProps> = ({
  noun,
  onBackup,
  onRestore,
  onDeleteCloud,
  onChanged,
  onMessage,
  compact = false,
}) => {
  const [busy, setBusy] = useState<'backup' | 'restore' | 'delete' | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState<string | null>(() => getRecoveryCode());
  const [paste, setPaste] = useState('');

  const handleBackup = async (): Promise<void> => {
    if (busy) return;
    setBusy('backup');
    const result = await onBackup();
    setBusy(null);
    if (result.unreachable) {
      onMessage(NOT_READY);
      return;
    }
    if (result.uploaded > 0) {
      setCode(getRecoveryCode());
      onMessage(
        `${plural(noun, result.uploaded)} backed up. Keep the recovery code — without it the cloud copy cannot be opened on another device.`,
      );
      return;
    }
    if (result.failed > 0) {
      onMessage(`${plural(noun, result.failed)} could not be backed up.`);
      return;
    }
    onMessage('Everything is already backed up.');
  };

  const handleRestore = async (): Promise<void> => {
    if (busy) return;
    setBusy('restore');
    const result = await onRestore();
    setBusy(null);
    if (result.unreachable) {
      onMessage(NOT_READY);
      return;
    }
    if (result.added === 0) {
      onMessage('Nothing new to restore.');
      return;
    }
    onChanged();
    onMessage(`${plural(noun, result.added)} restored into this browser.`);
  };

  const handleDelete = async (): Promise<void> => {
    if (busy) return;
    if (
      !window.confirm(
        `Permanently delete the cloud copy of every ${noun} for this device? The copy in this browser stays.`,
      )
    ) {
      return;
    }
    setBusy('delete');
    const result = await onDeleteCloud();
    setBusy(null);
    if (result.failed) {
      onMessage('The cloud copy could not be deleted.');
      return;
    }
    onMessage(`${plural(noun, result.deleted)} deleted from the cloud permanently.`);
  };

  const handleShowCode = (): void => {
    if (!code) {
      const created = createRecoveryCode();
      if (!created) {
        onMessage('This browser blocked storage, so no recovery code can be created.');
        return;
      }
      setCode(created);
    }
    setShowCode((value) => !value);
  };

  const handleCopy = async (): Promise<void> => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      onMessage('Recovery code copied. Keep it somewhere private.');
    } catch {
      onMessage('Copy failed. Select the code and copy it manually.');
    }
  };

  const handleUseCode = (): void => {
    if (adoptRecoveryCode(paste)) {
      setCode(getRecoveryCode());
      setPaste('');
      onMessage('Recovery code accepted. Use Restore to bring the cloud copy into this browser.');
    } else {
      onMessage('That does not look like a recovery code. It has 64 letters and numbers.');
    }
  };

  return (
    <div
      className={`rounded-lg border border-cyan-400/20 bg-cyan-400/5 ${
        compact ? 'p-2.5' : 'p-3'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Cloud className="h-3.5 w-3.5 text-cyan-300" />
        <p className="text-[10px] font-mono uppercase tracking-wide text-cyan-300">
          Cloud copy — optional
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        <button type="button" onClick={handleBackup} disabled={busy !== null} className={buttonClass}>
          {busy === 'backup' ? <Loader2 className="h-3 w-3 animate-spin inline" /> : 'Back up'}
        </button>
        <button type="button" onClick={handleRestore} disabled={busy !== null} className={buttonClass}>
          {busy === 'restore' ? <Loader2 className="h-3 w-3 animate-spin inline" /> : 'Restore'}
        </button>
        <button type="button" onClick={handleDelete} disabled={busy !== null} className={buttonClass}>
          {busy === 'delete' ? (
            <Loader2 className="h-3 w-3 animate-spin inline" />
          ) : (
            <>
              <Trash2 className="h-3 w-3 inline" /> Delete cloud
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleShowCode}
          className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-300 hover:bg-white/10 transition-colors"
        >
          <KeyRound className="h-3 w-3 inline" /> Recovery code
        </button>
      </div>

      {showCode && (
        <div className="mt-2 rounded-md border border-white/10 bg-slate-950/50 p-2">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Write this down or keep it in a password manager. It is the only way to open this cloud copy on
            another device or after clearing site data.
          </p>
          {code ? (
            <>
              <code className="mt-1.5 block break-all font-mono text-[10px] text-cyan-200">{code}</code>
              <button
                type="button"
                onClick={handleCopy}
                className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-white/10 transition-colors"
              >
                <Copy className="h-3 w-3" /> Copy code
              </button>
            </>
          ) : (
            <p className="mt-1.5 text-[10px] text-amber-200/90">
              No code yet. It is created the first time you back up.
            </p>
          )}

          <div className="mt-2 border-t border-white/10 pt-2">
            <label
              htmlFor={`cloud-code-${noun}`}
              className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1"
            >
              Use an existing code
            </label>
            <div className="flex gap-1.5">
              <input
                id={`cloud-code-${noun}`}
                type="text"
                value={paste}
                onChange={(event) => setPaste(event.target.value)}
                placeholder="XXXX-XXXX-…"
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-slate-950/60 px-2 py-1 font-mono text-[10px] text-slate-200 placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={handleUseCode}
                className="rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-200 hover:bg-cyan-400/20 transition-colors"
              >
                Use
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-500 leading-relaxed mt-2">
        Cloud copies last {retentionLabel()}. They are keyed to this browser&apos;s private code, so
        clearing site data loses access unless you saved the recovery code. Nothing is uploaded until
        you press Back up.
      </p>
    </div>
  );
};
