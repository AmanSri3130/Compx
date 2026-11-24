import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateOrderId } from "@/lib/utils";
import { generateDynamicUpiQr, buildUpiUri, buildWhatsAppOrderUrl } from "@/lib/upi";
import { z } from "zod";

const createOrderSchema = z.object({
  noteIds: z.array(z.string()).min(1, "Please select at least one note"),
  paymentMode: z.enum(["UPI_QR", "WHATSAPP", "GATEWAY_RAZORPAY"]),
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  couponCode: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { noteIds, paymentMode, customerName, customerEmail, customerPhone, couponCode } = parsed.data;

    // Fetch site settings for UPI & WhatsApp details
    const settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });

    const upiId = settings?.upiId || "compx@upi";
    const payeeName = settings?.upiPayeeName || "CompX Education";
    const whatsappNumber = settings?.whatsappNumber || "919876543210";

    // Fetch notes to calculate true server-side price
    const notes = await prisma.note.findMany({
      where: { id: { in: noteIds }, status: "PUBLISHED" },
    });

    if (notes.length === 0) {
      return NextResponse.json({ error: "Selected notes not found" }, { status: 404 });
    }

    const totalAmount = notes.reduce((sum, n) => sum + (n.isFree ? 0 : n.price), 0);
    let discountAmount = 0;
    let couponRecord = null;

    // Apply coupon if provided
    if (couponCode && totalAmount > 0) {
      couponRecord = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (couponRecord && couponRecord.isActive && totalAmount >= couponRecord.minOrderAmount) {
        if (couponRecord.discountType === "PERCENTAGE") {
          discountAmount = (totalAmount * couponRecord.discountValue) / 100;
          if (couponRecord.maxDiscount && discountAmount > couponRecord.maxDiscount) {
            discountAmount = couponRecord.maxDiscount;
          }
        } else {
          discountAmount = couponRecord.discountValue;
        }
        discountAmount = Math.min(discountAmount, totalAmount);
      }
    }

    const finalAmount = Math.max(0, Math.round(totalAmount - discountAmount));
    const orderId = generateOrderId();

    // Check if user exists or use session or create temporary student
    let userId = session?.id;
    if (!userId) {
      const existingUser = await prisma.user.findUnique({
        where: { email: customerEmail.toLowerCase().trim() },
      });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create student account on the fly with random secure temp password
        const tempUser = await prisma.user.create({
          data: {
            name: customerName,
            email: customerEmail.toLowerCase().trim(),
            phone: customerPhone,
            password: "TEMPORARY_HASHED_PASSWORD",
            role: "STUDENT",
            permissions: "[]",
          },
        });
        userId = tempUser.id;
      }
    }

    // Create Order with Items
    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId,
        totalAmount,
        discountAmount,
        finalAmount,
        status: finalAmount === 0 ? "PAID" : "PENDING",
        paymentMode,
        couponId: couponRecord?.id || null,
        customerName,
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone,
        items: {
          create: notes.map((n) => ({
            noteId: n.id,
            price: n.isFree ? 0 : n.price,
            title: n.title,
          })),
        },
        payment: {
          create: {
            mode: paymentMode,
            amount: finalAmount,
            status: finalAmount === 0 ? "PAID" : "PENDING",
            verifiedAt: finalAmount === 0 ? new Date() : null,
          },
        },
      },
      include: {
        items: true,
        payment: true,
      },
    });

    // Increment coupon used count if used
    if (couponRecord && discountAmount > 0) {
      await prisma.coupon.update({
        where: { id: couponRecord.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Generate UPI URI and Dynamic QR Code
    let dynamicQrDataUrl = "";
    let upiIntentUri = "";
    let whatsAppUrl = "";

    if (finalAmount > 0) {
      if (paymentMode === "UPI_QR") {
        const upiParams = {
          pa: upiId,
          pn: payeeName,
          am: finalAmount,
          tn: orderId,
          cu: "INR",
        };
        upiIntentUri = buildUpiUri(upiParams);
        try {
          dynamicQrDataUrl = await generateDynamicUpiQr(upiParams);
        } catch (e) {
          console.error("Failed to generate dynamic QR:", e);
        }
      } else if (paymentMode === "WHATSAPP") {
        whatsAppUrl = buildWhatsAppOrderUrl({
          phone: whatsappNumber,
          orderId,
          customerName,
          noteTitles: notes.map((n) => n.title),
          amount: finalAmount,
        });
      }
    }

    // Notify Admin of new order
    await prisma.notification.create({
      data: {
        title: `New Order: ${orderId} (₹${finalAmount})`,
        message: `${customerName} placed order for ${notes.length} note(s) via ${paymentMode}.`,
        type: "ORDER",
        link: `/admin/orders?search=${orderId}`,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        totalAmount,
        discountAmount,
        finalAmount,
        status: order.status,
        paymentMode,
        customerName,
        customerEmail,
        createdAt: order.createdAt,
      },
      paymentDetails: {
        upiId,
        payeeName,
        upiIntentUri,
        dynamicQrDataUrl,
        adminQrImageUrl: settings?.upiQrImageUrl || "/images/sample-upi-qr.svg",
        whatsAppUrl,
        whatsappNumber,
      },
    });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Failed to create order. Please try again." }, { status: 500 });
  }
}

