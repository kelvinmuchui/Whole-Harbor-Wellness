import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { dbService } from '../services/dbService.ts';
import { analyticsService } from '../services/analyticsService.ts';
import { auth } from '../lib/firebase.ts';
import { Order, ShippingAddress } from '../types/index.ts';
import { demoModeEnabled } from '../lib/testVariables.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string, param?: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, navigate }) => {
  const {
    items,
    subtotal,
    volumeDiscount,
    partnerDiscount,
    shipping,
    tax,
    finalTotal,
    activeReferral,
    clearCart
  } = useCart();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [fullName, setFullName] = useState<string>(currentUser?.displayName || '');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [phone, setPhone] = useState<string>('');
  const [addressLine1, setAddressLine1] = useState<string>('');
  const [addressLine2, setAddressLine2] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [medicalConsent, setMedicalConsent] = useState<boolean>(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    if (!medicalConsent) {
      setCheckoutError('Please confirm the clinical compliance statement before proceeding.');
      return;
    }
    if (!currentUser && !demoModeEnabled) {
      setCheckoutError('Sign in before submitting an order so it can be saved to your account.');
      return;
    }

    setLoading(true);

    try {
      const shippingAddress: ShippingAddress = {
        fullName,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        phone
      };

      // Compute partner commission if referral exists
      let partnerCommission = 0;
      let commissionStatus: 'NONE' | 'PENDING' = 'NONE';
      if (activeReferral) {
        partnerCommission = Number(
          (Math.max(0, subtotal - partnerDiscount) * activeReferral.commissionRate).toFixed(2)
        );
        commissionStatus = 'PENDING';
      }

      const orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'> = {
        customerUid: auth.currentUser?.uid || currentUser?.uid || 'guest-cust-id',
        customerName: fullName,
        customerEmail: email,
        shippingAddress,
        items,
        subtotal,
        volumeDiscount,
        partnerDiscount,
        shipping,
        tax,
        total: finalTotal,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        partnerId: activeReferral?.partnerId,
        partnerSlug: activeReferral?.partnerSlug,
        partnerName: activeReferral?.partnerName,
        referralSource: activeReferral
          ? activeReferral.referralSource || `partner_url:${activeReferral.partnerSlug}`
          : undefined,
        partnerCommission,
        commissionStatus,
        coldChainLogged: false
      };

      const created = await dbService.createOrder(orderData);
      analyticsService.trackCheckoutCompleted(created.orderNumber, created.total, created.partnerSlug);
      setCompletedOrder(created);
      clearCart();
    } catch (err) {
      console.error('Failed to create order', err);
      setCheckoutError('Unable to finalize order right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setCompletedOrder(null);
    onClose();
    navigate('customer-portal');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0c2340]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => { if (!loading) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Clinical Checkout"
    >
      <div
        className="relative bg-[#fffdfb] w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl border border-[#dfd7c7] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Order Completed View */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 text-center space-y-6 overflow-y-auto pb-[calc(24px+env(safe-area-inset-bottom))]">
            <div className="w-16 h-16 rounded-full bg-[#dfd7c7] text-[#c5a059] flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#c5a059] text-[#fffdfb] text-xs font-semibold uppercase tracking-wider mb-2">
                Order Submitted
              </span>
              <h2 className="font-serif text-2xl text-[#0c2340] font-bold">
                Thank You, {completedOrder.customerName}
              </h2>
              <p className="text-xs text-[#5a6b7c] mt-1">
                Order reference: <strong className="text-[#0c2340]">{completedOrder.orderNumber}</strong>
              </p>
            </div>

            {/* Cold Chain Badge */}
            <div className="bg-[#f6f4ee] rounded-xl p-4 border border-[#dfd7c7] text-left flex items-start gap-3">
              <span className="material-symbols-outlined text-[#c5a059] text-[24px]">ac_unit</span>
              <div className="text-xs">
                <p className="font-semibold text-[#0c2340]">Fulfillment Pending</p>
                <p className="text-[#5a6b7c] mt-0.5">
                  Fulfillment and tracking updates will appear here after the order is processed.
                </p>
                {completedOrder.partnerName && (
                  <p className="mt-2 text-[#c5a059] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">store</span>
                    Attributed to partner: {completedOrder.partnerName}
                  </p>
                )}
              </div>
            </div>

            {/* Summary Details */}
            <div className="border border-[#dfd7c7] rounded-xl overflow-hidden text-xs">
              <div className="bg-[#f6f4ee] px-4 py-2 font-semibold text-[#0c2340] flex justify-between">
                <span>Items ({completedOrder.items.length})</span>
                <span>Total: ${completedOrder.total.toFixed(2)}</span>
              </div>
              <div className="p-4 space-y-2 bg-white text-left divide-y divide-[#dfd7c7]/40">
                {completedOrder.items.map((it, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex justify-between items-center text-[#5a6b7c]">
                    <span>
                      {it.productName} ({it.selectedStrength.label}) × {it.quantity}
                    </span>
                    <span className="font-medium text-[#0c2340]">
                      ${(it.unitPrice * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-3 px-4 rounded-xl bg-[#c5a059] text-[#fffdfb] text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] transition-colors cursor-pointer"
              >
                Track in Customer Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  setCompletedOrder(null);
                  onClose();
                  navigate('shop');
                }}
                className="py-3 px-4 rounded-xl border border-[#dfd7c7] text-[#5a6b7c] hover:bg-[#f6f4ee] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close &amp; Return to Shop
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div className="flex flex-col flex-1 min-h-0">
            {/* Pinned Modal Header */}
            <div className="shrink-0 px-5 sm:px-6 py-4 border-b border-[#dfd7c7] bg-[#f6f4ee] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#dfd7c7] p-0.5 shadow-xs flex items-center justify-center shrink-0">
                  <img src="/images/whw-logo.png" alt="Whole Harbor Wellness" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif text-lg font-semibold text-[#0c2340] truncate">
                    Clinical Checkout &amp; Dispatch
                  </h2>
                  <p className="text-[11px] text-[#5a6b7c] truncate">
                    Cold-chain insured pharmaceutical-grade fulfillment
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                aria-label="Cancel checkout"
                className="w-10 h-10 rounded-full bg-white border border-[#dfd7c7] flex items-center justify-center text-[#5a6b7c] hover:text-[#0c2340] hover:border-[#0c2340] transition-colors cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form id="whw-checkout-form" onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* Partner Attribution Banner */}
              {activeReferral && (
                <div className="p-3 bg-[#5a6b7c]/15 border border-[#5a6b7c]/40 rounded-xl flex items-center justify-between text-xs text-[#c5a059]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>
                      Partner VIP: <strong>{activeReferral.partnerName}</strong> ({(activeReferral.discountRate * 100).toFixed(0)}% Off)
                    </span>
                  </div>
                  <span className="font-semibold text-[#c5a059]">VIP Applied</span>
                </div>
              )}

              {/* Shipping Details */}
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#5a6b7c] mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#c5a059]">local_shipping</span>
                  1. Delivery Destination
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[#5a6b7c] font-medium mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[#5a6b7c] font-medium mb-1">Apartment, suite, etc. (optional)</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">Phone (optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[#5a6b7c] font-medium mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#5a6b7c] font-medium mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[#5a6b7c] font-medium mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="pt-2 border-t border-[#dfd7c7]/60">
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#5a6b7c] mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#c5a059]">credit_card</span>
                  2. Payment
                </h3>
                <div className="bg-[#f6f4ee] p-4 rounded-xl border border-[#dfd7c7] text-xs text-[#0c2340]">
                  Order Request &amp; Pending Invoice: submitting records your order as Pending Fulfillment and queues it for clinical review, invoice confirmation, and cold-chain dispatch scheduling.
                </div>
              </div>

              {/* Clinical Compliance Checkbox */}
              <div className="pt-2 border-t border-[#dfd7c7]/60">
                <label className="flex items-start gap-2.5 text-xs text-[#5a6b7c] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={medicalConsent}
                    onChange={(e) => setMedicalConsent(e.target.checked)}
                    className="mt-0.5 rounded text-[#c5a059] focus:ring-[#c5a059]"
                  />
                  <span>
                    I confirm that I am authorized to receive this research-backed metabolic protocol, and acknowledge cold-chain storage instructions upon arrival.
                  </span>
                </label>
              </div>

              {/* Investment Summary */}
              <div className="bg-[#f6f4ee] p-4 rounded-xl border border-[#dfd7c7] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#5a6b7c]">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {volumeDiscount > 0 && (
                  <div className="flex justify-between text-[#c5a059] font-medium">
                    <span>Volume Savings</span>
                    <span>-${volumeDiscount.toFixed(2)}</span>
                  </div>
                )}
                {partnerDiscount > 0 && (
                  <div className="flex justify-between text-[#c5a059] font-medium">
                    <span>Partner VIP Discount</span>
                    <span>-${partnerDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#5a6b7c]">
                  <span>Cold-Chain Courier</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-[#5a6b7c]">
                  <span>Estimated Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-[#dfd7c7] flex justify-between font-serif font-bold text-sm text-[#0c2340]">
                  <span>Total Order Investment</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {checkoutError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                  <span>{checkoutError}</span>
                </div>
              )}

            </form>

            {/* Pinned Responsive Footer */}
            <div className="shrink-0 px-5 sm:px-6 py-3.5 pb-[calc(14px+env(safe-area-inset-bottom))] border-t border-[#dfd7c7] bg-[#f6f4ee] flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="sm:w-36 py-3 px-4 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] hover:border-[#0c2340] text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="whw-checkout-form"
                disabled={loading || items.length === 0}
                className="flex-1 py-3.5 px-4 rounded-xl bg-[#c5a059] text-[#fffdfb] text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Transmitting Order to Cold-Chain Lab...
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>Submit Order Request (${finalTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
