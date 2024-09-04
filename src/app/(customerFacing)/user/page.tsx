import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import React from "react";
import db from "@/db/db";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Order } from "@prisma/client";

export default async function ProfilePage() {
  try {
    const session = await getServerSession(authOptions);

    console.log("Session:", session);

    if (!session?.user?.email) {
      return (
        <div>
          <h2>Please login to see your profile page</h2>
          {JSON.stringify(session)}
        </div>
      );
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    console.log("User:", user);
    if (!user) {
      return <div>User not found.</div>;
    }

    return (
      <div className="mt-20">
        <h2 className="text-2xl mb-5">Welcome back {user.name}</h2>
        <Image
          style={{ borderRadius: "100px" }}
          className="text-muted-foregorund"
          src={user.profileImage ?? "/default-avatar.png"}
          height={200}
          width={200}
          alt="User Image"
        />
        <div className="mt-5">
          Edit your profile{" "}
          <Link href={`/user/${user.id}/edit`} className=" text-blue-600">
            here
          </Link>
          <UserInfoTable user={user} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching session or user:", error);
    return <div>Something went wrong.</div>;
  }
}

type UserInfoProps = {
  id: string;
  name: string | null;
  email: string;
  address: string | null;
  profileImage: string | null;
  orders: Order[];
};

async function UserInfoTable({ user }: { user: UserInfoProps }) {
  return (
    <Table className="w-[500px]">
      <>
        <TableBody className="w-[300px]">
          <TableRow className="w-[300px] border-none">
            <TableHead className="w-[100px]">Name:</TableHead>
            <TableCell className="font-medium whitespace-break-spaces">
              {user.name}
            </TableCell>
          </TableRow>
          <TableRow className="border-none">
            <TableHead className="w-[100px]">Email:</TableHead>
            <TableCell className="whitespace-break-spaces">
              {user.email}
            </TableCell>
          </TableRow>
          <TableRow className="border-none">
            <TableHead className="w-[100px] text-nowrap">Delivery Address:</TableHead>
            <TableCell className="whitespace-break-spaces">
              {user.address}
            </TableCell>
          </TableRow>
        </TableBody>
      </>
    </Table>
  );
}