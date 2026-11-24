import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { dbService } from '../services/dbService.ts';
import { Order } from '../types/index.ts';

interface CustomerPortalViewProps {
  navigate: (path: string, param?: string) => void;
}

interface SavedProtocolStack {
  id: string;
  title: string;
  description: string;
  category: string;
}

const DEFAULT_SAVED_PROTOCOLS: SavedProtocolStack[] = [
  {
    id: 'prot-mito',
    title: 'Mitochondrial Longevity Duo',
    description: 'MOTS-C Activator + NAD+ Cellular Solution',
    category: 'cellular'
  },
  {
    id: 'prot-rec',
    title: 'Tissue Recovery Protocol',
    description: 'BPC-157 + TB-500 Recovery Matrix',
    category: 'recovery'
  }
];

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({ navigate }) => {
  const { currentUser, role, isAdmin, changePassword, updateCurrentUserProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'protocols'>('orders');
  const [confirmCancelOrderId, setConfirmCancelOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [orderActionNotice, setOrderActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profileName, setProfileName] = useState(currentUser?.displayName || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const protocolStorageKey = `whw_saved_protocols_${currentUser?.uid || 'guest'}`;
  const [savedProtocols, setSavedProtocols] = useState<SavedProtocolStack[]>(() => {
    try {
      const raw = localStorage.getItem(`whw_saved_protocols_${currentUser?.uid || 'guest'}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as SavedProtocolStack[];
      }
    } catch {
      // ignore
    }
    return DEFAULT_SAVED_PROTOCOLS;
  });
  const [newProtocolTitle, setNewProtocolTitle] = useState('');
  const [newProtocolDesc, setNewProtocolDesc] = useState('');
  const [newProtocolCategory, setNewProtocolCategory] = useState('cellular');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdStatus, setPwdStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    setProfileName(currentUser?.displayName || '');
    setProfilePhone(currentUser?.phone || '');
  }, [currentUser?.displayName, currentUser?.phone]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(protocolStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedProtocols(parsed as SavedProtocolStack[]);
          return;
        }
      }
    } catch {
      // ignore
    }
    setSavedProtocols(DEFAULT_SAVED_PROTOCOLS);
  }, [protocolStorageKey]);

  const persistProtocols = (next: SavedProtocolStack[]) => {
    setSavedProtocols(next);
    try {
      localStorage.setItem(protocolStorageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let active = true;
    const loadOrders = async () => {
      try {
        const all = await dbService.getOrders(isAdmin ? 'admin' : 'customer');
        if (!active) return;
        setOrdersError(null);
        if (!isAdmin && currentUser) {
          const emailLower = currentUser.email.toLowerCase();
          const scoped = all.filter(
            (o) =>
              (o.customerUid && o.customerUid === currentUser.uid) ||
              (o.customerEmail && o.customerEmail.toLowerCase() === emailLower)
          );
          setOrders(scoped);
        } else {
          setOrders(all);
        }
      } catch (err) {
        console.error('Failed to load customer orders', err);
        if (active) {
          setOrdersError('Unable to load your orders from the database. Please try again shortly.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadOrders();
    const unsubscribe = dbService.subscribeToCollections(['orders'], () => {
      void loadOrders();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [currentUser, isAdmin]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#dfd7c7] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-widest text-[#5a6b7c]">
              Patient Portal
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#c5a059] text-[#fffdfb]">
              {role}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#0c2340] font-bold">
            Welcome, {currentUser?.displayName || 'Clinical Member'}
          </h1>
          <p className="text-xs text-[#5a6b7c] mt-1">
            {currentUser?.email || 'member@wholeharbor.com'} • Active Cold-Chain Orders &amp; Health Records
          </p>
        </div>

        <button
          onClick={() => navigate('shop')}
          className="px-5 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] transition-colors cursor-pointer"
        >
          Explore Formulations
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#dfd7c7]/60 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#c5a059] text-white'
              : 'text-[#5a6b7c] hover:bg-[#f6f4ee]'
          }`}
        >
          My Orders &amp; Tracking ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('protocols')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'protocols'
              ? 'bg-[#c5a059] text-white'
              : 'text-[#5a6b7c] hover:bg-[#f6f4ee]'
          }`}
        >
          Saved Protocols
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#c5a059] text-white'
              : 'text-[#5a6b7c] hover:bg-[#f6f4ee]'
          }`}
        >
          Account &amp; Shipping Profile
        </button>
      </div>

      {/* Orders Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orderActionNotice && (
            <div
              role="status"
              className={`rounded-xl border p-3.5 text-xs ${
                orderActionNotice.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              {orderActionNotice.text}
            </div>
          )}
          {ordersError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
              {ordersError}
            </div>
          ) : loading ? (
            <div className="py-12 text-center text-[#5a6b7c]">
              <span className="w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin inline-block"></span>
              <p className="text-xs mt-2">Retrieving orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-[#dfd7c7] rounded-3xl p-12 text-center space-y-4">
              <span className="material-symbols-outlined text-[48px] text-[#5a6b7c]">package_2</span>
              <h3 className="font-serif text-xl font-bold text-[#0c2340]">No Orders On Record</h3>
              <p className="text-xs text-[#5a6b7c] max-w-sm mx-auto">
                You haven't ordered any metabolic kits yet. Visit our shop to select research-backed formulations.
              </p>
              <button
                onClick={() => navigate('shop')}
                className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold cursor-pointer"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white border border-[#dfd7c7] rounded-3xl p-6 shadow-xs space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#dfd7c7]/60 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-[#0c2340]">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs text-[#5a6b7c]">
                        Placed on {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ord.status === 'COMPLETED'
                          ? 'bg-[#dfd7c7] text-[#c5a059]'
                          : ord.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                      <span className="font-serif text-base font-bold text-[#0c2340]">
                        ${ord.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Cold Chain Tracking Strip */}
                  <div className="bg-[#f6f4ee]/70 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#c5a059] text-[20px]">ac_unit</span>
                      <div>
                        <span className="font-semibold text-[#0c2340] block">Cold-Chain Express Delivery</span>
                        <span className="text-[#5a6b7c] font-mono">
                          Tracking: {ord.trackingNumber || 'Pending fulfillment'}
                        </span>
                      </div>
                    </div>

                    {ord.partnerName && (
                      <div className="flex items-center gap-1.5 text-[#c5a059] font-medium">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Attributed Partner: {ord.partnerName}</span>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-[#dfd7c7]/40 text-xs">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={it.imageUrl}
                            alt={it.productName}
                            loading="lazy"
                            className="w-12 h-12 rounded-xl object-cover bg-[#f6f4ee] border border-[#dfd7c7]"
                          />
                          <div>
                            <span className="font-serif font-semibold text-sm text-[#0c2340] block">
                              {it.productName}
                            </span>
                            <span className="text-[#5a6b7c]">
                              {it.selectedStrength.label} • Quantity: {it.quantity}
                            </span>
                          </div>
                        </div>

                        <span className="font-semibold text-[#0c2340]">
                          ${(it.unitPrice * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Destination & Order Actions */}
                  <div className="pt-3 border-t border-[#dfd7c7]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5a6b7c]">
                    <span>
                      Shipping to: {ord.shippingAddress.addressLine1}, {ord.shippingAddress.city}, {ord.shippingAddress.state} {ord.shippingAddress.postalCode}
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      {ord.status === 'PENDING' && (
                        confirmCancelOrderId === ord.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={cancellingOrderId === ord.id}
                              onClick={async () => {
                                setCancellingOrderId(ord.id);
                                setOrderActionNotice(null);
                                try {
                                  await dbService.updateOrderStatus(ord.id, 'CANCELLED');
                                  setOrders((prev) =>
                                    prev.map((o) =>
                                      o.id === ord.id ? { ...o, status: 'CANCELLED' } : o
                                    )
                                  );
                                  setOrderActionNotice({
                                    type: 'success',
                                    text: `Order ${ord.orderNumber} has been cancelled.`
                                  });
                                } catch (err) {
                                  setOrderActionNotice({
                                    type: 'error',
                                    text:
                                      err instanceof Error
                                        ? err.message
                                        : 'Unable to cancel this order right now.'
                                  });
                                } finally {
                                  setCancellingOrderId(null);
                                  setConfirmCancelOrderId(null);
                                }
                              }}
                              className="px-3 py-1 rounded-lg bg-red-600 text-white text-[11px] font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                            >
                              {cancellingOrderId === ord.id ? 'Cancelling...' : 'Confirm Cancel'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmCancelOrderId(null)}
                              className="px-2.5 py-1 rounded-lg border border-[#dfd7c7] text-[#5a6b7c] text-[11px] font-semibold hover:bg-[#f6f4ee] cursor-pointer"
                            >
                              Keep Order
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelOrderId(ord.id)}
                            className="text-red-600 font-semibold hover:underline cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        )
                      )}
                      <button
                        type="button"
                        onClick={() => navigate('shop')}
                        className="text-[#c5a059] font-semibold hover:underline cursor-pointer"
                      >
                        Re-Order Protocol
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Protocols Tab */}
      {activeTab === 'protocols' && (
        <div className="bg-white border border-[#dfd7c7] rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#0c2340]">Saved Protocol Stacks</h3>
            <p className="text-xs text-[#5a6b7c] mt-0.5">
              Bookmark and organize your recurring monthly peptide regimens or wellness routines.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newProtocolTitle.trim()) return;
              const next: SavedProtocolStack[] = [
                ...savedProtocols,
                {
                  id: `prot-${Date.now()}`,
                  title: newProtocolTitle.trim(),
                  description: newProtocolDesc.trim() || 'Custom wellness regimen bookmark',
                  category: newProtocolCategory
                }
              ];
              persistProtocols(next);
              setNewProtocolTitle('');
              setNewProtocolDesc('');
            }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#f6f4ee] border border-[#dfd7c7] rounded-2xl p-4 text-xs"
          >
            <input
              type="text"
              required
              placeholder="Protocol name (e.g. Morning Cellular)"
              value={newProtocolTitle}
              onChange={(e) => setNewProtocolTitle(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
            />
            <input
              type="text"
              placeholder="Formulations included"
              value={newProtocolDesc}
              onChange={(e) => setNewProtocolDesc(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
            />
            <select
              value={newProtocolCategory}
              onChange={(e) => setNewProtocolCategory(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] cursor-pointer"
            >
              <option value="cellular">Cellular Optimization</option>
              <option value="metabolic">Metabolic Support</option>
              <option value="recovery">Tissue Recovery</option>
              <option value="longevity">Longevity &amp; Vitality</option>
              <option value="stacks">Synergy Multi-Kits</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#0c2340] text-white font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
            >
              + Save Protocol
            </button>
          </form>

          {savedProtocols.length === 0 ? (
            <p className="text-xs text-[#5a6b7c] py-4 text-center">
              No saved protocol stacks yet. Use the form above to bookmark a recurring protocol.
            </p>
          ) : (
            <div className="divide-y divide-[#dfd7c7]/50">
              {savedProtocols.map((prot, idx) => (
                <div key={prot.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-sm text-[#0c2340] block">{prot.title}</span>
                    <span className="text-[#5a6b7c]">{prot.description}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        if (idx === 0) return;
                        const copy = [...savedProtocols];
                        [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
                        persistProtocols(copy);
                      }}
                      aria-label="Move protocol up"
                      className="px-2.5 py-1.5 rounded-lg border border-[#dfd7c7] text-[#5a6b7c] hover:text-[#0c2340] disabled:opacity-40 cursor-pointer"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={idx === savedProtocols.length - 1}
                      onClick={() => {
                        if (idx === savedProtocols.length - 1) return;
                        const copy = [...savedProtocols];
                        [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
                        persistProtocols(copy);
                      }}
                      aria-label="Move protocol down"
                      className="px-2.5 py-1.5 rounded-lg border border-[#dfd7c7] text-[#5a6b7c] hover:text-[#0c2340] disabled:opacity-40 cursor-pointer"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => persistProtocols(savedProtocols.filter((p) => p.id !== prot.id))}
                      className="px-3 py-1.5 rounded-lg border border-[#dfd7c7] text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('shop', prot.category)}
                      className="px-4 py-2 rounded-xl bg-[#c5a059] text-white font-semibold hover:bg-[#0c2340] transition-colors cursor-pointer"
                    >
                      Order Protocol
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile & Security Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!profileName.trim()) return;
              setSavingProfile(true);
              setProfileStatus(null);
              try {
                await updateCurrentUserProfile({
                  displayName: profileName.trim(),
                  phone: profilePhone.trim()
                });
                setProfileStatus({ type: 'success', text: 'Your profile details have been updated.' });
              } catch (err) {
                setProfileStatus({
                  type: 'error',
                  text: err instanceof Error ? err.message : 'Unable to save profile details.'
                });
              } finally {
                setSavingProfile(false);
              }
            }}
            className="bg-white border border-[#dfd7c7] rounded-3xl p-6 sm:p-8 space-y-6 text-xs"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#dfd7c7]/60">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#0c2340]">
                  Client Profile &amp; Clinical Information
                </h3>
                <p className="text-[#5a6b7c] mt-0.5">Secure client account details and role permissions</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#c5a059]/15 text-[#c5a059] font-bold">
                {role}
              </span>
            </div>

            {profileStatus && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  profileStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {profileStatus.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[#5a6b7c] block mb-1 font-medium">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                />
              </div>
              <div>
                <label className="text-[#5a6b7c] block mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || 'member@wholeharbor.com'}
                  className="w-full px-3 py-2 rounded-lg bg-[#f6f4ee] border border-[#dfd7c7] text-[#5a6b7c]"
                />
              </div>
              <div>
                <label className="text-[#5a6b7c] block mb-1 font-medium">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                />
              </div>
              {currentUser?.businessName && (
                <div>
                  <label className="text-[#5a6b7c] block mb-1 font-medium">Organization / Studio</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.businessName}
                    className="w-full px-3 py-2 rounded-lg bg-[#f6f4ee] border border-[#dfd7c7] text-[#5a6b7c]"
                  />
                </div>
              )}
              <div className={currentUser?.businessName ? 'sm:col-span-2' : ''}>
                <label className="text-[#5a6b7c] block mb-1 font-medium">Wholesale 10-Vial Kit Status</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f6f4ee] border border-[#dfd7c7]">
                  <span className={`w-2 h-2 rounded-full ${
                    currentUser?.wholesaleApprovalStatus === 'APPROVED' ? 'bg-emerald-500' :
                    currentUser?.wholesaleApprovalStatus === 'PENDING' ? 'bg-amber-500' : 'bg-gray-400'
                  }`}></span>
                  <span className="font-semibold text-[#0c2340]">
                    {currentUser?.wholesaleApprovalStatus === 'APPROVED'
                      ? 'Approved Wholesale Partner'
                      : currentUser?.wholesaleApprovalStatus === 'PENDING'
                      ? 'Under WHW Review'
                      : 'Retail Individual Buyer (Wholesale Gated)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-xl bg-[#0c2340] text-white font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Details'}
              </button>
            </div>
          </form>

          {/* Clinical Process & Security Standards (Per PDF: Appointments/Clinical Process & Security) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#dfd7c7] rounded-3xl p-6 space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c5a059] text-[20px]">medical_services</span>
                <h4 className="font-serif text-base font-bold text-[#0c2340]">Clinical Process &amp; Intake</h4>
              </div>
              <p className="text-[#5a6b7c] leading-relaxed">
                Health screening and physician oversight are maintained through compliant medical systems without duplicating regulated clinical records on the public site.
              </p>
              <div className="p-3 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-1">
                <div className="flex items-center justify-between font-semibold text-[#0c2340]">
                  <span>Prescription Eligibility</span>
                  <span className="text-emerald-700">Active</span>
                </div>
                <p className="text-[11px] text-[#5a6b7c]">Compounded formulations dispensed via licensed 503A/503B partner pharmacies.</p>
              </div>
            </div>

            <div className="bg-white border border-[#dfd7c7] rounded-3xl p-6 space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c5a059] text-[20px]">security</span>
                <h4 className="font-serif text-base font-bold text-[#0c2340]">Account Security &amp; Password Management</h4>
              </div>
              <div className="space-y-2 text-[#5a6b7c]">
                <div className="flex items-center justify-between py-1 border-b border-[#dfd7c7]/40">
                  <span>SSL / HTTPS Session</span>
                  <span className="font-mono text-emerald-700 font-semibold">TLS 1.3 Active</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#dfd7c7]/40">
                  <span>Role-Based Access (RBAC)</span>
                  <span className="font-semibold text-[#0c2340]">{role}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Two-Factor Authentication</span>
                  <span className="font-semibold text-[#c5a059]">
                    {currentUser?.mfaEnabled ? 'Enabled' : 'Standard'}
                  </span>
                </div>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPwdStatus(null);
                  if (newPassword !== confirmPassword) {
                    setPwdStatus({ type: 'error', text: 'New password and confirmation do not match.' });
                    return;
                  }
                  setSavingPwd(true);
                  try {
                    const res = await changePassword(currentPassword, newPassword);
                    if (!res.success) {
                      setPwdStatus({ type: 'error', text: res.error || 'Unable to update password.' });
                    } else {
                      setPwdStatus({ type: 'success', text: res.message || 'Password updated.' });
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }
                  } finally {
                    setSavingPwd(false);
                  }
                }}
                className="pt-3 border-t border-[#dfd7c7]/60 space-y-3"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c2340] block">
                  Update Account Password
                </span>
                {pwdStatus && (
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] ${
                      pwdStatus.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {pwdStatus.text}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="password"
                    required
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340]"
                  />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="New password (min 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340]"
                  />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingPwd}
                  className="px-4 py-2 rounded-xl bg-[#0c2340] text-white font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingPwd ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
