import prisma from '../../config/prisma.js';

interface AdminDashboardData {
    totalShipments: number;
    activeShipments: number;
    totalClients: number;
    totalRevenue: number;
}

interface UserDashboardData {
    totalShipments: number;
    activeShipments: number;
    completedShipments: number;
    totalSpent: number;
}

// Get admin dashboard data for logistics
export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
    // Get total shipments
    const totalShipments = await prisma.shipment.count();

    // Get active shipments (not delivered)
    const activeShipments = await prisma.shipment.count({
        where: { status: { not: 'DELIVERED' } },
    });

    // Get total clients (users with CLIENT role)
    const totalClients = await prisma.user.count({
        where: { role: 'CLIENT' },
    });

    // Get total revenue (sum of all invoice amounts)
    const revenueResult = await prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' },
    });
    const totalRevenue = Number(revenueResult._sum.amount) || 0;

    const data: AdminDashboardData = {
        totalShipments,
        activeShipments,
        totalClients,
        totalRevenue
    };

    return data;
}

// Get recent shipments for admin dashboard
export const getRecentOrdersService = async (limit: number = 5): Promise<any[]> => {
    const shipments = await prisma.shipment.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: true },
    });

    // Format the time ago
    const now = new Date();
    const formattedShipments = shipments.map(shipment => {
        const minutesAgo = Math.floor((now.getTime() - shipment.createdAt.getTime()) / (1000 * 60));
        return {
            id: shipment.id,
            shipmentCode: shipment.shipmentCode,
            client: shipment.client.fullName,
            status: shipment.status,
            time: minutesAgo < 60
                ? `${minutesAgo} min ago`
                : minutesAgo < 1440
                ? `${Math.floor(minutesAgo / 60)} hours ago`
                : `${Math.floor(minutesAgo / 1440)} days ago`
        };
    });

    return formattedShipments;
}

// Get user dashboard data - shipments, active shipments, completed shipments, total spent
export const getUserDashboardData = async (userId: string): Promise<UserDashboardData> => {
    // Get user's total shipments
    const totalShipments = await prisma.shipment.count({
        where: { clientId: userId },
    });

    // Get user's active shipments (not delivered)
    const activeShipments = await prisma.shipment.count({
        where: { clientId: userId, status: { not: 'DELIVERED' } },
    });

    // Get user's completed shipments
    const completedShipments = await prisma.shipment.count({
        where: { clientId: userId, status: 'DELIVERED' },
    });

    // Get user's total spent (sum of paid invoices)
    const spentResult = await prisma.invoice.aggregate({
        _sum: { amount: true },
        where: {
            shipment: { clientId: userId },
            status: 'PAID',
        },
    });
    const totalSpent = Number(spentResult._sum.amount) || 0;

    const data: UserDashboardData = {
        totalShipments,
        activeShipments,
        completedShipments,
        totalSpent
    };

    return data;
}