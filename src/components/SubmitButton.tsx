import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";

export function SubmitButton() {
    const {pending} = useFormStatus();
    return (
      <>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </>
    );
  }