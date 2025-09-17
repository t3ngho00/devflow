import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/ROUTES";

export default async function Home() {
  const session = await auth();
  console.log(session);
  return (
    <>
      <h1 className="font-space-grotesk">Welcome to DevFlow App</h1>
      <form
        className="px-4 pt-[100]"
        action={async () => {
          "use server";
          await signOut({ redirectTo: ROUTES.SIGN_IN });
        }}
      > 
        <Button type="submit">Logout</Button>
      </form>
    </>
  );
}
