export const PRICE = 700,
  SHIPPING = 60;
export const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  civico: "",
  cap: "",
  city: "",
  provincia: "",
  nazione: "Italia",
  billingAddress: "",
  cardNumber: "",
  cardExpiry: "",
  cardOwner: "",
  cardCvv: "",
};
export type CheckoutData = typeof EMPTY_FORM;
export function validateCheckout(
  data: CheckoutData,
  billing = false,
  now = new Date(),
) {
  const errors: Partial<Record<keyof CheckoutData, string>> = {};
  for (const key of Object.keys(data) as (keyof CheckoutData)[])
    if (key !== "billingAddress" && !data[key].trim())
      errors[key] = "Compila questo campo con dati fittizi.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    errors.email = "Inserisci un indirizzo email nel formato nome@example.com.";
  if (
    !/^\+?[\d ()-]{7,20}$/.test(data.phone.trim()) ||
    data.phone.replace(/\D/g, "").length < 7
  )
    errors.phone = "Inserisci almeno 7 cifre per il telefono dimostrativo.";
  if (!/^\d{5}$/.test(data.cap.trim()))
    errors.cap = "Il CAP dimostrativo deve contenere 5 cifre.";
  const number = data.cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(number))
    errors.cardNumber = "Inserisci da 13 a 19 cifre fittizie, senza lettere.";
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(data.cardExpiry.trim());
  if (
    !match ||
    new Date(2000 + Number(match[2]), Number(match[1]), 1).getTime() <=
      new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  )
    errors.cardExpiry = "Usa MM/AA con una scadenza corrente o futura.";
  if (!/^\d{3,4}$/.test(data.cardCvv.trim()))
    errors.cardCvv = "Inserisci 3 o 4 cifre fittizie.";
  if (billing && !data.billingAddress.trim())
    errors.billingAddress = "Inserisci l’indirizzo di fatturazione fittizio.";
  return errors;
}
export function orderTotal(quantity: number, discount: boolean) {
  return PRICE * quantity * (discount ? 0.85 : 1) + SHIPPING;
}
export function canApplyPromo(code: string, unlocked: boolean) {
  return unlocked && code.trim().toUpperCase() === "SPEEDRUN15";
}
export const euro = (value: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
    value,
  );
