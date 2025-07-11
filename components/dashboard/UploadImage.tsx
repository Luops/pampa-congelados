"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { useImageStore } from "../../lib/imageStore";

function UploadImage({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { setNotifyUpdate } = useImageStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.imageUrl) {
        setUploadUrl(data.imageUrl);
        useImageStore.getState().setNotifyUpdate(true); // dispara atualização global
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-md">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {previewUrl && (
        <div className="my-4">
          <p className="text-sm text-gray-600">Pré-visualização:</p>
          <img
            src={previewUrl}
            alt="Prévia"
            className="w-40 h-40 object-cover rounded"
          />
        </div>
      )}
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-2 disabled:opacity-50"
        disabled={!file || isUploading}
      >
        {isUploading ? "Enviando..." : "Enviar"}
      </button>

      {uploadUrl && (
        <div className="text-center">
          <p className="mt-4 text-green-600 uppercase">
            Imagem enviada com sucesso!
          </p>
          <a href={uploadUrl} className="underline" target="_blank">
            Ir para a imagem
          </a>
        </div>
      )}
    </div>
  );
}

export default UploadImage;
