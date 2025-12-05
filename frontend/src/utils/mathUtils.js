export function calculateArticlePrice(basePrice, quantity, discount = 0) {
  if (basePrice <= 0) throw new Error("INVALID_PRICE");
  if (quantity <= 0) throw new Error("INVALID_QUANTITY");
  if (discount < 0 || discount > 100) throw new Error("INVALID_DISCOUNT");
  
  const total = basePrice * quantity;
  const discountAmount = total * (discount / 100);
  return Math.round((total - discountAmount) * 100) / 100;
}