import React from 'react';

export default function ConfirmModal({ isOpen, onConfirm, onCancel }: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
        <p className="mb-6 text-gray-600">This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}