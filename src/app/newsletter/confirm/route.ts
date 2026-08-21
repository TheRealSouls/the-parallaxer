import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

/**
 * Opened from the confirmation email. Marks the address confirmed and hands the
 * reader back to the front page with a note.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) redirect("/?newsletter=invalid");

  const subscriber = await prisma.subscriber.findUnique({
    where: { token },
    select: { id: true, confirmedAt: true },
  });
  if (!subscriber) redirect("/?newsletter=invalid");

  if (!subscriber.confirmedAt) {
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { confirmedAt: new Date(), unsubscribedAt: null },
    });
  }

  redirect("/?newsletter=confirmed");
}
