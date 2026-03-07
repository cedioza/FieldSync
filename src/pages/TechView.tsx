import React, { useState, useRef } from 'react';
import { Battery, Wifi, Settings2, PenLine, Camera } from 'lucide-react';
import { useStore, WorkOrder } from '../store/useStore';
import { OrderTypeTag } from '../components/ui/OrderTypeTag';
import { useToast } from '../components/ui/ToastContext';

const PHOTO_CHECKLISTS: Record<string, { key: string, label: string }[]> = {
    fault: [
        { key: 'arrival', label: '📷 Arrival' },
        { key: 'before', label: '📷 Before state' },
        { key: 'work', label: '📷 Work in progress' },
        { key: 'after', label: '📷 After state' },
        { key: 'speedtest', label: '📷 Speed test screenshot' },
    ],
    install: [
        { key: 'vault', label: '📷 Vault / baúl' },
        { key: 'trench', label: '📷 Trench — full length' },
        { key: 'covered', label: '📷 Trench filled and covered' },
        { key: 'cable', label: '📷 Cable routing' },
        { key: 'router', label: '📷 Router installed' },
        { key: 'serial', label: '📷 Router serial number' },
        { key: 'speedtest', label: '📷 Speed test (500Mbps)' },
        { key: 'contract', label: '📷 Signed customer contract' },
    ],
    upgrade: [
        { key: 'old_equip', label: '📷 Old equipment' },
        { key: 'new_equip', label: '📷 New modem' },
        { key: 'speed_before', label: '📷 Speed test BEFORE' },
        { key: 'speed_after', label: '📷 Speed test AFTER' },
    ],
    maintenance: [
        { key: 'node', label: '📷 Node inspection' },
        { key: 'connectors', label: '📷 Fiber connectors' },
        { key: 'meter', label: '📷 Signal meter reading' },
        { key: 'final', label: '📷 Final state' },
    ],
};

export default function TechView() {
    const { orders, capturePhoto, completeOrder } = useStore();
    const { addToast } = useToast();

    const activeOrder = orders.find(o => o.assignedTech === 'Carlos M.' && o.status === 'inprogress');
    const [activeInstallLot, setActiveInstallLot] = useState<string | null>(null);

    const [reportForm, setReportForm] = useState({
        arrival: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        departure: '',
        numTechs: 1,
        engineer: activeOrder?.apEngineer || '',
        notes: '',
        details: '1. '
    });

    const getRequiredPhotos = () => {
        if (!activeOrder) return [];
        return PHOTO_CHECKLISTS[activeOrder.type] || [];
    };

    const getPhotoKey = (baseKey: string) => {
        return activeOrder?.type === 'install' && activeInstallLot ? `${activeInstallLot}_${baseKey}` : baseKey;
    };

    const getMissingPhotosCount = () => {
        if (!activeOrder) return 0;
        const required = getRequiredPhotos();
        const captured = activeOrder.photos || {};
        return required.filter(p => !captured[getPhotoKey(p.key)]).length;
    };

    const requiredCount = getRequiredPhotos().length;
    const missingCount = getMissingPhotosCount();
    const capturedCount = requiredCount - missingCount;
    const isSubmitEnabled = activeOrder && requiredCount > 0 && missingCount === 0;

    const handleCapture = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!activeOrder) return;

        const file = e.target.files?.[0];
        if (!file) return;

        // In a real app we'd upload the file to S3/Cloud Storage here.
        // For this demo, we'll create a local object URL to display the thumbnail.
        const imageUrl = URL.createObjectURL(file);

        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString();
        const noise = (Math.random() - 0.5) * 0.0006;
        const lat = (activeOrder.lat + noise).toFixed(5);
        const lng = (activeOrder.lng + noise).toFixed(5);
        const timestamp = new Date().toISOString();

        capturePhoto(activeOrder.id, getPhotoKey(key), { ts, lat, lng, lot: activeInstallLot || activeOrder.location, url: imageUrl, timestamp });
        addToast('📷 Photo captured · GPS + timestamp embedded', 'success');
    };

    const handleSubmit = () => {
        if (!activeOrder) return;
        completeOrder(activeOrder.id);
        addToast(`✅ ${activeOrder.id} resolved · Ticket closed`, 'success');
    };

    const handleLotComplete = () => {
        setActiveInstallLot(null);
        addToast(`✓ Lot completed. Moving to next assignment.`, 'success');
        // In a real app we'd also mark the lot as done in Zustand here.
    };

    return (
        <div className="flex-1 flex w-full h-full bg-bg items-center justify-center p-8">

            <div className="w-[375px] h-[812px] bg-panel rounded-[40px] border-[8px] border-border2 relative overflow-hidden flex flex-col shadow-2xl shrink-0">

                {/* Status Bar */}
                <div className="h-12 bg-panel flex items-center justify-between px-6 shrink-0 relative z-10 border-b border-border2/30 tour-tech-status">
                    <span className="text-xs font-bold font-mono text-white">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-border2 rounded-b-xl" />
                    <div className="flex items-center gap-2 text-white">
                        <Wifi size={14} />
                        <Battery size={16} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 flex flex-col relative no-scrollbar">

                    {!activeOrder && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 mt-20 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-panel2 rounded-full flex items-center justify-center mb-6 shadow-inner border border-border2">
                                <Settings2 className="text-muted" size={32} />
                            </div>
                            <h2 className="text-xl font-bold mb-2">You're Online</h2>
                            <p className="text-muted text-sm leading-relaxed mb-8">☕ No active assignments right now. We'll ping you when a ticket comes in.</p>
                            <div className="px-4 py-2 bg-green/10 text-green border border-green/20 rounded font-mono text-xs uppercase tracking-wider font-bold">
                                Carlos M. · Northern CA
                            </div>
                        </div>
                    )}

                    {activeOrder && activeOrder.type !== 'install' && (
                        <div className="flex flex-col gap-6 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-500">

                            <div className="bg-panel2 p-4 rounded-xl border border-border2 shadow-lg tour-tech-ticket">
                                <div className="flex justify-between items-start mb-3">
                                    <OrderTypeTag type={activeOrder.type} />
                                    <span className="text-xs font-mono text-muted">{activeOrder.id}</span>
                                </div>
                                <h2 className="text-[17px] font-bold text-white mb-2 leading-tight">{activeOrder.title}</h2>
                                <div className="flex items-start gap-2 text-muted">
                                    <span className="mt-0.5">📍</span>
                                    <p className="text-sm leading-snug">{activeOrder.address}</p>
                                </div>
                            </div>

                            {activeOrder.mopItems && activeOrder.mopItems.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold font-mono tracking-widest text-muted uppercase mb-3">Method of Procedure</h3>
                                    <div className="flex flex-col gap-2">
                                        {activeOrder.mopItems.map((step, i) => (
                                            <div key={i} className="flex gap-3 bg-panel2 p-3 rounded-lg border border-border2 text-sm text-text leading-snug">
                                                <span className="font-mono text-muted font-bold">{i + 1}.</span>
                                                <span>{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="tour-tech-checklist">
                                <div className="flex justify-between items-end mb-3">
                                    <h3 className="text-xs font-bold font-mono tracking-widest text-muted uppercase">Photo Checklist</h3>
                                    <span className="text-[10px] font-mono text-muted uppercase">GPS Embedded</span>
                                </div>

                                <div className="bg-[#0d1117] border border-[#1a2030] rounded-lg overflow-hidden mb-4 relative">
                                    <div className="h-1 bg-[#ffd93d] absolute top-0 left-0 transition-all duration-500" style={{ width: `${(capturedCount / requiredCount) * 100}%`, backgroundColor: capturedCount === requiredCount ? '#00e5a0' : '#ffd93d' }} />
                                    <div className="p-3 bg-[#0d1117] border-b border-[#1a2030] flex justify-between items-center text-xs font-bold font-mono">
                                        <span className="text-white flex items-center gap-2">📷 {capturedCount} / {requiredCount} photos</span>
                                        {capturedCount < requiredCount ? <span className="text-[#ffd93d]">Blocks submission</span> : <span className="text-[#00e5a0]">All captured ✓</span>}
                                    </div>

                                    <div className="flex flex-col divide-y divide-border2">
                                        {getRequiredPhotos().map((photo) => {
                                            const actualKey = getPhotoKey(photo.key);
                                            const isCaptured = !!(activeOrder.photos?.[actualKey]);
                                            const metaData = activeOrder.photos?.[actualKey] || {} as any;

                                            return (
                                                <div key={photo.key} className={`p-4 transition-colors ${isCaptured ? 'bg-[#00e5a0]/5' : ''}`}>
                                                    <div className="flex justify-between items-center gap-3">
                                                        <div className="flex-1 flex flex-col gap-1">
                                                            <p className={`text-sm font-medium ${isCaptured ? 'text-white' : 'text-gray-300'}`}>
                                                                {photo.label} {isCaptured && <span className="text-[#00e5a0] ml-1">✓</span>}
                                                            </p>
                                                            {isCaptured && (
                                                                <div className="flex gap-2 items-center mt-1">
                                                                    {metaData.url && (
                                                                        <img src={metaData.url} alt="captured" className="w-10 h-10 object-cover rounded border border-[#00e5a0]/30" />
                                                                    )}
                                                                    <p className="text-[9px] font-mono text-[#00e5a0] opacity-80 border border-[#00e5a0]/20 rounded px-1.5 py-0.5 inline-block">
                                                                        {metaData.ts} <br /> {metaData.lat}, {metaData.lng}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {!isCaptured ? (
                                                            <label className="w-10 h-10 shrink-0 bg-[#0d1117] border border-[#ffd93d]/50 rounded cursor-pointer flex items-center justify-center hover:bg-[#ffd93d]/10 transition-all text-[#ffd93d]">
                                                                <Camera size={18} />
                                                                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleCapture(photo.key, e)} />
                                                            </label>
                                                        ) : (
                                                            <div className="w-8 h-8 shrink-0 bg-[#00e5a0] rounded flex items-center justify-center text-black font-bold">✓</div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {activeOrder && activeOrder.type === 'install' && !activeInstallLot && (
                        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex justify-between items-center border-b border-border2 pb-4">
                                <div className="flex items-center gap-2 text-green">
                                    <Wifi size={14} />
                                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase">INSTALL BATCH · {activeOrder.id}</span>
                                </div>
                                <span className="text-xs font-mono text-muted">1/3 DONE</span>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-mono tracking-widest text-muted uppercase mb-4">TODAY'S LOT SCHEDULE</h3>
                                <div className="flex flex-col gap-3">
                                    {activeOrder.lots?.map((lot, i) => (
                                        <div
                                            key={i}
                                            onClick={() => lot.status === 'inprogress' && setActiveInstallLot(lot.num)}
                                            className={`p-4 rounded-xl border flex justify-between items-center transition-all ${lot.status === 'done' ? 'border-border2 bg-panel2/50 opacity-60' :
                                                lot.status === 'inprogress' ? 'border-blue bg-blue/5 cursor-pointer hover:bg-blue/10' :
                                                    'border-border2 bg-panel2'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className={`text-xs font-mono font-bold ${lot.status === 'inprogress' ? 'text-blue' : lot.status === 'done' ? 'text-muted' : 'text-text'}`}>{lot.num}</span>
                                                <span className="text-sm font-medium">{lot.client}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-mono text-muted">{lot.sched}</span>
                                                <div className={`w-2 h-2 rounded-full ${lot.status === 'done' ? 'bg-muted' :
                                                    lot.status === 'inprogress' ? 'bg-blue shadow-[0_0_8px_rgba(45,122,255,0.6)]' :
                                                        'bg-muted2'
                                                    }`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeOrder && activeOrder.type === 'install' && activeInstallLot && (
                        <div className="flex flex-col gap-6 pb-24 animate-in slide-in-from-right duration-300 bg-bg absolute inset-0 z-20 p-5 overflow-y-auto">

                            <button onClick={() => setActiveInstallLot(null)} className="text-xs font-mono text-muted hover:text-white uppercase flex items-center gap-2 mb-2">
                                ← BACK TO SCHEDULE
                            </button>

                            <div className="p-4 rounded-xl border border-blue bg-blue/5">
                                <div className="text-[10px] font-mono text-blue tracking-widest uppercase mb-1">CURRENT · {activeInstallLot}</div>
                                <h2 className="text-2xl font-bold mb-1">{activeOrder.lots?.find(l => l.num === activeInstallLot)?.client}</h2>
                                <p className="text-[11px] font-mono text-muted">{activeOrder.location} · {activeOrder.lots?.find(l => l.num === activeInstallLot)?.sched}</p>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <h3 className="text-[10px] font-bold font-mono tracking-widest text-muted uppercase">PHOTO CHECKLIST — GPS EMBEDDED</h3>
                                </div>

                                <div className="bg-[#0d1117] border border-[#1a2030] rounded-lg overflow-hidden mb-4 relative">
                                    <div className="h-1 bg-[#ffd93d] absolute top-0 left-0 transition-all duration-500" style={{ width: `${(capturedCount / requiredCount) * 100}%`, backgroundColor: capturedCount === requiredCount ? '#00e5a0' : '#ffd93d' }} />
                                    <div className="p-3 bg-[#0d1117] border-b border-[#1a2030] flex justify-between items-center text-[10px] font-bold font-mono uppercase">
                                        <span className="text-white flex items-center gap-2 text-xs">📷 {capturedCount} / {requiredCount} photos</span>
                                        {capturedCount < requiredCount ? <span className="text-[#ffd93d]">Blocks submission</span> : <span className="text-[#00e5a0]">Satisfied ✓</span>}
                                    </div>

                                    <div className="flex flex-col divide-y divide-border2">
                                        {getRequiredPhotos().map((photo) => {
                                            const actualKey = getPhotoKey(photo.key);
                                            const isCaptured = !!(activeOrder.photos?.[actualKey]);
                                            const metaData = activeOrder.photos?.[actualKey] || {} as any;

                                            return (
                                                <div key={photo.key} className={`p-3 transition-colors ${isCaptured ? 'bg-[#00e5a0]/5' : ''}`}>
                                                    <div className="flex justify-between items-center gap-3">
                                                        <div className="flex-1 flex flex-col gap-1">
                                                            <p className={`text-[11px] font-medium ${isCaptured ? 'text-[#00e5a0]' : 'text-gray-300'}`}>
                                                                {photo.label}
                                                            </p>
                                                            {isCaptured && metaData.url && (
                                                                <img src={metaData.url} alt="captured" className="w-16 h-16 mt-2 object-cover rounded-lg border-2 border-[#00e5a0] shadow-[0_0_10px_rgba(0,229,160,0.2)]" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isCaptured && (
                                                                <div className="text-[10px] font-mono text-[#00e5a0] mr-2">
                                                                    {new Date(metaData.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            )}
                                                            {!isCaptured ? (
                                                                <label className="w-10 h-10 shrink-0 bg-[#0d1117] border border-[#ffd93d]/50 rounded cursor-pointer flex items-center justify-center hover:bg-[#ffd93d]/10 transition-all text-[#ffd93d]">
                                                                    <Camera size={18} />
                                                                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleCapture(photo.key, e)} />
                                                                </label>
                                                            ) : (
                                                                <div className="w-10 h-10 shrink-0 bg-[#00e5a0]/10 border border-[#00e5a0]/50 rounded flex items-center justify-center text-[#00e5a0] font-bold text-lg shadow-[0_0_15px_rgba(0,229,160,0.2)]">✓</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <h3 className="text-[10px] font-bold font-mono tracking-widest text-[#a1a1aa] uppercase">CUSTOMER SIGNATURE</h3>
                                <div className="h-32 bg-[#0d1117] rounded-lg border border-[#1a2030] flex flex-col items-center justify-center text-[#4a5568] relative cursor-crosshair">
                                    <PenLine size={24} className="mb-2 opacity-50" />
                                    <span className="text-[10px] uppercase font-mono tracking-widest opacity-50">Sign Here</span>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleLotComplete}
                                    disabled={capturedCount < requiredCount}
                                    className={`w-full py-4 rounded-xl font-mono font-bold text-[13px] tracking-widest uppercase transition-all duration-300
                     ${capturedCount === requiredCount
                                            ? 'bg-[#2d7aff] text-white shadow-[0_0_15px_rgba(45,122,255,0.4)] hover:bg-[#2d7aff]/90'
                                            : 'bg-[#1a2030] text-[#64748b] cursor-not-allowed border border-[#242d40]'}`}
                                >
                                    {capturedCount === requiredCount ? '✓ LOT COMPLETE' : `${requiredCount} PHOTOS NEEDED`}
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {activeOrder && activeOrder.type !== 'install' && (
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-panel via-panel to-transparent pt-12 shrink-0 z-20">
                        <button
                            onClick={handleSubmit}
                            disabled={!isSubmitEnabled}
                            className={`w-full py-4 rounded-xl font-mono font-bold text-[13px] tracking-widest uppercase transition-all duration-300 shadow-[0_-10px_30px_rgba(6,8,16,0.8)]
                ${isSubmitEnabled
                                    ? 'bg-[#00e5a0] text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(0,229,160,0.3)]'
                                    : 'bg-[#1a2030] text-[#64748b] cursor-not-allowed border border-[#242d40]'}`}
                        >
                            {isSubmitEnabled ? '📋 SUBMIT & CLOSE TICKET' : '📷 CAPTURE ALL PHOTOS'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
