import { create } from 'zustand';

export interface WorkOrder {
    id: string;
    type: 'fault' | 'install' | 'upgrade' | 'maintenance' | 'survey';
    siteType: 'mhc' | 'rvpark' | 'natpark' | 'residential';
    region: 'AZ' | 'FL' | 'MT' | 'WY' | string;
    title: string;
    location: string;
    partner: string;
    address: string;
    lat: number;
    lng: number;
    status: 'critical' | 'assigned' | 'inprogress' | 'done';
    contractor: 'STS' | 'SWFS' | null;
    assignedTech: string | null;

    // Technical Details
    equipment: string[];
    task: string;
    mopItems: string[];

    // Analytics / Billing
    hours: number;
    travelHours: number;

    // Support contact
    apEngineer: string;
    apPhone: string;

    // Timestamps
    created: string;
    completedAt?: string | null;

    // Optional arrays for media
    photos?: Record<string, any>;
    workReport?: any;

    // Install-specific: lot schedule
    lots?: { num: string; client: string; sched: string; status: string }[];
}

export interface Technician {
    id: string;
    name: string;
    specialty: string;
    zone: string;
    contractor: 'STS' | 'SWFS';
    status: 'available' | 'busy' | 'off';
    orders: number;
    lat: number;
    lng: number;
}

interface AppState {
    orders: WorkOrder[];
    technicians: Technician[];
    selectedOrderId: string | null;
    activeFilter: string;
    activeRegion: string;
    viewRole: 'dispatcher' | 'contractor' | 'tech';
    faultCounter: number;
    runTour: boolean;

    // Actions
    assignOrder: (id: string, contractor: 'STS' | 'SWFS') => void;
    deleteOrder: (id: string) => void;
    updateStatus: (id: string, status: WorkOrder['status']) => void;
    dispatchTech: (id: string) => void;
    completeOrder: (id: string) => void;
    rejectOrder: (id: string) => void;
    capturePhoto: (orderId: string, photoKey: string, meta: Record<string, any>) => void;
    setSelectedOrder: (id: string | null) => void;
    setFilter: (f: string) => void;
    setRegion: (r: string) => void;
    setViewRole: (role: 'dispatcher' | 'contractor' | 'tech') => void;
    addOrder: (order: WorkOrder) => void;
    setRunTour: (run: boolean) => void;

    // API actions
    fetchData: () => Promise<void>;
}

const API_URL = '/api';

function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const useStore = create<AppState>((set, get) => ({
    orders: [],
    technicians: [],
    selectedOrderId: null,
    activeFilter: 'ALL',
    activeRegion: 'all',
    viewRole: 'dispatcher',
    faultCounter: 0,
    runTour: false,

    assignOrder: async (id, contractor) => {
        try {
            await fetch(`${API_URL}/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'assigned', contractor })
            });
            // Update local state instantly for snappiness
            set((state) => ({
                orders: state.orders.map(o => o.id === id ? { ...o, contractor, status: 'assigned' } : o)
            }));
        } catch (error) {
            console.error('Failed to assign order:', error);
        }
    },

    deleteOrder: async (id) => {
        try {
            await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
            set((state) => ({
                orders: state.orders.filter(o => o.id !== id),
                selectedOrderId: state.selectedOrderId === id ? null : state.selectedOrderId
            }));
        } catch (error) {
            console.error('Failed to delete order:', error);
        }
    },

    updateStatus: async (id, status) => {
        try {
            await fetch(`${API_URL}/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            set((state) => ({
                orders: state.orders.map(o => {
                    if (o.id === id) {
                        return {
                            ...o,
                            status,
                            completedAt: status === 'done' ? now() : o.completedAt
                        };
                    }
                    return o;
                })
            }));
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    },

    dispatchTech: async (id) => {
        try {
            await fetch(`${API_URL}/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'inprogress' })
            });
            set((state) => ({
                orders: state.orders.map(o => {
                    if (o.id === id) {
                        const techName = o.contractor === 'SWFS' ? 'Ramon V.' : 'Carlos M.';
                        return { ...o, status: 'inprogress' as const, assignedTech: techName };
                    }
                    return o;
                })
            }));
        } catch (error) {
            console.error('Failed to dispatch tech:', error);
        }
    },

    completeOrder: async (id) => {
        try {
            await fetch(`${API_URL}/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'done' })
            });
            set((state) => ({
                orders: state.orders.map(o =>
                    o.id === id ? { ...o, status: 'done' as const, completedAt: now() } : o
                )
            }));
        } catch (error) {
            console.error('Failed to complete order:', error);
        }
    },

    rejectOrder: async (id) => {
        try {
            set((state) => ({
                orders: state.orders.map(o => {
                    if (o.id === id) {
                        const alt = o.contractor === 'STS' ? 'SWFS' : 'STS';
                        return { ...o, contractor: alt as 'STS' | 'SWFS', status: 'assigned' as const };
                    }
                    return o;
                })
            }));
        } catch (error) {
            console.error('Failed to reject order:', error);
        }
    },

    capturePhoto: (orderId, photoKey, meta) => {
        set((state) => ({
            orders: state.orders.map(o => {
                if (o.id === orderId) {
                    return { ...o, photos: { ...(o.photos || {}), [photoKey]: meta } };
                }
                return o;
            })
        }));
    },

    setSelectedOrder: (id) => set({ selectedOrderId: id }),
    setFilter: (f) => set({ activeFilter: f }),
    setRegion: (r) => set({ activeRegion: r }),
    setViewRole: (role) => set({ viewRole: role }),

    addOrder: async (order) => {
        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            if (res.ok) {
                const newOrder = await res.json();
                set((state) => ({
                    orders: [newOrder, ...state.orders],
                    faultCounter: state.faultCounter + 1,
                }));
            }
        } catch (error) {
            console.error('Error adding order:', error);
        }
    },

    setRunTour: (run) => set({ runTour: run }),

    fetchData: async () => {
        try {
            const [ordersRes, techsRes] = await Promise.all([
                fetch(`${API_URL}/orders`),
                fetch(`${API_URL}/technicians`)
            ]);
            if (ordersRes.ok && techsRes.ok) {
                const orders = await ordersRes.json();
                const technicians = await techsRes.json();
                set({ orders, technicians });
            }
        } catch (error) {
            console.error('API Error:', error);
        }
    }
}));
