import React, { useState, useEffect } from 'react';
import { SaveIcon } from './icons/SaveIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKeys: string[];
  onAddKeys: (keys: string[]) => Promise<{ successCount: number, errors: { key: string, message: string }[] }>;
  onDeleteKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, currentApiKeys, onAddKeys, onDeleteKey }) => {
  const [newApiKeyInput, setNewApiKeyInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [keysVisible, setKeysVisible] = useState(false);


  useEffect(() => {
    if (isOpen) {
      setNewApiKeyInput('');
      setStatus('idle');
      setError('');
      setSuccessMessage('');
      setKeysVisible(false);
    }
  }, [isOpen]);

  const handleAdd = async () => {
    const keys = newApiKeyInput.trim().split('\n').map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) {
      setError('Vui lòng nhập ít nhất một API Key.');
      setStatus('error');
      return;
    }
    
    setStatus('validating');
    setError('');
    setSuccessMessage('');
    
    const result = await onAddKeys(keys);

    if (result.successCount > 0) {
        setSuccessMessage(`${result.successCount} API Key đã được thêm thành công.`);
        setNewApiKeyInput('');
    }

    if (result.errors.length > 0) {
        const errorMessages = result.errors.map(e => `Key ••••${e.key.slice(-4)}: ${e.message}`);
        setError(errorMessages.join('\n'));
        setStatus('error');
    } else if (result.successCount > 0) {
        setStatus('success');
        setTimeout(() => {
            setStatus('idle');
            setSuccessMessage('');
        }, 3000);
    } else {
        setStatus('idle');
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length < 10) {
      return '•'.repeat(key.length);
    }
    // Show first 4 and last 6 characters. Standard for API keys.
    return `${key.substring(0, 4)}•••••••••••••••••••••••••${key.slice(-6)}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-secondary rounded-lg shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-primary">
          <h2 className="text-xl font-bold text-accent">Quản lý API Keys</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6 space-y-6">
          <div className="p-4 bg-primary/50 rounded-lg border border-secondary">
              <h3 className="text-md font-semibold text-text-primary mb-2">Làm thế nào để lấy API Key?</h3>
              <ol className="list-decimal list-inside text-sm text-text-secondary space-y-1">
                  <li>Truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google AI Studio</a> và đăng nhập.</li>
                  <li>Nhấn vào nút "<strong>Create API key</strong>".</li>
                  <li>Sao chép API key vừa được tạo.</li>
                  <li>Dán key vào ô bên dưới.</li>
              </ol>
          </div>
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-text-secondary mb-2">
                Thêm API Key mới
            </label>
            <div className="flex items-start gap-2">
                <textarea
                  id="apiKey"
                  rows={4}
                  className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
                  placeholder="Nhập mỗi API Key trên một dòng riêng biệt."
                  value={newApiKeyInput}
                  onChange={(e) => setNewApiKeyInput(e.target.value)}
                />
                <button
                    onClick={handleAdd}
                    disabled={status === 'validating' || !newApiKeyInput}
                    className="flex items-center justify-center w-32 shrink-0 gap-2 text-sm bg-accent hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50"
                >
                    {status === 'validating' ? (
                        <>
                           <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                        </>
                    ) : (
                        'Thêm Key'
                    )}
                </button>
            </div>
          </div>
          {status === 'error' && <pre className="text-red-400 text-sm whitespace-pre-wrap font-sans">{error}</pre>}
          {successMessage && <p className="text-green-400 text-sm">{successMessage}</p>}
          
          <div className="border-t border-primary pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-semibold text-text-primary">Các API Key đã lưu ({currentApiKeys.length})</h3>
                {currentApiKeys.length > 0 && (
                    <button 
                        onClick={() => setKeysVisible(!keysVisible)}
                        className="text-xs font-semibold text-accent hover:underline"
                    >
                        {keysVisible ? 'Ẩn Keys' : 'Hiển thị Keys'}
                    </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {currentApiKeys.length === 0 ? (
                      <p className="text-sm text-text-secondary text-center py-4">Chưa có API Key nào được lưu.</p>
                  ) : (
                      <ul className="space-y-2">
                          {currentApiKeys.map((key, index) => (
                              <li key={key} className="bg-primary/50 p-3 rounded-md flex justify-between items-center text-sm">
                                  <div className="font-mono text-text-secondary break-all flex items-center flex-wrap">
                                      <span>{keysVisible ? key : maskApiKey(key)}</span>
                                      {index === 0 && <span className="ml-3 text-xs font-sans text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full whitespace-nowrap">Đang hoạt động</span>}
                                  </div>
                                  <button onClick={() => onDeleteKey(key)} className="p-1 text-red-400 hover:text-red-300 hover:bg-red-800/50 rounded-full transition ml-4 shrink-0" aria-label="Xóa key">
                                      <TrashIcon className="w-5 h-5" />
                                  </button>
                              </li>
                          ))}
                      </ul>
                  )}
              </div>
          </div>
        </div>
        <div className="p-4 border-t border-primary flex justify-end">
            <button onClick={onClose} className="text-sm bg-primary/70 hover:bg-primary text-text-secondary font-semibold py-2 px-4 rounded-md transition">
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};
