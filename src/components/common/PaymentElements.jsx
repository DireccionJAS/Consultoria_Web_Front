import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';

let stripePromise;
export default function PaymentElements({ children }) {
  stripePromise ??= loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
