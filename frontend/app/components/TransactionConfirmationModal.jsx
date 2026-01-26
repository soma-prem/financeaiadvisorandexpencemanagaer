'use client'
import { useState, useEffect } from 'react';

export function TransactionConfirmationModal({
  isOpen,
  extractedData,
  onConfirm,
  onDiscard,
  isSaving = false
}) {
  const [editedData, setEditedData] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  const getConfidence = (field) => {
    if (!editedData) return 0.5;
    return editedData.confidence?.[field] ?? 0.5;
  };

  const isLowConfidence = (field) => {
    return getConfidence(field) < 0.7;
  };

  useEffect(() => {
    if (extractedData) {
      setEditedData({ ...extractedData });
      setValidationErrors({});
      setWarnings({});
      setEditingField(null);
    }
  }, [extractedData]);

  const validateField = (field, value) => {
    const errors = {};
    const warns = {};
    
    if (field === 'amount') {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        errors[field] = 'Amount must be a positive number';
      } else if (numValue > 100000) {
        warns[field] = 'Large amount detected - please verify';
      }
    }
    
    if (field === 'sender' || field === 'receiver') {
      if (!value || value.trim().length < 2) {
        errors[field] = 'Name must be at least 2 characters';
      }
    }
    
    if (field === 'transaction_id') {
      if (!value || value.trim().length < 4) {
        errors[field] = 'Transaction ID must be at least 4 characters';
      }
    }
    
    return { errors, warns };
  };

  const handleFieldEdit = (field, value) => {
    const newData = { ...editedData, [field]: value };
    setEditedData(newData);
    
    const { errors, warns } = validateField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: errors[field] }));
    setWarnings(prev => ({ ...prev, [field]: warns[field] }));
  };

  const handleConfirm = () => {
    const allErrors = {};
    const allWarnings = {};
    
    Object.keys(editedData).forEach(field => {
      if (field !== 'confidence') {
        const { errors, warns } = validateField(field, editedData[field]);
        if (errors[field]) allErrors[field] = errors[field];
        if (warns[field]) allWarnings[field] = warns[field];
      }
    });
    
    setValidationErrors(allErrors);
    setWarnings(allWarnings);
    
    if (Object.keys(allErrors).length === 0) {
      onConfirm(editedData);
    }
  };

  const FieldDisplay = ({ field, label }) => {
    const isEditing = editingField === field;
    const hasError = validationErrors[field];
    const hasWarning = warnings[field];
    const lowConfidence = isLowConfidence(field);
    
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <div className="flex items-center gap-2">
            {lowConfidence && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Low Confidence
              </span>
            )}
            {!isEditing && (
              <button
                onClick={() => setEditingField(field)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <input
            type={field === 'amount' ? 'number' : 'text'}
            value={editedData[field] || ''}
            onChange={(e) => handleFieldEdit(field, e.target.value)}
            onBlur={() => setEditingField(null)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : hasWarning ? 'border-yellow-500' : 'border-gray-300'
            }`}
            autoFocus
          />
        ) : (
          <div className={`p-2 border rounded-md ${
            hasError ? 'border-red-500 bg-red-50' : 
            hasWarning ? 'border-yellow-500 bg-yellow-50' : 
            'border-gray-200 bg-gray-50'
          }`}>
            <span className={hasError ? 'text-red-700' : hasWarning ? 'text-yellow-700' : 'text-gray-900'}>
              {editedData[field] || 'Not detected'}
            </span>
          </div>
        )}
        
        {hasError && (
          <p className="text-xs text-red-600">{hasError}</p>
        )}
        {hasWarning && (
          <p className="text-xs text-yellow-600">{hasWarning}</p>
        )}
      </div>
    );
  };

  if (!isOpen || !extractedData || !editedData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Confirm Transaction Details</h2>
            <button
              onClick={onDiscard}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSaving}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <FieldDisplay field="amount" label="Amount (₹)" />
            <FieldDisplay field="sender" label="Sender" />
            <FieldDisplay field="receiver" label="Receiver" />
            <FieldDisplay field="date" label="Date" />
            <FieldDisplay field="time" label="Time" />
            <FieldDisplay field="transaction_id" label="Transaction ID" />
            <FieldDisplay field="category" label="Category" />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleConfirm}
              disabled={isSaving || Object.keys(validationErrors).some(key => validationErrors[key])}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Confirm & Save'}
            </button>
            <button
              onClick={onDiscard}
              disabled={isSaving}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
            >
              Discard
            </button>
          </div>

          {Object.keys(warnings).some(key => warnings[key]) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Please review the highlighted fields before confirming.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
