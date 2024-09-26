import { Nav, NavLink } from "@/components/Nav";

export const dynamic = "force-dynamic";

export default function AdminLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>){
    return <>
    <Nav>
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/products">Products</NavLink>
        <NavLink href="/admin/users">Customers</NavLink>
        <NavLink href="/admin/orders">Sales</NavLink>
        <NavLink href="/admin/discountCodes">Coupons</NavLink>
    </Nav>
    <div className="container mt-20 mb-5">{children}</div>
    </>
  }