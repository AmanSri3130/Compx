import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, cartTotal, categoryIds = [] } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Please enter a coupon code" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 404 });
    }

    // Check validity dates
    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      return NextResponse.json({ error: "Coupon is not yet active" }, { status: 400 });
    }
    if (coupon.endDate && coupon.endDate < now) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit has been reached" }, { status: 400 });
    }

    // Check minimum order amount
    if (cartTotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, cartTotal);

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discount),
      },
    });
  } catch (err: any) {
    console.error("Coupon verification error:", err);
    return NextResponse.json({ error: "Failed to apply coupon" }, { status: 500 });
  }
}

