"use client";

import { useEffect, useMemo } from "react";
import { Icon } from "./icon";

export function UploadTile({
  label,
  hint,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <label className="ad-upload">
      <input
        key={file ? "selected" : "empty"}
        type="file"
        accept="image/*"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span className="ad-upload-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
        {preview ? <img src={preview} alt="" /> : <Icon name="upload" size={20} />}
      </span>
      <span>
        <strong>{label}</strong>
        <span>{file ? file.name : hint}</span>
      </span>
    </label>
  );
}
