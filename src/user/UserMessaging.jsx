import { useState, useEffect } from 'react';
import { ArrowLeft, Send, Paperclip, X, User, MessageCircle } from 'lucide-react';
import { API_ENDPOINTS, getAssetUrl } from '../utils/api';

const UserMessaging = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [user, setUser] = useState(null);
    const [conversationId, setConversationId] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            
            // Create or get existing conversation with admin
            const userConversationId = `admin_chat_${parsedUser.id}`;
            setConversationId(userConversationId);
            fetchMessages(userConversationId);
        }
    }, []);

    const fetchMessages = async (conversationId) => {
        try {
            const response = await fetch(API_ENDPOINTS.MESSAGES.CONVERSATION(conversationId));
            const data = await response.json();
            
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            
            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => setFilePreview(e.target.result);
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
            }
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim()) {
            alert('Please enter a message.');
            return;
        }

        setSending(true);
        
        try {
            let response;
            
            if (selectedFile) {
                // Send with attachment using FormData
                const formData = new FormData();
                formData.append('sender_id', user.id);
                formData.append('receiver_id', 1); // Admin ID is 1
                formData.append('conversation_id', conversationId);
                formData.append('subject', 'Chat with Admin');
                formData.append('message', newMessage);
                formData.append('attachment', selectedFile);
                
                response = await fetch(API_ENDPOINTS.MESSAGES.SEND, {
                    method: 'POST',
                    body: formData
                });
            } else {
                // Send without attachment
                response = await fetch(API_ENDPOINTS.MESSAGES.SEND, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sender_id: user.id,
                        receiver_id: 1, // Admin ID is 1
                        conversation_id: conversationId,
                        subject: 'Chat with Admin',
                        message: newMessage
                    })
                });
            }

            const data = await response.json();
            
            if (data.success) {
                setNewMessage('');
                removeFile();
                
                // Refresh messages
                fetchMessages(conversationId);
            } else {
                alert('Failed to send message: ' + data.message);
            }
        } catch (error) {
            alert('Network error occurred while sending message');
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMessageIcon = (message) => {
        if (message.sender_id === user?.id) {
            return <Send className="h-4 w-4 text-blue-600" />;
        } else {
            return <MessageCircle className="h-4 w-4 text-green-600" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading messages...</span>
            </div>
        );
    }

    return (
        <div className="h-full max-h-[calc(100vh-12rem)] flex flex-col">
            {/* Header */}
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-blue-900">Chat with Admin</h2>
                <p className="text-blue-700 mt-1">Direct messaging with administrators</p>
            </div>

            {/* Chat Container */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg flex-1 flex flex-col min-h-0">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Administrator</h3>
                            <p className="text-xs text-gray-500">Online</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                            <p>No messages yet</p>
                            <p className="text-sm">Start a conversation with the admin</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id} className={`flex ${
                                message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                            }`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.sender_id === user?.id 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-800'
                                }`}>
                                    <p className="text-sm">{message.message}</p>
                                    {message.attachment_path && (
                                        <div className="mt-2">
                                            {message.attachment_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                <img 
                                                    src={getAssetUrl(message.attachment_path)}
                                                    alt="Attachment"
                                                    className="max-w-full h-32 object-contain rounded"
                                                />
                                            ) : (
                                                <a 
                                                    href={getAssetUrl(message.attachment_path)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs underline"
                                                >
                                                    📎 {message.attachment_path.split('/').pop()}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-xs mt-1 opacity-75">
                                        {new Date(message.created_at).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="space-y-3">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Type your message..."
                            />
                            
                            <label className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                                <Paperclip className="h-4 w-4" />
                                <input
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                                    className="hidden"
                                />
                            </label>
                            
                            <button
                                type="submit"
                                disabled={sending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {sending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        
                        {/* File Preview */}
                        {selectedFile && (
                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                                {selectedFile.type.startsWith('image/') ? (
                                    <Image className="h-4 w-4 text-blue-600" />
                                ) : (
                                    <FileText className="h-4 w-4 text-blue-600" />
                                )}
                                <span className="text-sm text-gray-700">{selectedFile.name}</span>
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="text-gray-400 hover:text-red-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserMessaging;
