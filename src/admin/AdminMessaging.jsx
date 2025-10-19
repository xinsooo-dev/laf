import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Clock, Image } from 'lucide-react';
import { API_BASE_URL, getAssetUrl } from '../utils/api';

const AdminMessaging = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversationMessages, setConversationMessages] = useState([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch all conversations
    const fetchConversations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/messages.php?action=admin_messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Group messages by conversation_id
                    const conversationMap = {};
                    data.messages.forEach(msg => {
                        const convId = msg.conversation_id;
                        if (!conversationMap[convId]) {
                            conversationMap[convId] = {
                                conversation_id: convId,
                                subject: msg.subject || 'No Subject',
                                sender_name: msg.sender_name,
                                sender_id: msg.sender_id,
                                messages: [],
                                unread_count: 0,
                                last_message: '',
                                last_message_time: msg.created_at
                            };
                        }
                        conversationMap[convId].messages.push(msg);
                        if (!msg.is_read && msg.sender_id !== 1) {
                            conversationMap[convId].unread_count++;
                        }
                        // Update last message info
                        if (new Date(msg.created_at) > new Date(conversationMap[convId].last_message_time)) {
                            conversationMap[convId].last_message = msg.message;
                            conversationMap[convId].last_message_time = msg.created_at;
                        }
                    });

                    // Convert to array and sort by last message time
                    const conversationArray = Object.values(conversationMap).map(conv => ({
                        ...conv,
                        message_count: conv.messages.length,
                        last_message: conv.last_message.length > 50 ? 
                            conv.last_message.substring(0, 50) + '...' : conv.last_message
                    })).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));

                    setConversations(conversationArray);
                } else {
                    console.error('Failed to fetch conversations:', data.message);
                }
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages for a specific conversation
    const fetchConversationMessages = async (conversationId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/messages.php?action=conversation_messages&conversation_id=${conversationId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setConversationMessages(data.messages);
                    // Mark messages as read
                    await markMessagesAsRead(conversationId);
                } else {
                    console.error('Failed to fetch conversation messages:', data.message);
                }
            }
        } catch (error) {
            console.error('Error fetching conversation messages:', error);
        }
    };

    // Mark messages as read
    const markMessagesAsRead = async (conversationId) => {
        try {
            await fetch(`${API_BASE_URL}/messages.php?action=mark_read&conversation_id=${conversationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    // Send reply
    const sendReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedConversation) return;

        setSending(true);
        try {
            let response;
            
            if (selectedFile) {
                // Send with file attachment using FormData
                const formData = new FormData();
                formData.append('sender_id', '1'); // Admin ID
                formData.append('receiver_id', selectedConversation.sender_id);
                formData.append('conversation_id', selectedConversation.conversation_id);
                formData.append('message', replyMessage);
                formData.append('subject', ''); // No subject for replies
                formData.append('attachment', selectedFile);
                
                response = await fetch(`${API_BASE_URL}/messages.php?action=send`, {
                    method: 'POST',
                    body: formData
                });
            } else {
                // Send text-only message using JSON
                response = await fetch(`${API_BASE_URL}/messages.php?action=send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sender_id: 1, // Admin ID
                        receiver_id: selectedConversation.sender_id,
                        conversation_id: selectedConversation.conversation_id,
                        message: replyMessage,
                        subject: '' // No subject for replies
                    })
                });
            }

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setReplyMessage('');
                    setSelectedFile(null);
                    // Refresh conversation messages
                    await fetchConversationMessages(selectedConversation.conversation_id);
                    // Refresh conversations list
                    await fetchConversations();
                } else {
                    alert('Failed to send reply: ' + data.message);
                }
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Error sending reply. Please try again.');
        } finally {
            setSending(false);
        }
    };

    // Handle conversation selection
    const handleConversationSelect = (conversation) => {
        setSelectedConversation(conversation);
        fetchConversationMessages(conversation.conversation_id);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <MessageCircle className="mr-3 h-8 w-8 text-blue-600" />
                    Admin Messages
                </h2>
                <p className="text-gray-600 mt-2">Manage user messages and conversations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Conversations List */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-semibold text-gray-800">Conversations ({conversations.length})</h3>
                    </div>
                    <div className="overflow-y-auto h-full">
                        {conversations.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                <p>No conversations yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {conversations.map((conv) => (
                                    <div
                                        key={conv.conversation_id}
                                        onClick={() => handleConversationSelect(conv)}
                                        className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                                            selectedConversation?.conversation_id === conv.conversation_id 
                                                ? 'bg-blue-50 border-r-4 border-blue-600' 
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <span className="font-medium text-gray-900 truncate">
                                                        {conv.sender_name}
                                                    </span>
                                                    {conv.unread_count > 0 && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            {conv.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-gray-800 mt-1 truncate">
                                                    {conv.subject}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(conv.last_message_time)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-2">
                                            <p className="text-gray-700 text-sm line-clamp-2">{conv.last_message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{conv.message_count} messages</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Conversation Messages & Reply */}
                <div className="lg:col-span-2">
                    {selectedConversation ? (
                        <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">Conversation</h3>
                            </div>
                            
                            {/* Messages Thread */}
                            <div className="flex-1 p-6 overflow-y-auto max-h-96 space-y-4">
                                {conversationMessages.map((msg) => (
                                    <div 
                                        key={msg.id} 
                                        className={`flex ${msg.sender_id === 1 ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            msg.sender_id === 1 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-100 text-gray-900'
                                        }`}>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-xs font-medium">
                                                    {msg.sender_id === 1 ? 'Admin' : msg.sender_name}
                                                </span>
                                                <span className="text-xs opacity-75">
                                                    {formatDate(msg.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm">{msg.message}</p>
                                            {msg.attachment_path && (
                                                <div className="mt-2 flex items-center space-x-2 text-xs">
                                                    <Image className="h-3 w-3" />
                                                    <a 
                                                        href={getAssetUrl(msg.attachment_path)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="underline hover:no-underline"
                                                    >
                                                        View attachment
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Section */}
                            <div className="border-t p-6">
                                <form onSubmit={sendReply}>
                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Reply</label>
                                    <textarea
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Type your reply here..."
                                    />
                                    
                                    {/* File Upload */}
                                    <div className="mt-3">
                                        <input
                                            type="file"
                                            id="attachment"
                                            accept="image/*,.pdf,.doc,.docx,.txt"
                                            onChange={(e) => setSelectedFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="attachment"
                                            className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm"
                                        >
                                            <Image className="h-4 w-4" />
                                            <span>Attach File</span>
                                        </label>
                                        {selectedFile && (
                                            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                                                <span>Selected: {selectedFile.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedFile(null)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={sending || !replyMessage.trim()}
                                        className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {sending ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                <span>Send Reply</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-lg h-full flex items-center justify-center">
                            <div className="text-center">
                                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Select a conversation</h3>
                                <p className="text-gray-600">Choose a conversation from the list to view messages and reply.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessaging;
