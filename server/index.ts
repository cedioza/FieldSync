import express from 'express';
import cors from 'cors';
import path from 'path';

process.env.DATABASE_URL = "file:./prisma/dev.db";
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes

// GET /api/orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await prisma.workOrder.findMany({
            include: {
                photos: true,
                workReport: true,
            },
            orderBy: { created: 'desc' }
        });

        // Parse JSON strings back to arrays for frontend
        const formattedOrders = orders.map(o => ({
            ...o,
            equipment: JSON.parse(o.equipment),
            mopItems: JSON.parse(o.mopItems),
            photos: o.photos.reduce((acc, photo) => {
                acc[photo.key] = photo;
                return acc;
            }, {} as Record<string, any>),
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// POST /api/orders
app.post('/api/orders', async (req, res) => {
    try {
        const data = req.body;

        const newOrder = await prisma.workOrder.create({
            data: {
                id: data.id,
                type: data.type,
                siteType: data.siteType,
                region: data.region,
                title: data.title,
                location: data.location,
                partner: data.partner,
                address: data.address,
                lat: data.lat,
                lng: data.lng,
                status: data.status,
                contractor: data.contractor,
                assignedTech: data.assignedTech,
                equipment: JSON.stringify(data.equipment || []),
                task: data.task,
                mopItems: JSON.stringify(data.mopItems || []),
                hours: data.hours || 0,
                travelHours: data.travelHours || 0,
                apEngineer: data.apEngineer || 'System API',
                apPhone: data.apPhone || '(555) 000-0000',
            }
        });

        res.status(201).json({ ...newOrder, equipment: [], mopItems: [], photos: {} });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// PUT /api/orders/:id/status
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, contractor } = req.body;

        const updated = await prisma.workOrder.update({
            where: { id },
            data: {
                status,
                ...(contractor ? { contractor } : {})
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// GET /api/technicians
app.get('/api/technicians', async (req, res) => {
    try {
        const techs = await prisma.technician.findMany();
        res.json(techs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch technicians' });
    }
});

// Serve frontend build (For Docker Production Environment)
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server boot
app.listen(PORT, () => {
    console.log(`[FieldSync] Backend listening on port ${PORT} ⚡`);
});
