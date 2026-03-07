import React from 'react';

export function StatusChip({ status }: { status: 'critical' | 'assigned' | 'inprogress' | 'done' }) {
    const styles = {
        critical: 'bg-red/15 border-red/30 text-red',
        assigned: 'bg-blue/15 border-blue/30 text-blue',
        inprogress: 'bg-green/12 border-green/25 text-green',
        done: 'bg-muted/20 border-muted2 text-muted',
    };

    const labels = {
        critical: 'UNASSIGNED',
        assigned: 'ASSIGNED',
        inprogress: 'TECH IN FIELD',
        done: 'COMPLETED',
    };

    return (
        <span className={`px-2 py-0.5 border rounded-full text-[9px] font-mono font-bold tracking-wider uppercase whitespace-nowrap ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
