import React, { useState } from 'react';
import { QrCode, X, Check, MapPin, Sparkles } from 'lucide-react';
import { getLocation } from '../../api/locations';
import { LocationDetail } from '../../types';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationFound: (location: LocationDetail) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onLocationFound,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScan = async (selectedCode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const loc = await getLocation(selectedCode);
      onLocationFound(loc);
      onClose();
    } catch (err: any) {
      setError('Could not resolve location code. Please check the code or enter manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleCodes = [
    { label: 'CSE Lab 2 (2nd Floor)', code: 'CSE-BLOCK-F2-LAB2' },
    { label: 'Tech Tower Server Room', code: 'TECH-TOWER-F1-102' },
    { label: 'Hostel Block C (Room 304)', code: 'HOSTEL-C-F3-304' },
    { label: 'Central Library Desk', code: 'LIB-CENTRAL-F1-DESK' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Scan Campus Location QR</h3>
            <p className="text-xs text-slate-400">Instant geolocated room & building identification</p>
          </div>
        </div>

        {/* Camera simulation viewport */}
        <div className="relative w-full h-48 rounded-xl border-2 border-dashed border-indigo-500/40 bg-slate-950 flex flex-col items-center justify-center overflow-hidden mb-6">
          {/* Animated scanner laser bar */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse shadow-[0_0_15px_#6366f1]" />
          <QrCode className="w-16 h-16 text-slate-600 mb-2" />
          <p className="text-xs text-slate-400 font-mono">Simulating Optical Camera Lens...</p>
        </div>

        {/* Quick select buttons */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Quick Campus QR Tags
          </label>
          <div className="grid grid-cols-2 gap-2">
            {sampleCodes.map((item) => (
              <button
                key={item.code}
                onClick={() => handleScan(item.code)}
                disabled={isLoading}
                className="flex flex-col items-start p-2.5 rounded-lg border border-slate-800 bg-slate-850 hover:border-indigo-500/50 hover:bg-slate-800 transition-all text-left"
              >
                <span className="text-xs font-medium text-slate-200 truncate w-full">{item.label}</span>
                <span className="text-[11px] font-mono text-indigo-400">{item.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Code input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Or enter location code (e.g. CSE-BLOCK-F2-LAB2)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => code.trim() && handleScan(code.trim())}
            disabled={!code.trim() || isLoading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4" />
            Resolve
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-400 mt-3 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
};
