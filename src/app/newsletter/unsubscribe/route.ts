import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

/**
 * Opened from the footer of every newsletter. One click, no sign-in, no
 * confirmation step: an unsubscribe that asks questions is the reason people
 * report mail as spam instead.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) redirect("/?newsletter=invalid");

  const subscriber = await prisma.subscriber.findUnique({
    where: { token },
    select: { id: true },
  });
  if (!subscriber) redirect("/?newsletter=invalid");

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { unsubscribedAt: new Date() },
  });

  redirect("/?newsletter=unsubscribed");
}
