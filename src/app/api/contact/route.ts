import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email, phone, subject, message } = parsed.data;

    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone,
        subject,
        message,
      },
    });

    // Notify admin
    await prisma.notification.create({
      data: {
        title: `New Support Message from ${name}`,
        message: `Subject: ${subject} (${email})`,
        type: "SYSTEM",
        link: "/admin/reviews",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been received! Our support team will get back to you shortly.",
    });
  } catch (err: any) {
    console.error("Contact message error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

