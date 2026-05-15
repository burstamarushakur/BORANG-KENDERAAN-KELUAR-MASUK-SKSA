import React, { useState } from 'react';
import { callGasApi } from './lib/api';
import {
  ChevronLeft,
  RefreshCw,
  Search,
  LogOut,
  CheckCircle2,
  User,
  CarFront,
  Users,
  FileText,
  X,
  Clock
} from 'lucide-react';

function InputField({ label, name, required, icon, placeholder, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
        {label} {required && <span className="text-cyan-400">*</span>}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 flex items-center pointer-events-none">
          {icon && React.cloneElement(icon, { className: 'w-5 h-5' })}
        </div>

        <input
          type="text"
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder || ''}
          className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-12 pr-4 py-3 outline-none text-white uppercase transition-all placeholder-slate-600 text-sm font-bold"
        />
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('home');
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    nama_pelawat: '',
    no_kenderaan: '',
    tujuan: '',
    jumpa_siapa: '',
    catatan: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeVisitors, setActiveVisitors] = useState([]);
  const [isLoadingVisitors, setIsLoadingVisitors] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [checkoutSuccessData, setCheckoutSuccessData] = useState(null);

  const toUpper = (value) => String(value || '').toUpperCase();

  const resetMessages = () => {
    setErrorMsg('');
    setCheckoutSuccessData(null);
  };

  const goHome = () => {
    setView('home');
    setSelectedVisitor(null);
    setSearchQuery('');
    resetMessages();
  };

  const goRegister = () => {
    setView('register');
    resetMessages();
  };

  const goCheckout = () => {
    setView('checkout');
    resetMessages();
    loadActiveVisitors();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: toUpper(value)
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const result = await callGasApi('addVisitor', formData);

      if (result && result.success) {
        setSuccessData({
          ...formData,
          masa_masuk: result.data?.masa_masuk || '-'
        });

        setView('register-success');

        setFormData({
          nama_pelawat: '',
          no_kenderaan: '',
          tujuan: '',
          jumpa_siapa: '',
          catatan: ''
        });
      } else {
        setErrorMsg(result?.message || 'Gagal menyimpan rekod.');
      }
    } catch (error) {
      setErrorMsg('Ralat rangkaian. Sila cuba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadActiveVisitors = async () => {
    setIsLoadingVisitors(true);
    setErrorMsg('');

    try {
      const result = await callGasApi('listActiveVisitors', {});

      if (result && result.success) {
        setActiveVisitors(Array.isArray(result.data) ? result.data : []);
      } else {
        setActiveVisitors([]);
        setErrorMsg(result?.message || 'Gagal memuatkan senarai pelawat aktif.');
      }
    } catch (e) {
      setActiveVisitors([]);
      setErrorMsg('Ralat sambungan. Sila cuba lagi.');
    } finally {
      setIsLoadingVisitors(false);
    }
  };

  const handleCheckoutConfirm = async () => {
    if (!selectedVisitor) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const result = await callGasApi('checkoutVisitor', { id: selectedVisitor.id });

      if (result && result.success) {
        setCheckoutSuccessData({
          nama_pelawat: selectedVisitor.nama_pelawat,
          no_kenderaan: selectedVisitor.no_kenderaan,
          masa_keluar: result.data?.masa_keluar || '-'
        });

        setSelectedVisitor(null);
        await loadActiveVisitors();
      } else {
        setErrorMsg(result?.message || 'Gagal mengemaskini rekod keluar.');
      }
    } catch (e) {
      setErrorMsg('Ralat rangkaian. Sila cuba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredList = activeVisitors.filter(v =>
    (v.nama_pelawat || '').toUpperCase().includes(searchQuery.toUpperCase()) ||
    (v.no_kenderaan || '').toUpperCase().includes(searchQuery.toUpperCase()) ||
    (v.tujuan || '').toUpperCase().includes(searchQuery.toUpperCase())
  );

  const renderHomeView = () => (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center space-y-6">
        <div className="inline-block p-4 bg-white rounded-3xl shadow-xl shadow-cyan-900/20">
          <img
            src="https://i.postimg.cc/3RF9M05N/Logo-SKSA.png"
            alt="SKSA Logo"
            className="h-24 w-auto"
          />
        </div>

        <div className="space-y-1">
          <h2 className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">
            Sistem Pengurusan
          </h2>

          <h1 className="text-2xl font-black text-white leading-tight uppercase">
            Borang Keluar Masuk<br />Kenderaan Pelawat
          </h1>

          <p className="text-sm font-medium text-slate-400">
            Sekolah Kebangsaan Sungai Abong
          </p>
        </div>
      </div>

      <div className="grid gap-4 mt-12">
        <button
          onClick={goRegister}
          className="group relative flex items-center justify-between w-full p-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl transition-all shadow-lg shadow-cyan-900/30"
        >
          <div className="text-left">
            <p className="text-xs font-bold opacity-80 uppercase mb-1 tracking-wider">
              Action
            </p>
            <p className="text-xl font-bold uppercase">
              Daftar Masuk
            </p>
          </div>
          <ChevronLeft className="w-8 h-8 opacity-40 rotate-180" />
        </button>

        <button
          onClick={goCheckout}
          className="group relative flex items-center justify-between w-full p-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all shadow-lg shadow-emerald-900/30"
        >
          <div className="text-left">
            <p className="text-xs font-bold opacity-80 uppercase mb-1 tracking-wider">
              Action
            </p>
            <p className="text-xl font-bold uppercase">
              Rekod Keluar
            </p>
          </div>
          <LogOut className="w-8 h-8 opacity-60" />
        </button>

        <div className="pt-8 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 font-mono tracking-tighter">
            APP VERSION 1.0.6 • DIRECT GAS API
          </p>
        </div>
      </div>
    </div>
  );

  const renderRegistrationFormView = () => (
    <div className="flex-1 flex flex-col h-full w-full max-w-sm mx-auto overflow-y-auto py-8">
      <div className="flex items-center justify-between mb-8 cursor-pointer group" onClick={goHome}>
        <button className="text-slate-400 group-hover:text-cyan-400 transition-colors flex items-center text-sm font-bold tracking-widest uppercase">
          <ChevronLeft className="w-5 h-5 mr-1" /> Kembali
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white leading-tight uppercase mb-1">
            Daftar Masuk
          </h2>
          <p className="text-sm font-medium text-slate-400">
            Sila lengkapkan maklumat pelawat.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
            <span className="font-bold uppercase tracking-wider">
              {errorMsg}
            </span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <InputField
            label="Nama Pelawat"
            name="nama_pelawat"
            icon={<User />}
            required
            value={formData.nama_pelawat}
            onChange={handleInputChange}
          />

          <InputField
            label="No Kenderaan"
            name="no_kenderaan"
            icon={<CarFront />}
            required
            value={formData.no_kenderaan}
            onChange={handleInputChange}
          />

          <InputField
            label="Tujuan"
            name="tujuan"
            icon={<FileText />}
            required
            value={formData.tujuan}
            onChange={handleInputChange}
          />

          <InputField
            label="Jumpa Siapa"
            name="jumpa_siapa"
            icon={<Users />}
            required
            value={formData.jumpa_siapa}
            onChange={handleInputChange}
          />

          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
              Catatan (Pilihan)
            </label>
            <textarea
              name="catatan"
              value={formData.catatan}
              onChange={handleInputChange}
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 outline-none text-white transition-all resize-none uppercase text-sm"
              placeholder="MAKLUMAT TAMBAHAN..."
            />
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center space-x-2 uppercase tracking-wide"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>MENYIMPAN...</span>
              </>
            ) : (
              <span>HANTAR REKOD MASUK</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  const renderRegisterSuccessView = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 w-full max-w-sm mx-auto">
      <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <h2 className="text-sm font-bold text-cyan-400 tracking-[0.2em] uppercase mb-2">
          Status Berjaya
        </h2>
        <h1 className="text-2xl font-black text-white uppercase leading-tight">
          REKOD MASUK<br />DISIMPAN
        </h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full text-left space-y-4 shadow-xl">
        <div className="flex flex-col">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">
            Nama
          </span>
          <span className="font-bold text-white text-sm uppercase">
            {successData?.nama_pelawat}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">
            No Kenderaan
          </span>
          <span className="font-bold text-cyan-400 text-lg uppercase">
            {successData?.no_kenderaan}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">
            Masa Masuk
          </span>
          <span className="font-mono text-slate-300 text-xs">
            {successData?.masa_masuk}
          </span>
        </div>
      </div>

      <button
        onClick={goHome}
        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors tracking-widest uppercase text-xs"
      >
        Kembali Ke Laman Utama
      </button>
    </div>
  );

  const renderCheckoutView = () => (
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goHome}
          className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center text-sm font-bold tracking-widest uppercase"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Kembali
        </button>

        <button
          onClick={loadActiveVisitors}
          className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center text-xs font-bold tracking-widest uppercase"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingVisitors ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-black text-white uppercase leading-tight">
          Rekod Keluar
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Pilih nama pelawat dan nombor kenderaan untuk rekod keluar.
        </p>
      </div>

      {checkoutSuccessData && (
        <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-black uppercase tracking-wider text-sm">
                Rekod Keluar Berjaya
              </p>
              <p className="text-xs mt-1 text-emerald-300">
                {checkoutSuccessData.nama_pelawat} · {checkoutSuccessData.no_kenderaan} · Masa keluar: {checkoutSuccessData.masa_keluar}
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
          <span className="font-bold uppercase tracking-wider">
            {errorMsg}
          </span>
        </div>
      )}

      <div className="mb-5 p-4 bg-slate-900 rounded-2xl flex items-center space-x-3 border border-slate-700 shrink-0">
        <Search className="w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(toUpper(e.target.value))}
          placeholder="CARI NO. KENDERAAN / NAMA / TUJUAN..."
          className="bg-transparent text-sm w-full outline-none text-white uppercase placeholder:text-slate-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {isLoadingVisitors ? (
          <div className="text-center py-16 border border-slate-800 border-dashed rounded-2xl">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              Memuatkan senarai pelawat...
            </p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-16 p-4 rounded-2xl border border-slate-800 border-dashed">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">
              Tiada Pelawat Aktif
            </p>
            <p className="text-xs text-slate-600 mt-2">
              Semua pelawat telah keluar atau belum ada rekod masuk.
            </p>
          </div>
        ) : (
          filteredList.map((visitor, idx) => (
            <button
              key={visitor.id || idx}
              type="button"
              onClick={() => setSelectedVisitor(visitor)}
              className="w-full text-left p-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-emerald-500/60 hover:bg-slate-800 transition-all"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 min-w-0">
                  <p className="text-lg font-black text-cyan-400 uppercase font-mono">
                    {visitor.no_kenderaan}
                  </p>
                  <p className="text-sm font-bold text-white uppercase">
                    {visitor.nama_pelawat}
                  </p>
                  <p className="text-xs text-slate-400">
                    Tujuan: <span className="text-slate-300">{visitor.tujuan || '-'}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Jumpa: <span className="text-slate-300">{visitor.jumpa_siapa || '-'}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded uppercase border border-emerald-500/20">
                    MASUK
                  </span>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">
                    {visitor.masa_masuk || '-'}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-slate-950 font-sans text-slate-200 overflow-hidden">
      <div className="h-full w-full flex items-center justify-center p-6 overflow-y-auto">
        {view === 'home' && renderHomeView()}
        {view === 'register' && renderRegistrationFormView()}
        {view === 'register-success' && renderRegisterSuccessView()}
        {view === 'checkout' && renderCheckoutView()}
      </div>

      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col ring-1 ring-white/10">
            <div className="p-8 text-center space-y-2 border-b border-slate-800">
              <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-4">
                <LogOut className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                Pengesahan Keluar
              </h3>

              <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mt-1">
                Sahkan rekod keluar kenderaan
              </p>
            </div>

            <div className="p-6 space-y-4 bg-slate-900">
              <div className="space-y-1">
                <p className="text-lg font-black text-cyan-400 uppercase font-mono">
                  {selectedVisitor.no_kenderaan}
                </p>
                <p className="text-sm font-bold text-white uppercase">
                  {selectedVisitor.nama_pelawat}
                </p>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest block mb-0.5">
                    Tujuan
                  </span>
                  <span className="font-medium text-slate-200 text-xs">
                    {selectedVisitor.tujuan || '-'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest block mb-0.5">
                    Jumpa Siapa
                  </span>
                  <span className="font-medium text-slate-200 text-xs">
                    {selectedVisitor.jumpa_siapa || '-'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest block mb-0.5">
                    Masa Masuk
                  </span>
                  <span className="font-mono text-slate-200 text-xs">
                    {selectedVisitor.masa_masuk || '-'}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="text-red-400 text-xs font-bold uppercase tracking-wider bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="p-6 pt-0 bg-slate-900 space-y-3">
              <button
                disabled={isSubmitting}
                onClick={handleCheckoutConfirm}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/30 tracking-widest uppercase text-xs flex justify-center items-center"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Sahkan Rekod Keluar'
                )}
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => {
                  setSelectedVisitor(null);
                  setErrorMsg('');
                }}
                className="w-full bg-transparent text-slate-400 hover:text-white font-bold py-4 transition-all tracking-widest uppercase text-xs"
              >
                Batal
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedVisitor(null);
                setErrorMsg('');
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
