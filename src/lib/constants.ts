// FieldSync v6 — Shared Constants
// Source of truth for order types, site types, contractors, and photo checklists

export const ORDER_TYPES = {
    fault: { label: 'FAULT', icon: '⚡', tagCls: 'tag-fault', color: '#ff2d2d', rate: 100 },
    install: { label: 'INSTALL', icon: '📡', tagCls: 'tag-install', color: '#00e5a0', rate: 120 },
    upgrade: { label: 'UPGRADE', icon: '⬆', tagCls: 'tag-upgrade', color: '#c084fc', rate: 140 },
    maintenance: { label: 'MAINT', icon: '🔧', tagCls: 'tag-maintenance', color: '#ffd93d', rate: 85 },
    survey: { label: 'SURVEY', icon: '📋', tagCls: 'tag-survey', color: '#2d7aff', rate: 75 },
} as const;

export const SITE_TYPES = {
    mhc: { label: 'MHC', icon: '🏘', color: '#00e5a0', cls: 'site-mhc', desc: 'Manufactured Housing Community' },
    rvpark: { label: 'RV PARK', icon: '🚐', color: '#ffd93d', cls: 'site-rvpark', desc: 'RV Park & Campground' },
    natpark: { label: 'NAT. PARK', icon: '🏔', color: '#2d7aff', cls: 'site-natpark', desc: 'U.S. National Park' },
    residential: { label: 'RESIDENTIAL', icon: '🏠', color: '#c084fc', cls: 'site-residential', desc: 'Residential Community' },
} as const;

export const CONTRACTORS = {
    STS: { name: 'STS Corp.', region: 'Northern CA / Arizona', color: '#00e5a0', cls: 'cb-sts' },
    SWFS: { name: 'Southwest Field Services', region: 'AZ / FL / MT', color: '#c084fc', cls: 'cb-swfs' },
} as const;

export type OrderType = keyof typeof ORDER_TYPES;
export type SiteType = keyof typeof SITE_TYPES;
export type ContractorId = keyof typeof CONTRACTORS;

// Photo checklists per order type
export const PHOTO_CHECKLISTS: Record<string, { key: string; label: string }[]> = {
    fault: [
        { key: 'arrival', label: '📷 Arrival photo — timestamp + lot number visible' },
        { key: 'before', label: '📷 Before state — equipment as found' },
        { key: 'work', label: '📷 Work in progress' },
        { key: 'after', label: '📷 After state — issue resolved' },
        { key: 'speedtest', label: '📷 Speed test screenshot' },
    ],
    install: [
        { key: 'vault', label: '📷 Vault / baúl (fiber origin point)' },
        { key: 'trench', label: '📷 Trench — full length' },
        { key: 'covered', label: '📷 Trench filled and covered' },
        { key: 'cable', label: '📷 Cable entry + routing inside home' },
        { key: 'router', label: '📷 Router installed' },
        { key: 'serial', label: '📷 Router serial number (clear + legible)' },
        { key: 'speedtest', label: '📷 Speed test — 500 Mbps target' },
        { key: 'contract', label: '📷 Signed customer contract' },
    ],
    upgrade: [
        { key: 'old_equip', label: '📷 Old equipment — model + serial' },
        { key: 'new_equip', label: '📷 New modem installed' },
        { key: 'speed_before', label: '📷 Speed test BEFORE upgrade' },
        { key: 'speed_after', label: '📷 Speed test AFTER upgrade' },
    ],
    maintenance: [
        { key: 'node', label: '📷 Node inspection closeup' },
        { key: 'connectors', label: '📷 Fiber connectors' },
        { key: 'meter', label: '📷 Signal meter reading' },
        { key: 'final', label: '📷 Final state after cleaning' },
    ],
    survey: [
        { key: 'overview', label: '📷 Site overview' },
        { key: 'infra', label: '📷 Existing infrastructure / conduit' },
        { key: 'proposed', label: '📷 Proposed AP locations marked' },
    ],
};

// Status helpers
export function chipClass(status: string): string {
    return { critical: 'chip-critical', assigned: 'chip-assigned', inprogress: 'chip-inprogress', done: 'chip-done' }[status] ?? '';
}

export function chipLabel(status: string): string {
    return { critical: 'UNASSIGNED', assigned: 'ASSIGNED', inprogress: 'IN FIELD', done: 'COMPLETED' }[status] ?? status.toUpperCase();
}
