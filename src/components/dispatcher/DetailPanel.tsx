import React from 'react';
import { useStore, WorkOrder } from '../../store/useStore';
import { ORDER_TYPES, SITE_TYPES, CONTRACTORS } from '../../lib/constants';
import ActionBlock from './ActionBlock';

const SITE_CHIP_STYLES: Record<string, string> = {
    mhc: 'bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/30',
    rvpark: 'bg-[#ffd93d]/10 text-[#ffd93d] border-[#ffd93d]/30',
    natpark: 'bg-[#2d7aff]/10 text-[#2d7aff] border-[#2d7aff]/30',
    residential: 'bg-[#c084fc]/10 text-[#c084fc] border-[#c084fc]/30',
};

const STATUS_CHIP_STYLE: Record<string, string> = {
    critical: 'bg-[#ff2d2d]/10 text-[#ff2d2d] border-[#ff2d2d]/30 shadow-[0_0_10px_rgba(255,45,45,0.15)]',
    assigned: 'bg-[#2d7aff]/10 text-[#2d7aff] border-[#2d7aff]/30',
    inprogress: 'bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/30',
    done: 'bg-[#334155]/20 text-[#64748b] border-[#334155]/50',
};

const STATUS_LABEL: Record<string, string> = {
    critical: 'UNASSIGNED', assigned: 'ASSIGNED TO CONTRACTOR', inprogress: 'TECH IN FIELD', done: 'COMPLETED',
};

export default function DetailPanel() {
    const { orders, selectedOrderId, setSelectedOrder } = useStore();
    const order = orders.find(o => o.id === selectedOrderId);

    if (!order) return null;

    const ot = ORDER_TYPES[order.type];
    const st = SITE_TYPES[order.siteType];

    return (
        <div className="w-[380px] h-full flex flex-col bg-[#060810] shrink-0 border-l border-[#1a2030] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-10 relative">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#1a2030] shrink-0 bg-[#0d1117] flex justify-between gap-4">
                <div className="flex-1">
                    <div className="font-mono text-[10px] text-[#64748b] font-bold mb-2 flex items-center gap-2">
                        <span>{order.id}</span>
                        <span className="text-[#334155]">/</span>
                        <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border tracking-widest ${SITE_CHIP_STYLES[order.siteType]}`}>
                            {st.icon} {st.label}
                        </span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight mb-2.5 text-white">{order.title}</h2>
                    <span className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded border tracking-widest ${STATUS_CHIP_STYLE[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                    </span>
                </div>
                <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-[#64748b] hover:bg-[#1a2030] hover:text-white cursor-pointer h-8 w-8 flex items-center justify-center rounded-lg transition-all"
                >
                    ✕
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 no-scrollbar">

                {/* Order type */}
                <InfoRow label="Order Type">
                    <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2 py-0.5 rounded border tracking-widest`}
                        style={{ background: `${ot.color}15`, color: ot.color, borderColor: `${ot.color}40` }}>
                        {ot.icon} {ot.label}
                    </span>
                </InfoRow>

                {/* Site type */}
                <InfoRow label="Site Type">
                    <div className="flex flex-col gap-1 items-start">
                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border tracking-widest ${SITE_CHIP_STYLES[order.siteType]}`}>
                            {st.icon} {st.label}
                        </span>
                        <span className="text-xs text-[#94a3b8] ml-0.5">{st.desc}</span>
                    </div>
                </InfoRow>

                {/* Partner */}
                {order.partner && (
                    <InfoRow label="Partner">
                        <span className="text-sm font-bold text-white">{order.partner}</span>
                    </InfoRow>
                )}

                {/* Address */}
                <InfoRow label="Address">
                    <span className="text-sm text-[#e2e8f0]">{order.address}</span>
                </InfoRow>

                {/* Task */}
                <InfoRow label="Task">
                    <div className="bg-[#111620] border border-[#1a2030] p-4 rounded-lg">
                        <p className="text-sm leading-relaxed text-[#cbd5e1]">{order.task}</p>
                    </div>
                </InfoRow>

                {/* Equipment */}
                {order.equipment.length > 0 && (
                    <InfoRow label="Required Equipment">
                        <div className="flex flex-wrap gap-2 mt-2">
                            {order.equipment.map(e => (
                                <span key={e} className="font-mono text-[10px] font-bold uppercase tracking-wide px-2 py-1 bg-[#2d7aff]/10 border border-[#2d7aff]/30 rounded text-[#2d7aff]">
                                    {e}
                                </span>
                            ))}
                        </div>
                    </InfoRow>
                )}

                {/* Divider */}
                <div className="h-px bg-[#1a2030] w-full" />

                {/* Action block */}
                <ActionBlock order={order} />

                {/* Divider */}
                <div className="h-px bg-[#1a2030] w-full" />

                {/* Timeline */}
                <div className="mb-4">
                    <div className="font-mono text-[10px] text-[#64748b] font-bold tracking-widest uppercase mb-4 flex items-center gap-3">
                        <span>Timeline</span>
                        <div className="h-px flex-1 bg-[#1a2030]" />
                    </div>
                    <Timeline order={order} />
                </div>

                {/* Delete Option */}
                <div className="mt-4 pt-4 border-t border-[#1a2030] flex justify-end">
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this ticket permanently?')) {
                                useStore.getState().deleteOrder(order.id);
                            }
                        }}
                        className="text-[#ff2d2d] hover:text-white border border-[#ff2d2d]/30 hover:bg-[#ff2d2d] transition-all px-4 py-2 rounded text-[10px] font-mono font-bold tracking-widest uppercase flex items-center gap-2"
                    >
                        🗑 Delete Ticket
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="font-mono text-[10px] text-[#64748b] font-bold tracking-widest uppercase">{label}</div>
            {children}
        </div>
    );
}

function Timeline({ order }: { order: WorkOrder }) {
    const ctrInfo = order.contractor ? CONTRACTORS[order.contractor] : null;

    const steps = [
        { lbl: 'Order received by AccessParks', sub: order.created, done: true },
        {
            lbl: `Assigned to ${order.contractor || 'contractor'}`,
            sub: order.contractor ? `${ctrInfo?.name || order.contractor} · ${ctrInfo?.region || ''}` : '',
            done: ['assigned', 'inprogress', 'done'].includes(order.status),
            active: order.status === 'assigned',
        },
        {
            lbl: 'Contractor dispatches technician',
            sub: order.assignedTech || '',
            done: ['inprogress', 'done'].includes(order.status),
            active: order.status === 'inprogress',
        },
        { lbl: 'Work completed on site', sub: order.completedAt || '', done: order.status === 'done' },
        { lbl: 'AccessParks receives work report', sub: order.status === 'done' ? 'Auto-generated PDF' : '', done: order.status === 'done' },
    ];

    return (
        <div className="flex flex-col">
            {steps.map((s, i) => (
                <div key={i} className={`flex gap-4 ${i === steps.length - 1 ? '' : 'pb-6'}`}>
                    <div className="flex flex-col items-center shrink-0">
                        <div className={`w-3 h-3 rounded-full border-[3px] shrink-0 transition-all ${s.done ? 'bg-[#00e5a0] border-[#00e5a0]/30' :
                            s.active ? 'bg-[#2d7aff] border-[#2d7aff]/30 animate-pulse' :
                                'bg-transparent border-[#1a2030]'
                            }`} style={s.active ? { boxShadow: '0 0 10px #2d7aff' } : s.done ? { boxShadow: '0 0 10px #00e5a0' } : {}} />
                        {i < steps.length - 1 && (
                            <div className={`w-0.5 mt-2 flex-1 min-h-[20px] rounded-full ${s.done ? 'bg-[#00e5a0]/50' : 'bg-[#1a2030]'}`} />
                        )}
                    </div>
                    <div className="-mt-1 flex-1">
                        <div className={`text-sm font-bold mb-1 ${s.active ? 'text-white' : s.done ? 'text-[#e2e8f0]' : 'text-[#64748b]'}`}>{s.lbl}</div>
                        {s.sub && <div className="font-mono text-[10px] text-[#94a3b8]">{s.sub}</div>}
                    </div>
                </div>
            ))}
        </div>
    );
}
