import { useState } from 'react';
import axios from 'axios';

export default function useImageUpload() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearSelectedImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const uploadImageWithRetry = async (file: File, account: { instance_id: string; token: string }, retries = 3): Promise<string> => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        // Normalize instance ID
        const cleanId = account.instance_id.replace(/^instance/, '');
        const isHkAccount = account.instance_id.toLowerCase().includes('hk');

        // Try both servers if needed
        const servers = isHkAccount
            ? ['hk.ultramsg.com', 'api.ultramsg.com']
            : ['api.ultramsg.com', 'hk.ultramsg.com'];

        for (let i = 0; i < retries; i++) {
            const server = servers[i % servers.length];
            const url = `https://${server}/instance${cleanId}/media/upload`;

            try {
                const response = await axios.post(
                    url,
                    formData,
                    {
                        params: { token: account.token }, // Token in query params is standard for UltraMsg media upload
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        timeout: 30000
                    }
                );

                if (response.data && response.data.url) {
                    setIsUploading(false);
                    return response.data.url;
                }

                if (response.data.error || response.data.message) {
                    throw new Error(response.data.error || response.data.message);
                }

                throw new Error(`Invalid response from ${server}`);
            } catch (err: any) {
                console.error(`Upload attempt ${i + 1} to ${server} failed:`, err.message);

                if (i === retries - 1) {
                    setIsUploading(false);
                    // Critical Fallback: If all cloud uploads fail, return base64
                    // UltraMsg /messages/image endpoint accepts base64 URL directly
                    if (imagePreview) {
                        return imagePreview;
                    }
                    throw err;
                }
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }
        setIsUploading(false);
        return imagePreview || '';
    };

    return {
        selectedImage,
        imagePreview,
        handleImageChange,
        clearSelectedImage,
        uploadImageWithRetry,
        isUploading
    };
}
