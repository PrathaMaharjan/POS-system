import { prisma } from '../../../lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const timeFilter = searchParams.get('timeFilter') || '24H';

  // Calculate start date based on filter
  const now = new Date();
  let startDate;
  if (timeFilter === '24H') {
    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (timeFilter === '7D') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Fetch completed orders in time range
  const orders = await prisma.order.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: { gte: startDate },
    },
    include: {
      items: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Total sales
  const totalSales = orders.reduce((s, o) => s + o.total, 0);

  // Average order value
  const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

  // Customer count = number of orders (each order = 1 customer visit)
  const customerCount = orders.length;

  // ── Sales trend data ──────────────────────────────────────────────────────
  // For 24H: split into 7 slots of ~3.4 hours each (08:00 to 22:00)
  // For 7D: one slot per day
  // For 30D: one slot per week (4 slots)

  let trendData = [];

  if (timeFilter === '24H') {
    // 7 time slots from 08:00 to 22:00
    const slots = 7;
    const slotHours = [8, 10, 12, 14, 16, 18, 20];
    const slotTotals = new Array(slots).fill(0);

    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      const slotIndex = slotHours.findIndex((h, i) =>
        hour >= h && (i === slotHours.length - 1 || hour < slotHours[i + 1])
      );
      if (slotIndex !== -1) slotTotals[slotIndex] += order.total;
    });

    const max = Math.max(...slotTotals, 1);
    trendData = slotTotals.map(v => Math.round((v / max) * 100));

  } else if (timeFilter === '7D') {
    const dayTotals = new Array(7).fill(0);
    orders.forEach(order => {
      const daysAgo = Math.floor((now - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));
      const idx = Math.min(daysAgo, 6);
      dayTotals[6 - idx] += order.total;
    });
    const max = Math.max(...dayTotals, 1);
    trendData = dayTotals.map(v => Math.round((v / max) * 100));

  } else {
    // 30D — 4 weekly slots
    const weekTotals = new Array(4).fill(0);
    orders.forEach(order => {
      const daysAgo = Math.floor((now - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));
      const weekIdx = Math.min(Math.floor(daysAgo / 7), 3);
      weekTotals[3 - weekIdx] += order.total;
    });
    const max = Math.max(...weekTotals, 1);
    trendData = weekTotals.map(v => Math.round((v / max) * 100));
  }

  // ── Top selling items ─────────────────────────────────────────────────────
  const itemMap = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!itemMap[item.name]) {
        itemMap[item.name] = { name: item.name, units: 0, revenue: 0, productId: item.productId };
      }
      itemMap[item.name].units += item.quantity;
      itemMap[item.name].revenue += item.subtotal;
    });
  });

  const topSellingRaw = Object.values(itemMap)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  // Fetch images for top selling items
  const productIds = topSellingRaw.map(i => i.productId).filter(Boolean);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));

  const topSelling = topSellingRaw.map(item => ({
    name: item.name,
    units: `${item.units} sold`,
    price: `Rs.${item.revenue.toFixed(2)}`,
    img: productMap[item.productId]?.imageUrl ||
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=100',
  }));

  // ── Alerts ────────────────────────────────────────────────────────────────
  const alerts = [];

  const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
  if (pendingOrders > 0) {
    alerts.push({
      id: 'pending',
      title: `${pendingOrders} Pending Order${pendingOrders > 1 ? 's' : ''}`,
      desc: 'Orders awaiting completion or payment.',
    });
  }

  const totalProducts = await prisma.product.count({ where: { isAvailable: true } });
  if (totalProducts === 0) {
    alerts.push({
      id: 'no-menu',
      title: 'No Menu Items',
      desc: 'Add items to the menu so cashiers can take orders.',
    });
  }

  const totalTables = await prisma.table.count();
  if (totalTables === 0) {
    alerts.push({
      id: 'no-tables',
      title: 'No Tables Configured',
      desc: 'Add tables in Table Management for dine-in orders.',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'ok',
      title: 'All Systems Normal',
      desc: 'No issues detected across terminal endpoints.',
    });
  }

  return Response.json({
    success: true,
    data: {
      totalSales,
      averageOrderValue,
      customerCount,
      trendData,
      topSelling,
      alerts,
      timeFilter,
    },
  });
}