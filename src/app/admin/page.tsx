// src/app/admin/dashboard/page.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {prisma} from '@/lib/prisma';
import { authOptions } from "@/lib/auth";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

async function getSalesData() {
  const data = await prisma.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });

  return {
    amount: (data._sum?.pricePaidInCents || 0) / 100,
    numberOfSales: data._count,
  };
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: { pricePaidInCents: true },
    }),
  ]);

  return {
    userCount,
    averageValuePerUser:
      userCount === 0
        ? 0
        : (orderData._sum.pricePaidInCents || 0) / userCount / 100,
  };
}

async function getProductData() {
  const [activeCount, inactiveCount] = await Promise.all([
    prisma.product.count({ where: { isAvailableForPurchase: true } }),
    prisma.product.count({ where: { isAvailableForPurchase: false } }),
  ]);

  return {
    activeCount,
    inactiveCount,
  };
}

type DashboardCardProps = {
  title: string;
  subtitle: string;
  body: string;
};

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}

export default async function AdminDashboard() {
  // Fetch session data on the server
  const session = await getServerSession(authOptions);

  // If no session, redirect to sign-in
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/admin/dashboard");
  }

  // If user is not an admin, redirect to 403
  if (session.user.role !== "ADMIN") {
    redirect("/403");
  }

  // Fetch data concurrently
  const [salesData, usersData, productData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductData(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DashboardCard
        title="Sales"
        subtitle={`${formatNumber(salesData.numberOfSales)} Orders`}
        body={formatCurrency(salesData.amount)}
      />
      <DashboardCard
        title="Customers"
        subtitle={`${formatCurrency(
          usersData.averageValuePerUser
        )} Average value`}
        body={formatNumber(usersData.userCount)}
      />
      <DashboardCard
        title="Active Products"
        subtitle={`${formatNumber(productData.inactiveCount)} Inactive`}
        body={formatNumber(productData.activeCount)}
      />
    </div>
  );
}
