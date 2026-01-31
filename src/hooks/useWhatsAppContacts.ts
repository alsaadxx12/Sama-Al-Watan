import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

interface WhatsAppContact {
    id: string;
    name: string;
    number: string;
    image?: string | null;
}

export default function useWhatsAppContacts(autoFetch = true, account?: { instance_id: string; token: string } | null) {
    const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContact[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchContacts = useCallback(async () => {
        if (!account?.instance_id || !account?.token) return;

        setIsLoading(true);
        setError(null);

        try {
            // Clean instance ID
            const cleanInstanceId = account.instance_id.startsWith('instance')
                ? account.instance_id
                : `instance${account.instance_id}`;

            const response = await axios.get(`https://api.ultramsg.com/${cleanInstanceId}/contacts`, {
                params: {
                    token: account.token
                }
            });

            if (Array.isArray(response.data)) {
                const formattedContacts = response.data
                    .filter((c: any) => c.id && (c.name || c.id))
                    .map((c: any) => ({
                        id: c.id,
                        name: c.name || c.id.split('@')[0],
                        number: c.id.split('@')[0],
                        image: c.picture || c.image || c.avatar || c.thumbnailUrl || null
                    }));
                setWhatsappContacts(formattedContacts);
            } else {
                setWhatsappContacts([]);
            }
        } catch (err: any) {
            console.error('Error fetching WhatsApp contacts:', err);
            setError(err.message || 'فشل جلب جهات الاتصال');
        } finally {
            setIsLoading(false);
        }
    }, [account]);

    useEffect(() => {
        if (autoFetch && account) {
            fetchContacts();
        }
    }, [autoFetch, account, fetchContacts]);

    return {
        whatsappContacts,
        isLoading,
        error,
        fetchContacts
    };
}
