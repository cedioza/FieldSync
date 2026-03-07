import React from 'react';
import { useStore } from '../../store/useStore';
import { SITE_TYPES, CONTRACTORS, ORDER_TYPES } from '../../lib/constants';
import type { WorkOrder } from '../../store/useStore';
import NewOrderModal from './NewOrderModal';

const TYPE_FILTERS = [
    { key: 'ALL', label: 'ALL' },
    { key: 'FAULT', label: '⚡ FAULT' },
    { key: 'INSTALL', label: '📡 INSTALL' },
    { key: 'UPGRADE', label: '⬆ UPGRADE' },
    { key: 'MAINTENANCE', label: '🔧 MAINT' },
    { key: 'SURVEY', label: '📋 SURVEY' },
];

const REGION_FILTERS = [
    { key: 'all', label: '🌎 ALL REGIONS' },
    { key: 'AZ', label: '📍 ARIZONA' },
    { key: 'FL', label: '📍 FLORIDA' },
    { key: 'MT', label: '📍 MONTANA' },
    { key: 'WY', label: '📍 WYOMING' },
    { key: 'natpark', label: '🏔 NAT. PARKS' },
];

const STATUS_LEFT: Record<string, string> = {
    critical: 'border-l-[#ff2d2d]',
    assigned: 'border-l-[#2d7aff] border-l-2',
    inprogress: 'border-l-[#00e5a0] border-l-2',
    done: 'border-l-[#334155]',
};

const STATUS_CHIP: Record<string, string> = {
    critical: 'bg-[#ff2d2d]/10 text-[#ff2d2d] border-[#ff2d2d]/30',
    assigned: 'bg-[#2d7aff]/10 text-[#2d7aff] border-[#2d7aff]/30',
    inprogress: 'bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/30',
    done: 'bg-[#334155]/20 text-[#64748b] border-[#334155]/50',
};

const STATUS_LABEL: Record<string, string> = {
    critical: 'UNASSIGNED', assigned: 'ASSIGNED', inprogress: 'IN FIELD', done: 'DONE',
};

const SITE_CHIP_STYLES: Record<string, string> = {
    mhc: 'bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/30',
    rvpark: 'bg-[#ffd93d]/10 text-[#ffd93d] border-[#ffd93d]/30',
    natpark: 'bg-[#2d7aff]/10 text-[#2d7aff] border-[#2d7aff]/30',
    residential: 'bg-[#c084fc]/10 text-[#c084fc] border-[#c084fc]/30',
};

const CONTRACTOR_BADGE: Record<string, string> = {
    STS: 'bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/20',
    SWFS: 'bg-[#c084fc]/10 text-[#c084fc] border-[#c084fc]/20',
};

export default function OrderQueue() {
    const { orders, activeFilter, activeRegion, setFilter, setRegion, selectedOrderId, setSelectedOrder, addOrder, faultCounter } = useStore();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const filteredOrders = orders.filter(o => {
        const typeMatch = activeFilter === 'ALL' || o.type.toUpperCase() === activeFilter ||
            (activeFilter === 'MAINTENANCE' && o.type === 'maintenance');
        const regionMatch = activeRegion === 'all'
            ? true
            : activeRegion === 'natpark'
                ? o.siteType === 'natpark'
                : o.region === activeRegion;
        return typeMatch && regionMatch;
    });

    function triggerNewOrder() {
        setIsModalOpen(true);
    }

    return (
        <div className="w-[300px] h-full flex flex-col border-r border-[#1a2030] bg-[#060810] shrink-0 tour-order-queue relative">

            <NewOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Panel header */}
            <div className="px-5 py-4 border-b border-[#1a2030] flex items-center justify-between shrink-0 bg-[#0d1117]">
                <span className="font-mono text-[10px] text-[#64748b] font-bold tracking-[2px] uppercase">Order Queue</span>
                <button
                    onClick={triggerNewOrder}
                    className="tour-add-button bg-[#ff2d2d] text-white border-none px-3 py-1.5 font-mono text-[10px] font-bold rounded tracking-widest cursor-pointer transition-all hover:bg-[#ff2d2d]/90 shadow-[0_0_10px_rgba(255,45,45,0.3)] hover:shadow-[0_0_15px_rgba(255,45,45,0.5)] flex items-center gap-2"
                >
                    ⚡ ADD NEW
                </button>
            </div>

            {/* Type filter bar */}
            <div className="flex gap-1.5 px-3 py-2.5 border-b border-[#1a2030] bg-[#0d1117] shrink-0 overflow-x-auto no-scrollbar">
                {TYPE_FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`font-mono text-[9px] px-2.5 py-1 rounded border whitespace-nowrap transition-all duration-150 cursor-pointer tracking-widest uppercase font-bold ${activeFilter === f.key
                            ? 'border-[#00e5a0] text-[#00e5a0] bg-[#00e5a0]/10'
                            : 'border-[#1a2030] text-[#64748b] hover:border-[#00e5a0]/50 hover:text-[#00e5a0]'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Region filter bar */}
            <div className="flex gap-1.5 px-3 py-2.5 border-b border-[#1a2030] bg-[#0d1117]/50 shrink-0 overflow-x-auto no-scrollbar shadow-sm">
                {REGION_FILTERS.map(r => (
                    <button
                        key={r.key}
                        onClick={() => setRegion(r.key)}
                        className={`font-mono text-[9px] px-2.5 py-1 rounded border whitespace-nowrap transition-all duration-150 cursor-pointer tracking-widest uppercase font-bold ${activeRegion === r.key
                            ? 'border-[#2d7aff] text-[#2d7aff] bg-[#2d7aff]/10'
                            : 'border-[#1a2030] text-[#64748b] hover:border-[#2d7aff]/50 hover:text-[#2d7aff]'
                            }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {/* Order list */}
            <div className="flex-1 overflow-y-auto">
                {filteredOrders.length === 0 ? (
                    <div className="p-5 text-center font-mono text-[10px] text-[#4a5568]">No orders match this filter</div>
                ) : (
                    filteredOrders.map(order => {
                        const ot = ORDER_TYPES[order.type];
                        const st = SITE_TYPES[order.siteType];
                        return (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order.id)}
                                className={`px-5 py-4 border-b border-[#1a2030] cursor-pointer border-l-4 transition-all duration-150 relative group
                                    ${STATUS_LEFT[order.status] || 'border-l-transparent'}
                                    ${selectedOrderId === order.id ? 'bg-[#00e5a0]/5' : 'hover:bg-white/[0.02]'}
                                `}
                            >
                                {/* Top row: ID + status chip */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`font-mono text-xs font-bold leading-none ${selectedOrderId === order.id ? 'text-[#00e5a0]' : 'text-[#64748b]'}`}>{order.id}</span>
                                    <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-transparent tracking-widest ${STATUS_CHIP[order.status]}`}>
                                        {STATUS_LABEL[order.status]}
                                    </span>
                                </div>

                                {/* Type + site type + contractor badge */}
                                <div className="flex gap-2 items-center mb-1.5 flex-wrap">
                                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest leading-none drop-shadow-sm" style={{ color: ot.color }}>
                                        {ot.icon} {ot.label}
                                    </span>
                                    <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border tracking-widest ${SITE_CHIP_STYLES[order.siteType]}`}>
                                        {st.icon} {st.label}
                                    </span>
                                    {order.contractor && (
                                        <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border tracking-widest ${CONTRACTOR_BADGE[order.contractor] || ''}`}>
                                            {order.contractor}
                                        </span>
                                    )}
                                </div>

                                <h3 className={`text-sm font-bold leading-tight mb-1 mt-2.5 transition-colors ${selectedOrderId === order.id ? 'text-white' : 'text-[#f8fafc]'}`}>{order.title}</h3>
                                <p className="text-[11px] font-mono text-[#94a3b8] truncate opacity-90">
                                    📍 {order.location} · {order.address.split(',').slice(-2).join(',').trim()}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
