import React from 'react';

export function EquipmentChip({ items }: { items: string[] }) {
    if (!items || items.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5 mt-2">
            {items.map(item => (
                <span key={item} className="px-2 py-0.5 bg-blue/15 border border-blue/30 text-blue font-mono text-[10px] rounded-full whitespace-nowrap">
                    {item}
                </span>
            ))}
        </div>
    );
}
