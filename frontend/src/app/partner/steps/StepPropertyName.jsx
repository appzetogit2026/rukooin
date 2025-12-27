import React, { useEffect, useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import BottomSheet from '../components/BottomSheet';
import { Building } from 'lucide-react';

const StepPropertyName = () => {
    const { formData, updateFormData } = usePartnerStore();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const inputRef = React.useRef(null);

    // Auto-open sheet on mount
    useEffect(() => {
        setTimeout(() => setIsSheetOpen(true), 300);
    }, []);

    // Focus input when sheet opens
    useEffect(() => {
        if (isSheetOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 500);
        }
    }, [isSheetOpen]);

    const handleSave = () => {
        if (formData.propertyName.trim().length > 3) {
            setIsSheetOpen(false);
        }
    };

    return (

        <div className="pt-4 text-center">
            {/* Background Visual when sheet is active (Optional context) */}
            <div className="opacity-50 blur-sm pointer-events-none transition-all duration-500">
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Building size={48} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-300">Naming your property...</h2>
            </div>

            {!isSheetOpen && formData.propertyName && (
                <div className="mt-8 animate-fade-in-up">
                    <h2 className="text-2xl font-black text-black mb-1">{formData.propertyName}</h2>
                    <p className="text-gray-500 mb-6 text-sm">Great name! Click Next to continue.</p>
                    <button onClick={() => setIsSheetOpen(true)} className="text-xs font-bold underline">Edit Name</button>
                </div>
            )}

            <BottomSheet
                isOpen={isSheetOpen}
                onClose={() => { if (formData.propertyName) setIsSheetOpen(false); }}
                title="Property Name"
            >
                <div>
                    <p className="text-xs text-gray-500 mb-4">Give your property a catchy name that guests will remember.</p>

                    <div className="relative mb-6">
                        <input
                            ref={inputRef}
                            type="text"
                            value={formData.propertyName || ''}
                            onChange={(e) => updateFormData({ propertyName: e.target.value })}
                            placeholder="e.g. Ocean View Residency"
                            className="w-full text-xl font-bold border-b-2 border-gray-200 py-2 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={!formData.propertyName || formData.propertyName.length < 3}
                            className="w-full bg-black text-white font-bold py-3 rounded-xl disabled:bg-gray-200 disabled:text-gray-400 transition-colors text-sm"
                        >
                            Confirm Name
                        </button>
                    </div>
                </div>
            </BottomSheet>
        </div>
    );
};

export default StepPropertyName;
