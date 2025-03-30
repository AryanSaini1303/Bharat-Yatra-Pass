import Ticket from "@/components/TicketPage";
import { Suspense } from "react";

export default function TicketWrapper() {
  return (
    <Suspense fallback={<p>Loading ticket details...</p>}>
      <Ticket/>
    </Suspense>
  );
}
