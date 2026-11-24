import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderLock,
  Download,
  Printer,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { OrderConfirmationClient } from "./OrderConfirmationClient";

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          note: {
            select: { id: true, title: true, slug: true, coverImage: true, isFree: true },
          },
        },
      },
      payment: true,
      user: {
        select: { name: true, email: true },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return <OrderConfirmationClient order={order} />;
}

