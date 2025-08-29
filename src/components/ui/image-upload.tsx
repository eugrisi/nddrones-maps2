import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (base64: string | undefined) => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (!file) {
      return;
    }

    // Verificar tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 2MB.');
      return;
    }

    // Verificar tipo do arquivo
    if (!file.type.startsWith('image/')) {
      setError('Apenas arquivos de imagem são permitidos.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (ev) => {
      try {
        const result = ev.target?.result as string;
        if (result) {
          onChange(result);
        }
        setUploading(false);
      } catch (err) {
        setError('Erro ao processar arquivo.');
        setUploading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Erro ao carregar arquivo.');
      setUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(undefined);
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="image-upload">{label}</Label>
      <div className="flex items-center space-x-2">
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="flex-1"
        />
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700"
          >
            Remover
          </Button>
        )}
      </div>
      
      {uploading && (
        <div className="text-sm text-blue-600">Carregando imagem...</div>
      )}
      
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      
      {value && !uploading && (
        <div className="mt-2">
          <img 
            src={value} 
            alt="Preview" 
            className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
          />
        </div>
      )}
    </div>
  );
}; 