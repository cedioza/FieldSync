import React, { useState } from 'react';
import { useStore, WorkOrder } from '../../store/useStore';
import { OrderType, SiteType } from '../../lib/constants';
import { useToast } from '../ui/ToastContext';

export default function NewOrderModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { faultCounter, addOrder } = useStore();
    const { addToast } = useToast();

    const [type, setType] = useState<OrderType>('fault');
    const [siteType, setSiteType] = useState<SiteType>('mhc');
    const [title, setTitle] = useState('');
    const [partner, setPartner] = useState('');
    const [address, setAddress] = useState('');
    const [task, setTask] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !address || !partner) {
            addToast('Please fill all required fields', 'error');
            return;
        }

        const newOrder: WorkOrder = {
            id: `AS-${faultCounter + 1}`,
            type,
            siteType,
            region: 'AZ', // Default demo region
            title,
            location: partner.split(' ')[0], // Mock logic for location name
            partner,
            address,
            lat: 33.422 + (Math.random() - 0.5) * 0.1, // Random near Phoenix
            lng: -111.750 + (Math.random() - 0.5) * 0.1,
            status: 'critical',
            contractor: null,
            assignedTech: null,
            equipment: ['Laptop', 'Standard Toolkit'],
            task,
            mopItems: [],
            hours: 2,
            travelHours: 0.5,
            apEngineer: 'System Generated',
            apPhone: '800-555-0199',
            created: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            completedAt: null,
            photos: {},
            workReport: null,
            lots: type === 'install' ? [{ num: 'LOT 1', client: 'TBD', sched: 'ASAP', status: 'pending' }] : undefined
        };

        addOrder(newOrder);
        addToast(`✅ Order ${newOrder.id} created successfully`, 'success');
        onClose();

        // Reset form
        setTitle('');
        setPartner('');
        setAddress('');
        setTask('');
    };

    return (
        <div className="fixed inset-0 z-[999] bg-[#060810]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-[#1a2030] flex justify-between items-center bg-[#060810]">
                    <h2 className="text-white font-bold text-lg tracking-wide flex items-center gap-2">
                        <span className="text-[#ff2d2d]">⚡</span> CREATE DISPATCH TICKET
                    </h2>
                    <button onClick={onClose} className="text-[#64748b] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1a2030]">✕</button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh] no-scrollbar">

                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono text-[#64748b] font-bold uppercase tracking-widest">Order Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value as OrderType)} className="bg-[#060810] border border-[#1a2030] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2d7aff] cursor-pointer">
                                <option value="fault">Fault / Repair</option>
                                <option value="install">New Install</option>
                                <option value="upgrade">Equipment Upgrade</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono text-[#64748b] font-bold uppercase tracking-widest">Site Type</label>
                            <select value={siteType} onChange={(e) => setSiteType(e.target.value as SiteType)} className="bg-[#060810] border border-[#1a2030] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2d7aff] cursor-pointer">
                                <option value="mhc">Manufactured Home</option>
                                <option value="rvpark">RV Park</option>
                                <option value="natpark">National Park</option>
                                <option value="residential">Residential MDU</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#64748b] font-bold uppercase tracking-widest">Issue / Title <span className="text-[#ff2d2d]">*</span></label>
                        <input required autoFocus placeholder="e.g. Lot 42 — Complete signal drop" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-[#060810] border border-[#1a2030] rounded-lg px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#2d7aff] placeholder:text-[#334155]" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#64748b] font-bold uppercase tracking-widest">Partner / Community <span className="text-[#ff2d2d]">*</span></label>
                        <input required placeholder="e.g. Cobblestone Communities" value={partner} onChange={(e) => setPartner(e.target.value)} className="bg-[#060810] border border-[#1a2030] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2d7aff] placeholder:text-[#334155]" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#64748b] font-bold uppercase tracking-widest">Full Address <span className="text-[#ff2d2d]">*</span></label>
                        <input required placeholder="123 Main St, City, ST 12345" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-[#060810] border border-[#1a2030] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] font-mono focus:outline-none focus:border-[#2d7aff] placeholder:text-[#334155]" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#64748b] font-bold uppercase tracking-widest">Task Description</label>
                        <textarea placeholder="Describe the work to be done..." value={task} onChange={(e) => setTask(e.target.value)} rows={3} className="bg-[#060810] border border-[#1a2030] rounded-lg px-3 py-2 text-sm text-[#cbd5e1] focus:outline-none focus:border-[#2d7aff] placeholder:text-[#334155] resize-none" />
                    </div>

                </form>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-[#1a2030] bg-[#060810] flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 font-mono text-xs font-bold text-[#64748b] hover:text-white transition-colors uppercase tracking-widest">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} type="submit" className="px-6 py-2 bg-[#ff2d2d] text-white rounded font-mono text-xs font-bold uppercase tracking-widest transition-all hover:bg-[#ff2d2d]/90 shadow-[0_0_15px_rgba(255,45,45,0.3)]">
                        Add to Queue
                    </button>
                </div>

            </div>
        </div>
    );
}
