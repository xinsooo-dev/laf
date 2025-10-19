import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Camera, FileText, User, MapPin, Calendar } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/api';

const ReportItem = ({ onItemReported }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        item_name: '',
        description: '',
        location: '',
        date_reported: new Date().toISOString().split('T')[0],
        type: 'lost',
        contact_info: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Convert location to uppercase
        const processedValue = name === 'location' ? value.toUpperCase() : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!selectedImage) {
            console.error('No image selected');
            return null;
        }

        console.log('Starting image upload...');
        console.log('Selected image:', selectedImage);
        console.log('Image type:', selectedImage.type);
        console.log('Image size:', selectedImage.size);

        const imageFormData = new FormData();
        imageFormData.append('image', selectedImage);

        try {
            console.log('Sending request to:', API_ENDPOINTS.UPLOAD.IMAGE);
            const response = await fetch(API_ENDPOINTS.UPLOAD.IMAGE, {
                method: 'POST',
                body: imageFormData
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload failed with status:', response.status);
                console.error('Error response:', errorText);
                throw new Error(`Upload failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Upload response:', data);
            if (data.success) {
                console.log('Upload successful, filename:', data.filename);
                return data.filename; // Return filename, not path
            } else {
                console.error('Upload failed:', data.message);
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Image upload error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get user data
            const userData = localStorage.getItem('user');
            if (!userData) {
                alert('Please login to report an item');
                navigate('/login');
                return;
            }

            const user = JSON.parse(userData);

            // Upload image if selected
            let imagePath = null;
            if (selectedImage) {
                try {
                    console.log('Attempting to upload image...');
                    imagePath = await uploadImage();
                    console.log('Image uploaded successfully, filename:', imagePath);
                } catch (error) {
                    console.error('Image upload failed:', error);
                    alert('Failed to upload image: ' + error.message);
                    setLoading(false);
                    return;
                }
            } else {
                console.log('No image selected, proceeding without image');
            }

            console.log('Final data being sent to backend:');
            const requestData = {
                ...formData,
                user_id: user.id,
                image_path: imagePath
            };
            console.log('Request data:', requestData);
            console.log('Image path value:', imagePath);
            console.log('Image path type:', typeof imagePath);
            console.log('Image path is null:', imagePath === null);
            console.log('Image path is empty string:', imagePath === '');

            // Submit item report
            const response = await fetch(API_ENDPOINTS.ITEMS.BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    user_id: user.id,
                    image_path: imagePath
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(`${formData.type === 'lost' ? 'Lost' : 'Found'} item reported successfully!`);
                // Trigger dashboard refresh
                if (onItemReported) {
                    onItemReported();
                }
                navigate('/user-dashboard');
            } else {
                alert('Failed to report item: ' + data.message);
            }
        } catch (error) {
            console.error('Error reporting item:', error);
            alert('Network error occurred while reporting item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Report an Item</h1>
                    <p className="text-gray-600">Help others find their lost items or report found items</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Item Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Item Type *</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'lost' }))}
                                className={`p-4 border-2 rounded-lg text-center transition-colors ${formData.type === 'lost'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-300 hover:border-red-300'
                                    }`}
                            >
                                <div className="w-8 h-8 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 font-bold">L</span>
                                </div>
                                <div className="font-medium">Lost Item</div>
                                <div className="text-sm text-gray-500">I lost something</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'found' }))}
                                className={`p-4 border-2 rounded-lg text-center transition-colors ${formData.type === 'found'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-300 hover:border-green-300'
                                    }`}
                            >
                                <div className="w-8 h-8 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-bold">F</span>
                                </div>
                                <div className="font-medium">Found Item</div>
                                <div className="text-sm text-gray-500">I found something</div>
                            </button>
                        </div>
                    </div>

                    {/* Item Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="inline h-4 w-4 mr-1" />
                            Item Name *
                        </label>
                        <input
                            type="text"
                            name="item_name"
                            value={formData.item_name}
                            onChange={handleInputChange}
                            placeholder="e.g., iPhone 13, Blue Backpack, Car Keys"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="inline h-4 w-4 mr-1" />
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Provide detailed description including color, brand, size, distinctive features..."
                            required
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Camera className="inline h-4 w-4 mr-1" />
                            Item Photo (Recommended)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {imagePreview ? (
                                <div className="space-y-4">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedImage(null);
                                            setImagePreview(null);
                                        }}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-2">
                                        <label className="cursor-pointer">
                                            <span className="text-blue-600 hover:text-blue-800 font-medium">
                                                Click to upload
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">PNG, JPG, GIF up to 5MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="inline h-4 w-4 mr-1" />
                            Location *
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="e.g., Library 2nd Floor, CLA Building, Cafeteria"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Date {formData.type === 'lost' ? 'Lost' : 'Found'} *
                        </label>
                        <input
                            type="date"
                            name="date_reported"
                            value={formData.date_reported}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Contact Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <User className="inline h-4 w-4 mr-1" />
                            Contact Information
                        </label>
                        <input
                            type="text"
                            name="contact_info"
                            value={formData.contact_info}
                            onChange={handleInputChange}
                            placeholder="Phone number or additional contact details (optional)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/user-dashboard')}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : formData.type === 'lost'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {loading ? 'Reporting...' : `Report ${formData.type === 'lost' ? 'Lost' : 'Found'} Item`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportItem;
