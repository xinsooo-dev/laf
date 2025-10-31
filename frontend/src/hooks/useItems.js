import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../utils/api';

export function useItems(userId) {
    const [lostItems, setLostItems] = useState([]);
    const [foundItems, setFoundItems] = useState([]);
    const [allLostItems, setAllLostItems] = useState([]);
    const [commonItems, setCommonItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = useCallback(async () => {
        if (!userId) return;

        try {
            // Fetch user-specific lost and found items
            const userItemsResponse = await fetch(API_ENDPOINTS.ITEMS.LATEST);
            if (userItemsResponse.ok) {
                const itemsData = await userItemsResponse.json();
                console.log('Latest items API response:', itemsData); // Debug log

                if (itemsData.success) {
                    // Filter items by current user (for My Activity)
                    const userLostItems = itemsData.lost_items?.filter(item => item.user_id === userId) || [];
                    const userFoundItems = itemsData.found_items?.filter(item => item.user_id === userId) || [];

                    // Get ALL lost items (for View Lost Items tab)
                    const allLost = itemsData.lost_items || [];

                    console.log('User lost items:', userLostItems); // Debug log
                    console.log('User found items:', userFoundItems); // Debug log
                    console.log('All lost items:', allLost); // Debug log

                    // Transform user's lost items
                    setLostItems(userLostItems.map(item => ({
                        id: item.id,
                        itemName: item.item_name,
                        description: item.description || 'No description',
                        location: item.location || 'Location not specified',
                        dateFound: new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }),
                        timeFound: new Date(item.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        type: 'lost',
                        status: item.status || 'pending',
                        reporter: item.reporter_name || 'Unknown',
                        contactInfo: item.contact_info || 'Not provided',
                        imagePath: item.image_path || null
                    })));

                    // Transform ALL lost items
                    setAllLostItems(allLost.map(item => ({
                        id: item.id,
                        itemName: item.item_name,
                        description: item.description || 'No description',
                        location: item.location || 'Location not specified',
                        dateFound: new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }),
                        timeFound: new Date(item.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        type: 'lost',
                        status: item.status || 'pending',
                        reporter: item.reporter_name || 'Unknown',
                        contactInfo: item.contact_info || 'Not provided',
                        imagePath: item.image_path || null,
                        user_id: item.user_id
                    })));

                    setFoundItems(userFoundItems.map(item => ({
                        id: item.id,
                        itemName: item.item_name,
                        description: item.description || 'No description',
                        location: item.location || 'Location not specified',
                        dateFound: new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }),
                        timeFound: new Date(item.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        type: 'found',
                        status: item.status || 'pending',
                        reporter: item.reporter_name || 'Unknown',
                        contactInfo: item.contact_info || 'Not provided',
                        imagePath: item.image_path || null
                    })));
                }
            }

            // Fetch recent lost items
            const recentLostResponse = await fetch(API_ENDPOINTS.ITEMS.GET_RECENT_LOST_ITEMS);
            if (recentLostResponse.ok) {
                const recentLostData = await recentLostResponse.json();
                if (recentLostData.success) {
                    setCommonItems(recentLostData.items);
                }
            }
        } catch (error) {
            console.error('Error fetching items data:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return {
        lostItems,
        foundItems,
        allLostItems,
        commonItems,
        loading,
        refetchItems: fetchItems
    };
}
