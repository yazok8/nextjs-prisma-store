import { PageHeader } from "@/app/admin/_components/PageHeader";
import db from "@/db/db";
import { UserForm } from "../../_componenets/UserForm";



export default async function EditUserPage({params:{id}}:{params:{id:string}}){

        const user = await db.user.findUnique({where:{id}})

        if (!user) {
            return <div>User not found.</div>;
          }
          return (
            <div className="mt-5">
            <PageHeader> Edit User
            </PageHeader>
            <UserForm user={user}/>
            </div>
        )
}