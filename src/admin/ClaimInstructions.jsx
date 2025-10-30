// src/admin/ClaimInstructions.jsx
import { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/api';

function ClaimInstructions() {
    const [claimInstructions, setClaimInstructions] = useState([]);
    const [editingInstruction, setEditingInstruction] = useState(null);
    const [isAddingInstruction, setIsAddingInstruction] = useState(false);
    const [newInstruction, setNewInstruction] = useState({ title: '', description: '' });
    const [isDeletingId, setIsDeletingId] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('success');

    // Confirmation modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchClaimInstructions();
    }, []);

    const fetchClaimInstructions = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CLAIM_INSTRUCTIONS.ALL);
            const data = await response.json();
            if (data.success) {
                setClaimInstructions(data.instructions || []);
            }
        } catch (error) {
            console.error('Error fetching claim instructions:', error);
        }
    };

    const handleAddInstruction = async (e) => {
        e.preventDefault();
        try {
            // Calculate the next step number based on existing instructions
            const nextStepNumber = claimInstructions.length > 0 
                ? Math.max(...claimInstructions.map(inst => inst.step_number || 0)) + 1 
                : 1;

            const response = await fetch(API_ENDPOINTS.CLAIM_INSTRUCTIONS.CREATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newInstruction,
                    step_number: nextStepNumber
                })
            });

            const data = await response.json();
            if (data.success) {
                setModalMessage('Instruction added successfully!');
                setModalType('success');
                setShowModal(true);
                setNewInstruction({ title: '', description: '' });
                setIsAddingInstruction(false);
                fetchClaimInstructions();
            } else {
                setModalMessage('Failed to add instruction: ' + data.message);
                setModalType('error');
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error adding instruction:', error);
            setModalMessage('Error adding instruction');
            setModalType('error');
            setShowModal(true);
        }
    };

    const handleUpdateInstruction = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_ENDPOINTS.CLAIM_INSTRUCTIONS.UPDATE}&id=${editingInstruction.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editingInstruction.title,
                    description: editingInstruction.description,
                    step_number: editingInstruction.step_number
                })
            });

            const data = await response.json();
            if (data.success) {
                setModalMessage('Instruction updated successfully!');
                setModalType('success');
                setShowModal(true);
                setEditingInstruction(null);
                fetchClaimInstructions();
            } else {
                setModalMessage('Failed to update instruction: ' + data.message);
                setModalType('error');
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error updating instruction:', error);
            setModalMessage('Error updating instruction');
            setModalType('error');
            setShowModal(true);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowConfirmModal(true);
    };

    const handleDeleteInstruction = async () => {
        setShowConfirmModal(false);
        setIsDeletingId(deleteId);
        try {
            const response = await fetch(API_ENDPOINTS.CLAIM_INSTRUCTIONS.DELETE(deleteId), {
                method: 'DELETE'
            });

                const data = await response.json();
                if (data.success) {
                    setModalMessage('Instruction deleted successfully!');
                    setModalType('success');
                    setShowModal(true);
                    fetchClaimInstructions();
                } else {
                    setModalMessage('Failed to delete instruction: ' + data.message);
                    setModalType('error');
                    setShowModal(true);
                }
            } catch (error) {
                console.error('Error deleting instruction:', error);
                setModalMessage('Error deleting instruction');
                setModalType('error');
                setShowModal(true);
            } finally {
                setIsDeletingId(null);
                setDeleteId(null);
            }
    };

    return (
        <div className="w-full max-w-full overflow-hidden">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 mb-4 sm:mb-6 break-words">
                Claim Instructions Management
            </h2>
            <div className="bg-white/90 rounded-lg shadow-lg p-4 md:p-6">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Claim Instructions</h3>
                        {!isAddingInstruction && (
                            <button
                                onClick={() => setIsAddingInstruction(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Instruction
                            </button>
                        )}
                    </div>

                    {/* Add New Instruction Form */}
                    {isAddingInstruction && (
                        <form onSubmit={handleAddInstruction} className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Step Title</label>
                                    <input
                                        type="text"
                                        value={newInstruction.title}
                                        onChange={(e) => setNewInstruction({ ...newInstruction, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        placeholder="e.g., Step 1: Visit the Office"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={newInstruction.description}
                                        onChange={(e) => setNewInstruction({ ...newInstruction, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        rows="3"
                                        placeholder="Describe this step..."
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Add Instruction
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingInstruction(false);
                                            setNewInstruction({ title: '', description: '' });
                                        }}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Instructions List */}
                    <div className="space-y-4">
                        {claimInstructions.length > 0 ? (
                            claimInstructions.map((instruction, index) => (
                                <div key={instruction.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                                    {editingInstruction && editingInstruction.id === instruction.id ? (
                                        <form onSubmit={handleUpdateInstruction} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Step Title</label>
                                                <input
                                                    type="text"
                                                    value={editingInstruction.title}
                                                    onChange={(e) => setEditingInstruction({ ...editingInstruction, title: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                                <textarea
                                                    value={editingInstruction.description}
                                                    onChange={(e) => setEditingInstruction({ ...editingInstruction, description: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    rows="3"
                                                    required
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingInstruction(null)}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                        {index + 1}
                                                    </span>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 mb-1">{instruction.title}</h4>
                                                        <p className="text-gray-700 text-sm">{instruction.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        onClick={() => setEditingInstruction(instruction)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(instruction.id)}
                                                        disabled={isDeletingId === instruction.id}
                                                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        {isDeletingId === instruction.id ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-lg font-medium">No claim instructions yet</p>
                                <p className="text-sm">Add instructions to help users claim their items</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-red-700">Confirm Delete</h3>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="text-gray-600 hover:text-gray-800 transition-colors p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-700 leading-relaxed">Are you sure you want to delete this instruction?</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteInstruction}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <h3 className={`text-xl font-bold ${modalType === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                                {modalType === 'success' ? 'Success' : 'Error'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-600 hover:text-gray-800 transition-colors p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-700 leading-relaxed">{modalMessage}</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className={`px-6 py-2 rounded-lg transition-colors font-medium text-white ${
                                    modalType === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClaimInstructions;
