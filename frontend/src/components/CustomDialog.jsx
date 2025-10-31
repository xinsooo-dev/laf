// Custom Dialog Component - Replaces browser's alert/confirm
import { X } from 'lucide-react';

export const showCustomAlert = (message, onClose) => {
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
    dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    const content = `
        <div class="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">iFound System</h3>
                <p class="text-gray-700">${message}</p>
            </div>
            <div class="flex justify-end">
                <button id="alert-ok-btn" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                    OK
                </button>
            </div>
        </div>
    `;
    
    dialog.innerHTML = content;
    document.body.appendChild(dialog);
    
    const okBtn = dialog.querySelector('#alert-ok-btn');
    const closeDialog = () => {
        document.body.removeChild(dialog);
        if (onClose) onClose();
    };
    
    okBtn.addEventListener('click', closeDialog);
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) closeDialog();
    });
};

export const showCustomConfirm = (message, onConfirm, onCancel) => {
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
    dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    const content = `
        <div class="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">iFound System</h3>
                <p class="text-gray-700">${message}</p>
            </div>
            <div class="flex justify-end gap-3">
                <button id="confirm-cancel-btn" class="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium">
                    Cancel
                </button>
                <button id="confirm-ok-btn" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                    OK
                </button>
            </div>
        </div>
    `;
    
    dialog.innerHTML = content;
    document.body.appendChild(dialog);
    
    const okBtn = dialog.querySelector('#confirm-ok-btn');
    const cancelBtn = dialog.querySelector('#confirm-cancel-btn');
    
    const closeDialog = () => {
        document.body.removeChild(dialog);
    };
    
    okBtn.addEventListener('click', () => {
        closeDialog();
        if (onConfirm) onConfirm();
    });
    
    cancelBtn.addEventListener('click', () => {
        closeDialog();
        if (onCancel) onCancel();
    });
    
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            closeDialog();
            if (onCancel) onCancel();
        }
    });
};

export default { showCustomAlert, showCustomConfirm };
