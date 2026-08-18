"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { addressSchema, type AddressFormValues } from "@/lib/validation/address";
import type { Address } from "@/types/address";

export function AddressForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: {
  defaultValues?: Address;
  onSubmit: (data: AddressFormValues) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: defaultValues?.label ?? "",
      fullName: defaultValues?.fullName ?? "",
      line1: defaultValues?.line1 ?? "",
      line2: defaultValues?.line2 ?? "",
      city: defaultValues?.city ?? "",
      state: defaultValues?.state ?? "",
      postalCode: defaultValues?.postalCode ?? "",
      country: defaultValues?.country ?? "",
      phone: defaultValues?.phone ?? "",
      isDefault: defaultValues?.isDefault ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="label" className="text-sm font-light">
            Label
          </Label>
          <Input
            id="label"
            {...register("label")}
            className="mt-2 rounded-none"
            placeholder="Home, Work, ..."
          />
        </div>

        <div>
          <Label htmlFor="fullName" className="text-sm font-light">
            Full Name
          </Label>
          <Input
            id="fullName"
            {...register("fullName")}
            className="mt-2 rounded-none"
            placeholder="Jane Doe"
          />
          {errors.fullName && (
            <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="line1" className="text-sm font-light">
            Address Line 1
          </Label>
          <Input
            id="line1"
            {...register("line1")}
            className="mt-2 rounded-none"
            placeholder="Street address"
          />
          {errors.line1 && (
            <p className="text-sm text-destructive mt-1">{errors.line1.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="line2" className="text-sm font-light">
            Address Line 2
          </Label>
          <Input
            id="line2"
            {...register("line2")}
            className="mt-2 rounded-none"
            placeholder="Apt, suite, etc. (optional)"
          />
        </div>

        <div>
          <Label htmlFor="city" className="text-sm font-light">
            City
          </Label>
          <Input id="city" {...register("city")} className="mt-2 rounded-none" />
          {errors.city && (
            <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="state" className="text-sm font-light">
            State / Province
          </Label>
          <Input id="state" {...register("state")} className="mt-2 rounded-none" />
        </div>

        <div>
          <Label htmlFor="postalCode" className="text-sm font-light">
            Postal Code
          </Label>
          <Input
            id="postalCode"
            {...register("postalCode")}
            className="mt-2 rounded-none"
          />
          {errors.postalCode && (
            <p className="text-sm text-destructive mt-1">{errors.postalCode.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="country" className="text-sm font-light">
            Country
          </Label>
          <Input id="country" {...register("country")} className="mt-2 rounded-none" />
          {errors.country && (
            <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-light">
            Phone
          </Label>
          <Input id="phone" {...register("phone")} className="mt-2 rounded-none" />
        </div>
      </div>

      <Controller
        control={control}
        name="isDefault"
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <Checkbox
              checked={field.value ?? false}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
            Set as default address
          </label>
        )}
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-none"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="rounded-none">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Address"
          )}
        </Button>
      </div>
    </form>
  );
}
