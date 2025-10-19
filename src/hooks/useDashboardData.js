import { useState, useCallback, useEffect } from 'react';
import { API_ENDPOINTS } from '../utils/api';

export const useDashboardData = () => {
    const [lostItems, setLostItems] = useState([]);
    const [foundItems, setFoundItems] = useState([]);
    const [userStats, setUserStats] = useState({ lostItems: 0, foundItems: 0, claimedItems: 0 });
    const [commonItems, setCommonItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchUserData = useCallback(async (userData) => {
        if (!userData) return;

        try {
            // Fetch user stats
            const statsResponse = await fetch(API_ENDPOINTS.ITEMS.USER_STATS(userData.id));
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                if (statsData.success) {
                    setUserStats(statsData.stats);
                }
            }

            // Fetch user-specific lost and found items
            const userItemsResponse = await fetch(API_ENDPOINTS.ITEMS.LATEST);
            if (userItemsResponse.ok) {
                const itemsData = await userItemsResponse.json();
                if (itemsData.success) {
                    // Filter items by current user
                    const userLostItems = itemsData.lost_items?.filter(item => item.user_id === userData.id) || [];
                    const userFoundItems = itemsData.found_items?.filter(item => item.user_id === userData.id) || [];

                    // Transform data to match table format
                    setLostItems(userLostItems.map(item => ({
                        id: item.id,
                        itemName: item.item_name,
                        description: item.description || 'No description',
                        dateFound: new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }),
                        timeFound: new Date(item.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    })));

                    setFoundItems(userFoundItems.map(item => ({
                        id: item.id,
                        itemName: item.item_name,
                        description: item.description || 'No description',
                        dateFound: new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }),
                        timeFound: new Date(item.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    })));
                }
            }

            // Fetch common items
            const commonResponse = await fetch(API_ENDPOINTS.ITEMS.COMMON_ITEMS);
            if (commonResponse.ok) {
                const commonData = await commonResponse.json();
                if (commonData.success) {
                    setCommonItems(commonData.items);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshDashboard = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // Trigger refresh when refreshTrigger changes
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            fetchUserData(userData);
        }
    }, [refreshTrigger, fetchUserData]);

    return {
        lostItems,
        foundItems,
        userStats,
        commonItems,
        loading,
        refreshDashboard,
        fetchUserData
    };
};
