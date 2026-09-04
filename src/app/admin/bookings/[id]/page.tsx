"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Booking } from "@/lib/types";
import {
  getTypeBadgeClass,
  formatDateTime,
  formatCurrency,
  getTypeIcon,
} from "@/lib/utils";
import { ArrowLeft, Check, X, Ban, Loader2, MessageCircle, ZoomIn, XIcon } from "lucide-react";

interface SignedImage {
  path: string;
  bucket: string;
  url: string;
  label: string;
}

function useDocumentViewer() {
  const [images, setImages] = useState<SignedImage[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSignedUrl = async (path: string, bucket: string, label: string) => {
    const res = await fetch("/api/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, bucket }),
    });
    const data = await res.json();
    if (data.signedUrl) {
      setImages((prev) => [...prev, { path, bucket, url: data.signedUrl, label }]);
    }
  };

  return { images, setImages, loadSignedUrl, loading, setLoading };
}

function Lightbox({
  image,
  onClose,
}: {
  image: SignedImage | null;
  onClose: () => void;
}) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
      >
        <XIcon size={22} />
      </button>
      <div className="relative max-h-[85vh] max-w-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={image.url}
          alt={image.label}
          className="max-h-[80vh] max-w-full rounded-lg object-contain"
        />
        <p className="mt-2 text-center text-sm font-medium text-white/80">
          {image.label}
        </p>
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState("");
  const [lightboxImage, setLightboxImage] = useState<SignedImage | null>(null);
  const { images, setImages, loadSignedUrl } = useDocumentViewer();

  const supabase = createClient();

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxImage]);

  const loadBooking = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*, vehicle:vehicles(*)")
      .eq("id", bookingId)
      .single();
    if (data) {
      setBooking(data as Booking);
      const b = data as Booking;
      const proms: Promise<void>[] = [];
      if (b.license_front_url)
        proms.push(loadSignedUrl(b.license_front_url, "licenses", "License Front"));
      if (b.license_back_url)
        proms.push(loadSignedUrl(b.license_back_url, "licenses", "License Back"));
      if (b.payment_screenshot_url)
        proms.push(loadSignedUrl(b.payment_screenshot_url, "payment-proofs", "Payment Screenshot"));
      await Promise.all(proms);
    }
    setLoading(false);
  };

  const handleAction = async (
    status: "approved" | "rejected" | "cancelled"
  ) => {
    setActionLoading(status);
    setError(null);
    setEmailStatus("");

    const { error: updateErr } = await supabase
      .from("bookings")
      .update({
        status,
        admin_note: note || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateErr) {
      setError(updateErr.message.includes("23P01") ? "Slot overlap detected. The times may already be booked." : updateErr.message);
      setActionLoading(null);
      return;
    }

    if (status === "approved") {
      setEmailStatus("sending");
      try {
        await fetch("/api/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });
        setEmailStatus("sent");
      } catch {
        setEmailStatus("failed");
      }
    }

    setActionLoading(null);
    await loadBooking();
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-16 text-center text-gray-400">
        Booking not found.{" "}
        <Link href="/admin/dashboard" className="text-gold-500 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const vehicle = booking.vehicle;

  const ADMIN_WHATSAPP = "918490048239";

  const getAdminNotifyUrl = () => {
    const msg = encodeURIComponent(
      `New Booking Received!%0A%0A` +
      `Customer: ${booking.customer_name}%0A` +
      `Vehicle: ${vehicle?.name || "N/A"}%0A` +
      `From: ${formatDateTime(booking.start_time)}%0A` +
      `To: ${formatDateTime(booking.end_time)}%0A` +
      `Amount: Rs.${booking.amount}%0A` +
      `WhatsApp: ${booking.customer_whatsapp}`
    );
    return `https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`;
  };

  const getCustomerContactUrl = () => {
    const phone = booking.customer_whatsapp.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Hi ${booking.customer_name},%0A%0A` +
      `This is from Riya Travels. We have received your booking for ${vehicle?.name || "N/A"} and are reviewing it.%0A%0A` +
      `We will get back to you shortly.`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  };

  const getCustomerNotifyUrl = () => {
    const phone = booking.customer_whatsapp.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Booking Approved!%0A%0A` +
      `Hi ${booking.customer_name},%0A` +
      `Your booking for ${vehicle?.name || "N/A"} has been approved!%0A%0A` +
      `From: ${formatDateTime(booking.start_time)}%0A` +
      `To: ${formatDateTime(booking.end_time)}%0A` +
      `Amount: Rs.${booking.amount}%0A%0A` +
      `Thank you for choosing Riya Travels!`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  };

  return (
    <div className="max-w-4xl">
      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />

      <Link
        href="/admin/dashboard"
        className="mb-4 sm:mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-600 hover:text-gold-400 transition-colors min-h-[44px]"
      >
        <ArrowLeft size={16} /> Back to Bookings
      </Link>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      {emailStatus === "sent" && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600">
          Confirmation email sent successfully.
        </div>
      )}
      {emailStatus === "failed" && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
          Booking approved but confirmation email could not be sent.
        </div>
      )}

      {/* WhatsApp notification links */}
      {booking.status === "pending_review" && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="mb-3 text-sm font-medium text-blue-800">Contact customer on WhatsApp:</p>
          <a
            href={getCustomerContactUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors min-h-[44px]"
          >
            <MessageCircle size={16} /> Contact {booking.customer_whatsapp}
          </a>
        </div>
      )}
      {booking.status === "approved" && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="mb-3 text-sm font-medium text-green-800">Notify customer on WhatsApp:</p>
          <a
            href={getCustomerNotifyUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors min-h-[44px]"
          >
            <MessageCircle size={16} /> Send to {booking.customer_whatsapp}
          </a>
        </div>
      )}

      {/* Header */}
      <div className="card mb-4 sm:mb-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-navy-700">
              {booking.customer_name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Submitted {formatDateTime(booking.created_at)}
            </p>
          </div>
          <span
            className={`${
              booking.status === "pending_review"
                ? "badge-pending"
                : booking.status === "approved"
                  ? "badge-approved"
                  : booking.status === "rejected"
                    ? "badge-rejected"
                    : "badge-cancelled"
            } text-sm sm:text-base px-3 sm:px-4 py-1`}
          >
            {booking.status.replace("_", " ").toUpperCase()}
          </span>
        </div>

        {booking.admin_note && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            <span className="font-semibold">Admin Note:</span> {booking.admin_note}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="mb-4 sm:mb-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-semibold text-navy-700">Vehicle</h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getTypeIcon(vehicle?.type || "car")}</span>
            <div>
              <p className="font-semibold text-navy-600">{vehicle?.name}</p>
              {vehicle?.type && (
                <span className={getTypeBadgeClass(vehicle.type)}>
                  {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-semibold text-navy-700">Time Slot</h3>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-navy-700">{formatDateTime(booking.start_time)}</span>
            {" to "}
            <span className="font-medium text-navy-700">{formatDateTime(booking.end_time)}</span>
          </p>
          <p className="mt-2 text-lg font-bold text-gold-500">
            {formatCurrency(booking.amount)}
          </p>
        </div>
      </div>

      {/* Customer info */}
      <div className="card mb-4 sm:mb-6 p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-navy-700">Customer</h3>
        <div className="space-y-1.5 text-sm text-gray-600">
          <p><span className="font-medium text-navy-700">Email:</span> {booking.customer_email || "Not provided"}</p>
          <p className="break-all"><span className="font-medium text-navy-700">WhatsApp:</span> {booking.customer_whatsapp}</p>
        </div>
      </div>

      {/* Documents */}
      <div className="card mb-4 sm:mb-6 p-4 sm:p-5">
        <h3 className="mb-4 text-sm font-semibold text-navy-700">Documents</h3>
        {images.length === 0 ? (
          <div className="space-y-2 text-sm text-gray-500">
            {!booking.license_front_url && <p>No license front uploaded.</p>}
            {!booking.license_back_url && <p>No license back uploaded.</p>}
            {!booking.payment_screenshot_url && <p>No payment screenshot uploaded.</p>}
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            {images.map((img) => (
              <div
                key={img.path}
                className="overflow-hidden rounded-lg border border-gray-200"
              >
                <button
                  onClick={() => setLightboxImage(img)}
                  className="relative block w-full group"
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="h-44 sm:h-40 w-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                    <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                  </div>
                </button>
                <p className="border-t border-gray-100 bg-gray-50 px-3 py-2 text-center text-xs font-medium text-gray-600">
                  {img.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {booking.status === "pending_review" || booking.status === "approved" ? (
        <div className="card p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-semibold text-navy-700">Admin Actions</h3>
          <div className="mb-4">
            <label className="label-text">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field min-h-[80px]"
              placeholder="Add a note..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {booking.status === "pending_review" && (
              <>
                <button
                  onClick={() => handleAction("approved")}
                  disabled={actionLoading !== null}
                  className="btn-primary w-full sm:w-auto justify-center"
                >
                  {actionLoading === "approved" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} className="mr-1" />
                  )}
                  Approve & Send Email
                </button>
                <button
                  onClick={() => handleAction("rejected")}
                  disabled={actionLoading !== null}
                  className="btn-danger w-full sm:w-auto justify-center"
                >
                  {actionLoading === "rejected" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <X size={16} className="mr-1" />
                  )}
                  Reject
                </button>
              </>
            )}
            {booking.status === "approved" && (
              <button
                onClick={() => handleAction("cancelled")}
                disabled={actionLoading !== null}
                className="btn-outline text-red-600 border-red-400 hover:bg-red-600 hover:text-white w-full sm:w-auto justify-center"
              >
                {actionLoading === "cancelled" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Ban size={16} className="mr-1" />
                )}
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-5 text-center text-sm text-gray-500">
          Booking is {booking.status.replace("_", " ")}. No actions available.
        </div>
      )}
    </div>
  );
}
