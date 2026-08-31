import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const supabase = createAdminClient();

    // Fetch booking with vehicle
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("*, vehicle:vehicles(*)")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const vehicle = booking.vehicle;
    const startDate = new Date(booking.start_time).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const endDate = new Date(booking.end_time).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #16233F;">
        <h2 style="color: #C99A4A;">Booking Confirmed!</h2>
        <p>Hi ${booking.customer_name},</p>
        <p>Your booking has been approved. Here are the details:</p>
        <div style="background: #F7F7F5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Vehicle:</strong> ${vehicle.name} (${vehicle.type})</p>
          <p><strong>From:</strong> ${startDate}</p>
          <p><strong>To:</strong> ${endDate}</p>
          <p><strong>Amount:</strong> ₹${booking.amount}</p>
        </div>
        <p>Thank you for choosing Riya Travels!</p>
        <p>For any queries, reach us on WhatsApp.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">This is an automated email from Riya Travels.</p>
      </div>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Riya Travels <no-reply@riyatravels.com>",
      to: booking.customer_email,
      subject: `Booking Confirmed — ${vehicle.name} (${startDate})`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
