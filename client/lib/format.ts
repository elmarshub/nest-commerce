const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(price: number): string {
  return currencyFormatter.format(price);
}
