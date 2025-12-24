
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, X, Search, Bell, User, ChevronRight, LogOut, 
  Trash2, Plus, Minus, CreditCard, Printer, CheckCircle, 
  ChevronLeft, Smartphone, Laptop, Settings as SettingsIcon, 
  Clock, Filter, Edit, Eye, Download, Users, Package, 
  TrendingUp, TrendingDown, DollarSign, Calendar, MapPin, 
  Tag, Info, PlusCircle, AlertTriangle, Layers, Truck, FileText,
  ShoppingCart, Wallet, LayoutDashboard, BookOpen, Trash, UserPlus, Shield, ArrowLeft,
  List, Coffee, Home, MoreVertical, Upload, Camera, Check, Building2, Key, EyeOff,
  Flame, History, SlidersHorizontal, Receipt, BadgeCent, Warehouse, Percent, Banknote,
  UserCircle, BarChart3, PieChart as PieChartIcon, ImageIcon, Lock, ExternalLink, HandCoins, Star, ShieldCheck, ShieldAlert, Sparkles, BrainCircuit, Loader2, Database, Save, UploadCloud, RefreshCcw, Coins, Ticket
} from 'lucide-react';
import { 
  NAV_ITEMS, 
  DEFAULT_SETTINGS, 
  MOCK_MENU_ITEMS, 
  MOCK_BRANCHES, 
  INITIAL_CATEGORIES,
  MOCK_ADDONS
} from './constants';
import { 
  Role, 
  BranchType, 
  OrderStatus, 
  PaymentMethod, 
  MenuItem, 
  Order, 
  OrderItem, 
  AddOn,
  Variant,
  AccountingEntry,
  RawMaterial,
  Supplier,
  WastageEntry,
  User as UserType,
  Category,
  Branch,
  BranchPriceOverride,
  WithdrawalRequest,
  Notification,
  Customer
} from './types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- Utility: Filter Logic ---
const filterOrdersByCriteria = (orders: Order[], branchId: string, frequency: string, startDate: string, endDate: string) => {
  return (orders || []).filter((order) => {
    if (branchId !== 'ALL' && order.branchId !== branchId) return false;
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    if (frequency === 'DAILY') {
      if (orderDate.toDateString() !== now.toDateString()) return false;
    } else if (frequency === 'WEEKLY') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      if (orderDate < lastWeek) return false;
    } else if (frequency === 'MONTHLY') {
      if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) return false;
    } else if (frequency === 'YEARLY') {
      if (orderDate.getFullYear() !== now.getFullYear()) return false;
    } else if (frequency === 'CUSTOM') {
      if (startDate && orderDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }
    }
    return true;
  });
};

// --- Utility: Image Resizer ---
const resizeImage = (file: File, maxWidth = 800, maxHeight = 600): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    };
  });
};

// --- Persistent State Helpers ---
const usePersistentState = (key: string, initialValue: any) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {}
  }, [key, state]);
  return [state, setState];
};

// --- AI: Dashboard Insights Module ---
const AIDashboardInsights = ({ stats, settings, branches }: any) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this POS data: Revenue ${settings.currencySymbol}${stats.totalSales}, Orders ${stats.totalOrders}. Provide 3 short business growth tips.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setInsight(response.text || "Insight unavailable.");
    } catch (err) {
      setInsight("AI connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700"><BrainCircuit size={120} /></div>
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md"><Sparkles size={24} className="text-blue-300" /></div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-200">AI Intelligence Core</h4>
            <p className="text-lg font-black tracking-tight">Enterprise Strategy Analyst</p>
          </div>
        </div>
        {insight ? (
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 animate-in fade-in zoom-in">
            <div className="text-sm font-medium leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: insight }} />
            <button onClick={() => setInsight(null)} className="mt-6 text-[10px] font-black uppercase tracking-widest text-blue-300 hover:text-white transition-colors">← Refresh</button>
          </div>
        ) : (
          <button onClick={generateInsight} disabled={loading} className="flex items-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Generate Strategic Insight
          </button>
        )}
      </div>
    </div>
  );
};

// --- Authentication: Login View ---
const LoginView = ({ onLogin, staff }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = staff.find((u: any) => u.username === username && u.password === password);
    if (user) onLogin(user);
    else setError('Invalid credentials');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-8 border border-gray-100">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-xl mb-6"><Lock size={32} /></div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Enterprise POS</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Terminal Access</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-4 bg-rose-50 text-rose-600 text-xs font-black rounded-2xl animate-pulse">{error}</div>}
          <input type="text" className="w-full p-4 bg-gray-50 border-none rounded-[1.5rem] font-bold text-sm focus:ring-4 focus:ring-blue-50 outline-none" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" className="w-full p-4 bg-gray-50 border-none rounded-[1.5rem] font-bold text-sm focus:ring-4 focus:ring-blue-50 outline-none" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-[1.5rem] shadow-xl text-sm uppercase tracking-widest hover:bg-blue-700">Open Terminal</button>
        </form>
      </div>
    </div>
  );
};

// --- Shared Component: GlobalFilterBar ---
const GlobalFilterBar = ({ branches, filterBranchId, setFilterBranchId, filterFrequency, setFilterFrequency, startDate, setStartDate, endDate, setEndDate }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-wrap items-end gap-4">
    <div className="space-y-1.5 flex-1 min-w-[150px]">
      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Branch</label>
      <select value={filterBranchId} onChange={e => setFilterBranchId(e.target.value)} className="w-full bg-gray-50 text-gray-700 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none">
        <option value="ALL">All Nodes</option>
        {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
    </div>
    <div className="space-y-1.5 flex-1 min-w-[150px]">
      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Frequency</label>
      <select value={filterFrequency} onChange={e => setFilterFrequency(e.target.value)} className="w-full bg-gray-50 text-gray-700 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none">
        <option value="DAILY">Daily</option>
        <option value="WEEKLY">Weekly</option>
        <option value="MONTHLY">Monthly</option>
        <option value="ALL_TIME">All Time</option>
        <option value="CUSTOM">Custom Range</option>
      </select>
    </div>
    {filterFrequency === 'CUSTOM' && (
      <>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-gray-50 border-gray-100 rounded-xl px-3 py-2 text-xs font-bold" />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-gray-50 border-gray-100 rounded-xl px-3 py-2 text-xs font-bold" />
      </>
    )}
  </div>
);

// --- Module: Dashboard View ---
const DashboardView = ({ orders, settings, branches, currentUser }: any) => {
  const [fBranch, setFBranch] = useState('ALL');
  const [fFreq, setFFreq] = useState('DAILY');
  const [sDate, setSDate] = useState('');
  const [eDate, setEDate] = useState('');

  const stats = useMemo(() => {
    const filtered = filterOrdersByCriteria(orders, fBranch, fFreq, sDate, eDate);
    const totalSales = filtered.filter(o => o.status !== OrderStatus.CANCELLED).reduce((acc, o) => acc + o.total, 0);
    return { totalSales, totalOrders: filtered.length, filtered };
  }, [orders, fBranch, fFreq, sDate, eDate]);

  return (
    <div className="p-4 lg:p-8 space-y-8 h-full overflow-y-auto pb-32 no-scrollbar bg-gray-50/20">
      <GlobalFilterBar branches={branches} filterBranchId={fBranch} setFilterBranchId={setFBranch} filterFrequency={fFreq} setFilterFrequency={setFFreq} startDate={sDate} setStartDate={setSDate} endDate={eDate} setEndDate={setEDate} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner"><DollarSign size={24}/></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</p><p className="text-xl font-black">{settings.currencySymbol}{stats.totalSales.toLocaleString()}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner"><ShoppingCart size={24}/></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders</p><p className="text-xl font-black">{stats.totalOrders}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner"><Users size={24}/></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active nodes</p><p className="text-xl font-black">{branches.length}</p></div>
        </div>
      </div>
      <AIDashboardInsights stats={stats} settings={settings} branches={branches} />
    </div>
  );
};

// --- Module: POS Terminal ---
const POSView = ({ branch, settings, addOrder, categories, menuItems, allAddons, orders, customers, setCustomers }: any) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [addonModal, setAddonModal] = useState<any>(null);
  
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [vatPercent, setVatPercent] = useState(settings.vatPercentage || 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  
  // Loyalty & Promo Logic
  const [usePoints, setUsePoints] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  const matchedCustomer = useMemo(() => customers.find((c: Customer) => c.phone === customerInfo.phone), [customerInfo.phone, customers]);

  useEffect(() => { if (matchedCustomer) setCustomerInfo(p => ({ ...p, name: matchedCustomer.name })); }, [matchedCustomer]);

  const filteredItems = useMemo(() => menuItems.filter((item: MenuItem) => 
    item.allowedBranchIds.includes(branch.id) && (selectedCategory === 'All' || item.category === selectedCategory) &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [menuItems, selectedCategory, searchQuery, branch.id]);

  const subtotal = cart.reduce((acc, item) => acc + ((item.unitPrice + item.addOns.reduce((a, b) => a + b.price, 0)) * item.quantity), 0);
  const vatAmount = (subtotal * vatPercent) / 100;
  
  // Point rules: min 30 balance, max 30% of points per tx
  const canRedeem = matchedCustomer && matchedCustomer.points >= 30;
  const maxRedeemablePoints = canRedeem ? Math.floor(matchedCustomer.points * 0.3) : 0;
  const pointsToRedeem = usePoints ? Math.min(maxRedeemablePoints, Math.floor(subtotal / settings.pointsRedeemRate)) : 0;
  const pointsCashValue = pointsToRedeem * settings.pointsRedeemRate;
  
  const total = Math.max(0, subtotal + vatAmount - pointsCashValue - promoDiscount);

  const verifyPromo = () => {
    const code = promoCode.toUpperCase();
    if (code === 'SAVE10') setPromoDiscount(subtotal * 0.1);
    else if (code === 'WELCOME50') setPromoDiscount(50);
    else { setPromoDiscount(0); alert('Invalid Promo Code'); }
  };

  const onMenuItemClick = (item: MenuItem) => {
    const addons = allAddons.filter((a: AddOn) => item.addOns?.includes(a.id));
    if (addons.length > 0) {
      setAddonModal({ item, addons, onSelect: (sel: AddOn[]) => { addToCart(item, sel); setAddonModal(null); } });
    } else addToCart(item, []);
  };

  const addToCart = (item: MenuItem, sel: AddOn[]) => {
    const price = item.branchPrices?.find(bp => bp.branchId === branch.id)?.price || item.price;
    const existing = cart.find(c => c.menuItemId === item.id && JSON.stringify(c.addOns.map(a => a.id).sort()) === JSON.stringify(sel.map(a => a.id).sort()));
    if (existing) setCart(cart.map(c => c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c));
    else setCart([...cart, { id: `${item.id}-${Date.now()}`, menuItemId: item.id, name: item.name, quantity: 1, unitPrice: price, addOns: sel }]);
  };

  const handleCheckout = () => {
    const pointsEarned = Math.floor(total / settings.pointsEarnRate);
    addOrder({
      id: `ORD-${Date.now()}`, branchId: branch.id, items: cart, subtotal, vat: vatAmount, discount: pointsCashValue + promoDiscount, total,
      status: OrderStatus.PENDING, paymentMethod, createdAt: Date.now(), userId: 'admin-1', customerName: customerInfo.name, customerPhone: customerInfo.phone
    });

    if (customerInfo.phone) {
      const idx = customers.findIndex((c: Customer) => c.phone === customerInfo.phone);
      if (idx > -1) {
        const updated = [...customers];
        updated[idx] = { ...updated[idx], points: updated[idx].points - pointsToRedeem + pointsEarned, totalSpend: updated[idx].totalSpend + total, totalOrders: updated[idx].totalOrders + 1 };
        setCustomers(updated);
      } else {
        // Registration bonus: 10 points
        setCustomers([...customers, { id: `cust-${Date.now()}`, name: customerInfo.name || 'Guest', phone: customerInfo.phone, points: 10 + pointsEarned, totalSpend: total, totalOrders: 1, createdAt: Date.now() }]);
      }
    }
    setCart([]); setIsCheckoutModalOpen(false); setCustomerInfo({ name: '', phone: '' }); setUsePoints(false); setPromoDiscount(0); setPromoCode('');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-gray-50 relative">
      <div className="flex-1 flex flex-col min-w-0 bg-white lg:border-r h-full overflow-hidden">
        <div className="p-4 flex flex-col gap-4 border-b shrink-0 z-10">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
            <Search size={16} className="text-gray-400"/><input type="text" placeholder="Search menu..." className="bg-transparent outline-none w-full text-xs font-bold" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setSelectedCategory('All')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black border ${selectedCategory === 'All' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500'}`}>All</button>
            {categories.map((cat: any) => <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black border ${selectedCategory === cat.name ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500'}`}>{cat.name}</button>)}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 no-scrollbar pb-40">
          {filteredItems.map((item: MenuItem) => (
            <button key={item.id} onClick={() => onMenuItemClick(item)} className="bg-white border border-gray-100 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col text-left active:scale-[0.98]">
              <div className="aspect-square bg-gray-100 relative overflow-hidden"><img src={item.image} className="w-full h-full object-cover" alt={item.name} /></div>
              <div className="p-3"><h4 className="font-black text-[11px] line-clamp-1">{item.name}</h4><p className="text-[10px] font-black text-blue-600 mt-1">{settings.currencySymbol}{item.price}</p></div>
            </button>
          ))}
        </div>
      </div>
      <div className="lg:w-96 bg-white border-l h-full flex flex-col z-20 shadow-2xl lg:shadow-none">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><ShoppingCart size={14} className="text-blue-600"/> Cart</h2>
          <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">{cart.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <div className="flex-1 pr-2"><h4 className="text-[10px] font-black">{item.name}</h4><p className="text-[9px] text-blue-600 font-bold">{settings.currencySymbol}{(item.unitPrice + item.addOns.reduce((a,b)=>a+b.price, 0))}</p></div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gray-50 rounded-lg p-0.5">
                    <button onClick={() => setCart(cart.map(c => c.id === item.id ? {...c, quantity: Math.max(1, c.quantity - 1)} : c))} className="p-1"><Minus size={10}/></button>
                    <span className="text-[10px] font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => setCart(cart.map(c => c.id === item.id ? {...c, quantity: c.quantity + 1} : c))} className="p-1"><Plus size={10}/></button>
                  </div>
                  <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-rose-400"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t bg-white space-y-3">
          <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
            <span>Payable Total</span><span className="text-gray-900 text-lg leading-none font-black">{settings.currencySymbol}{total.toFixed(0)}</span>
          </div>
          <button disabled={cart.length === 0} onClick={() => setIsCheckoutModalOpen(true)} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl disabled:opacity-50 text-[11px] tracking-[0.15em] uppercase transition-all">Review Settlement</button>
        </div>
      </div>
      {addonModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAddonModal(null)} />
          <div className="bg-white rounded-[2rem] w-full max-w-sm relative z-10 p-8 space-y-6 shadow-2xl animate-in zoom-in">
            <h3 className="text-xl font-black text-center">{addonModal.item.name}</h3>
            <div className="space-y-2">
              {addonModal.addons.map((a: AddOn) => (
                <button key={a.id} onClick={() => alert('Feature coming soon: Selective addon toggle in modal')} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold">{a.name}</span><span className="text-[10px] font-black text-blue-600">+{settings.currencySymbol}{a.price}</span>
                </button>
              ))}
            </div>
            <button onClick={() => addonModal.onSelect([])} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Add to Bag</button>
          </div>
        </div>
      )}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsCheckoutModalOpen(false)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 p-8 space-y-6 shadow-2xl animate-in zoom-in border border-gray-100 max-h-[95vh] overflow-y-auto no-scrollbar">
             <div className="flex justify-between items-center"><h3 className="text-xl font-black uppercase tracking-widest">Settlement</h3><button onClick={() => setIsCheckoutModalOpen(false)}><X size={20}/></button></div>
             <div className="grid grid-cols-2 gap-3">
               <input type="text" className="w-full p-4 bg-gray-50 border-none rounded-xl font-bold text-xs" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} placeholder="Phone (01XXX...)"/>
               <input type="text" className="w-full p-4 bg-gray-50 border-none rounded-xl font-bold text-xs" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} placeholder="Guest Name"/>
             </div>
             {matchedCustomer && (
               <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center"><Coins size={20}/></div>
                   <div><p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Loyalty</p><p className="text-xs font-black text-gray-900">{matchedCustomer.points.toFixed(0)} Pts ({canRedeem ? `Max ${maxRedeemablePoints} useable` : 'Min 30 pts needed'})</p></div>
                 </div>
                 <button onClick={() => setUsePoints(!usePoints)} disabled={!canRedeem} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${usePoints ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-200'} disabled:opacity-30`}>{usePoints ? 'Applied' : 'Redeem'}</button>
               </div>
             )}
             <div className="space-y-1.5">
               <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Promo Code</label>
               <div className="flex gap-2">
                 <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-3 py-0.5 border border-gray-100"><Ticket size={14} className="text-gray-400 mr-2"/><input type="text" className="w-full py-3 bg-transparent outline-none font-black text-xs uppercase" value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="SAVE10 / WELCOME50"/></div>
                 <button onClick={verifyPromo} className="px-4 py-2 bg-gray-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95">Verify</button>
               </div>
             </div>
             <div className="p-5 bg-gray-900 rounded-[1.8rem] space-y-2 shadow-xl">
               <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest"><span>Subtotal</span><span className="text-gray-300">{settings.currencySymbol}{subtotal.toLocaleString()}</span></div>
               {usePoints && pointsCashValue > 0 && <div className="flex justify-between text-[10px] font-bold text-blue-400 uppercase tracking-widest"><span>Loyalty Discount</span><span>-{settings.currencySymbol}{pointsCashValue}</span></div>}
               {promoDiscount > 0 && <div className="flex justify-between text-[10px] font-bold text-purple-400 uppercase tracking-widest"><span>Promo Discount</span><span>-{settings.currencySymbol}{promoDiscount.toFixed(0)}</span></div>}
               <div className="flex justify-between text-lg font-black text-white uppercase tracking-tight pt-2 border-t border-white/10 mt-1"><span>Total</span><span className="text-blue-400">{settings.currencySymbol}{total.toFixed(0)}</span></div>
             </div>
             <button onClick={handleCheckout} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-2xl text-[10px] uppercase tracking-widest active:scale-95">Complete Order</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Module: Customers View ---
const CustomersView = ({ settings, customers, setCustomers }: any) => {
  const [modal, setModal] = useState<any>(null);

  const saveCust = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    if (modal.data) setCustomers(customers.map((c: any) => c.id === modal.data.id ? { ...c, name, phone } : c));
    else setCustomers([...customers, { id: `cust-${Date.now()}`, name, phone, points: 10, totalSpend: 0, totalOrders: 0, createdAt: Date.now() }]);
    setModal(null);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 h-full overflow-y-auto pb-32 no-scrollbar bg-gray-50/20">
      <div className="flex justify-between items-center"><h3 className="text-xl md:text-2xl font-black uppercase tracking-widest">Loyalty Registry</h3><button onClick={() => setModal({ type: 'add', data: null })} className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl"><UserPlus size={20}/></button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {customers.map((c: Customer) => (
          <div key={c.id} className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-6 relative group overflow-hidden">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-[1.5rem] bg-blue-50 text-blue-600 flex items-center justify-center font-black text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">{c.name.charAt(0)}</div>
              <div><h4 className="text-lg font-black text-gray-900 truncate tracking-tight">{c.name}</h4><p className="text-xs font-bold text-gray-400 mt-1">{c.phone}</p></div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex gap-1"><button onClick={() => setModal({ type: 'edit', data: c })} className="p-2 bg-gray-50 text-blue-600 rounded-lg"><Edit size={14}/></button></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-2xl text-center"><p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Points</p><p className="text-xs font-black text-blue-600">{c.points.toFixed(0)}</p></div>
              <div className="bg-gray-50 p-3 rounded-2xl text-center"><p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Orders</p><p className="text-xs font-black text-gray-800">{c.totalOrders}</p></div>
              <div className="bg-gray-50 p-3 rounded-2xl text-center"><p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Spend</p><p className="text-xs font-black text-emerald-600">{settings.currencySymbol}{c.totalSpend.toFixed(0)}</p></div>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(null)} />
          <form onSubmit={saveCust} className="bg-white rounded-[2.5rem] w-full max-w-md relative z-10 p-8 space-y-4 shadow-2xl border border-gray-100">
             <h3 className="text-xl font-black uppercase tracking-widest">{modal.type === 'edit' ? 'Update Profile' : 'New Registration'}</h3>
             <input name="name" type="text" placeholder="Guest Name" defaultValue={modal.data?.name} className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50" required />
             <input name="phone" type="text" placeholder="01XXX..." defaultValue={modal.data?.phone} className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50" required />
             {!modal.data && <p className="text-[8px] font-bold text-blue-600 uppercase ml-4 tracking-widest">+ 10 points bonus will be awarded on registration</p>}
             <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl">Settle Profile</button>
          </form>
        </div>
      )}
    </div>
  );
};

// --- Module: Sidebar ---
const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, settings, currentUser, onLogout }: any) => (
  <>
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}/>
    <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-100 z-50 transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
      <div className="p-8 shrink-0 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Flame size={20} fill="currentColor" /></div>
        <div><h1 className="text-sm font-black tracking-tighter leading-none">{settings.appName}</h1><p className="text-[8px] font-black text-blue-600 uppercase mt-1">Enterprise Core</p></div>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}>
            {item.icon}<span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-50 shrink-0"><button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all"><LogOut size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span></button></div>
    </aside>
  </>
);

// --- Module: Header ---
const Header = ({ title, toggleSidebar, activeBranch, branches, currentUser }: any) => (
  <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
    <div className="flex items-center gap-4">
      <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-500"><Menu size={24} /></button>
      <div><h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter leading-none">{title}</h2><p className="text-[8px] font-black text-gray-400 uppercase mt-1">Sync: Active</p></div>
    </div>
    <div className="flex items-center gap-3 md:gap-6">
      <div className="hidden sm:flex items-center bg-gray-50 rounded-2xl px-3 py-1.5 border border-gray-100"><Building2 size={16} className="text-gray-400 mr-2" /><span className="text-[10px] font-black uppercase text-gray-700">{activeBranch?.name}</span></div>
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-[1rem] bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-inner text-sm">{currentUser.name.charAt(0)}</div>
    </div>
  </header>
);

// --- Main App Controller ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = usePersistentState('app-settings', DEFAULT_SETTINGS);
  const [branches, setBranches] = usePersistentState('app-branches', MOCK_BRANCHES);
  const [activeBranch, setActiveBranch] = useState(branches[0]);
  const [orders, setOrders] = usePersistentState('orders-list', []);
  const [withdrawalRequests, setWithdrawalRequests] = usePersistentState('withdrawal-requests', []);
  const [accountingEntries, setAccountingEntries] = usePersistentState('accounting-records', []);
  const [staff, setStaff] = usePersistentState('staff-list', [{ id: 'admin-1', name: 'Super Admin', role: Role.SUPER_ADMIN, assignedBranchIds: ['b1','b2'], username: 'admin', password: 'password', permissions: NAV_ITEMS.map(n => n.id), salary: 50000, advanceLimit: 10000, walletBalance: 0 }]);
  const [categories, setCategories] = usePersistentState('app-categories', INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = usePersistentState('menu-items', MOCK_MENU_ITEMS);
  const [addons, setAddons] = usePersistentState('app-addons', MOCK_ADDONS);
  const [stockItems, setStockItems] = usePersistentState('inventory-stock', []);
  const [notifications, setNotifications] = usePersistentState('app-notifications', []);
  const [customers, setCustomers] = usePersistentState('loyalty-customers', []);
  const [currentUser, setCurrentUser] = usePersistentState('current-user', null);

  const addOrder = (order: Order) => {
    setOrders([order, ...orders]);
    const newEntry: AccountingEntry = { id: `INC-${Date.now()}`, date: Date.now(), description: `Sales - Order #${order.id.split('-')[1]}`, type: 'INCOME', amount: order.total, category: 'Sales', branchId: order.branchId };
    setAccountingEntries((prev: any) => [newEntry, ...prev]);
  };

  const stopImpersonating = () => { setCurrentUser(null); };

  if (!currentUser) return <LoginView onLogin={setCurrentUser} staff={staff} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView orders={orders} settings={settings} branches={branches} currentUser={currentUser} />;
      case 'pos': return <POSView branch={activeBranch} settings={settings} addOrder={addOrder} categories={categories} menuItems={menuItems} allAddons={addons} orders={orders} customers={customers} setCustomers={setCustomers} />;
      case 'customers': return <CustomersView settings={settings} customers={customers} setCustomers={setCustomers} />;
      default: return <div className="p-8 text-gray-400 font-black uppercase text-xs tracking-widest text-center">Module "{activeTab}" is in standard configuration mode.</div>;
    }
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} settings={settings} currentUser={currentUser} onLogout={stopImpersonating} />
      <main className="flex-1 lg:pl-64 flex flex-col h-full relative overflow-hidden">
        <Header title={NAV_ITEMS.find(n => n.id === activeTab)?.label} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} activeBranch={activeBranch} branches={branches} currentUser={currentUser} />
        <div className="flex-1 overflow-hidden relative h-full">{renderContent()}</div>
      </main>
      <style>{`@keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-in { animation-duration: 0.3s; } .zoom-in { animation-name: zoom-in; } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
