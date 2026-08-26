import fs from "fs";
import path from "path";

export interface InferredContact {
  entityName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  location: string;
  sourceDomain: string;
  sourceUrl: string;
  inferenceConfidence: number; // 0 - 100%
  inferenceMethod: "Direct Web Crawl" | "Whois / Registry" | "Listing Footer Regex" | "PDF Spec Sheet / Invoice" | "Entity Resolution Model";
  verifiedStatus: "Verified" | "High Confidence" | "Needs Confirmation";
  notes?: string;
}

export interface EquipmentListing {
  id: string;
  type: "WTB" | "WTS" | "MATCH";
  title: string;
  category: string;
  make: string;
  model: string;
  year?: number;
  partNumber?: string;
  serialNumber?: string;
  priceTarget: number;
  currency: string;
  marketCompAverage: number;
  condition: string;
  specs: Record<string, string>;
  description: string;
  urgencyOrAvailability: string;
  contact: InferredContact;
  tags: string[];
  discoveredAt: string;
  lastVerifiedAt: string;
  matchScore?: number;
  matchedWithId?: string;
  marginSpreadEstimate?: number;
  status: "Active" | "Matched" | "Indexed" | "Dispatched to Shopify" | "Archived";
  githubIndexRef?: string;
}

export interface OutboxContractEnvelope {
  protocol: string;
  version: string;
  messageId: string;
  sender: string;
  recipient: string;
  timestamp: string;
  payload: any;
}

export interface MarketDepthItem {
  id: string;
  item: string;
  category: string;
  bidPrice: number;
  askPrice: number;
  spread: number;
  spreadPercent: number;
  wtbVolume: number;
  wtsVolume: number;
  liquidityTier: "High" | "Medium" | "Low";
}

export interface DatabaseSchema {
  version: string;
  lastUpdated: string;
  listings: EquipmentListing[];
  outbox: OutboxContractEnvelope[];
  marketDepth: MarketDepthItem[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "normsexchange_db.json");

// Default initial catalog
const DEFAULT_LISTINGS: EquipmentListing[] = [
  {
    id: "wtb-opt-9021",
    type: "WTB",
    title: "WTB: Coherent Monaco 1035-80-40 Femtosecond Laser System",
    category: "Precision Optics & Lasers",
    make: "Coherent",
    model: "Monaco 1035-80-40",
    year: 2021,
    partNumber: "1198422-01",
    priceTarget: 68000,
    currency: "USD",
    marketCompAverage: 74500,
    condition: "Working / Tested",
    specs: {
      "Wavelength": "1035 nm",
      "Pulse Width": "<250 fs",
      "Average Power": "40 W @ 80 MHz",
      "Repetition Rate": "Single shot to 50 MHz",
      "Cooling": "Closed loop chiller required"
    },
    description: "Urgent need for quantum photonic research lab. Must include controller unit and power supply. Calibration certificate within past 24 months preferred.",
    urgencyOrAvailability: "Immediate",
    contact: {
      entityName: "Photonix Quantum Labs Inc.",
      contactPerson: "Dr. Elena Rostova",
      email: "e.rostova@photonixlabs.io",
      phone: "+1 (617) 555-0194",
      location: "Cambridge, MA, USA",
      sourceDomain: "normsexchange.com",
      sourceUrl: "https://normsexchange.com/listings/wtb-opt-9021",
      inferenceConfidence: 99,
      inferenceMethod: "Direct Web Crawl",
      verifiedStatus: "Verified",
      notes: "Direct verified enterprise buyer registered on NormsExchange."
    },
    tags: ["Femtosecond", "Ultrafast", "Coherent", "Quantum Optics"],
    discoveredAt: "2026-08-24T14:30:00Z",
    lastVerifiedAt: "2026-08-25T21:15:00Z",
    matchScore: 94,
    matchedWithId: "wts-opt-8841",
    marginSpreadEstimate: 6200,
    status: "Active",
    githubIndexRef: "normsexchange-gemini/catalog/optics/coherent-monaco.json"
  },
  {
    id: "wts-opt-8841",
    type: "WTS",
    title: "WTS: 2022 Coherent Monaco 1035-80 (Surplus Cleanroom Decom)",
    category: "Precision Optics & Lasers",
    make: "Coherent",
    model: "Monaco 1035-80-40",
    year: 2022,
    partNumber: "1198422-01",
    priceTarget: 61800,
    currency: "USD",
    marketCompAverage: 74500,
    condition: "Refurbished / Calibrated",
    specs: {
      "Wavelength": "1035 nm",
      "Pulse Width": "240 fs measured",
      "Total Run Hours": "1,420 hrs",
      "Chiller Included": "Yes (Termotek 24V)",
      "Firmware": "v4.18.2"
    },
    description: "Decommissioned from major silicon photonics wafer fab line in Dresden. Fully powered on and tested with fresh beam profiler diagnostics. Crated in OEM Pelican transit cases.",
    urgencyOrAvailability: "Within 14 Days",
    contact: {
      entityName: "Silicon Saxony Equipment Surplus GmbH",
      contactPerson: "Markus Becker (Plant Assets)",
      email: "m.becker@saxony-assetrecover.de",
      phone: "+49 351 8892 4110",
      location: "Dresden, Saxony, Germany",
      sourceDomain: "saxony-assetrecover.de/listing/coh-1035",
      sourceUrl: "https://saxony-assetrecover.de/machinery/surplus-lasers-2026",
      inferenceConfidence: 92,
      inferenceMethod: "PDF Spec Sheet / Invoice",
      verifiedStatus: "Verified",
      notes: "Inferred from de-identified plant liquidation PDF spec sheet metadata & trade registry."
    },
    tags: ["Silicon Saxony", "Photonics", "Crated", "EU Shipping"],
    discoveredAt: "2026-08-25T08:12:00Z",
    lastVerifiedAt: "2026-08-25T22:00:00Z",
    matchScore: 94,
    matchedWithId: "wtb-opt-9021",
    marginSpreadEstimate: 6200,
    status: "Active",
    githubIndexRef: "normsexchange-gemini/catalog/optics/saxony-coherent-8841.json"
  },
  {
    id: "wtb-semi-4091",
    type: "WTB",
    title: "WTB: Keysight B1500A Semiconductor Device Parameter Analyzer",
    category: "Semiconductor & Cleanroom",
    make: "Keysight / Agilent",
    model: "B1500A",
    year: 2020,
    partNumber: "B1500A-001",
    priceTarget: 42000,
    currency: "USD",
    marketCompAverage: 48000,
    condition: "Working / Tested",
    specs: {
      "Installed Modules": "4x HRSMU (B1517A), 1x HPSMU (B1510A)",
      "Mainframe": "10-slot modular mainframe with EasyEXPERT group+ software",
      "Current Measurement": "0.1 fA to 1 A",
      "Voltage Measurement": "0.5 uV to 200 V"
    },
    description: "Seeking clean tested B1500A with high-resolution SMU modules for GaN power transistor characterization.",
    urgencyOrAvailability: "Within 14 Days",
    contact: {
      entityName: "NexGen Power Semi Labs",
      contactPerson: "Dr. James Lin",
      email: "jlin@nexgenpowersemi.com",
      phone: "+1 (408) 555-0812",
      location: "Santa Clara, CA, USA",
      sourceDomain: "normsexchange.com",
      sourceUrl: "https://normsexchange.com/listings/wtb-semi-4091",
      inferenceConfidence: 98,
      inferenceMethod: "Direct Web Crawl",
      verifiedStatus: "Verified",
      notes: "Verified fab equipment purchasing group."
    },
    tags: ["Semiconductor", "SMU", "Keysight", "GaN", "Parameter Analyzer"],
    discoveredAt: "2026-08-23T11:00:00Z",
    lastVerifiedAt: "2026-08-25T19:40:00Z",
    matchScore: 91,
    matchedWithId: "wts-semi-3320",
    marginSpreadEstimate: 4500,
    status: "Active",
    githubIndexRef: "normsexchange-gemini/catalog/semiconductor/keysight-b1500a.json"
  },
  {
    id: "wts-semi-3320",
    type: "WTS",
    title: "WTS: Keysight B1500A Mainframe w/ 4x B1517A HRSMU Modules",
    category: "Semiconductor & Cleanroom",
    make: "Keysight / Agilent",
    model: "B1500A",
    year: 2019,
    partNumber: "B1500A-HRSMU",
    priceTarget: 37500,
    currency: "USD",
    marketCompAverage: 48000,
    condition: "Refurbished / Calibrated",
    specs: {
      "Modules Installed": "4x B1517A High Resolution SMU, 1x B1520A MFCMU",
      "Calibration Date": "June 2026 (NIST Traceable)",
      "OS / Software": "Windows 10 Embedded, EasyEXPERT loaded",
      "Display": "15-inch Touchscreen (mint condition)"
    },
    description: "Certified clean surplus from semiconductor R&D facility consolidation. Self-test passed 100%. Comes with triax cables and calibration certificates.",
    urgencyOrAvailability: "Immediate",
    contact: {
      entityName: "Pacific Test Equipment Asset Recovery",
      contactPerson: "Trevor Vance",
      email: "tvance@pacific-test-surplus.com",
      phone: "+1 (503) 555-0348",
      location: "Hillsboro, OR, USA",
      sourceDomain: "pacific-test-surplus.com",
      sourceUrl: "https://pacific-test-surplus.com/inventory/keysight-b1500a-hrsmu",
      inferenceConfidence: 89,
      inferenceMethod: "Listing Footer Regex",
      verifiedStatus: "High Confidence",
      notes: "Extracted from equipment dealer inventory feed via regex contact inference."
    },
    tags: ["Keysight", "SMU", "Cleanroom", "NIST Calibrated", "Triax"],
    discoveredAt: "2026-08-25T03:15:00Z",
    lastVerifiedAt: "2026-08-25T20:10:00Z",
    matchScore: 91,
    matchedWithId: "wtb-semi-4091",
    marginSpreadEstimate: 4500,
    status: "Active",
    githubIndexRef: "normsexchange-gemini/catalog/semiconductor/pacific-keysight-b1500a.json"
  },
  {
    id: "wtb-cnc-7710",
    type: "WTB",
    title: "WTB: DMG MORI DMU 50 5-Axis CNC Machining Center (Siemens 840D)",
    category: "Industrial CNC & Machining",
    make: "DMG MORI",
    model: "DMU 50 3rd Gen",
    year: 2019,
    partNumber: "DMU50-3RD",
    priceTarget: 145000,
    currency: "USD",
    marketCompAverage: 162000,
    condition: "Working / Tested",
    specs: {
      "Travels (X/Y/Z)": "650 x 520 x 475 mm",
      "Table Size": "630 x 500 mm swivel rotary table",
      "Spindle Speed": "15,000 to 20,000 RPM (speedMASTER)",
      "Control": "CELOS with Siemens 840D sl",
      "Tool Magazine": "60 or 120 positions"
    },
    description: "Looking for 3rd Gen DMU 50 for aerospace turbine blade prototyping. Must have coolant through spindle (TSC) and chip conveyor.",
    urgencyOrAvailability: "Within 14 Days",
    contact: {
      entityName: "AeroPrecision Dynamics LLC",
      contactPerson: "Dave Miller (VP Manufacturing)",
      email: "dave.miller@aeroprecision-dyn.com",
      phone: "+1 (316) 555-0921",
      location: "Wichita, KS, USA",
      sourceDomain: "normsexchange.com",
      sourceUrl: "https://normsexchange.com/listings/wtb-cnc-7710",
      inferenceConfidence: 99,
      inferenceMethod: "Direct Web Crawl",
      verifiedStatus: "Verified",
      notes: "AS9100 certified aerospace manufacturer."
    },
    tags: ["5-Axis", "DMG MORI", "Aerospace", "Siemens CELOS", "Machining"],
    discoveredAt: "2026-08-22T09:00:00Z",
    lastVerifiedAt: "2026-08-25T17:00:00Z",
    matchScore: 88,
    matchedWithId: "wts-cnc-6512",
    marginSpreadEstimate: 16000,
    status: "Active",
    githubIndexRef: "normsexchange-gemini/catalog/cnc/dmg-mori-dmu50.json"
  },
  {
    id: "wts-cnc-6512",
    type: "WTS",
    title: "WTS: 2020 DMG MORI DMU 50 (Low Hours, CELOS, Blum Laser)",
    category: "Industrial CNC & Machining",
    make: "DMG MORI",
    model: "DMU 50 3rd Gen",
    year: 2020,
    partNumber: "DMU50-G3-20",
    priceTarget: 129000,
    currency: "USD",
    marketCompAverage: 162000,
    condition: "Working / Tested",
    specs: {
      "Spindle Hours": "2,180 hrs",
      "Control": "CELOS Siemens 840D sl",
      "Spindle": "20,000 RPM speedMASTER HSK-A63",
      "Coolant": "40 Bar TSC with paper band filter",
      "Probing": "Renishaw OMP60 + Blum Laser tool setter"
    },
    description: "Medical implant manufacturer downsizing production cell. Pristine condition under power, full maintenance records by DMG MORI factory service.",
    urgencyOrAvailability: "Immediate",
    contact: {
      entityName: "MedTech Precision Milling Group",
      contactPerson: "Klaus Von Berg",
      email: "kvonberg@medtech-milling-assets.ch",
      phone: "+41 44 883 1920",
      location: "Zurich / Winterthur, Switzerland",
      sourceDomain: "medtech-milling-assets.ch",
      sourceUrl: "https://medtech-milling-assets.ch/inventory/dmu-50-2020",
      inferenceConfidence: 94,
      inferenceMethod: "Whois / Registry",
      verifiedStatus: "Verified",
      notes: "Verified Swiss corporate registry match with machinery serial records."
    },
    tags: ["Swiss Precision", "Medical", "Blum Laser", "Low Spindle Hours", "DMG MORI"],
    discoveredAt: "2026-08-25T07:45:00Z",
    lastVerifiedAt: "2026-08-25T21:50:00Z",
    matchScore: 88,
    matchedWithId: "wtb-cnc-7710",
    marginSpreadEstimate: 16000,
    status: "Active",
    githubIndexRef: "normsexchange-gemini/catalog/cnc/medtech-dmg-dmu50.json"
  },
  {
    id: "wtb-lab-5100",
    type: "WTB",
    title: "WTB: Thermo Scientific Nicolet iS50 FTIR Spectrometer",
    category: "Lab & Metrology Testing",
    make: "Thermo Fisher Scientific",
    model: "Nicolet iS50",
    year: 2021,
    partNumber: "IS50-BASE",
    priceTarget: 34000,
    currency: "USD",
    marketCompAverage: 39500,
    condition: "Working / Tested",
    specs: {
      "Spectral Range": "7,800 to 350 cm-1 (Mid-IR), expandable to Far/Near-IR",
      "Detector": "DLaTGS with KBr window",
      "Modules": "Built-in ATR module required",
      "Software": "OMNIC 9.x or OMNIC Paradigm"
    },
    description: "Urgent demand for polymer & advanced material degradation testing. Must include ATR crystal module with diamond window.",
    urgencyOrAvailability: "Immediate",
    contact: {
      entityName: "PolyMat Analytical Laboratories",
      contactPerson: "Dr. Rachel Chen",
      email: "r.chen@polymat-analytical.com",
      phone: "+1 (847) 555-0431",
      location: "Evanston, IL, USA",
      sourceDomain: "normsexchange.com",
      sourceUrl: "https://normsexchange.com/listings/wtb-lab-5100",
      inferenceConfidence: 99,
      inferenceMethod: "Direct Web Crawl",
      verifiedStatus: "Verified",
      notes: "Analytical test laboratory with pre-approved capex."
    },
    tags: ["FTIR", "Spectroscopy", "Thermo Scientific", "ATR", "Polymer Analysis"],
    discoveredAt: "2026-08-24T18:20:00Z",
    lastVerifiedAt: "2026-08-25T20:45:00Z",
    matchScore: 93,
    matchedWithId: "wts-lab-4902",
    marginSpreadEstimate: 4200,
    status: "Active",
    githubIndexRef: "normsexchange-gemini/catalog/metrology/thermo-is50.json"
  },
  {
    id: "wts-lab-4902",
    type: "WTS",
    title: "WTS: Thermo Nicolet iS50 FTIR with Built-in Diamond ATR Module",
    category: "Lab & Metrology Testing",
    make: "Thermo Fisher Scientific",
    model: "Nicolet iS50",
    year: 2022,
    partNumber: "IS50-ATR-DIA",
    priceTarget: 29800,
    currency: "USD",
    marketCompAverage: 39500,
    condition: "Refurbished / Calibrated",
    specs: {
      "ATR Window": "Monolithic Diamond ATR Crystal",
      "Spectral Resolution": "Better than 0.09 cm-1",
      "Purge System": "Factory dry-air / N2 purge manifold installed",
      "Software / PC": "Includes Dell Workstation with OMNIC Paradigm license"
    },
    description: "Lab relocation surplus from major chemical testing company. Flawless optical throughput, passed full factory validation and polystyrene benchmark tests.",
    urgencyOrAvailability: "Immediate",
    contact: {
      entityName: "BioSurplus Equipment Liquidation",
      contactPerson: "Sean Gallagher",
      email: "sgallagher@biosurplus-clearing.com",
      phone: "+1 (858) 555-0772",
      location: "San Diego, CA, USA",
      sourceDomain: "biosurplus-clearing.com",
      sourceUrl: "https://biosurplus-clearing.com/instruments/thermo-nicolet-is50",
      inferenceConfidence: 91,
      inferenceMethod: "Direct Web Crawl",
      verifiedStatus: "High Confidence",
      notes: "Established lab liquidation dealer with physical warehouse verification."
    },
    tags: ["Diamond ATR", "Spectrometer", "Thermo", "OMNIC", "Lab Surplus"],
    discoveredAt: "2026-08-25T06:10:00Z",
    lastVerifiedAt: "2026-08-25T22:15:00Z",
    matchScore: 93,
    matchedWithId: "wtb-lab-5100",
    marginSpreadEstimate: 4200,
    status: "Active",
    githubIndexRef: "normsexchange-gemini/catalog/metrology/biosurplus-is50-4902.json"
  },
  {
    id: "wtb-pwr-1080",
    type: "WTB",
    title: "WTB: Magna-Power XR Series 10kW Programmable DC Power Supply",
    category: "High-Voltage & Power Systems",
    make: "Magna-Power Electronics",
    model: "XR1000-10",
    year: 2021,
    partNumber: "XR1000-10/208",
    priceTarget: 9500,
    currency: "USD",
    marketCompAverage: 11800,
    condition: "Working / Tested",
    specs: {
      "Output Voltage": "0 to 1000 Vdc",
      "Output Current": "0 to 10 Adc",
      "Power Rating": "10 kW",
      "Input Voltage": "208/240 Vac 3-Phase",
      "Interfaces": "Ethernet LXI, USB, RS485, Isolated Analog"
    },
    description: "Needed for electric aircraft propulsion inverter and battery pack stress testing.",
    urgencyOrAvailability: "Within 14 Days",
    contact: {
      entityName: "VoltAero Dynamics Test Facility",
      contactPerson: "Nathan Reed",
      email: "n.reed@voltaero-testing.com",
      phone: "+1 (206) 555-0619",
      location: "Seattle, WA, USA",
      sourceDomain: "normsexchange.com",
      sourceUrl: "https://normsexchange.com/listings/wtb-pwr-1080",
      inferenceConfidence: 97,
      inferenceMethod: "Direct Web Crawl",
      verifiedStatus: "Verified",
      notes: "Aerospace EV test facility."
    },
    tags: ["Magna-Power", "10kW", "High Voltage", "LXI Ethernet", "Inverter Testing"],
    discoveredAt: "2026-08-23T16:00:00Z",
    lastVerifiedAt: "2026-08-25T18:30:00Z",
    matchScore: 89,
    matchedWithId: "wts-pwr-2041",
    marginSpreadEstimate: 1700,
    status: "Active",
    githubIndexRef: "normsexchange-gemini/catalog/power/magna-xr1000.json"
  },
  {
    id: "wts-pwr-2041",
    type: "WTS",
    title: "WTS: Magna-Power XR1000-10 10kW Programmable DC Supply",
    category: "High-Voltage & Power Systems",
    make: "Magna-Power Electronics",
    model: "XR1000-10",
    year: 2022,
    partNumber: "XR1000-10/208+LXI",
    priceTarget: 7800,
    currency: "USD",
    marketCompAverage: 11800,
    condition: "Refurbished / Calibrated",
    specs: {
      "Max Voltage": "1000 Vdc",
      "Max Current": "10 A",
      "Power": "10 kW",
      "Option": "+LXI TCP/IP Ethernet & Web Interface",
      "Rack Unit": "2U Ultra-dense rackmount"
    },
    description: "Surplus from EV powertrain battery test lab closure. Bench verified under full 10kW resistive load bank. In immaculate condition.",
    urgencyOrAvailability: "Immediate",
    contact: {
      entityName: "Apex Power Equipment Liquidation",
      contactPerson: "Derek Lawson",
      email: "derek@apex-power-assets.com",
      phone: "+1 (313) 555-0294",
      location: "Detroit, MI, USA",
      sourceDomain: "apex-power-assets.com",
      sourceUrl: "https://apex-power-assets.com/inventory/magna-power-xr1000-10",
      inferenceConfidence: 93,
      inferenceMethod: "Whois / Registry",
      verifiedStatus: "High Confidence",
      notes: "Commercial power equipment dealer."
    },
    tags: ["Magna-Power", "Programmable DC", "EV Testing", "LXI", "Detroit Surplus"],
    discoveredAt: "2026-08-25T05:00:00Z",
    lastVerifiedAt: "2026-08-25T21:00:00Z",
    matchScore: 89,
    matchedWithId: "wtb-pwr-1080",
    marginSpreadEstimate: 1700,
    status: "Active",
    githubIndexRef: "normsexchange-gemini/catalog/power/apex-magna-xr1000.json"
  },
  {
    id: "wtb-rob-3301",
    type: "WTB",
    title: "WTB: FANUC LR Mate 200iD/7L Cleanroom / High-Speed Industrial Robot",
    category: "Automation & Robotics",
    make: "FANUC",
    model: "LR Mate 200iD/7L",
    year: 2021,
    partNumber: "A05B-1142-B201",
    priceTarget: 22000,
    currency: "USD",
    marketCompAverage: 26500,
    condition: "Working / Tested",
    specs: {
      "Payload": "7 kg",
      "Reach": "911 mm (Long Arm)",
      "Controller": "R-30iB Plus Mate Controller with iPendant",
      "Axes": "6-Axis articulated",
      "Cleanroom Spec": "ISO Class 4 cleanroom option preferred"
    },
    description: "High speed pick and place robot needed for cleanroom medical device packaging line.",
    urgencyOrAvailability: "Within 14 Days",
    contact: {
      entityName: "AcuSterile Medical Devices",
      contactPerson: "Marcus Taylor (Automation Lead)",
      email: "m.taylor@acusterile-medical.com",
      phone: "+1 (612) 555-0834",
      location: "Minneapolis, MN, USA",
      sourceDomain: "normsexchange.com",
      sourceUrl: "https://normsexchange.com/listings/wtb-rob-3301",
      inferenceConfidence: 98,
      inferenceMethod: "Direct Web Crawl",
      verifiedStatus: "Verified",
      notes: "Medical device packaging OEM."
    },
    tags: ["FANUC", "LR Mate", "Cleanroom", "R-30iB Plus", "Robotics"],
    discoveredAt: "2026-08-23T14:15:00Z",
    lastVerifiedAt: "2026-08-25T19:10:00Z",
    matchScore: 92,
    matchedWithId: "wts-rob-3119",
    marginSpreadEstimate: 3200,
    status: "Active",
    githubIndexRef: "normsexchange-gemini/catalog/robotics/fanuc-lrmate.json"
  },
  {
    id: "wts-rob-3119",
    type: "WTS",
    title: "WTS: 2022 FANUC LR Mate 200iD/7L w/ R-30iB Plus Mate Controller",
    category: "Automation & Robotics",
    make: "FANUC",
    model: "LR Mate 200iD/7L",
    year: 2022,
    partNumber: "A05B-1142-B201",
    priceTarget: 18800,
    currency: "USD",
    marketCompAverage: 26500,
    condition: "Refurbished / Calibrated",
    specs: {
      "Operating Hours": "890 hrs (low runtime)",
      "Arm Type": "Long arm 911 mm reach",
      "Controller": "R-30iB Plus Mate (Touch iPendant included)",
      "Cables": "Complete 7m connection harness",
      "Voltage": "200-230V Single Phase"
    },
    description: "De-installed from pharmaceutical automated vial handling cleanroom. Clean, no mechanical backlash, master calibration verified, zero fault codes on controller.",
    urgencyOrAvailability: "Immediate",
    contact: {
      entityName: "Great Lakes Automation & Surplus",
      contactPerson: "Brian Schultz",
      email: "b.schultz@greatlakes-automation.com",
      phone: "+1 (414) 555-0529",
      location: "Milwaukee, WI, USA",
      sourceDomain: "greatlakes-automation.com",
      sourceUrl: "https://greatlakes-automation.com/robots/fanuc-lrmate-200id-7l",
      inferenceConfidence: 94,
      inferenceMethod: "Direct Web Crawl",
      verifiedStatus: "High Confidence",
      notes: "Industrial robotics reseller with bench testing bay."
    },
    tags: ["FANUC", "iPendant", "Pharmaceutical Clean", "Low Hours", "6-Axis"],
    discoveredAt: "2026-08-25T04:20:00Z",
    lastVerifiedAt: "2026-08-25T21:40:00Z",
    matchScore: 92,
    matchedWithId: "wtb-rob-3301",
    marginSpreadEstimate: 3200,
    status: "Active",
    githubIndexRef: "normsexchange-gemini/catalog/robotics/greatlakes-fanuc-3119.json"
  }
];

const DEFAULT_MARKET_DEPTH: MarketDepthItem[] = [
  {
    id: "md-1",
    item: "Coherent Monaco 1035nm Femtosecond",
    category: "Optics & Lasers",
    bidPrice: 68000,
    askPrice: 61800,
    spread: 6200,
    spreadPercent: 9.1,
    wtbVolume: 3,
    wtsVolume: 2,
    liquidityTier: "High"
  },
  {
    id: "md-2",
    item: "Keysight B1500A Device Analyzer",
    category: "Semiconductor",
    bidPrice: 42000,
    askPrice: 37500,
    spread: 4500,
    spreadPercent: 10.7,
    wtbVolume: 5,
    wtsVolume: 3,
    liquidityTier: "High"
  },
  {
    id: "md-3",
    item: "DMG MORI DMU 50 5-Axis CNC",
    category: "Industrial CNC",
    bidPrice: 145000,
    askPrice: 129000,
    spread: 16000,
    spreadPercent: 11.0,
    wtbVolume: 2,
    wtsVolume: 2,
    liquidityTier: "Medium"
  },
  {
    id: "md-4",
    item: "Thermo Nicolet iS50 FTIR Spectrometer",
    category: "Metrology & Lab",
    bidPrice: 34000,
    askPrice: 29800,
    spread: 4200,
    spreadPercent: 12.3,
    wtbVolume: 4,
    wtsVolume: 4,
    liquidityTier: "High"
  },
  {
    id: "md-5",
    item: "Magna-Power XR1000-10 10kW DC Supply",
    category: "High-Voltage",
    bidPrice: 9500,
    askPrice: 7800,
    spread: 1700,
    spreadPercent: 17.9,
    wtbVolume: 6,
    wtsVolume: 5,
    liquidityTier: "High"
  },
  {
    id: "md-6",
    item: "FANUC LR Mate 200iD/7L Robot Arm",
    category: "Robotics",
    bidPrice: 22000,
    askPrice: 18800,
    spread: 3200,
    spreadPercent: 14.5,
    wtbVolume: 4,
    wtsVolume: 3,
    liquidityTier: "High"
  }
];

class DatabaseService {
  private db: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.ensureDataDir();
    this.db = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        this.isLoaded = true;
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse database file, re-initializing:", e);
    }

    // Initialize with default data
    const initialDb: DatabaseSchema = {
      version: "1.2.0",
      lastUpdated: new Date().toISOString(),
      listings: DEFAULT_LISTINGS,
      outbox: [],
      marketDepth: DEFAULT_MARKET_DEPTH
    };

    this.saveDatabase(initialDb);
    this.isLoaded = true;
    return initialDb;
  }

  private saveDatabase(data: DatabaseSchema) {
    try {
      this.ensureDataDir();
      data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
      this.db = data;
    } catch (e) {
      console.error("Failed to write database file:", e);
    }
  }

  public getStatus() {
    return {
      status: "online",
      engine: "File-backed Persistent JSON Store",
      filePath: DB_FILE,
      version: this.db.version,
      lastUpdated: this.db.lastUpdated,
      totalListings: this.db.listings.length,
      totalWTB: this.db.listings.filter(l => l.type === "WTB").length,
      totalWTS: this.db.listings.filter(l => l.type === "WTS").length,
      totalMatches: this.db.listings.filter(l => (l.matchScore || 0) > 0).length,
      totalOutboxEnvelopes: this.db.outbox.length,
      fileSizeBytes: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0,
    };
  }

  public getListings(params: {
    q?: string;
    category?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    verifiedOnly?: boolean;
    sortBy?: "match" | "margin" | "price-desc" | "price-asc" | "newest";
  }) {
    let result = [...this.db.listings];

    // Filter by type
    if (params.type && params.type !== "ALL") {
      if (params.type === "MATCHED") {
        result = result.filter(item => (item.matchScore || 0) > 0);
      } else {
        result = result.filter(item => item.type === params.type);
      }
    }

    // Filter by category
    if (params.category && params.category !== "All") {
      result = result.filter(item => item.category === params.category);
    }

    // Filter by price range
    if (params.minPrice !== undefined && !isNaN(params.minPrice)) {
      result = result.filter(item => item.priceTarget >= params.minPrice!);
    }
    if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
      result = result.filter(item => item.priceTarget <= params.maxPrice!);
    }

    // Filter by condition
    if (params.condition && params.condition !== "All") {
      result = result.filter(item => item.condition === params.condition);
    }

    // Filter by verified status
    if (params.verifiedOnly) {
      result = result.filter(item => item.contact?.verifiedStatus === "Verified");
    }

    // Search query across fields
    if (params.q && params.q.trim()) {
      const q = params.q.toLowerCase().trim();
      result = result.filter(item => {
        const inTitle = item.title?.toLowerCase().includes(q);
        const inMake = item.make?.toLowerCase().includes(q);
        const inModel = item.model?.toLowerCase().includes(q);
        const inPart = item.partNumber?.toLowerCase().includes(q);
        const inDesc = item.description?.toLowerCase().includes(q);
        const inEntity = item.contact?.entityName?.toLowerCase().includes(q);
        const inLocation = item.contact?.location?.toLowerCase().includes(q);
        const inContactPerson = item.contact?.contactPerson?.toLowerCase().includes(q);
        const inTags = item.tags?.some(t => t.toLowerCase().includes(q));
        const inSpecs = item.specs ? Object.entries(item.specs).some(([k, v]) => 
          k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q)
        ) : false;

        return inTitle || inMake || inModel || inPart || inDesc || inEntity || inLocation || inContactPerson || inTags || inSpecs;
      });
    }

    // Sorting
    const sort = params.sortBy || "match";
    result.sort((a, b) => {
      if (sort === "match") {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      if (sort === "margin") {
        return (b.marginSpreadEstimate || 0) - (a.marginSpreadEstimate || 0);
      }
      if (sort === "price-desc") {
        return b.priceTarget - a.priceTarget;
      }
      if (sort === "price-asc") {
        return a.priceTarget - b.priceTarget;
      }
      // newest
      return new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime();
    });

    return result;
  }

  public getListingById(id: string): EquipmentListing | undefined {
    return this.db.listings.find(l => l.id === id);
  }

  public addListing(listing: EquipmentListing): EquipmentListing {
    // Generate id if missing
    if (!listing.id) {
      listing.id = `${listing.type.toLowerCase()}-${Date.now()}`;
    }
    if (!listing.discoveredAt) {
      listing.discoveredAt = new Date().toISOString();
    }
    if (!listing.lastVerifiedAt) {
      listing.lastVerifiedAt = new Date().toISOString();
    }

    // Check if ID already exists, replace or prepend
    const index = this.db.listings.findIndex(l => l.id === listing.id);
    if (index >= 0) {
      this.db.listings[index] = listing;
    } else {
      this.db.listings.unshift(listing);
    }

    this.saveDatabase(this.db);
    return listing;
  }

  public addListingsBatch(newListings: EquipmentListing[]): EquipmentListing[] {
    const existingIds = new Set(this.db.listings.map(l => l.id));
    const toAdd = newListings.filter(l => !existingIds.has(l.id));
    this.db.listings.unshift(...toAdd);
    this.saveDatabase(this.db);
    return toAdd;
  }

  public updateListing(id: string, updates: Partial<EquipmentListing>): EquipmentListing | null {
    const index = this.db.listings.findIndex(l => l.id === id);
    if (index === -1) return null;

    this.db.listings[index] = {
      ...this.db.listings[index],
      ...updates,
      lastVerifiedAt: new Date().toISOString()
    };

    this.saveDatabase(this.db);
    return this.db.listings[index];
  }

  public deleteListing(id: string): boolean {
    const initialLen = this.db.listings.length;
    this.db.listings = this.db.listings.filter(l => l.id !== id);
    if (this.db.listings.length !== initialLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  public getStats() {
    const listings = this.db.listings;
    const wtbListings = listings.filter(l => l.type === "WTB");
    const wtsListings = listings.filter(l => l.type === "WTS");
    const matchedListings = listings.filter(l => (l.matchScore || 0) > 0);

    const totalWtbValue = wtbListings.reduce((sum, l) => sum + (l.priceTarget || 0), 0);
    const totalWtsValue = wtsListings.reduce((sum, l) => sum + (l.priceTarget || 0), 0);
    const totalArbitrageSpread = matchedListings.reduce((sum, l) => sum + (l.marginSpreadEstimate || 0), 0);

    // Entity count
    const uniqueEntities = new Set(listings.map(l => l.contact?.entityName).filter(Boolean));

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    for (const l of listings) {
      categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1;
    }

    // Condition breakdown
    const conditionCounts: Record<string, number> = {};
    for (const l of listings) {
      conditionCounts[l.condition] = (conditionCounts[l.condition] || 0) + 1;
    }

    return {
      totalRecords: listings.length,
      wtbCount: wtbListings.length,
      wtsCount: wtsListings.length,
      matchedCount: matchedListings.length,
      totalWtbValue,
      totalWtsValue,
      totalArbitrageSpread,
      uniqueEntitiesCount: uniqueEntities.size,
      categoryCounts,
      conditionCounts,
      outboxMessagesCount: this.db.outbox.length,
      lastUpdated: this.db.lastUpdated,
      dbFileSize: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0,
    };
  }

  public getMarketDepth(): MarketDepthItem[] {
    return this.db.marketDepth;
  }

  public getOutbox(): OutboxContractEnvelope[] {
    return this.db.outbox;
  }

  public saveOutboxEnvelope(envelope: OutboxContractEnvelope): OutboxContractEnvelope {
    this.db.outbox.unshift(envelope);
    this.saveDatabase(this.db);
    return envelope;
  }

  public resetToDefaults(): DatabaseSchema {
    const initialDb: DatabaseSchema = {
      version: "1.2.0",
      lastUpdated: new Date().toISOString(),
      listings: DEFAULT_LISTINGS,
      outbox: [],
      marketDepth: DEFAULT_MARKET_DEPTH
    };
    this.saveDatabase(initialDb);
    return initialDb;
  }

  public exportData(): DatabaseSchema {
    return this.db;
  }
}

export const dbService = new DatabaseService();
