// ============================================================================
// FILE UPLOAD INPUT — Zone de dépôt de fichiers (drag & drop style)
// Extrait de AdminPanel.tsx (upload contenu multimédia)
// ============================================================================
import React from 'react';
import { FileUploadInputProps } from './file-upload-input.types';

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  accept = '*',
  maxSizeMb,
  fileName,
  onChange,
  label,
  hint = 'Cliquez pour uploader un fichier',
  required = false,
  theme = 'orange',
}) => {
  const hoverCls =
    theme === 'green'
      ? 'hover:border-brand-green hover:bg-emerald-50/30'
      : 'hover:border-brand-orange hover:bg-orange-50/30';
  const iconCls = theme === 'green' ? 'text-brand-green' : 'text-brand-orange';

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <label
        className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl p-10 bg-slate-50 cursor-pointer transition-all ${hoverCls}`}
      >
        <i className={`fa-solid fa-cloud-arrow-up text-4xl ${iconCls}`} />
        <span className="font-semibold text-slate-700">{hint}</span>
        {maxSizeMb && (
          <span className="text-sm text-slate-400">Max {maxSizeMb} MB</span>
        )}
        {fileName && (
          <span className="text-sm font-medium text-emerald-600">
            <i className="fa-solid fa-circle-check mr-1" />
            {fileName}
          </span>
        )}
        <input
          type="file"
          className="hidden"
          accept={accept}
          required={required}
          onChange={e => {
            if (e.target.files?.[0]) onChange(e.target.files[0]);
          }}
        />
      </label>
    </div>
  );
};

export default FileUploadInput;

