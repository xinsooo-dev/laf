// src/admin/PostItem.jsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/api';
import { LOCATION_OPTIONS } from '../utils/constants';
import { SuccessModal } from '../components/Modals';

function PostItem({ user, onSuccess }) {
    const [categories, setCategories] = useState([]);
    const [newItem, setNewItem] = useState({
        item_name: '',
        category: '',
        location: '',
        customLocation: '',
        description: '',
        image: null,
        date_lost: '',
        time_lost: '',
        status: 'lost',
        reporter_name: '',
        student_id: '',
        reporter_contact: ''
    });
    const [isPostingItem, setIsPostingItem] = useState(false);
    const [itemImagePreview, setItemImagePreview] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORIES.ALL);
            const data = await response.json();
            if (data.success) {
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewItem({ ...newItem, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setItemImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateLocationField = (value, fieldName) => {
        // More lenient validation for locations (allows room codes like "nb401", "rm201", etc.)
        if (!value || value.trim() === '') {
            alert(`${fieldName} is required.`);
            return false;
        }

        // Allow alphanumeric codes - just check for excessive special characters
        const specialCharCount = (value.match(/[^a-zA-Z0-9\s.,'-]/g) || []).length;
        if (specialCharCount > 5) {
            alert(`${fieldName} contains too many special characters.`);
            return false;
        }

        // Check for repeated characters (like "aaaa")
        if (/(.)\1{4,}/.test(value)) {
            alert(`${fieldName} contains too many repeated characters.`);
            return false;
        }

        return true;
    };

    const validateTextField = (value, fieldName) => {
        const specialCharCount = (value.match(/[^a-zA-Z0-9\s.,'-]/g) || []).length;
        
        if (specialCharCount > 3) {
            alert(`${fieldName} contains too many special characters. Please check for typos.`);
            return false;
        }

        if (/(.)\1{3,}/.test(value)) {
            alert(`${fieldName} contains repeated characters. Please check for typos.`);
            return false;
        }

        const words = value.toLowerCase().split(/\s+/);
        for (let word of words) {
            const cleanWord = word.replace(/[.,!?;:'"()-]/g, '');
            if (cleanWord.length < 4 || /^\d+$/.test(cleanWord)) continue;

            const vowelCount = (cleanWord.match(/[aeiou]/g) || []).length;
            if (vowelCount === 0 && cleanWord.length > 3) {
                alert(`${fieldName} contains invalid text: "${word}". Please check for typos.`);
                return false;
            }

            if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(cleanWord)) {
                alert(`${fieldName} contains invalid text: "${word}". Please check for typos.`);
                return false;
            }

            const keyboardPatterns = ['qwert', 'asdf', 'zxcv', 'qaz', 'wsx', 'edc', 'yuiop', 'hjkl', 'bnm'];
            for (let pattern of keyboardPatterns) {
                if (cleanWord.includes(pattern)) {
                    alert(`${fieldName} contains keyboard pattern: "${word}". Please enter meaningful text.`);
                    return false;
                }
            }
        }
        return true;
    };

    const validateFullName = (name) => {
        const trimmedName = name.trim();
        const nameParts = trimmedName.split(/\s+/);

        if (nameParts.length < 2) {
            alert('Please enter a full name (First Name and Last Name) for the reporter.');
            return false;
        }

        for (let part of nameParts) {
            if (part.length < 2) {
                alert('Each part of the name must be at least 2 characters long.');
                return false;
            }
        }

        if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
            alert('Reporter name should only contain letters, spaces, hyphens, and apostrophes.');
            return false;
        }

        return true;
    };

    const handlePostItem = async (e) => {
        e.preventDefault();

        // Validations
        if (!validateFullName(newItem.reporter_name)) {
            return;
        }

        if (!validateTextField(newItem.item_name, 'Item Name')) {
            return;
        }

        if (!validateLocationField(newItem.location, 'Location')) {
            return;
        }

        if (newItem.location === 'Others' && !validateLocationField(newItem.customLocation, 'Custom Location')) {
            return;
        }

        if (!validateTextField(newItem.description, 'Description')) {
            return;
        }

        setIsPostingItem(true);

        try {
            let imagePath = null;

            // Upload image first if exists
            if (newItem.image) {
                const imageFormData = new FormData();
                imageFormData.append('image', newItem.image);

                const uploadResponse = await fetch(API_ENDPOINTS.UPLOAD.IMAGE, {
                    method: 'POST',
                    body: imageFormData
                });

                const uploadData = await uploadResponse.json();
                if (uploadData.success) {
                    imagePath = uploadData.filename ? `uploads/${uploadData.filename}` : null;
                } else {
                    throw new Error('Failed to upload image: ' + uploadData.message);
                }
            }

            // Create item
            const itemData = {
                user_id: user?.id || 1,
                item_name: newItem.item_name,
                description: newItem.description,
                location: newItem.location === 'Others' ? newItem.customLocation : newItem.location,
                category: newItem.category,
                date_reported: `${newItem.date_lost} ${newItem.time_lost}:00`,
                type: newItem.status,
                contact_info: newItem.reporter_contact,
                image_path: imagePath,
                reporter_name: newItem.reporter_name,
                student_id: newItem.student_id,
                status: newItem.status
            };

            const response = await fetch(API_ENDPOINTS.ITEMS.CREATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });

            const data = await response.json();
            if (data.success) {
                // Show success modal instead of alert
                setShowSuccessModal(true);
                
                // Reset form
                setNewItem({
                    item_name: '',
                    category: '',
                    location: '',
                    customLocation: '',
                    description: '',
                    image: null,
                    date_lost: '',
                    time_lost: '',
                    status: 'lost',
                    reporter_name: '',
                    student_id: '',
                    reporter_contact: ''
                });
                setItemImagePreview(null);
                
                // Call success callback
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                alert('Failed to post item: ' + data.message);
            }
        } catch (error) {
            console.error('Error posting item:', error);
            alert('Error posting item. Please try again.');
        } finally {
            setIsPostingItem(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Post New Item</h2>
            <div className="max-w-2xl mx-auto">
                <div className="bg-white/90 rounded-lg shadow-lg p-8">
                    <form onSubmit={handlePostItem} className="space-y-6">
                        {/* Item Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Item Name *</label>
                            <input
                                type="text"
                                value={newItem.item_name}
                                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                                placeholder="Enter item name (e.g., Black iPhone 13)"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Category *</label>
                            <select
                                value={newItem.category}
                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Location *</label>
                            <select
                                value={newItem.location}
                                onChange={(e) => {
                                    setNewItem({ ...newItem, location: e.target.value });
                                    if (e.target.value !== 'Others') {
                                        setNewItem(prev => ({ ...prev, customLocation: '' }));
                                    }
                                }}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                required
                            >
                                <option value="">Select Location</option>
                                {LOCATION_OPTIONS.map(location => (
                                    <option key={location.value} value={location.value}>
                                        {location.label}
                                    </option>
                                ))}
                            </select>

                            {/* Custom location input */}
                            {newItem.location === 'Others' && (
                                <input
                                    type="text"
                                    value={newItem.customLocation || ''}
                                    onChange={(e) => setNewItem({ ...newItem, customLocation: e.target.value })}
                                    placeholder="Please specify the location"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium mt-2"
                                    required
                                />
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Item Description *</label>
                            <textarea
                                rows={4}
                                value={newItem.description}
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                placeholder="Describe the item in detail (color, brand, distinctive features, etc.)"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium resize-vertical"
                                required
                            ></textarea>
                        </div>

                        {/* Reporter Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Reporter's Name *</label>
                            <input
                                type="text"
                                value={newItem.reporter_name}
                                onChange={(e) => setNewItem({ ...newItem, reporter_name: e.target.value })}
                                placeholder="Enter the name of the person who reported this item"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                required
                            />
                        </div>

                        {/* Student ID */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Student ID *</label>
                            <input
                                type="text"
                                value={newItem.student_id}
                                onChange={(e) => setNewItem({ ...newItem, student_id: e.target.value })}
                                placeholder="Enter student ID (e.g., 2021-0001)"
                                maxLength="9"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Format: YYYY-NNNN (e.g., 2021-0001)</p>
                        </div>

                        {/* Reporter Contact */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Reporter's Contact *</label>
                            <input
                                type="text"
                                value={newItem.reporter_contact}
                                onChange={(e) => setNewItem({ ...newItem, reporter_contact: e.target.value })}
                                placeholder="Enter phone number or email (e.g., 09123456789 or email@example.com)"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">This will be used to contact the reporter about the item</p>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Item Image</label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 focus-within:border-blue-500 bg-white text-gray-700 font-medium cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 hover:bg-blue-50"
                                    >
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {newItem.image ? newItem.image.name : 'Choose Image'}
                                    </label>
                                </div>
                                {itemImagePreview && (
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                        <img
                                            src={itemImagePreview}
                                            alt="Item preview"
                                            className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-gray-200"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Date Lost/Found *</label>
                                <input
                                    type="date"
                                    value={newItem.date_lost}
                                    onChange={(e) => setNewItem({ ...newItem, date_lost: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Time Lost/Found *</label>
                                <input
                                    type="time"
                                    value={newItem.time_lost}
                                    onChange={(e) => setNewItem({ ...newItem, time_lost: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
                            <select
                                value={newItem.status}
                                onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                            >
                                <option value="lost">Lost Item</option>
                                <option value="found">Found Item</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPostingItem}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
                        >
                            {isPostingItem ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Posting Item...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    Post Item
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Success Modal */}
            <SuccessModal 
                show={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                message="Item posted successfully!"
            />
        </div>
    );
}

export default PostItem;
