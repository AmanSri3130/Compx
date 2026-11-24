import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const verifyPaymentSchema = z.object({
  orderId: z.string().min(5, "Order ID is required"),
  utr: z.string().min(6, "Valid UTR / Transaction Reference ID is required").max(30),
  screenshotUrl: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = verifyPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { orderId, utr, screenshotUrl } = parsed.data;
    const cleanUtr = utr.trim();

    // Check if UTR is already used in any other verified or pending payment
    const duplicatePayment = await prisma.payment.findFirst({
      where: {
        utr: cleanUtr,
        orderId: { not: orderId },
        status: { in: ["PENDING_VERIFICATION", "PAID"] },
      },
    });

    if (duplicatePayment) {
      return NextResponse.json(
        { error: "This UTR / Transaction ID has already been submitted for another order. Please check and re-enter." },
        { status: 409 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "PAID") {
      return NextResponse.json({ success: true, message: "Order is already verified and paid!" });
    }

    // Update Order & Payment
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PENDING_VERIFICATION",
        },
      }),
      prisma.payment.upsert({
        where: { orderId },
        update: {
          utr: cleanUtr,
          screenshotUrl: screenshotUrl || null,
          status: "PENDING_VERIFICATION",
        },
        create: {
          orderId,
          amount: order.finalAmount,
          mode: order.paymentMode,
          utr: cleanUtr,
          screenshotUrl: screenshotUrl || null,
          status: "PENDING_VERIFICATION",
        },
      }),
      // Admin Alert Notification
      prisma.notification.create({
        data: {
          title: `Action Required: Payment Verification (${orderId})`,
          message: `${order.customerName} submitted UTR: ${cleanUtr} for ₹${order.finalAmount}. Click to verify.`,
          type: "PAYMENT",
          link: `/admin/orders?search=${orderId}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Payment proof submitted successfully! Your notes will be unlocked within 5-15 minutes after admin verification.",
      orderId,
      status: "PENDING_VERIFICATION",
    });
  } catch (err: any) {
    console.error("Payment verification submission error:", err);
    return NextResponse.json({ error: "Failed to submit payment details" }, { status: 500 });
  }
}

