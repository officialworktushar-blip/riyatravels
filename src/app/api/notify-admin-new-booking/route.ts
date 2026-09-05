import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("*, vehicle:vehicles(*)")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const vehicle = booking.vehicle;
    const reviewLink = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/bookings/${booking.id}`;

    const startLabel = new Date(booking.start_time).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const endLabel = new Date(booking.end_time).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const emailResults = await sendEmail(booking, vehicle, startLabel, endLabel, reviewLink);
    const whatsappResults = await sendWhatsApp(booking, vehicle, startLabel, endLabel, reviewLink);

    const warnings: string[] = [];
    if (emailResults.error) warnings.push(`Email: ${emailResults.error}`);
    if (whatsappResults.error) warnings.push(`WhatsApp: ${whatsappResults.error}`);

    return NextResponse.json({
      success: true,
      ...(warnings.length > 0 ? { warnings } : {}),
    });
  } catch (err) {
    console.error("Failed to process new-booking notification request:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

async function sendEmail(booking: any, vehicle: any, startLabel: string, endLabel: string, reviewLink: string) {
  try {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (!adminEmail) {
      console.warn("ADMIN_NOTIFICATION_EMAIL not set; skipping admin email notification.");
      return { error: "ADMIN_NOTIFICATION_EMAIL not set" };
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #16233F;">
        <h2 style="color: #C99A4A;">New booking request received</h2>
        <p>A customer has submitted a new booking and it is awaiting your review.</p>
        <div style="background: #F7F7F5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Customer:</strong> ${booking.customer_name}</p>
          <p><strong>Email:</strong> ${booking.customer_email ?? "Not provided"}</p>
          <p><strong>WhatsApp:</strong> ${booking.customer_whatsapp}</p>
          <p><strong>Vehicle:</strong> ${vehicle.name} (${vehicle.type})</p>
          <p><strong>From:</strong> ${startLabel}</p>
          <p><strong>To:</strong> ${endLabel}</p>
          <p><strong>Amount:</strong> ₹${booking.amount}</p>
        </div>
        <p><a href="${reviewLink}" style="color: #C99A4A;">Review this booking</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">This is an automated notification from Riya Travels.</p>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Riya Travels" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `New booking request — ${vehicle.name}`,
      html,
    });

    return { error: null };
  } catch (err) {
    console.error("Admin email notification failed:", err);
    return { error: "Email send failed" };
  }
}

async function sendWhatsApp(booking: any, vehicle: any, startLabel: string, endLabel: string, reviewLink: string) {
  try {
    const phone = process.env.CALLMEBOT_PHONE;
    const apiKey = process.env.CALLMEBOT_APIKEY;
    if (!phone || !apiKey) {
      console.warn("CALLMEBOT_PHONE or CALLMEBOT_APIKEY not set; skipping WhatsApp notification.");
      return { error: "CallMeBot env vars not set" };
    }

    const message = `New booking request! ${booking.customer_name} wants ${vehicle.name} (${vehicle.type}) from ${startLabel} to ${endLabel}. Amount: ₹${booking.amount}. Review: ${reviewLink}`;

    const url =
      `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}` +
      `&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url);
    const body = await res.text();

    if (!res.ok || body.includes("Error")) {
      console.error("CallMeBot WhatsApp notification failed:", res.status, body);
      return { error: "WhatsApp send failed" };
    }

    return { error: null };
  } catch (err) {
    console.error("WhatsApp notification failed:", err);
    return { error: "WhatsApp send failed" };
  }
}
