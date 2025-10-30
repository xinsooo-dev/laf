// src/admin/SystemSettings.jsx
import { useState, useEffect } from 'react';
import { Settings, Edit, Check, X } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/api';

function SystemSettings() {
    const [settingsData, setSettingsData] = useState({
        systemName: 'Norzagaray College Lost & Found',
        office_location: '',
        contact_number: '',
        email: '',
        office_hours: ''
    });
    const [originalData, setOriginalData] = useState({
        systemName: 'Norzagaray College Lost & Found',
        office_location: '',
        contact_number: '',
        email: '',
        office_hours: ''
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('success'); // 'success' or 'error'

    useEffect(() => {
        fetchContactInfo();
    }, []);

    const fetchContactInfo = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CONTACT_INFO.GET);
            const data = await response.json();
            if (data.success && data.contact_info) {
                const newData = {
                    systemName: settingsData.systemName,
                    office_location: data.contact_info.office_location || '',
                    contact_number: data.contact_info.contact_number || '',
                    email: data.contact_info.email || '',
                    office_hours: data.contact_info.office_hours || ''
                };
                setSettingsData(newData);
                setOriginalData(newData);
            }
        } catch (error) {
            console.error('Error fetching contact info:', error);
        }
    };

    const hasChanges = () => {
        return JSON.stringify(settingsData) !== JSON.stringify(originalData);
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsSavingSettings(true);

        try {
            // Save contact information
            const contactData = {
                office_location: settingsData.office_location,
                contact_number: settingsData.contact_number,
                email: settingsData.email,
                office_hours: settingsData.office_hours
            };

            const response = await fetch(API_ENDPOINTS.CONTACT_INFO.UPDATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });

            // Check if response has content before parsing
            const text = await response.text();
            if (!text) {
                setModalType('success');
                setModalMessage('Settings saved successfully!');
                setShowModal(true);
                fetchContactInfo();
            } else {
                const data = JSON.parse(text);
                if (data.success) {
                    setModalType('success');
                    setModalMessage('Settings saved successfully!');
                    setShowModal(true);
                    fetchContactInfo();
                } else {
                    setModalType('error');
                    setModalMessage('Failed to save settings: ' + data.message);
                    setShowModal(true);
                }
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setModalType('error');
            setModalMessage('Error saving settings: ' + error.message);
            setShowModal(true);
        } finally {
            setIsSavingSettings(false);
        }
    };


    return (
        <div className="w-full max-w-full overflow-hidden">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
                <p className="text-sm text-gray-500">Dashboard / Settings</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    System Settings
                </h3>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                    {/* General Settings Section */}
                    <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-3">General Settings</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                System Name
                            </label>
                            <input
                                type="text"
                                value={settingsData.systemName}
                                onChange={(e) => setSettingsData({ ...settingsData, systemName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-3">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Office Location</label>
                                <input
                                    type="text"
                                    value={settingsData.office_location}
                                    onChange={(e) => setSettingsData({ ...settingsData, office_location: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                                <input
                                    type="text"
                                    value={settingsData.contact_number}
                                    onChange={(e) => setSettingsData({ ...settingsData, contact_number: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={settingsData.email}
                                    onChange={(e) => setSettingsData({ ...settingsData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Office Hours</label>
                                <input
                                    type="text"
                                    value={settingsData.office_hours}
                                    onChange={(e) => setSettingsData({ ...settingsData, office_hours: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Mon-Fri 8AM-5PM"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={isSavingSettings || !hasChanges()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            {isSavingSettings ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Settings className="h-4 w-4" />
                                    Save Settings
                                </>
                            )}
                        </button>
                        {!hasChanges() && (
                            <p className="text-sm text-gray-500 mt-2">No changes to save</p>
                        )}
                    </div>
                </form>
            </div>

            {/* Success/Error Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            {modalType === 'success' ? (
                                <div className="bg-green-100 p-2 rounded-full">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                            ) : (
                                <div className="bg-red-100 p-2 rounded-full">
                                    <X className="h-6 w-6 text-red-600" />
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-gray-900">
                                {modalType === 'success' ? 'Success' : 'Error'}
                            </h3>
                        </div>
                        <p className="text-gray-700 mb-6">{modalMessage}</p>
                        <button
                            onClick={() => setShowModal(false)}
                            className={`w-full px-6 py-2 rounded-lg font-medium transition-colors ${
                                modalType === 'success'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SystemSettings;
