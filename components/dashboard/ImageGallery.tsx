"use client";
import React, { useEffect, useState } from "react";
import { Trash2, ClipboardCopy } from "lucide-react";

import { useImageStore } from "../../lib/imageStore";

interface ImageItem {
  name: string;
  url: string;
}

export default function ImageGallery({
  refreshFlag,
}: {
  refreshFlag: boolean;
}) {
  const { notifyUpdate, setNotifyUpdate } = useImageStore();

  const [images, setImages] = useState<ImageItem[]>([]);

  const fetchImages = async () => {
    const res = await fetch("/api/uploads");
    const data = await res.json();
    setImages(data);
  };

  const handleDelete = async (fileName: string) => {
    const confirmed = confirm(`Tem certeza que deseja deletar "${fileName}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/uploads/delete?file=${fileName}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.name !== fileName));
      } else {
        alert("Erro ao deletar imagem.");
      }
    } catch (err) {
      alert("Erro de rede ao deletar imagem.");
    }
  };

  useEffect(() => {
    fetchImages(); // <-- carrega as imagens na primeira montagem
  }, []);

  useEffect(() => {
    if (notifyUpdate) {
      fetchImages();
      setNotifyUpdate(false); // reseta o estado
    }
  }, [notifyUpdate]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 mt-5">Imagens Enviadas</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {Array.isArray(images) &&
          images.map((img) => (
            <div key={img.name} className="relative border rounded shadow p-2">
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-40 object-cover rounded"
              />
              <p className="text-sm text-center mt-2 truncate">{img.name}</p>
              <button
                onClick={() => handleDelete(img.name)}
                className="absolute top-2 right-2 text-red-600 bg-white hover:text-red-800 transition ease-in-out duration-200 px-2 py-1 rounded border"
                title="Deletar imagem"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              {/* Botão de copiar URL */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(img.url);
                  alert("URL copiada!");
                }}
                className="absolute top-2 left-2"
                title="Copiar URL"
              >
                <i className="flex items-center justify-center bg-orange-600 hover:bg-orange-400 transition-all ease-in-out duration-200 rounded px-2 py-1 border">
                  <ClipboardCopy className="w-5 h-5 text-white" />
                </i>
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
