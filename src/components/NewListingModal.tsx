import React, { useState } from "react";
import { X, Plus, Radio, Building2, MapPin, Mail, Phone, Cpu, ShieldCheck } from "lucide-react";
import { EquipmentListing, EquipmentCategory, ConditionGrade, ListingType } from "../types";

interface NewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddListing: (listing: EquipmentListing) => void;
}

export const NewListingModal: React.FC<NewListingModalProps> = ({ isOpen, onClose, onAddListing }) => {
  const [type, setType] = useState<ListingType>("WTB");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EquipmentCategory>("Precision Optics & Lasers");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(2022);
  const [priceTarget, setPriceTarget] = useState<number>(45000);
  const [condition, setCondition] = useState<ConditionGrade>("Working / Tested");
  const [description, setDescription] = useState("");
  const [entityName, setEntityName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");
  const [specs, setSpecs] = useState<Record<string, string>>({
    "Operating Status": "Powered & tested",
    "Availability": "Immediate crating",
  });

  if (!isOpen) return null;

  const handleAddSpec = () => {
    if (!specKey.trim() || !specVal.trim()) return;
    setSpecs((prev) => ({ ...prev, [specKey]: specVal }));
    setSpecKey("");
    setSpecVal("");
  };

  const handleRemoveSpec = (k: string) => {
    setSpecs((prev) => {
      const copy = { ...prev };
      delete copy[k];
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !make.trim() || !model.trim()) return;

    const newListing: EquipmentListing = {
      id: `${type.toLowerCase()}-user-${Date.now()}`,
      type,
      title,
      category: category as Exclude<EquipmentCategory, "All">,
      make,
      model,
      year,
      priceTarget,
      currency: "USD",
      marketCompAverage: Math.round(priceTarget * 1.12),
      condition,
      specs,
      description: description || `${type} listing for ${make} ${model} submitted directly to NormsExchange.`,
      urgencyOrAvailability: "Within 14 Days",
      contact: {
        entityName: entityName || "Direct Submitter Entity",
        contactPerson: contactPerson || "Lead Contact",
        email: email || "contact@normsexchange-direct.io",
        phone: phone || "+1 (555) 019-2831",
        location: location || "North America",
        sourceDomain: "normsexchange.com",
        sourceUrl: "https://normsexchange.com",
        inferenceConfidence: 99,
        inferenceMethod: "Direct Web Crawl",
        verifiedStatus: "Verified",
        notes: "Direct user submission on NormsExchange Gemini node."
      },
      tags: [make, category, type],
      discoveredAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      status: "Active",
      githubIndexRef: `normsexchange-gemini/catalog/${category.toLowerCase().replace(/[^a-z0-9]/g, "-")}/${make.toLowerCase()}-${model.toLowerCase()}.json`
    };

    onAddListing(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 md:p-8 space-y-5 my-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-white">Post New Equipment Listing / Demand</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Register a WTB buyer demand or WTS equipment asset into the NormsExchange catalog.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("WTB")}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                type === "WTB"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800"
              }`}
            >
              ● WTB (BUY DEMAND)
            </button>
            <button
              type="button"
              onClick={() => setType("WTS")}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                type === "WTS"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800"
              }`}
            >
              ● WTS (SUPPLY / ASSET)
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-400 mb-1">Listing Headline / Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. WTB: Coherent Monaco 1035nm Femtosecond Laser"
              className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white font-sans text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Make, Model, Year, Category */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Make</label>
              <input
                type="text"
                required
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Coherent"
                className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Model</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Monaco 1035"
                className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Price ($ USD)</label>
              <input
                type="number"
                required
                value={priceTarget}
                onChange={(e) => setPriceTarget(Number(e.target.value))}
                className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white font-bold text-emerald-400"
              />
            </div>
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white"
              >
                <option value="Precision Optics & Lasers">Precision Optics & Lasers</option>
                <option value="Semiconductor & Cleanroom">Semiconductor & Cleanroom</option>
                <option value="Industrial CNC & Machining">Industrial CNC & Machining</option>
                <option value="Lab & Metrology Testing">Lab & Metrology Testing</option>
                <option value="High-Voltage & Power Systems">High-Voltage & Power Systems</option>
                <option value="Automation & Robotics">Automation & Robotics</option>
                <option value="Aerospace & Avionics Surplus">Aerospace & Avionics Surplus</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ConditionGrade)}
                className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white"
              >
                <option value="New / Unopened (NOS)">New / Unopened (NOS)</option>
                <option value="Refurbished / Calibrated">Refurbished / Calibrated</option>
                <option value="Working / Tested">Working / Tested</option>
                <option value="Untested / As-Is">Untested / As-Is</option>
                <option value="Parts / Core">Parts / Core</option>
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 space-y-2">
            <span className="text-slate-400 font-bold block mb-1 uppercase">Contact & Entity Dossier</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Entity / Company Name"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="rounded border border-slate-800 bg-slate-900 p-2 text-white"
              />
              <input
                type="email"
                placeholder="Contact Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded border border-slate-800 bg-slate-900 p-2 text-white"
              />
              <input
                type="text"
                placeholder="Location (e.g. Dresden, Germany)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded border border-slate-800 bg-slate-900 p-2 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 rounded bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2 font-bold text-slate-950 shadow-md hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              <span>Post to Exchange</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
