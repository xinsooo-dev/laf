import { useState, useEffect, useRef } from 'react';
import SettingsForm from './SettingsForm';

function SettingsTab({ currentUser, onUpdateUser }) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        student_id: '',
        phone: '',
        course: '',
        year: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const isUpdatingRef = useRef(false);

    useEffect(() => {
        console.log('SettingsTab: currentUser changed:', currentUser);
        console.log('SettingsTab: isUpdating:', isUpdatingRef.current);
        
        // Only update form data if we're not in the middle of an update
        if (currentUser && !isUpdatingRef.current) {
            const newFormData = {
                first_name: currentUser.first_name || '',
                last_name: currentUser.last_name || '',
                email: currentUser.email || '',
                student_id: currentUser.student_id || '',
                phone: currentUser.phone || '',
                course: currentUser.course || '',
                year: currentUser.year || ''
            };
            console.log('SettingsTab: Setting form data to:', newFormData);
            setFormData(newFormData);
        }
    }, [currentUser]);

    const handleUpdateProfile = async (submittedFormData) => {
        if (!currentUser?.id) return;

        console.log('Submitting form data:', submittedFormData);

        isUpdatingRef.current = true; // Mark that we're updating
        setIsUpdating(true);
        setUpdateMessage('');

        try {
            // Call the parent's update function with the submitted form data
            if (onUpdateUser) {
                console.log('Calling onUpdateUser with:', submittedFormData);
                const result = await onUpdateUser(submittedFormData);
                console.log('Update result:', result);

                if (result.success) {
                    // Update local form data to match what was submitted
                    setFormData(submittedFormData);
                    setUpdateMessage('Profile updated successfully!');
                    setTimeout(() => setUpdateMessage(''), 3000);
                } else {
                    setUpdateMessage('Failed to update profile: ' + (result.message || 'Unknown error'));
                }
            } else {
                console.error('onUpdateUser function not available');
                setUpdateMessage('Update function not available');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setUpdateMessage('Error updating profile. Please try again.');
        } finally {
            setIsUpdating(false);
            // Reset the flag after a small delay to allow state updates to complete
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 1000);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <SettingsForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUpdateProfile}
                isUpdating={isUpdating}
                updateMessage={updateMessage}
            />
        </div>
    );
}

export default SettingsTab;
