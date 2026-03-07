import React from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { SITE_TYPES } from '../lib/constants';

export default function Header() {
    const { viewRole, setViewRole, orders, technicians, setRunTour } = useStore();
    const navigate = useNavigate();

    const unassignedCount = orders.filter(o => o.status === 'critical').length;
    const activeOrders = orders.filter(o => o.status !== 'done').length;
    const inFieldTechs = technicians.filter(t => t.status === 'busy').length;
    const contractors = 2; // STS + SWFS
    const statesCovered = 6;
    const ticketsMonth = 847;

    const handleRoleSwitch = (role: 'dispatcher' | 'contractor' | 'tech') => {
        setViewRole(role);
        navigate(`/${role === 'dispatcher' ? 'dispatcher' : role === 'tech' ? 'tech' : 'contractor'}`);
    };

    return (
        <div className="flex flex-col shrink-0">
            {/* Main header bar */}
            <header className="h-[60px] border-b border-[#1a2030] bg-[#060810] flex items-center px-6 gap-6 z-50">
                {/* Logo */}
                <div className="font-mono text-lg font-bold tracking-[3px] text-[#00e5a0] shrink-0">
                    FIELD<span className="text-[#64748b]">SYNC</span>
                </div>
                <div className="w-px h-8 bg-[#1a2030]" />
                {/* Live dot */}
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ff2d2d] shrink-0 animate-pulse" style={{ boxShadow: '0 0 10px #ff2d2d' }} />
                    <div className="font-mono text-[10px] text-[#94a3b8] tracking-widest uppercase font-bold">Live Dispatch</div>
                </div>

                {/* Alert pill */}
                {unassignedCount > 0 ? (
                    <div className="font-mono text-[10px] font-bold text-[#ff2d2d] bg-[#ff2d2d]/10 border border-[#ff2d2d]/30 px-3 py-1 rounded tracking-widest flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,45,45,0.15)]">
                        ⚡ {unassignedCount} UNASSIGNED
                    </div>
                ) : (
                    <div className="font-mono text-[10px] font-bold text-[#00e5a0] bg-[#00e5a0]/10 border border-[#00e5a0]/30 px-3 py-1 rounded tracking-widest">
                        ✓ ALL ASSIGNED
                    </div>
                )}

                <div className="text-[10px] font-mono text-[#64748b] ml-4 tracking-wide font-bold hidden md:block">
                    accessparks.com · national ops
                </div>

                {/* View tabs */}
                <div className="flex gap-2 ml-auto tour-role-tabs">
                    {([
                        { role: 'dispatcher' as const, label: 'DISPATCHER' },
                        { role: 'contractor' as const, label: 'CONTRACTOR' },
                        { role: 'tech' as const, label: 'TECHNICIAN' },
                    ] as const).map(({ role, label }) => (
                        <button
                            key={role}
                            onClick={() => handleRoleSwitch(role)}
                            className={`px-4 py-1.5 rounded-full font-mono text-[10px] font-bold tracking-widest border transition-all duration-200 cursor-pointer ${viewRole === role
                                ? 'bg-[#00e5a0] text-[#060810] border-[#00e5a0] shadow-[0_0_15px_rgba(0,229,160,0.2)]'
                                : 'border-[#1a2030] bg-[#0d1117] text-[#64748b] hover:border-[#00e5a0]/50 hover:text-[#00e5a0]'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Help Tour */}
                <button
                    onClick={() => setRunTour(true)}
                    className="ml-2 px-3 py-1.5 rounded-full font-mono text-[10px] font-bold tracking-widest border border-[#334155]/50 bg-[#1a2030] text-[#00e5a0] hover:bg-[#2d7aff]/10 hover:border-[#2d7aff]/50 hover:text-[#2d7aff] transition-all duration-200 cursor-pointer shadow-sm"
                    title="Start Onboarding Tour"
                >
                    💡 HELP
                </button>

                {/* User pill */}
                <div className="text-[10px] font-mono font-bold text-[#f8fafc] bg-[#1a2030] px-3 py-1.5 rounded-full ml-4 shrink-0 shadow-sm border border-[#334155]/50">
                    {viewRole === 'dispatcher' && 'Marcus Prieto · AP Dispatcher'}
                    {viewRole === 'contractor' && 'Andrés Barrera · STS Operations'}
                    {viewRole === 'tech' && 'Carlos M. · Field Technician'}
                </div>
            </header>

            {/* Scale bar — national scope stats */}
            {/* Scale bar — national scope stats */}
            <div className="flex items-center gap-6 px-6 py-2 bg-[#0d1117] border-b border-[#1a2030] shrink-0 overflow-x-auto no-scrollbar shadow-sm tour-stats-header">
                <ScaleStat num={ticketsMonth.toString()} lbl="tickets this month" />
                <div className="w-px h-5 bg-[#1a2030] shrink-0" />
                <ScaleStat num={activeOrders.toString()} lbl="active orders" />
                <div className="w-px h-5 bg-[#1a2030] shrink-0" />
                <ScaleStat num={contractors.toString()} lbl="contractors" />
                <div className="w-px h-5 bg-[#1a2030] shrink-0" />
                <ScaleStat num={inFieldTechs.toString()} lbl="technicians in field" />
                <div className="w-px h-5 bg-[#1a2030] shrink-0" />
                <ScaleStat num={statesCovered.toString()} lbl="states covered" />
                <div className="w-px h-5 bg-[#1a2030] shrink-0" />
                {/* Site type chips */}
                <div className="flex gap-2 items-center shrink-0">
                    <SiteChip cls="mhc" icon="🏘" label="MHC" />
                    <SiteChip cls="rvpark" icon="🚐" label="RV PARK" />
                    <SiteChip cls="natpark" icon="🏔" label="NAT. PARK" />
                    <SiteChip cls="residential" icon="🏠" label="RESIDENTIAL" />
                </div>
            </div>
        </div>
    );
}

function ScaleStat({ num, lbl }: { num: string; lbl: string }) {
    return (
        <div className="flex items-center gap-2.5 shrink-0">
            <span className="font-mono text-base font-bold text-[#2d7aff]">{num}</span>
            <span className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest font-bold">{lbl}</span>
        </div>
    );
}

function SiteChip({ cls, icon, label }: { cls: string; icon: string; label: string }) {
    const styles: Record<string, string> = {
        mhc: 'bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/30',
        rvpark: 'bg-[#ffd93d]/10 text-[#ffd93d] border-[#ffd93d]/30',
        natpark: 'bg-[#2d7aff]/10 text-[#2d7aff] border-[#2d7aff]/30',
        residential: 'bg-[#c084fc]/10 text-[#c084fc] border-[#c084fc]/30',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 font-mono text-[9px] font-bold px-2 py-0.5 rounded border tracking-widest ${styles[cls]}`}>
            {icon} {label}
        </span>
    );
}
