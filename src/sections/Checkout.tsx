import { useEffect, useRef, useState, type FormEvent } from "react";
import { FormInput } from "../components/ui/FormInput";
import {
  canApplyPromo,
  EMPTY_FORM,
  euro,
  orderTotal,
  PRICE,
  SHIPPING,
  validateCheckout,
  type CheckoutData,
} from "../lib/checkout";
interface Props {
  speedrunUnlocked?: boolean;
  onClose: () => void;
  onSuccess?: (quantity: number, total: number) => void;
}
const FIELDS: {
  name: keyof CheckoutData;
  label: string;
  placeholder: string;
  type?: string;
  maxLength?: number;
}[] = [
  { name: "fullName", label: "Nome e cognome", placeholder: "Mario Demo" },
  {
    name: "email",
    label: "Email",
    placeholder: "mario@example.com",
    type: "email",
  },
  { name: "phone", label: "Telefono", placeholder: "3330000000", type: "tel" },
  { name: "address", label: "Indirizzo", placeholder: "Via Gotham" },
  { name: "civico", label: "Numero civico", placeholder: "87" },
  { name: "cap", label: "CAP", placeholder: "00100", maxLength: 5 },
  { name: "city", label: "Città", placeholder: "Roma" },
  { name: "provincia", label: "Provincia", placeholder: "RM" },
  { name: "nazione", label: "Paese", placeholder: "Italia" },
  {
    name: "cardOwner",
    label: "Intestatario fittizio",
    placeholder: "Mario Demo",
  },
  {
    name: "cardNumber",
    label: "Numero carta fittizio",
    placeholder: "4242 4242 4242 4242",
    maxLength: 23,
  },
  {
    name: "cardExpiry",
    label: "Scadenza fittizia",
    placeholder: "12/30",
    maxLength: 5,
  },
  { name: "cardCvv", label: "CVV fittizio", placeholder: "123", maxLength: 4 },
];
export default function Checkout({
  speedrunUnlocked = false,
  onClose,
  onSuccess,
}: Props) {
  const [data, setData] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<ReturnType<typeof validateCheckout>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [billing, setBilling] = useState(false);
  const [promo, setPromo] = useState(speedrunUnlocked ? "SPEEDRUN15" : "");
  const [discount, setDiscount] = useState(speedrunUnlocked);
  const [promoMessage, setPromoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(false);
  const total = orderTotal(quantity, discount);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      pending.current = false;
    },
    [],
  );
  function updateField(name: keyof CheckoutData, value: string) {
    const next = { ...data, [name]: value };
    setData(next);
    if (submitted) setErrors(validateCheckout(next, billing));
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending.current) return;
    const found = validateCheckout(data, billing);
    setErrors(found);
    setSubmitted(true);
    if (Object.keys(found).length) {
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLInputElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    pending.current = true;
    setLoading(true);
    timer.current = setTimeout(() => {
      if (pending.current) {
        pending.current = false;
        onSuccess?.(quantity, total);
      }
    }, 4000);
  }
  return (
    <section className="checkout-page">
      <header className="checkout-heading">
        <p className="eyebrow">WAYNE COLLECTION / EDIZIONE LIMITATA</p>
        <h1>
          La leggenda.
          <br />
          Nella tua collezione.
        </h1>
        <p className="demo-banner" id="demo-disclosure">
          DEMO ACCADEMICA — Nessun pagamento o ordine reale. Usa esclusivamente
          dati fittizi: non inserire dati personali o carte reali.
        </p>
      </header>
      <div className="checkout-layout">
        <form
          noValidate
          autoComplete="off"
          onSubmit={submit}
          aria-describedby="demo-disclosure"
        >
          <fieldset disabled={loading}>
            <legend>01 / Informazioni dimostrative</legend>
            <div className="form-grid">
              {FIELDS.slice(0, 9).map((field) => (
                <FormInput
                  key={field.name}
                  {...field}
                  value={data[field.name]}
                  required
                  error={errors[field.name]}
                  onChange={(e) => updateField(field.name, e.target.value)}
                />
              ))}
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={billing}
                onChange={(e) => setBilling(e.target.checked)}
              />
              Usa un indirizzo di fatturazione diverso
            </label>
            {billing && (
              <FormInput
                label="Indirizzo di fatturazione fittizio"
                name="billingAddress"
                value={data.billingAddress}
                error={errors.billingAddress}
                onChange={(e) => updateField("billingAddress", e.target.value)}
              />
            )}
            <h2 className="payment-heading">02 / Pagamento simulato</h2>
            <p className="caption">
              Esempio: 4242 4242 4242 4242 · 12/30 · 123. Nessun dato viene
              inviato o salvato.
            </p>
            <div className="form-grid">
              {FIELDS.slice(9).map((field) => (
                <FormInput
                  key={field.name}
                  {...field}
                  required
                  value={data[field.name]}
                  error={errors[field.name]}
                  onChange={(e) => updateField(field.name, e.target.value)}
                />
              ))}
            </div>
          </fieldset>
          {submitted && Object.keys(errors).length > 0 && (
            <p role="alert" className="field-error">
              Controlla i campi indicati prima di continuare.
            </p>
          )}
          <button className="purchase-button" disabled={loading} type="submit">
            {loading
              ? "Elaborazione della simulazione…"
              : `Completa simulazione · ${euro(total)}`}
          </button>
          {loading && (
            <p role="status">
              Simulazione in corso. Puoi annullarla tornando alla statua.
            </p>
          )}
          <button type="button" className="text-button" onClick={onClose}>
            {loading ? "Annulla e torna alla statua" : "Torna alla statua"}
          </button>
        </form>
        <aside className="order-summary" aria-label="Riepilogo simulazione">
          <img
            src="/assets/showreel/0400.webp"
            alt="Statua Batman in edizione limitata"
          />
          <p className="eyebrow">BATMAN / 87TH ANNIVERSARY</p>
          <h2>Il Cavaliere Oscuro</h2>
          <p>Collector’s Edition · Simulazione</p>
          <div className="quantity-control">
            <span>Quantità</span>
            <button
              aria-label="Diminuisci quantità"
              disabled={quantity === 1 || loading}
              onClick={() => setQuantity((q) => q - 1)}
            >
              −
            </button>
            <output aria-live="polite">{quantity}</output>
            <button
              aria-label="Aumenta quantità"
              disabled={quantity === 5 || loading}
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>
          <dl>
            <div>
              <dt>Statua × {quantity}</dt>
              <dd>{euro(PRICE * quantity)}</dd>
            </div>
            {discount && (
              <div>
                <dt>Premio speedrun −15%</dt>
                <dd>−{euro(PRICE * quantity * 0.15)}</dd>
              </div>
            )}
            <div>
              <dt>Spedizione simulata</dt>
              <dd>{euro(SHIPPING)}</dd>
            </div>
            <div className="order-total">
              <dt>Totale simulato</dt>
              <dd aria-live="polite">{euro(total)}</dd>
            </div>
          </dl>
          <label htmlFor="promo">Codice premio</label>
          <div className="promo-row">
            <input
              id="promo"
              value={promo}
              disabled={loading}
              onChange={(e) => setPromo(e.target.value)}
            />
            <button
              className="secondary"
              disabled={loading}
              onClick={() => {
                const valid = canApplyPromo(promo, speedrunUnlocked);
                setDiscount(valid);
                setPromoMessage(
                  valid
                    ? "Premio applicato."
                    : "Codice non valido o premio non sbloccato in questa sessione.",
                );
              }}
            >
              Applica
            </button>
          </div>
          <p role="status" className="caption">
            {promoMessage}
          </p>
          <p className="caption">
            Progetto accademico: nessuna vendita, spedizione o assistenza
            commerciale.
          </p>
        </aside>
      </div>
    </section>
  );
}
