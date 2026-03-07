import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../../store/useStore';

export default function LiveMap() {
    const { orders, technicians, selectedOrderId, setSelectedOrder } = useStore();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'critical': return '#ff2d2d';
            case 'assigned': return '#2d7aff';
            case 'inprogress': return '#00e5a0';
            case 'done': return '#4a5568';
            default: return '#fff';
        }
    };

    const getTechIcon = (tech: any) => {
        return L.divIcon({
            className: 'bg-transparent',
            html: `
        <div class="relative flex flex-col items-center justify-center">
          <div class="absolute -top-4 whitespace-nowrap text-[8px] font-mono font-bold text-[#ff6b35]">${tech.name.split(' ')[0]}</div>
          <div class="w-3.5 h-3.5 bg-[#ff6b35] rounded-[3px] shadow-[0_0_10px_rgba(255,107,53,0.6)] border border-[#fff]/20 ${tech.status === 'available' ? 'animate-pulse' : ''}"></div>
        </div>
      `,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
    };

    return (
        <div className="absolute inset-0 z-0 tour-live-map">
            <MapContainer
                center={[38.5, -98.0]}
                zoom={4}
                style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {orders.map(order => {
                    const isSelected = order.id === selectedOrderId;
                    const color = getStatusColor(order.status);
                    const isOpacity = order.status === 'done' ? 0.45 : 1;
                    const radius = order.status === 'done' ? 6 : isSelected ? 12 : 8;

                    return (
                        <CircleMarker
                            key={order.id}
                            center={[order.lat, order.lng]}
                            radius={radius}
                            pathOptions={{
                                color: color,
                                fillColor: color,
                                fillOpacity: isOpacity - 0.2,
                                weight: isSelected ? 3 : 2
                            }}
                            eventHandlers={{
                                click: () => setSelectedOrder(order.id)
                            }}
                        >
                            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
                                <div className="bg-[#060810] border border-[#1a2030] text-[#f8fafc] p-3 rounded-lg shadow-2xl font-sans min-w-[200px]">
                                    <div className="text-[10px] font-mono text-[#64748b] font-bold tracking-widest uppercase mb-1.5">{order.id} · {order.type}</div>
                                    <div className="text-sm font-bold w-48 truncate mb-0.5">{order.title}</div>
                                    <div className="text-[11px] font-mono text-[#94a3b8] truncate">{order.location}</div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    );
                })}

                {technicians.filter(t => t.status !== 'off').map(tech => (
                    <Marker
                        key={tech.id}
                        position={[tech.lat, tech.lng]}
                        icon={getTechIcon(tech)}
                    >
                        <Tooltip direction="bottom" offset={[0, 10]} opacity={1} className="custom-tooltip">
                            <div className="bg-[#060810] border border-[#1a2030] text-white p-2 rounded-lg font-sans text-xs shadow-xl">
                                <span className="font-bold">{tech.name}</span> <span className="text-[#64748b] mx-1">·</span> <span className="font-mono text-[#ff6b35] uppercase">{tech.status}</span>
                            </div>
                        </Tooltip>
                    </Marker>
                ))}

            </MapContainer>

            {/* Map Legend */}
            <div className="absolute bottom-6 left-6 z-[400] bg-[#060810]/90 backdrop-blur-md border border-[#1a2030] p-4 rounded-xl shadow-2xl flex flex-col gap-3 min-w-[220px]">
                <h4 className="text-[10px] font-mono text-[#64748b] font-bold uppercase tracking-widest border-b border-[#1a2030] pb-2 mb-1 flex items-center justify-between">
                    <span>STATUS LEGEND</span>
                    <span className="text-xs">📍</span>
                </h4>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#ff2d2d] border border-[#ff2d2d]/50 shadow-[0_0_10px_rgba(255,45,45,0.4)]" />
                    <span className="text-xs font-bold text-white">New Fault — Unassigned</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#2d7aff] shadow-[0_0_10px_rgba(45,122,255,0.4)]" />
                    <span className="text-xs text-[#e2e8f0]">Assigned to Contractor</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#00e5a0] shadow-[0_0_10px_rgba(0,229,160,0.4)]" />
                    <span className="text-xs text-[#e2e8f0]">Tech In Field</span>
                </div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#334155] border border-[#4a5568]" />
                    <span className="text-xs text-[#94a3b8]">Completed</span>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-[#1a2030]">
                    <div className="w-3 h-3 bg-[#ff6b35] rounded-[3px] shadow-[0_0_10px_rgba(255,107,53,0.4)]" />
                    <span className="text-xs text-white">Technician Location</span>
                </div>
            </div>
        </div>
    );
}
