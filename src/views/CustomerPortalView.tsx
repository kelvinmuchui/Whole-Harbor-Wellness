import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { dbService } from '../services/dbService.ts';
import { Order } from '../types/index.ts';

interface CustomerPortalViewProps {
  navigate: (path: string, param?: string) => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({ navigate }) => {
  const { currentUser, role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'protocols'>('orders');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const all = await dbService.getOrders();
        // Show orders matching user email or show all demo orders
        setOrders(all);
      } catch (err) {
        console.error('Failed to load customer orders', err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [currentUser]);

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
          {loading ? (
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
                          Tracking: {ord.trackingNumber || 'WH-EXP-CC-82910482'}
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

                  {/* Shipping Destination */}
                  <div className="pt-3 border-t border-[#dfd7c7]/60 flex items-center justify-between text-xs text-[#5a6b7c]">
                    <span>
                      Shipping to: {ord.shippingAddress.addressLine1}, {ord.shippingAddress.city}, {ord.shippingAddress.state} {ord.shippingAddress.postalCode}
                    </span>
                    <button
                      onClick={() => navigate('shop')}
                      className="text-[#c5a059] font-semibold hover:underline cursor-pointer"
                    >
                      Re-Order Protocol
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Protocols Tab */}
      {activeTab === 'protocols' && (
        <div className="bg-white border border-[#dfd7c7] rounded-3xl p-8 space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#0c2340]">Saved Protocol Stacks</h3>
          <p className="text-xs text-[#5a6b7c]">
            Bookmark your recurring monthly peptide regiments or physician recommendations.
          </p>
          <div className="pt-4 border-t border-[#dfd7c7]/50 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-sm text-[#0c2340] block">Mitochondrial Longevity Duo</span>
              <span className="text-[#5a6b7c]">MOTS-C Activator + NAD+ Cellular Solution</span>
            </div>
            <button
              onClick={() => navigate('shop', 'cellular')}
              className="px-4 py-2 rounded-xl bg-[#c5a059] text-white font-semibold cursor-pointer"
            >
              Order Protocol
            </button>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-[#dfd7c7] rounded-3xl p-8 max-w-2xl space-y-6 text-xs">
          <h3 className="font-serif text-xl font-bold text-[#0c2340]">
            Patient Profile &amp; Preferences
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#5a6b7c] block mb-1">Full Legal Name</label>
              <input
                type="text"
                disabled
                value={currentUser?.displayName || 'Dr. Arthur Vance'}
                className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340]"
              />
            </div>
            <div>
              <label className="text-[#5a6b7c] block mb-1">Account Role</label>
              <input
                type="text"
                disabled
                value={role}
                className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#c5a059] font-semibold"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[#5a6b7c] block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser?.email || 'arthur.vance@example.com'}
                className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340]"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
