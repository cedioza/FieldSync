import React from 'react';
import OrderQueue from '../components/dispatcher/OrderQueue';
import LiveMap from '../components/dispatcher/LiveMap';
import DetailPanel from '../components/dispatcher/DetailPanel';
import { useStore } from '../store/useStore';

export default function DispatcherView() {
    const { selectedOrderId } = useStore();

    return (
        <div className="flex-1 flex w-full h-full overflow-hidden bg-[#060810]">
            {/* Left Panel: Order Queue (300px) */}
            <OrderQueue />

            {/* Center: Live Map */}
            <div className="flex-1 relative z-0">
                <LiveMap />
            </div>

            {/* Right Panel: Detail Panel (380px, slides in if selected) */}
            <div className={`transition-all duration-300 ease-in-out z-10 flex flex-col tour-detail-panel ${selectedOrderId ? 'w-[380px] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-full border-none'}`}>
                <DetailPanel />
            </div>
        </div>
    );
}
