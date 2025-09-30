"use client"

// 削除（重複）

import React, { useRef, useState } from "react";
type ImageUploadModalProps = {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
};

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { FaFileImage, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ open, onClose, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("画像ファイルを選択してください。");
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      await onUpload(selectedFile);
      onClose();
    } catch (e) {
      setError("アップロードに失敗しました。");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <FaFileImage className="text-blue-500 text-xl" /> 保険証券画像アップロード
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <label htmlFor="insurance-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-6 cursor-pointer hover:bg-blue-50 transition">
            <FaFileImage className="text-3xl text-blue-400 mb-2" />
            <span className="text-blue-700 font-medium">画像ファイルを選択</span>
            <input
              id="insurance-upload"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
          </label>
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FaCheckCircle className="text-green-500" />
              選択中: {selectedFile.name}
            </div>
          )}
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="flex items-center gap-2 text-red-800">
                <FaExclamationCircle className="text-red-500" /> {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter className="flex gap-2 pt-2">
          <Button onClick={handleUpload} disabled={isUploading} className="flex items-center gap-2">
            {isUploading ? (
              <>
                <FaFileImage className="animate-spin text-blue-400" /> アップロード中...
              </>
            ) : (
              <>
                <FaFileImage className="text-blue-400" /> アップロード
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            キャンセル
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
