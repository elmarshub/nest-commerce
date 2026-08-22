import Link from "next/link";
import { Check, Package, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/lib/api/orders";
import { reconcilePaymentForOrder } from "@/lib/payments/actions";
import { formatPrice } from "@/lib/format";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";

interface OrderSuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const { orderId } = await searchParams;

  // Stripe's webhook can't reach a local dev server — reconcile the
  // payment directly against Stripe before rendering (see lib/payments/actions.ts).
  const payment = orderId ? await reconcilePaymentForOrder(orderId) : null;
  const order = orderId ? await getOrder(orderId) : null;

  if (!order) {
    return (
      <div className="pt-24 pb-12">
        <div className="max-w-lg mx-auto px-6 text-center">
          <h1 className="text-2xl font-light text-foreground mb-4">Order not found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn&apos;t find that order — it may belong to a different account.
          </p>
          <Button asChild className="rounded-none">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const paymentPending = payment?.status === "PENDING";

  return (
    <div className="pt-16 pb-12">
      <div className="max-w-lg mx-auto px-6">
        {!paymentPending && <ClearCartOnSuccess />}

        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-8">
          {paymentPending ? (
            <Clock className="h-10 w-10 text-primary-foreground" />
          ) : (
            <Check className="h-10 w-10 text-primary-foreground" />
          )}
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-foreground mb-3">
            {paymentPending ? "Almost there" : "Thank You!"}
          </h1>
          <p className="text-muted-foreground">
            {paymentPending
              ? "We're still confirming your payment with Stripe — this page will reflect it shortly. Refresh in a moment if it doesn't."
              : "Your order has been placed."}
          </p>
        </div>

        <div className="bg-muted/20 p-8 rounded-none space-y-6">
          <div className="flex items-start gap-4">
            <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-medium text-foreground">#{order.orderNumber}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Shipping to</p>
              <p className="font-medium text-foreground whitespace-pre-line">
                {order.shippingAddress}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-muted-foreground/20 flex justify-between items-center">
            <span className="text-muted-foreground">Total</span>
            <span className="text-xl font-medium text-foreground">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <Button asChild className="w-full rounded-none">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
