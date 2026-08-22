"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Pencil, Trash2, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressForm } from "@/components/account/address-form";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import {
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/lib/addresses/actions";
import type { AddressFormValues } from "@/lib/validation/address";
import type { Address } from "@/types/address";

type PanelState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; address: Address };

export function AddressesTab({
  initialAddresses,
}: {
  initialAddresses: Address[];
}) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [panel, setPanel] = useState<PanelState>({ mode: "closed" });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (data: AddressFormValues) => {
    setSubmitting(true);

    const result =
      panel.mode === "edit"
        ? await updateAddress(panel.address.id, data)
        : await createAddress(data);

    setSubmitting(false);

    if (!result.address) {
      toast.error("Something went wrong", {
        description: result.error ?? undefined,
      });
      return;
    }

    setAddresses((prev) => {
      const withoutSaved = prev.filter((a) => a.id !== result.address.id);
      const next = result.address.isDefault
        ? withoutSaved.map((a) => ({ ...a, isDefault: false }))
        : withoutSaved;
      return [result.address, ...next];
    });

    toast.success(panel.mode === "edit" ? "Address updated" : "Address added");
    setPanel({ mode: "closed" });
  };

  const handleDelete = async (address: Address) => {
    setDeletingId(address.id);
    const result = await deleteAddress(address.id);
    setDeletingId(null);

    if (result.error) {
      toast.error("Couldn't delete address", { description: result.error });
      return;
    }

    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== address.id);

      if (
        address.isDefault &&
        next.length > 0 &&
        !next.some((a) => a.isDefault)
      ) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
    toast.success("Address deleted");
  };

  return (
    <div className="bg-muted/20 p-8 rounded-none space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-light text-foreground">Saved Addresses</h2>
        {panel.mode === "closed" && (
          <Button
            onClick={() => setPanel({ mode: "add" })}
            className="rounded-none cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        )}
      </div>

      {panel.mode !== "closed" && (
        <div className="border border-muted-foreground/20 p-6">
          <h3 className="text-base font-light text-foreground mb-4">
            {panel.mode === "edit" ? "Edit Address" : "New Address"}
          </h3>
          <AddressForm
            defaultValues={panel.mode === "edit" ? panel.address : undefined}
            onSubmit={handleSubmit}
            onCancel={() => setPanel({ mode: "closed" })}
            submitting={submitting}
          />
        </div>
      )}

      {addresses.length === 0 && panel.mode === "closed" ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No saved addresses yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border border-muted-foreground/20 p-6"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {address.label && (
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {address.label}
                    </span>
                  )}
                  {address.isDefault && (
                    <span className="flex items-center gap-1 text-xs font-medium text-foreground">
                      <Star className="h-3 w-3 fill-current" />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer"
                    onClick={() => setPanel({ mode: "edit", address })}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <ConfirmDeleteDialog
                    title="Delete this address?"
                    description={`"${address.label || address.line1}" will be permanently deleted. This cannot be undone.`}
                    onConfirm={() => handleDelete(address)}
                    trigger={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="cursor-pointer"
                        disabled={deletingId === address.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                </div>
              </div>

              <div className="text-sm text-foreground space-y-0.5">
                <p className="font-medium">{address.fullName}</p>
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>
                  {address.city}
                  {address.state ? `, ${address.state}` : ""}{" "}
                  {address.postalCode}
                </p>
                <p>{address.country}</p>
                {address.phone && (
                  <p className="text-muted-foreground">{address.phone}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
