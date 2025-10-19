import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, AlertCircle, CheckCircle } from 'lucide-react';

function SettingsForm({ formData, setFormData, onSubmit, isUpdating, updateMessage }) {
    const [courseSearch, setCourseSearch] = useState('');
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);
    const courseDropdownRef = useRef(null);
    
    // Validation states
    const [emailError, setEmailError] = useState('');
    const [emailValid, setEmailValid] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        first_name: '',
        last_name: '',
        email: '',
        student_id: '',
        phone: '',
        course: '',
        year: ''
    });

    // Year dropdown states
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const yearDropdownRef = useRef(null);

    // Sync local search state with formData changes
    useEffect(() => {
        if (formData.course) {
            setCourseSearch('');
        }
    }, [formData.course]);
    
    // Validate email on initial load and when email changes
    useEffect(() => {
        if (formData.email) {
            validateEmail(formData.email);
        }
    }, [formData.email]);

    const courseOptions = [
        'BEED A',
        'BEED B',
        'BSED A',
        'BSED B',
        'HM A',
        'HM B',
        'BSCS/ACT A',
        'BSCS/ACT B',
        'BSCS/ACT C',
    ];

    const yearOptions = [
        '1st Year', '2nd Year', '3rd Year', '4th Year'
    ];

    const filteredCourses = courseOptions.filter(course =>
        course.toLowerCase().includes(courseSearch.toLowerCase())
    );

    // Close dropdowns when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
                setShowCourseDropdown(false);
            }
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
                setShowYearDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCourseSelect = (course) => {
        setFormData(prev => ({ ...prev, course }));
        setCourseSearch(''); // Clear search when selecting a course
        setShowCourseDropdown(false);
    };

    const handleCourseSearchChange = (e) => {
        const value = e.target.value;
        setCourseSearch(value);

        // If input is empty, clear the selected course
        if (value === '') {
            setFormData(prev => ({ ...prev, course: '' }));
            setShowCourseDropdown(false);
            return;
        }

        // If user is typing/backspacing, clear the selected course and show dropdown
        if (formData.course && value !== formData.course) {
            setFormData(prev => ({ ...prev, course: '' }));
        }

        setShowCourseDropdown(true);
    };

    const handleCourseBlur = (e) => {
        // Check if the blur is happening because user clicked on dropdown
        if (courseDropdownRef.current && courseDropdownRef.current.contains(e.relatedTarget)) {
            return; // Don't close dropdown or validate if clicking on dropdown
        }

        // Get the current input value (either selected course or search text)
        const currentValue = formData.course || courseSearch;

        // If there's text but it doesn't match any valid course, clear it
        if (currentValue && !courseOptions.includes(currentValue)) {
            setCourseSearch('');
            setFormData(prev => ({ ...prev, course: '' }));
        }

        setShowCourseDropdown(false);
    };

    const handleYearSelect = (year) => {
        setFormData(prev => ({ ...prev, year }));
        setShowYearDropdown(false);
    };

    const handleYearBlur = (e) => {
        // Check if the blur is happening because user clicked on dropdown
        if (yearDropdownRef.current && yearDropdownRef.current.contains(e.relatedTarget)) {
            return; // Don't close dropdown if clicking on dropdown
        }

        setShowYearDropdown(false);
    };

    const validateEmail = (email) => {
        if (!email || email.trim() === '') {
            setEmailError('Email is required');
            setEmailValid(false);
            return false;
        }
        
        // Check if email contains @
        if (!email.includes('@')) {
            setEmailError('Email must contain @');
            setEmailValid(false);
            return false;
        }
        
        // Check if email ends with @gmail.com
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            setEmailError('Email must be a valid @gmail.com address');
            setEmailValid(false);
            return false;
        }
        
        // Check for common typos in gmail.com
        const emailLower = email.toLowerCase();
        const commonTypos = ['@gmai.com', '@gmial.com', '@gamil.com', '@gmal.com', '@gnail.com', '@gmaill.com'];
        for (const typo of commonTypos) {
            if (emailLower.includes(typo)) {
                setEmailError('Did you mean @gmail.com?');
                setEmailValid(false);
                return false;
            }
        }
        
        // Check if there's text before @gmail.com
        const emailPrefix = email.split('@')[0];
        if (!emailPrefix || emailPrefix.trim() === '') {
            setEmailError('Email must have a username before @gmail.com');
            setEmailValid(false);
            return false;
        }
        
        setEmailError('');
        setEmailValid(true);
        return true;
    };

    const validateField = (name, value) => {
        let error = '';
        
        switch(name) {
            case 'first_name':
                if (!value || value.trim() === '') {
                    error = 'First name is required';
                }
                break;
            case 'last_name':
                if (!value || value.trim() === '') {
                    error = 'Last name is required';
                }
                break;
            case 'student_id':
                if (!value || value.trim() === '') {
                    error = 'Student ID is required';
                } else if (value.length !== 9) {
                    error = 'Student ID must be in format: YYYY-NNNN';
                }
                break;
            case 'phone':
                if (!value || value.trim() === '') {
                    error = 'Phone number is required';
                } else if (value.startsWith('+63')) {
                    if (value.length !== 13) {
                        error = 'Phone must be +63XXXXXXXXXX (13 digits)';
                    }
                } else if (value.startsWith('09')) {
                    if (value.length !== 11) {
                        error = 'Phone must be 09XXXXXXXXX (11 digits)';
                    }
                } else {
                    error = 'Phone must start with +63 or 09';
                }
                break;
            case 'course':
                if (!value || value.trim() === '') {
                    error = 'Course is required';
                }
                break;
            case 'year':
                if (!value || value.trim() === '') {
                    error = 'Year is required';
                }
                break;
        }
        
        setFieldErrors(prev => ({
            ...prev,
            [name]: error
        }));
        
        return error === '';
    };

    const formatStudentId = (value) => {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '');
        
        // Limit to 8 digits (YYYY-NNNN format)
        const limited = digits.slice(0, 8);
        
        // Add hyphen after 4 digits
        if (limited.length > 4) {
            return limited.slice(0, 4) + '-' + limited.slice(4);
        }
        
        return limited;
    };

    const formatPhoneNumber = (value) => {
        // Remove all non-digit and non-plus characters
        let cleaned = value.replace(/[^0-9+]/g, '');
        
        // Handle +63 format
        if (cleaned.startsWith('+63')) {
            // Limit to +63 + 10 digits
            return cleaned.slice(0, 13);
        }
        // Handle 09 format
        else if (cleaned.startsWith('09') || cleaned.startsWith('9')) {
            // Ensure it starts with 09
            if (cleaned.startsWith('9') && !cleaned.startsWith('09')) {
                cleaned = '0' + cleaned;
            }
            // Limit to 11 digits
            return cleaned.slice(0, 11);
        }
        // Handle 63 format (convert to +63)
        else if (cleaned.startsWith('63')) {
            return '+' + cleaned.slice(0, 12);
        }
        
        return cleaned;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        
        // Format student ID
        if (name === 'student_id') {
            formattedValue = formatStudentId(value);
        }
        
        // Format phone number
        if (name === 'phone') {
            formattedValue = formatPhoneNumber(value);
        }
        
        // Validate email on change
        if (name === 'email') {
            validateEmail(formattedValue);
        } else {
            validateField(name, formattedValue);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                            fieldErrors.first_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        required
                    />
                    {fieldErrors.first_name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {fieldErrors.first_name}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                            fieldErrors.last_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        required
                    />
                    {fieldErrors.last_name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {fieldErrors.last_name}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:border-transparent ${
                                emailError 
                                    ? 'border-red-300 focus:ring-red-500' 
                                    : emailValid 
                                        ? 'border-green-300 focus:ring-green-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            required
                        />
                        {emailError && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                        {emailValid && (
                            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                    </div>
                    {emailError && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {emailError}
                        </p>
                    )}
                    {emailValid && (
                        <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Valid email address
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                    <input
                        type="text"
                        name="student_id"
                        value={formData.student_id || ''}
                        onChange={handleInputChange}
                        placeholder="YYYY-NNNN"
                        maxLength="9"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                            fieldErrors.student_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        required
                    />
                    {fieldErrors.student_id && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {fieldErrors.student_id}
                        </p>
                    )}
                    {!fieldErrors.student_id && formData.student_id && (
                        <p className="mt-1 text-sm text-gray-500">Format: YYYY-NNNN (e.g., 2021-0001)</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        placeholder="+63XXXXXXXXXX or 09XXXXXXXXX"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                            fieldErrors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        required
                    />
                    {fieldErrors.phone && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {fieldErrors.phone}
                        </p>
                    )}
                    {!fieldErrors.phone && formData.phone && (
                        <p className="mt-1 text-sm text-gray-500">
                            {formData.phone.startsWith('+63') ? 'International format' : 'Local format'}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                    <div className="relative" ref={courseDropdownRef}>
                        <div className="relative">
                            <div className="flex">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.course || ''}
                                        onChange={handleCourseSearchChange}
                                        onFocus={() => setShowCourseDropdown(true)}
                                        onBlur={handleCourseBlur}
                                        placeholder="Search or select course"
                                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showCourseDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {showCourseDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredCourses.length > 0 ? (
                                        filteredCourses.map((course, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onMouseDown={(e) => {
                                                    e.preventDefault(); // Prevent blur from firing
                                                    handleCourseSelect(course);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                                            >
                                                {course}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-gray-500 text-sm">
                                            No courses found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <div className="relative" ref={yearDropdownRef}>
                        <div className="relative">
                            <select
                                name="year"
                                value={formData.year || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        year: value
                                    }));
                                }}
                                onFocus={() => setShowYearDropdown(true)}
                                onBlur={handleYearBlur}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                required
                            >
                                <option value="" disabled>Select Year</option>
                                {yearOptions.map((year, index) => (
                                    <option key={index} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowYearDropdown(!showYearDropdown)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showYearDropdown ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {updateMessage && (
                <div className={`p-3 rounded-lg ${updateMessage.includes('successfully')
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                    {updateMessage}
                </div>
            )}

            <button
                onClick={() => {
                    // Validate all fields before submitting
                    const isEmailValid = validateEmail(formData.email);
                    const isFirstNameValid = validateField('first_name', formData.first_name);
                    const isLastNameValid = validateField('last_name', formData.last_name);
                    const isStudentIdValid = validateField('student_id', formData.student_id);
                    const isPhoneValid = validateField('phone', formData.phone);
                    const isCourseValid = validateField('course', formData.course);
                    const isYearValid = validateField('year', formData.year);
                    
                    if (!isEmailValid || !isFirstNameValid || !isLastNameValid || !isStudentIdValid || !isPhoneValid || !isCourseValid || !isYearValid) {
                        alert('Please fill in all required fields correctly');
                        return;
                    }
                    
                    // Combine first and last name into full_name for backend
                    const submitData = {
                        ...formData,
                        full_name: `${formData.first_name} ${formData.last_name}`.trim()
                    };
                    
                    console.log('Form data being submitted:', submitData);
                    onSubmit(submitData);
                }}
                disabled={isUpdating || Object.values(fieldErrors).some(err => err !== '') || emailError}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
                {isUpdating ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                    </>
                ) : (
                    'Update Profile'
                )}
            </button>
        </div>
    );
}

export default SettingsForm;
