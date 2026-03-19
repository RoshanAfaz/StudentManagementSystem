import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Utility to handle file downloads across Web and Native (Capacitor)
 * @param {Blob|string} data - The file data (Blob for PDF/Images, Base64 or string for others)
 * @param {string} fileName - Suggest filename
 * @param {string} mimeType - MIME type of the file
 */
export const downloadFile = async (data, fileName, mimeType) => {
    if (!Capacitor.isNativePlatform()) {
        // Web Download Logic
        const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return;
    }

    // Native (Android/iOS) Download Logic
    try {
        let base64Data = '';

        if (data instanceof Blob) {
            base64Data = await blobToBase64(data);
        } else {
            base64Data = data;
        }

        // 1. Save to temporary directory
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
        });

        // 2. Share the file (this opens the "Save to device" or "Open with" dialog)
        await Share.share({
            title: fileName,
            text: `Download ${fileName}`,
            url: savedFile.uri,
            dialogTitle: 'Save Report'
        });

    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please check app permissions.');
    }
};

// Helper to convert Blob to Base64
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};
