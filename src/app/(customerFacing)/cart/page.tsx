import Container from "@/components/Container";
import CartClient from "./_components/CartClient";
import { getCurrentUser } from "../_actions/user";

export default async function Cart(){

    const currentUser = await getCurrentUser()
    return (
        <div>
            <Container>
                <CartClient />
            </Container>
        </div>
    )
}