import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { StatusChip } from '../components/ui/StatusChip';
import { OrderTypeTag } from '../components/ui/OrderTypeTag';
import { useToast } from '../components/ui/ToastContext';

type Tab = 'orders' | 'techs' | 'invoice';

export default function ContractorView() {
    const [activeTab, setActiveTab] = useState<Tab>('orders');
    const { orders, technicians, dispatchTech } = useStore();
    const stsOrders = orders.filter(o => o.contractor === 'STS' || o.contractor === null);
    const { addToast } = useToast();

    const assignedOrders = stsOrders.filter(o => o.status === 'assigned');
    const inFieldOrders = stsOrders.filter(o => o.status === 'inprogress');
    const completedOrders = stsOrders.filter(o => o.status === 'done');
    const totalBillableHours = completedOrders.reduce((sum, o) => sum + o.hours + o.travelHours, 0);

    const handleDispatch = (orderId: string) => {
        dispatchTech(orderId);
        addToast(`📍 STS dispatched tech → en route`, 'success');
    };

    const handleSendInvoice = () => {
        addToast(`✓ Invoice sent to AccessParks`, 'success');
    };

    return (
        <div className="flex-1 flex w-full h-full bg-[#060810] text-[#e2e8f0]">
            {/* Contractor Nav */}
            <div className="w-[240px] border-r border-[#1a2030] bg-[#0d1117] flex flex-col pt-6 shrink-0">
                <div className="px-4 mb-6">
                    <div className="text-[10px] uppercase font-mono text-muted tracking-widest mb-1">LOGGED IN AS</div>
                    <div className="font-bold">STS Corp.</div>
                    <div className="text-xs text-muted">Contractor · Northern CA</div>
                </div>

                <nav className="flex flex-col gap-1 px-4 mt-8">
                    <button onClick={() => setActiveTab('orders')} className={`flex justify-between items-center px-4 py-3 rounded text-sm transition-all font-medium ${activeTab === 'orders' ? 'bg-[#00e5a0]/10 border border-[#00e5a0]/30 border-l-4 border-l-[#00e5a0] text-[#00e5a0]' : 'text-[#94a3b8] hover:bg-white/5 border border-transparent hover:text-white'}`}>
                        <span>Active Orders</span>
                        {assignedOrders.length > 0 && <span className="bg-[#ff2d2d] text-white shadow-[0_0_10px_rgba(255,45,45,0.6)] text-[10px] w-5 h-5 rounded flex items-center justify-center font-bold px-1">{assignedOrders.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('techs')} className={`tour-contractor-fleet flex justify-between items-center px-4 py-3 rounded text-sm transition-all font-medium ${activeTab === 'techs' ? 'bg-[#00e5a0]/10 border border-[#00e5a0]/30 border-l-4 border-l-[#00e5a0] text-[#00e5a0]' : 'text-[#94a3b8] hover:bg-white/5 border border-transparent hover:text-white'}`}>
                        <span>Technicians</span>
                    </button>
                    <button onClick={() => setActiveTab('invoice')} className={`flex justify-between items-center px-4 py-3 rounded text-sm transition-all font-medium ${activeTab === 'invoice' ? 'bg-[#00e5a0]/10 border border-[#00e5a0]/30 border-l-4 border-l-[#00e5a0] text-[#00e5a0]' : 'text-[#94a3b8] hover:bg-white/5 border border-transparent hover:text-white'}`}>
                        <span>Invoicing</span>
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-12 bg-[#060810] max-w-7xl mx-auto w-full">
                {activeTab === 'orders' && (
                    <div className="animate-in fade-in duration-300">
                        <h2 className="text-3xl font-bold mb-1 text-white tracking-tight">Work Orders</h2>
                        <p className="text-[#94a3b8] text-sm mb-8 font-mono">Orders assigned by AccessParks · Dispatch your technicians here</p>
                        <div className="grid grid-cols-4 gap-6 mb-8 tour-contractor-performance">
                            <div className="bg-[#0d1117] border border-[#1a2030] rounded p-6 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#ff2d2d]" />
                                <div className="text-[10px] uppercase font-mono text-[#94a3b8] tracking-widest mb-3">PENDING ASSIGNMENT</div>
                                <div className="text-4xl font-mono font-bold text-[#ff2d2d] mb-1 tracking-tight">{assignedOrders.length}</div>
                                <div className="text-xs text-[#64748b] font-mono">needs immediate action</div>
                            </div>
                            <div className="bg-[#0d1117] border border-[#1a2030] rounded p-6 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#00e5a0]" />
                                <div className="text-[10px] uppercase font-mono text-[#94a3b8] tracking-widest mb-3">IN FIELD</div>
                                <div className="text-4xl font-mono font-bold text-[#00e5a0] mb-1 tracking-tight">{inFieldOrders.length}</div>
                                <div className="text-xs text-[#64748b] font-mono">techs currently working</div>
                            </div>
                            <div className="bg-[#0d1117] border border-[#1a2030] rounded p-6 shadow-sm">
                                <div className="text-[10px] uppercase font-mono text-[#94a3b8] tracking-widest mb-3">COMPLETED THIS MONTH</div>
                                <div className="text-4xl font-mono font-bold text-white mb-1 tracking-tight">{completedOrders.length}</div>
                                <div className="text-xs text-[#64748b] font-mono">successful resolves</div>
                            </div>
                            <div className="bg-[#0d1117] border border-[#1a2030] rounded p-6 shadow-sm bg-gradient-to-br from-[#0d1117] to-[#131b2c]">
                                <div className="text-[10px] uppercase font-mono text-[#00e5a0] tracking-widest mb-3">BILLABLE HOURS</div>
                                <div className="text-4xl font-mono font-bold text-[#00e5a0] mb-1 tracking-tight">{totalBillableHours}h</div>
                                <div className="text-xs text-[#00e5a0]/60 italic font-mono">apply rate table for $</div>
                            </div>
                        </div>

                        <div className="bg-[#0d1117] border border-[#1a2030] rounded-lg overflow-hidden tour-contractor-orders">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider border-b border-[#1a2030] bg-[#060810]">
                                    <tr>
                                        <th className="py-4 px-6 font-normal">ORDER ID</th>
                                        <th className="py-4 px-6 font-normal">TYPE</th>
                                        <th className="py-4 px-6 font-normal">ISSUE</th>
                                        <th className="py-4 px-6 font-normal">LOCATION</th>
                                        <th className="py-4 px-6 font-normal">STATUS</th>
                                        <th className="py-4 px-6 font-normal text-right">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1a2030]">
                                    {stsOrders.filter(o => o.status !== 'critical').map(order => (
                                        <tr key={order.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                                            <td className="py-5 px-6 font-mono text-[#00e5a0] text-xs font-bold">{order.id}</td>
                                            <td className="py-5 px-6"><OrderTypeTag type={order.type} /></td>
                                            <td className="py-5 px-6 text-[#f8fafc] font-medium truncate max-w-[250px]">{order.title}</td>
                                            <td className="py-5 px-6 text-[#94a3b8] truncate max-w-[200px] text-xs font-mono">{order.location}</td>
                                            <td className="py-5 px-6"><StatusChip status={order.status} /></td>
                                            <td className="py-5 px-6 text-right">
                                                {order.status === 'assigned' && (
                                                    <button
                                                        onClick={() => handleDispatch(order.id)}
                                                        className="px-5 py-2 bg-[#2d7aff] text-white text-[11px] font-bold font-mono uppercase tracking-widest rounded shadow-[0_0_15px_rgba(45,122,255,0.3)] hover:bg-[#1a65e5] hover:shadow-[0_0_20px_rgba(45,122,255,0.5)] transition-all"
                                                    >
                                                        DISPATCH TECH →
                                                    </button>
                                                )}
                                                {order.status === 'inprogress' && (
                                                    <div className="flex items-center justify-end gap-2 text-[#00e5a0] font-mono text-[11px] tracking-wider font-bold">
                                                        <span>{order.assignedTech}</span>
                                                        <span className="w-2 h-2 rounded-full bg-[#00e5a0] shadow-[0_0_8px_rgba(0,229,160,0.8)] animate-pulse" />
                                                    </div>
                                                )}
                                                {order.status === 'done' && (
                                                    <span className="px-5 py-2 border border-[#1a2030] text-[#94a3b8] hover:text-white hover:border-[#334155] cursor-pointer text-[11px] font-bold font-mono uppercase tracking-widest rounded transition-all">
                                                        ↓ REPORT
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'techs' && (
                    <div className="animate-in fade-in duration-300">
                        <h2 className="text-3xl font-bold mb-8 text-white tracking-tight">STS Technicians</h2>
                        <div className="bg-[#0d1117] border border-[#1a2030] rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider border-b border-[#1a2030] bg-[#060810]">
                                    <tr>
                                        <th className="py-4 px-6 font-normal">ID</th>
                                        <th className="py-4 px-6 font-normal">NAME</th>
                                        <th className="py-4 px-6 font-normal">SPECIALTY</th>
                                        <th className="py-4 px-6 font-normal">ZONE</th>
                                        <th className="py-4 px-6 font-normal">ORDERS YTD</th>
                                        <th className="py-4 px-6 font-normal text-right">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1a2030]">
                                    {technicians.filter(t => t.contractor === 'STS').map(tech => (
                                        <tr key={tech.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                            <td className="py-5 px-6 font-mono text-[#64748b] text-xs">{tech.id}</td>
                                            <td className="py-5 px-6 text-[#f8fafc] font-bold">{tech.name}</td>
                                            <td className="py-5 px-6 text-[#94a3b8] text-xs uppercase tracking-widest">{tech.specialty}</td>
                                            <td className="py-5 px-6 text-[#94a3b8] font-mono text-xs">{tech.zone}</td>
                                            <td className="py-5 px-6 font-mono text-[#2d7aff] font-bold">{tech.orders}</td>
                                            <td className="py-5 px-6 text-right">
                                                <span className={`px-2 py-0.5 border rounded text-[10px] font-mono font-bold tracking-widest uppercase 
                                                    ${tech.status === 'available' ? 'bg-[#00e5a0]/10 border-[#00e5a0]/30 text-[#00e5a0]' :
                                                        tech.status === 'busy' ? 'bg-[#ff6b35]/10 border-[#ff6b35]/30 text-[#ff6b35]' :
                                                            'bg-[#334155]/20 border-[#334155]/50 text-[#64748b]'}`}>
                                                    {tech.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'invoice' && (
                    <div className="animate-in fade-in duration-300">
                        <h2 className="text-3xl font-bold mb-6 text-white tracking-tight">Invoicing</h2>

                        <div className="flex items-start gap-4 bg-[#ffd93d]/10 border border-[#ffd93d]/30 text-[#ffd93d] p-5 rounded-lg mb-8 shadow-sm">
                            <span className="text-2xl mt-0.5">⚠</span>
                            <div>
                                <h4 className="font-bold text-sm tracking-wide">IMPORTANT</h4>
                                <p className="text-xs font-mono mt-1.5 leading-relaxed opacity-90 text-[#e2e8f0]">
                                    FieldSync shows hours + variables only.<br />
                                    Apply AccessParks rate table to generate invoice amounts.
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#0d1117] border border-[#1a2030] rounded-lg mb-12 overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-[#1a2030] flex justify-between items-center bg-gradient-to-r from-[#0d1117] to-[#131b2c]">
                                <div>
                                    <div className="text-xs text-[#64748b] font-mono mb-2 tracking-widest">INVOICE TO</div>
                                    <div className="font-bold text-2xl text-white">AccessParks Inc.</div>
                                    <div className="text-sm text-[#94a3b8] mt-1 font-mono">Period: March 2025 · Zone: Northern CA MHPs</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-[#00e5a0] font-mono tracking-widest uppercase mb-2">TOTAL HOURS</div>
                                    <div className="text-5xl font-bold font-mono text-[#00e5a0] tracking-tight">{totalBillableHours}h</div>
                                </div>
                            </div>
                            <div className="p-0 divide-y divide-[#1a2030]">
                                {completedOrders.map((order, i) => (
                                    <div key={order.id} className="p-5 px-8 flex justify-between items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                                        <div className="flex items-center gap-6">
                                            <span className="text-xs font-mono font-bold text-[#64748b] w-20">{order.id}</span>
                                            <OrderTypeTag type={order.type} />
                                            <span className="text-sm font-medium text-[#f8fafc]">{order.title}</span>
                                        </div>
                                        <div className="text-sm font-mono text-[#94a3b8] text-right flex items-center gap-4">
                                            <span>{order.hours}h + {order.travelHours}h travel</span>
                                            <span className="font-bold text-white bg-[#1a2030] px-3 py-1 rounded">{order.hours + order.travelHours}h</span>
                                        </div>
                                    </div>
                                ))}
                                {completedOrders.length === 0 && (
                                    <div className="p-12 text-center text-[#64748b] font-mono text-sm">
                                        No completed orders in this period.
                                    </div>
                                )}
                            </div>
                            <div className="p-6 bg-[#060810] flex justify-between items-center rounded-b-lg border-t border-[#1a2030]">
                                <span className="text-xs italic text-[#64748b]">Apply AccessParks rate table to calculate invoice amount</span>
                                <button
                                    onClick={handleSendInvoice}
                                    className="px-6 py-2.5 bg-[#2d7aff] hover:bg-[#1a65e5] text-white font-mono font-bold text-sm tracking-wider uppercase rounded transition-all shadow-[0_0_15px_rgba(45,122,255,0.3)] hover:shadow-[0_0_20px_rgba(45,122,255,0.5)]"
                                >
                                    Send Invoice →
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold mb-4">Technician Payouts</h3>
                        <p className="text-xs text-muted mb-4 max-w-2xl leading-relaxed">STS pays its own technicians based on Internal Rate tables. FieldSync does track these calculated amounts directly for contractor eyes only.</p>

                        <table className="w-full text-left text-sm whitespace-nowrap bg-panel border-collapse border border-border2 rounded-lg overflow-hidden block stack">
                            <thead className="text-[11px] font-mono uppercase text-muted tracking-wider border-b border-border2 bg-panel2 w-full table">
                                <tr>
                                    <th className="py-3 px-6 font-normal">TECHNICIAN</th>
                                    <th className="py-3 px-6 font-normal">ZONE</th>
                                    <th className="py-3 px-6 font-normal">ORDERS</th>
                                    <th className="py-3 px-6 font-normal">HOURS</th>
                                    <th className="py-3 px-6 font-normal text-right">PAYOUT</th>
                                </tr>
                            </thead>
                            <tbody className="w-full table">
                                {technicians.filter(t => t.contractor === 'STS').map((tech, i) => (
                                    <tr key={tech.id} className="border-b border-border2/50">
                                        <td className="py-4 px-6 text-white font-bold">{tech.name}</td>
                                        <td className="py-4 px-6 text-muted">{tech.zone}</td>
                                        <td className="py-4 px-6 font-mono text-muted">{tech.orders}</td>
                                        <td className="py-4 px-6 font-mono text-muted">{tech.orders * 3.5}h</td>
                                        <td className="py-4 px-6 text-right font-mono text-green font-bold">
                                            ${tech.orders * 3.5 * 70}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
