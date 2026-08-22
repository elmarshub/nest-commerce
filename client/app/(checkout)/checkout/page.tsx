"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, CreditCard, Loader2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/lib/stores/cart-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useAuthModalStore } from "@/lib/stores/auth-modal-store";
import { checkout } from "@/lib/orders/actions";
import { createPaymentIntent } from "@/lib/payments/actions";
import { useMyAddresses } from "@/lib/queries/addresses";
import {
  addressSchema,
  type AddressFormValues,
} from "@/lib/validation/address";
import { PaymentForm } from "@/components/checkout/payment-form";
import { formatPrice } from "@/lib/format";
import type { Address } from "@/types/address";

function toFormValues(address: Address): AddressFormValues {
  return {
    label: address.label ?? "",
    fullName: address.fullName,
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state ?? "",
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone ?? "",
    isDefault: address.isDefault,
  };
}

const BLANK_ADDRESS: AddressFormValues = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
  isDefault: false,
};

function serializeAddress(address: AddressFormValues) {
  return [
    address.fullName,
    address.line2 ? `${address.line1}, ${address.line2}` : address.line1,
    `${address.city}${address.state ? `, ${address.state}` : ""} ${address.postalCode}`,
    address.country,
  ]
    .filter(Boolean)
    .join("\n");
}

interface PaymentStep {
  clientSecret: string;
  paymentId: string;
  orderId: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal, clearCart } =
    useCartStore();
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthModalStore((state) => state.open);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep | null>(null);
  const [orderedItems, setOrderedItems] = useState<typeof items>([]);
  const [orderedTotal, setOrderedTotal] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | "new" | null
  >(null);
  const hasAutoFilledRef = useRef(false);

  const addressesQuery = useMyAddresses(!!user);
  const savedAddresses = addressesQuery.data ?? [];

  const activeAddressId = selectedAddressId ?? savedAddresses[0]?.id ?? null;

  const {
    register,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: BLANK_ADDRESS,
  });

  useEffect(() => {
    const addresses = addressesQuery.data;
    if (hasAutoFilledRef.current || !addresses || addresses.length === 0)
      return;
    hasAutoFilledRef.current = true;
    reset(toFormValues(addresses[0]));
  }, [addressesQuery.data, reset]);

  const handleSelectAddress = (id: string | "new") => {
    setSelectedAddressId(id);
    if (id === "new") {
      reset(BLANK_ADDRESS);
      return;
    }
    const match = savedAddresses.find((a) => a.id === id);
    if (match) reset(toFormValues(match));
  };

  const displayItems = paymentStep ? orderedItems : items;
  const total = paymentStep ? orderedTotal : subtotal();

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Cart is empty", {
        description: "Please add items to your cart before checking out.",
      });
      return;
    }

    if (!user) {
      openAuthModal();
      return;
    }

    const isValid = await trigger();
    if (!isValid) {
      toast.error("Shipping address incomplete", {
        description: "Please fill in all required address fields.",
      });
      return;
    }

    setIsProcessing(true);

    const shippingAddress = serializeAddress(getValues());

    const orderResult = await checkout({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      shippingAddress,
    });

    if (!orderResult.order) {
      toast.error("Checkout failed", {
        description: orderResult.error ?? undefined,
      });
      setIsProcessing(false);
      return;
    }

    const order = orderResult.order;
    const intentResult = await createPaymentIntent(order.id);

    setIsProcessing(false);

    if (!intentResult.clientSecret) {
      toast.error("Order placed, but payment couldn't start", {
        description: intentResult.error ?? undefined,
      });
      return;
    }

    setOrderedItems(items);
    setOrderedTotal(total);
    setPaymentStep({
      clientSecret: intentResult.clientSecret,
      paymentId: intentResult.paymentId,
      orderId: order.id,
    });
  };

  if (items.length === 0 && !paymentStep) {
    return (
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl font-light text-foreground mb-4">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Add some beautiful pieces to get started.
          </p>
          <Button onClick={() => router.push("/")} className="rounded-none">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 lg:order-2">
            <div className="bg-muted/20 p-8 rounded-none sticky top-6">
              <h2 className="text-lg font-light text-foreground mb-6">
                Order Summary
              </h2>

              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {displayItems.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4"
                    >
                      <div className="relative w-20 h-20 bg-muted rounded-none overflow-hidden">
                        {item.product.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-light text-foreground">
                          {item.product.name}
                        </h3>

                        {!paymentStep && (
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                item.quantity === 1
                                  ? removeItem(item.productId)
                                  : updateQuantity(
                                      item.productId,
                                      item.quantity - 1,
                                    )
                              }
                              className="h-8 w-8 p-0 rounded-none border-muted-foreground/20"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium text-foreground min-w-[2ch] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                )
                              }
                              className="h-8 w-8 p-0 rounded-none border-muted-foreground/20"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="text-foreground font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="border-t border-muted-foreground/20 mt-8 pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">Free</span>
                </div>
                <div className="flex justify-between text-base font-medium pt-3 border-t border-muted-foreground/20">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 lg:order-1 space-y-8">
            {paymentStep ? (
              <div className="bg-muted/20 p-8 rounded-none">
                <h2 className="text-lg font-light text-foreground mb-6 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </h2>
                <PaymentForm
                  clientSecret={paymentStep.clientSecret}
                  paymentId={paymentStep.paymentId}
                  orderId={paymentStep.orderId}
                  onPaid={clearCart}
                />
              </div>
            ) : (
              <>
                {!user && (
                  <div className="bg-muted/20 p-8 rounded-none">
                    <h2 className="text-lg font-light text-foreground mb-4">
                      Sign in to check out
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Every order is tied to an account so you can track it
                      afterward — there &apos;s no guest checkout.
                    </p>
                    <Button
                      onClick={() => openAuthModal()}
                      className="rounded-none"
                    >
                      Sign In
                    </Button>
                  </div>
                )}

                <div className="bg-muted/20 p-8 rounded-none">
                  <h2 className="text-lg font-light text-foreground mb-6">
                    Shipping Address
                  </h2>

                  {savedAddresses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {savedAddresses.map((saved) => (
                        <button
                          key={saved.id}
                          type="button"
                          onClick={() => handleSelectAddress(saved.id)}
                          className={`border px-4 py-2 text-left text-sm rounded-none transition-colors ${
                            activeAddressId === saved.id
                              ? "border-foreground bg-background"
                              : "border-muted-foreground/20 hover:border-muted-foreground/40"
                          }`}
                        >
                          <span className="font-medium text-foreground">
                            {saved.label || saved.fullName}
                          </span>
                          <span className="block text-muted-foreground">
                            {saved.line1}
                          </span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleSelectAddress("new")}
                        className={`border px-4 py-2 text-sm rounded-none transition-colors ${
                          selectedAddressId === "new"
                            ? "border-foreground bg-background"
                            : "border-muted-foreground/20 hover:border-muted-foreground/40"
                        }`}
                      >
                        Use a new address
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="fullName"
                        className="text-sm font-light text-foreground"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        {...register("fullName")}
                        className="mt-2 rounded-none"
                        placeholder="Jane Doe"
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="line1"
                        className="text-sm font-light text-foreground"
                      >
                        Address *
                      </Label>
                      <Input
                        id="line1"
                        {...register("line1")}
                        className="mt-2 rounded-none"
                        placeholder="Street address"
                      />
                      {errors.line1 && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.line1.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="line2"
                        className="text-sm font-light text-foreground"
                      >
                        Apt, suite, etc.
                      </Label>
                      <Input
                        id="line2"
                        {...register("line2")}
                        className="mt-2 rounded-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="city"
                          className="text-sm font-light text-foreground"
                        >
                          City *
                        </Label>
                        <Input
                          id="city"
                          {...register("city")}
                          className="mt-2 rounded-none"
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="state"
                          className="text-sm font-light text-foreground"
                        >
                          State / Province
                        </Label>
                        <Input
                          id="state"
                          {...register("state")}
                          className="mt-2 rounded-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="postalCode"
                          className="text-sm font-light text-foreground"
                        >
                          Postal Code
                        </Label>
                        <Input
                          id="postalCode"
                          {...register("postalCode")}
                          className="mt-2 rounded-none"
                        />
                        {errors.postalCode && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.postalCode.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="country"
                          className="text-sm font-light text-foreground"
                        >
                          Country *
                        </Label>
                        <Input
                          id="country"
                          {...register("country")}
                          className="mt-2 rounded-none"
                        />
                        {errors.country && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.country.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="phone"
                        className="text-sm font-light text-foreground"
                      >
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        className="mt-2 rounded-none"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full py-6 rounded-none text-base font-light"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing order...
                    </>
                  ) : (
                    `Continue to Payment • ${formatPrice(total)}`
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  By proceeding, you agree to our{" "}
                  <a
                    href="/terms-of-service"
                    className="underline hover:no-underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy-policy"
                    className="underline hover:no-underline"
                  >
                    Privacy Policy
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
