import { prisma } from '../../../lib/db';

export async function GET() {
  try {
    const [totalOrders, totalStaff, totalTables, revenueData, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.staff.count(),
      prisma.table.count(),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { table: true },
      }),
    ]);

    return Response.json({
      success: true,
      data: {
        totalOrders,
        totalStaff,
        totalTables,
        totalRevenue: revenueData._sum.total || 0,
        recentOrders,
      },
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}