import React from 'react';
import { Zap, Wifi, ArrowUpCircle, Wrench, Map } from 'lucide-react';

type OrderType = 'fault' | 'install' | 'upgrade' | 'maintenance' | 'survey';

export function OrderTypeTag({ type }: { type: OrderType }) {
    const config = {
        fault: { icon: Zap, color: 'text-red' },
        install: { icon: Wifi, color: 'text-green' },
        upgrade: { icon: ArrowUpCircle, color: 'text-purple' },
        maintenance: { icon: Wrench, color: 'text-muted' },
        survey: { icon: Map, color: 'text-blue' },
    };

    const { icon: Icon, color } = config[type];

    return (
        <div className={`flex items-center gap-1.5 ${color}`}>
            <Icon size={12} strokeWidth={3} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{type}</span>
        </div>
    );
}
