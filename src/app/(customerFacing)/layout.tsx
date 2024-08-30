import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { BurgerMenu } from "@/components/BurgerMenu";
import { Nav, NavLink } from "@/components/Nav";
import { UserSignOut, UserSignIn } from "@/components/UserAccountNav";
import { User } from "lucide-react";



export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch session data server-side
  const session = await getServerSession(authOptions);

  return (
    <>
      <Nav>
        <div className="flex justify-center mx-auto">
        <NavLink href="/" >
          Home
        </NavLink>
        <NavLink href="/products">Products</NavLink>
        <NavLink href="/orders">My Orders</NavLink>
        </div>
        <div className="hidden md:flex items-center absolute top-3 right-10 space-x-2">
        <a href={`/user`} className="flex text-white w-full text-nowrap pr-2">
        <div className="w-8"><User/></div>
        Hello, {session?.user?.name}
            </a>
        {session?.user ? (
          <>

            <UserSignOut />
          </>
        ) : (
          <UserSignIn />
        )}
      </div>


      {/* Pass session data to the BurgerMenu */}
      <BurgerMenu session={session} />
      </Nav>
    

      <div className="container my-4">{children}</div>
    </>
  );
}
