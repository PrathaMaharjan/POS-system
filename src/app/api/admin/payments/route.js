import { prisma } from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  const where = { status: 'COMPLETED', ...(user?.outletId && { outletId: user.outletId }) };

  const orders = await prisma.order.findMany({
    where,
    include: { staff: true, table: true, items: true },
    orderBy: { createdAt: 'desc' },
  });

  const payments = orders.map(order => ({
    id: `#${String(order.orderNumber).padStart(4, '0')}`,
    orderId: order.id,
    tableName: order.table ? order.table.label : null,
    cashierName: order.staff ? order.staff.name : null,
 method: (!order.paymentMethod || order.paymentMethod === 'Unpaid') ? '—' : order.paymentMethod,
    status: 'COMPLETED',
    amount: order.total,
    createdAt: new Date(order.createdAt).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
  }));

  const pendingOrders = await prisma.order.findMany({
    where: { status: 'PENDING', ...(user?.outletId && { outletId: user.outletId }) },
  });

  return Response.json({
    success: true,
    data: payments,
    summary: {
      totalReceived: payments.reduce((s, p) => s + p.amount, 0),
      pendingVolume: pendingOrders.reduce((s, o) => s + o.total, 0),
      count: payments.length,
    },
  });
}