"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getStripe } from "@/lib/stripe/client";
import { syncPayment } from "@/lib/payments/actions";

interface PaymentFormProps {
  clientSecret: string;
  paymentId: string;
  orderId: string;
  onPaid: () => void;
}

function PaymentFormInner({
  paymentId,
  orderId,
  onPaid,
}: Omit<PaymentFormProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);

    // The backend's payment intent is created with
    // automatic_payment_methods.allow_redirects: 'never', so this
    // resolves inline instead of navigating away.
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      toast.error("Payment failed", { description: error.message });
      setIsSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Stripe's webhook can't reach a local dev server — reconcile
      // directly instead of waiting for it (see lib/payments/actions.ts).
      await syncPayment(paymentId);
      onPaid();
      router.push(`/order-success?orderId=${orderId}`);
      return;
    }

    toast.error("Payment did not complete", {
      description: `Status: ${paymentIntent?.status ?? "unknown"}`,
    });
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="w-full py-6 rounded-none text-base font-light"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing payment...
          </>
        ) : (
          "Pay now"
        )}
      </Button>
    </form>
  );
}

export function PaymentForm({ clientSecret, paymentId, orderId, onPaid }: PaymentFormProps) {
  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      <PaymentFormInner paymentId={paymentId} orderId={orderId} onPaid={onPaid} />
    </Elements>
  );
}
