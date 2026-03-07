import React, { useState } from 'react';
import { useStore, WorkOrder } from '../../store/useStore';
import { useToast } from '../ui/ToastContext';
import { CONTRACTORS } from '../../lib/constants';
import type { ContractorId } from '../../lib/constants';

export default function ActionBlock({ order }: { order: WorkOrder }) {
    const { assignOrder, dispatchTech, completeOrder, rejectOrder } = useStore();
    const { addToast } = useToast();

    // Default contractor: SWFS for FL/natpark, STS for AZ
    const defaultCtr: ContractorId =
        (order.region === 'FL' || order.region === 'MT' || order.region === 'WY' || order.siteType === 'natpark')
            ? 'SWFS'
            : 'STS';
    const [selectedContractor, setSelectedContractor] = useState<ContractorId>(defaultCtr);

    const handleAssign = () => {
        assignOrder(order.id, selectedContractor);
        addToast(`✓ ${order.id} sent to ${selectedContractor} · 2h response window`, 'success');
    };

    const handleDispatch = () => {
        dispatchTech(order.id);
        const techName = order.contractor === 'SWFS' ? 'Ramon V.' : 'Carlos M.';
        addToast(`📍 ${order.contractor} dispatched ${techName} → en route to ${order.location}`, 'success');
    };

    const handleComplete = () => {
        completeOrder(order.id);
        addToast(`✅ Order resolved · Work report sent to AccessParks`, 'success');
    };

    const handleReject = () => {
        const prev = order.contractor;
        rejectOrder(order.id);
        const alt = prev === 'STS' ? 'SWFS' : 'STS';
        addToast(`⚠ ${prev} rejected · Auto-escalated to ${CONTRACTORS[alt].name}`, 'error');
    };

    const handleDownloadReport = () => {
        addToast(`📄 Report opened · Print or Save as PDF`, 'info');
        const travelH = order.travelHours ?? 0.5;
        const totalH = (order.hours ?? 0) + travelH;
        const wr = order.workReport || {};
        const isWeekend = [0, 6].includes(new Date().getDay());

        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Work Report ${order.id}</title>
        <style>
          body{font-family:Arial,sans-serif;max-width:720px;margin:40px auto;color:#1a1a1a;font-size:13px}
          h1{font-size:22px;font-weight:900;color:#006644;letter-spacing:2px}
          h2{font-size:11px;letter-spacing:2px;color:#555;margin:22px 0 10px;border-bottom:2px solid #006644;padding-bottom:4px;text-transform:uppercase}
          .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
          .f{background:#f6f6f6;border-radius:4px;padding:9px 12px}
          .l{font-size:9px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}
          .v{font-size:13px;font-weight:700}
          .notice{background:#fffbea;border:1px solid #f59e0b;border-radius:4px;padding:10px;font-size:12px;margin:12px 0}
          table{width:100%;border-collapse:collapse}th{background:#006644;color:#fff;padding:7px 10px;text-align:left;font-size:11px}
          td{padding:6px 10px;border:1px solid #ddd}
          @media print{.no-print{display:none}}
        </style></head><body>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px">
          <div><h1>FIELDSYNC</h1><div style="font-size:11px;color:#888">AccessParks Daily Vendor Work Report</div></div>
          <div style="text-align:right">
            <div style="font-size:9px;color:#888">TICKET NUMBER</div>
            <div style="font-size:20px;font-weight:900;color:#006644">${order.id}</div>
            <div style="font-size:9px;color:#cc0000">Must appear on ${order.contractor} invoice</div>
          </div>
        </div>
        <div class="notice">⚠ Dollar amounts NOT included — apply AccessParks rate table to calculate invoice amount</div>
        <h2>Site Information</h2>
        <div class="grid">
          <div class="f"><div class="l">Location</div><div class="v">${order.location}</div></div>
          <div class="f"><div class="l">Partner</div><div class="v">${order.partner || '—'}</div></div>
          <div class="f"><div class="l">Address</div><div class="v">${order.address}</div></div>
          <div class="f"><div class="l">Order Type</div><div class="v">${order.type.toUpperCase()}</div></div>
        </div>
        <h2>Time Summary</h2>
        <div class="grid">
          <div class="f"><div class="l">Arrival</div><div class="v">${(wr as any).arrival || '—'}</div></div>
          <div class="f"><div class="l">Departure</div><div class="v">${(wr as any).departure || '—'}</div></div>
          <div class="f"><div class="l">On-site Hours</div><div class="v">${order.hours}h</div></div>
          <div class="f"><div class="l">Travel Hours</div><div class="v">${travelH}h</div></div>
          <div class="f"><div class="l">Total Billable</div><div class="v">${totalH}h</div></div>
          <div class="f"><div class="l">Weekend</div><div class="v">${isWeekend ? 'YES ⚠' : 'No'}</div></div>
          <div class="f"><div class="l">Technician(s)</div><div class="v">${order.assignedTech || '—'} (${(wr as any).numTechs || 1})</div></div>
          <div class="f"><div class="l">AP Engineer</div><div class="v">${order.apEngineer}</div></div>
        </div>
        <h2>Work Notes</h2>
        <p>${(wr as any).notes || 'No notes provided.'}</p>
        <pre style="background:#f4f4f4;padding:10px;font-size:12px">${(wr as any).details || ''}</pre>
        <h2>Signatures</h2>
        <div class="grid">
          <div class="f"><div class="l">Technician</div><div style="height:40px"></div><div class="v">${order.assignedTech || '—'}</div></div>
          <div class="f"><div class="l">AP Engineer</div><div style="height:40px"></div><div class="v">${order.apEngineer}</div></div>
        </div>
        <p style="font-size:10px;color:#888;margin-top:20px">Generated by FieldSync · ${new Date().toLocaleString()}</p>
        <script>window.print();</script>
        </body></html>`;

        const win = window.open('', '_blank');
        if (win) win.document.write(html);
    };

    // ── CRITICAL: pick contractor ──
    if (order.status === 'critical') {
        return (
            <div className="flex flex-col gap-4 rounded-lg border border-[#ff2d2d]/30 bg-[#ff2d2d]/10 p-5 shadow-sm">
                <div className="font-mono text-[11px] font-bold text-[#ff2d2d] tracking-widest mb-1 flex items-center gap-2">
                    <span className="animate-pulse">⚡</span> NOTIFY CONTRACTOR
                </div>
                <p className="text-xs text-[#94a3b8] mb-2">Assign this required critical fault to a contractor.</p>

                <div className="flex flex-col gap-2">
                    {(['STS', 'SWFS'] as ContractorId[]).map(cid => {
                        const ctr = CONTRACTORS[cid];
                        const isSel = selectedContractor === cid;
                        return (
                            <div
                                key={cid}
                                onClick={() => setSelectedContractor(cid)}
                                className={`flex items-center gap-4 px-4 py-3 bg-[#060810] border rounded-lg cursor-pointer transition-all ${isSel ? 'border-[#00e5a0] bg-[#00e5a0]/10 shadow-[0_0_15px_rgba(0,229,160,0.15)]' : 'border-[#1a2030] hover:border-[#334155]'}`}
                            >
                                <div
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={isSel
                                        ? { background: ctr.color, boxShadow: `0 0 8px ${ctr.color}` }
                                        : { background: '#334155' }
                                    }
                                />
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-[#f8fafc]">{ctr.name}</div>
                                    <div className="font-mono text-[10px] text-[#94a3b8] uppercase mt-0.5">{ctr.region}</div>
                                </div>
                                <div className="font-mono text-xs font-bold text-[#64748b]">{cid}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-2 mt-2">
                    <button
                        onClick={handleAssign}
                        className="w-full py-3 bg-[#00e5a0] hover:bg-[#00e5a0]/90 text-black font-mono font-bold text-xs rounded-lg tracking-widest cursor-pointer transition-all shadow-[0_0_15px_rgba(0,229,160,0.3)] hover:shadow-[0_0_20px_rgba(0,229,160,0.5)]"
                    >
                        SEND TO CONTRACTOR →
                    </button>
                    <button
                        onClick={() => useStore.getState().setSelectedOrder(null)}
                        className="w-full py-2.5 bg-transparent text-[#64748b] border border-[#1a2030] rounded-lg font-mono text-xs cursor-pointer transition-all hover:bg-white/5 hover:text-white"
                    >
                        Close Panel
                    </button>
                </div>
            </div>
        );
    }

    // ── ASSIGNED: waiting for tech dispatch ──
    if (order.status === 'assigned') {
        const ctr = order.contractor ? CONTRACTORS[order.contractor] : null;
        return (
            <div className="flex flex-col gap-3">
                <div className="rounded-lg border border-[#2d7aff]/30 bg-[#2d7aff]/10 p-5 shadow-sm">
                    <div className="font-mono text-xs font-bold text-[#2d7aff] mb-2 tracking-widest">
                        ✓ SENT TO {order.contractor}
                    </div>
                    {ctr && (
                        <div className="text-sm font-bold text-white mb-3">{ctr.name} <span className="font-normal text-[#94a3b8] ml-1">· {ctr.region}</span></div>
                    )}
                    <div className="text-xs text-[#94a3b8] flex justify-between items-center bg-[#060810] p-3 rounded border border-[#1a2030]">
                        <span>Response window:</span>
                        <span className="font-mono font-bold text-[#ffd93d]">1:48:00</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleDispatch}
                        className="w-full py-3 bg-[#2d7aff] hover:bg-[#2d7aff]/90 text-white font-mono font-bold text-xs rounded-lg tracking-widest cursor-pointer transition-all shadow-[0_0_15px_rgba(45,122,255,0.3)]"
                    >
                        ▶ SIM: DISPATCH CONTRACTOR TECH
                    </button>
                    <button
                        onClick={handleReject}
                        className="w-full py-3 bg-transparent text-[#ff2d2d] border border-[#ff2d2d]/30 rounded-lg font-mono text-xs cursor-pointer transition-all hover:bg-[#ff2d2d]/10"
                    >
                        SIM: {order.contractor} Rejects → Escalate
                    </button>
                </div>
            </div>
        );
    }

    // ── IN PROGRESS: tech on site ──
    if (order.status === 'inprogress') {
        return (
            <div className="flex flex-col gap-3">
                <div className="rounded-lg border border-[#00e5a0]/30 bg-[#00e5a0]/10 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00e5a0] animate-pulse" style={{ boxShadow: '0 0 10px #00e5a0' }} />
                        <span className="font-mono text-xs font-bold text-[#00e5a0] tracking-widest">TECH ON SITE</span>
                    </div>
                    <div className="bg-[#060810] p-4 rounded border border-[#1a2030] flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                            <div className="text-sm font-bold text-white">{order.assignedTech}</div>
                            <div className="text-xs text-[#64748b] font-mono">{order.address.split(',')[0]}</div>
                        </div>
                        <div className="text-[10px] bg-[#1a2030] px-2 py-1 rounded text-[#94a3b8] font-mono uppercase">Working</div>
                    </div>
                </div>
                <button
                    onClick={handleComplete}
                    className="w-full py-3 bg-[#00e5a0] hover:bg-[#00e5a0]/90 text-black font-mono font-bold text-xs rounded-lg tracking-widest cursor-pointer transition-all shadow-[0_0_15px_rgba(0,229,160,0.3)] hover:shadow-[0_0_20px_rgba(0,229,160,0.5)]"
                >
                    ▶ SIM: Tech Marks Fault Resolved ✓
                </button>
            </div>
        );
    }

    // ── DONE ──
    if (order.status === 'done') {
        const travelH = order.travelHours ?? 0.5;
        const totalH = (order.hours ?? 0) + travelH;
        const wr = order.workReport;
        const isWeekend = [0, 6].includes(new Date().getDay());

        return (
            <div className="flex flex-col gap-4">
                <div className="bg-[#060810] border border-[#1a2030] rounded-lg p-5">
                    <div className="font-mono text-[10px] text-[#64748b] tracking-widest mb-4 flex justify-between items-center">
                        <span>TIME SUMMARY</span>
                        <span className="text-white bg-[#1a2030] px-2 py-0.5 rounded">{order.id}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        {[
                            ['On-site window', wr ? `${wr.arrival || '—'} → ${wr.departure || '—'}` : '—'],
                            ['On-site hours', `${order.hours}h`],
                            ['Travel time', `${travelH}h`],
                            ['Total billable', `${totalH}h`],
                            ['Technicians', String(wr?.numTechs ?? 1)],
                            ['Weekend', isWeekend ? 'YES ⚠' : 'No'],
                        ].map(([k, v]) => (
                            <div key={k} className="flex justify-between py-2 border-b border-[#1a2030]/50 last:border-b-0">
                                <span className="text-xs text-[#94a3b8]">{k}</span>
                                <span className={`font-mono font-bold text-xs ${k === 'Total billable' ? 'text-[#00e5a0] text-sm bg-[#00e5a0]/10 px-2 py-0.5 rounded' : k === 'Weekend' && isWeekend ? 'text-[#ffd93d]' : 'text-white'}`}>{v}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-[10px] text-[#64748b] bg-white/5 p-2 rounded italic font-mono uppercase tracking-wide">⚠ $ amounts excluded — apply AP rate table</div>
                </div>
                <button
                    onClick={handleDownloadReport}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#2d7aff] text-white hover:bg-[#1a65e5] rounded-lg font-mono text-xs font-bold tracking-widest cursor-pointer transition-all shadow-[0_0_15px_rgba(45,122,255,0.3)] hover:shadow-[0_0_20px_rgba(45,122,255,0.5)]"
                >
                    ⬇ DOWNLOAD WORK REPORT (PDF)
                </button>
            </div>
        );
    }

    return null;
}
