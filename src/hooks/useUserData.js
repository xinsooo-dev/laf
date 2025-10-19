import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../utils/api';

export function useUserData() {
    const [currentUser, setCurrentUser] = useState(null);
    const [userStats, setUserStats] = useState({ lostItems: 0, foundItems: 0, claimedItems: 0 });
    const [loading, setLoading] = useState(true);

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

            // Fetch current user data from database
            const userResponse = await fetch(API_ENDPOINTS.AUTH.GET_USER(userData.id));
            if (userResponse.ok) {
                const userResult = await userResponse.json();
                if (userResult.success) {
                    setCurrentUser(userResult.user);
                    // Update localStorage with fresh data
                    const updatedUserData = { ...userData, ...userResult.user };
                    localStorage.setItem('user', JSON.stringify(updatedUserData));
                } else {
                    setCurrentUser(userData);
                }
            } else {
                setCurrentUser(userData);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setCurrentUser(userData);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserProfile = useCallback(async (formData) => {
        if (!currentUser?.id) {
            console.error('No current user ID available for update');
            return { success: false, message: 'User not logged in' };
        }

        const apiUrl = API_ENDPOINTS.AUTH.UPDATE_USER(currentUser.id);
        console.log('=== UPDATE USER PROFILE DEBUG ===');
        console.log('API URL:', apiUrl);
        console.log('Current User ID:', currentUser.id);
        console.log('Form data to update:', formData);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            console.log('API Response Status:', response.status);
            console.log('API Response OK:', response.ok);
            
            const responseText = await response.text();
            console.log('Raw Response Text:', responseText);
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON response:', e);
                console.error('Response was:', responseText);
                return { success: false, message: 'Invalid response from server' };
            }
            
            console.log('Parsed API Response:', result);

            if (response.ok) {
                if (result.success) {
                    // Update current user state
                    console.log('Updating currentUser state with:', result.user);
                    setCurrentUser(result.user);
                    
                    // Update localStorage
                    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const updatedUser = { ...storedUser, ...result.user };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    console.log('Updated localStorage with:', updatedUser);

                    return { success: true, user: result.user };
                } else {
                    console.error('API returned success=false:', result.message);
                    return { success: false, message: result.message };
                }
            } else {
                console.error('API request failed with status:', response.status);
                return { success: false, message: result.message || 'Failed to update profile. Please try again.' };
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            return { success: false, message: 'Error updating profile. Please try again.' };
        }
    }, [currentUser]);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            fetchUserData(userData);
        }
    }, [fetchUserData]);

    return {
        currentUser,
        userStats,
        loading,
        updateUserProfile,
        refetchUserData: () => {
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                fetchUserData(userData);
            }
        }
    };
}
