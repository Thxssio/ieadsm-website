"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";

export default function ProfileImageUploader({
  previewImage,
  uploadProgress = 0,
  onFileChange,
}) {
  const fileInputRef = useRef(null);
  const [errored, setErrored] = useState(false);

  // ❗ Ajuste o caminho do fallback conforme seu arquivo real em /public
  const fallback = "/avatar-3x4.png";

  const src = !previewImage || errored ? fallback : previewImage;

  // quando o preview muda, tentamos de novo (zera o erro)
  useEffect(() => {
    setErrored(false);
  }, [previewImage]);

  return (
    <div className="col-span-full">
      <div className="flex items-start gap-6">
        {/* Moldura 3x4 */}
        <div className="relative w-24 h-32 md:w-28 md:h-36 overflow-hidden rounded-md ring-1 ring-slate-200 bg-slate-100">
          <img
            key={src} // força re-render quando o src muda
            src={src}
            alt="Foto 3x4"
            className="absolute inset-0 h-full w-full object-cover"
            onLoad={() => setErrored(false)}
            onError={() => setErrored(true)}
          />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-800">Foto 3x4</h3>
          <p className="mt-1 text-xs text-slate-500">
            Use uma foto nítida, em formato retrato (3x4), preferencialmente com fundo claro.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Upload size={16} />
              Enviar arquivo
            </button>

            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.setAttribute("capture", "user");
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 md:hidden"
            >
              <Camera size={16} />
              Tirar foto
            </button>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-3 w-64 max-w-full">
              <div className="h-2 w-full rounded bg-slate-200">
                <div
                  className="h-2 rounded bg-slate-900 transition-[width]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Enviando... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
