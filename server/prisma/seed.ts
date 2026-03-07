import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.workOrder.deleteMany();
    await prisma.technician.deleteMany();

    const orderData = [
        {
            id: 'AS-64462',
            type: 'fault',
            siteType: 'mhc',
            region: 'AZ',
            title: 'Lot 205 — DLPC linking at 100 Mbps',
            location: 'Del Pueblo',
            partner: 'Cobblestone Communities',
            address: '14525 E US Hwy 80, Yuma, AZ 85365',
            lat: 32.6685,
            lng: -114.4026,
            status: 'critical',
            contractor: null,
            assignedTech: null,
            equipment: JSON.stringify(['1x AP-63', 'SFP Transceiver']),
            task: 'Node offline. Switch port negotiating at 100FDX. Check fiber splice and AP termination.',
            mopItems: JSON.stringify(['Verify switch port speed', 'OTDR test on fiber run', 'Replace AP if SFP fails']),
            hours: 0,
            travelHours: 0,
            apEngineer: 'NOC Tier 2',
            apPhone: '(888) 505-1223'
        },
        {
            id: 'AS-64458',
            type: 'install',
            siteType: 'mhc',
            region: 'AZ',
            title: 'New fiber-to-lot install — Lots 12, 13, 14',
            location: 'Citrus Gardens',
            partner: 'Cobblestone Communities',
            address: '4000 E Main St, Mesa, AZ 85205',
            lat: 33.4152,
            lng: -111.7483,
            status: 'inprogress',
            contractor: 'STS',
            assignedTech: 'TECH-101',
            equipment: JSON.stringify(['3x ONT Calix', 'Pre-termed Fiber Drops']),
            task: 'Splice fiber drops from core to lots 12, 13, 14. Mount ONTs and verify optical levels.',
            mopItems: JSON.stringify(['Splice vault drops', 'Run through conduit', 'Mount ONTs on siding', 'Verify light levels > -20dBm']),
            hours: 0,
            travelHours: 0,
            apEngineer: 'Deployments',
            apPhone: '(888) 505-1223'
        }
    ];

    const techData = [
        {
            id: 'TECH-101',
            name: 'Carlos M.',
            specialty: 'Fiber Splicing',
            zone: 'Arizona',
            contractor: 'STS',
            status: 'busy',
            orders: 1,
            lat: 33.4152,
            lng: -111.7483
        },
        {
            id: 'TECH-102',
            name: 'Sarah J.',
            specialty: 'Wireless',
            zone: 'Florida',
            contractor: 'SWFS',
            status: 'available',
            orders: 0,
            lat: 28.5383,
            lng: -81.3792
        }
    ];

    for (const order of orderData) {
        await prisma.workOrder.create({ data: order });
    }

    for (const tech of techData) {
        await prisma.technician.create({ data: tech });
    }

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
