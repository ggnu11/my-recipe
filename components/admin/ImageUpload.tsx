"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  size?: number; // preview size in px (default 80)
  hint?: string; // recommended size hint e.g. "600x600px"
}

export function ImageUpload({
  value,
  onChange,
  folder = "recipes",
  size = 80,
  hint,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("recipe-images")
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert("업로드 실패: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(fileName);

    onChange(data.publicUrl);
    setUploading(false);
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="rounded-xl object-cover"
            style={{ width: size, height: size }}
          />
          <button
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-[#333] hover:text-[#333]"
          style={{ width: size, height: size }}
        >
          {uploading ? (
            <span className="text-xs">...</span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      {!value && !uploading && (
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">클릭하여 업로드</span>
          {hint && (
            <span className="text-[10px] text-gray-300">권장: {hint}</span>
          )}
        </div>
      )}
    </div>
  );
}
