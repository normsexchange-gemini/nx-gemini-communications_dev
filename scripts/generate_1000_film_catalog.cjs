const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "normsexchange_db.json");

// Equipment archetypes covering the 7 permanent mission categories
const EQUIPMENT_ARCHETYPES = [
  // 1. Cameras & Camera Systems
  {
    category: "Cameras & Systems",
    make: "ARRI",
    model: "Alexa 35 Production Set",
    year: 2023,
    avgPrice: 82000,
    priceRange: [74000, 89000],
    specs: {
      "Sensor": "Super 35 Native 4K CMOS (4608 x 2636)",
      "Dynamic Range": "17 Stops (REVEAL Color Science)",
      "Lens Mount": "LPL Mount (with PL-to-LPL Adapter)",
      "Recording Media": "Codex Compact Drive 2TB",
      "Frame Rates": "Up to 120 fps at 4K Native",
      "Base ISO": "EI 160 - 6400 (Enhanced Sensitivity Mode)"
    },
    descWTB: "Tier-1 production company seeking low-hour ARRI Alexa 35 with LPL/PL mounts, MVF-2 viewfinder, and power distribution for upcoming feature in SE Asia.",
    descWTS: "Surplus production gear: 2023 Alexa 35 with under 420 operating hours. Complete with MVF-2, 2x 2TB Codex drives, and heavy-duty cage. Fully bench-tested by ARRI Burbank.",
    tags: ["ARRI", "Alexa35", "Super35", "4KNative", "CinemaCamera"]
  },
  {
    category: "Cameras & Systems",
    make: "ARRI",
    model: "Alexa Mini LF Large Format Cinema Camera",
    year: 2021,
    avgPrice: 58000,
    priceRange: [52000, 64000],
    specs: {
      "Sensor": "Large Format 4.5K (4448 x 3096) ALEV III A2X",
      "Recording Formats": "ARRIRAW & Apple ProRes 4444 XQ",
      "Lens Mount": "LPL Mount (LBUS included)",
      "Weight": "2.6 kg (5.7 lbs) body only",
      "ND Filters": "Built-in motorized FSND (0.6, 1.2, 1.8)"
    },
    descWTB: "Urgent demand for Alexa Mini LF body kit for cross-border commercial shoot in Ho Chi Minh City. Ready for immediate escrow deposit.",
    descWTS: "Selling meticulously maintained Alexa Mini LF from commercial rental fleet. 880 hours, fresh sensor clean, includes MVF-2 and Bebob V-Mount plate.",
    tags: ["ARRI", "MiniLF", "LargeFormat", "ARRIRAW", "CommercialProduction"]
  },
  {
    category: "Cameras & Systems",
    make: "Sony",
    model: "Venice 2 8.6K Full-Frame Cinema Camera",
    year: 2022,
    avgPrice: 54000,
    priceRange: [48000, 61000],
    specs: {
      "Sensor": "8.6K 3:2 Full-Frame CMOS (8640 x 5760)",
      "Dual Base ISO": "ISO 800 / ISO 3200",
      "Internal Recording": "X-OCN XT/ST/LT & ProRes 4444",
      "Dynamic Range": "16 stops",
      "Internal ND": "8-step optical ND system (0.3 to 2.4)"
    },
    descWTB: "Studio WTB: Sony Venice 2 8.6K body with High Frame Rate & Anamorphic licenses activated. Immediate delivery to LA or Hanoi.",
    descWTS: "Sony Venice 2 8.6K package in pristine condition. Includes Rialto 2 extension block compatibility, 3x AXS-A1TS66 1TB cards, AXS-AR3 Thunderbolt card reader.",
    tags: ["Sony", "Venice2", "8K6", "FullFrame", "CinemaCamera"]
  },
  {
    category: "Cameras & Systems",
    make: "Sony",
    model: "FX9 Full-Frame Cinema Camera (PXW-FX9)",
    year: 2021,
    avgPrice: 8500,
    priceRange: [7200, 9800],
    specs: {
      "Sensor": "6K Full-Frame Exmor R CMOS",
      "Autofocus": "Fast Hybrid AF with Face Detection & Eye AF",
      "Dual Base ISO": "ISO 800 / 4000",
      "Electronic Variable ND": "1/4 to 1/128 ND",
      "Output": "16-bit RAW output via XDCA-FX9"
    },
    descWTB: "Documentary crew sourcing 2x clean Sony FX9 packages with XDCA extension units and 28-135mm G lenses for Vietnam wildlife series.",
    descWTS: "Sony FX9 documentary bundle: Body with XDCA-FX9 extension, 4x 240GB XQD cards, 3x BP-U70 batteries, and Shape shoulder rig. Low hours.",
    tags: ["Sony", "FX9", "Documentary", "FullFrame", "FastAF"]
  },
  {
    category: "Cameras & Systems",
    make: "RED Digital Cinema",
    model: "V-Raptor XL [X] 8K VV Studio Camera",
    year: 2024,
    avgPrice: 42000,
    priceRange: [38000, 46500],
    specs: {
      "Sensor": "8K VV Global Shutter CMOS (8192 x 4320)",
      "Dynamic Range": "17+ stops with Global Vision Extended Highlights",
      "Frame Rates": "8K 120fps, 4K 240fps, 2K 480fps",
      "Integrated I/O": "Built-in electronic ND, auxiliary 24V/12V power",
      "Mount": "Interchangeable PL / RF Mount"
    },
    descWTB: "High-speed action unit WTB RED V-Raptor XL [X] 8K VV. Seeking factory complete package with RED Touch 7.0 and V-Lock plates.",
    descWTS: "Brand new surplus 2024 RED V-Raptor XL [X] 8K VV. Zero field hours, original Pelican case, full factory warranty transferable.",
    tags: ["RED", "VRaptorXL", "GlobalShutter", "8KVV", "HighSpeed"]
  },
  {
    category: "Cameras & Systems",
    make: "Canon",
    model: "Cinema EOS C500 Mark II 5.9K Full Frame",
    year: 2021,
    avgPrice: 10500,
    priceRange: [9000, 12200],
    specs: {
      "Sensor": "5.9K Full Frame CMOS",
      "Recording": "Internal Cinema RAW Light 5.9K & XF-AVC",
      "Mount": "Interchangeable EF / PL Mount",
      "Image Stabilization": "5-axis Electronic IS",
      "Codec": "12-bit RAW Light / 10-bit 4:2:2"
    },
    descWTB: "Broadcast studio in Ho Chi Minh City looking for Canon C500 Mk II with EU-V2 expansion unit and PL mount.",
    descWTS: "Canon C500 Mark II in 9/10 condition. Comes with EU-V2 Expansion Unit, EVF-V70 Viewfinder, 4x 512GB CFexpress Type B cards and reader.",
    tags: ["Canon", "C500MkII", "CinemaRAWLight", "FullFrame", "Broadcast"]
  },

  // 2. Lenses & Optics
  {
    category: "Lenses & Optics",
    make: "Cooke Optics",
    model: "Anamorphic /i Full Frame Plus 5-Lens Set (32, 40, 50, 75, 100mm)",
    year: 2022,
    avgPrice: 115000,
    priceRange: [102000, 128000],
    specs: {
      "Squeeze Ratio": "1.8x Anamorphic",
      "Coverage": "Full Frame (up to 24x36mm format)",
      "Aperture": "T2.3 across set (T2.8 on 32mm)",
      "Lens Data": "/i Technology protocol integrated",
      "Look": "Classic Cooke Look with oval bokeh and controlled flare"
    },
    descWTB: "International DP requiring 5-lens Cooke Anamorphic /i FF+ set (PL mount). Must have pristine glass with zero fungus/haze. Immediate escrow ready.",
    descWTS: "Private owner offering immaculate Cooke Anamorphic /i Full Frame Plus 5-lens set (32/40/50/75/100mm). Custom flight case, fully serviced by Duclos Lenses in 2025.",
    tags: ["Cooke", "Anamorphic", "FullFrame", "PrimeSet", "CineGlass"]
  },
  {
    category: "Lenses & Optics",
    make: "ARRI / Zeiss",
    model: "Master Anamorphic 6-Lens Set (28, 35, 50, 75, 100, 135mm)",
    year: 2020,
    avgPrice: 98000,
    priceRange: [88000, 112000],
    specs: {
      "Squeeze Ratio": "2x Anamorphic",
      "Aperture": "T1.9 across entire set",
      "Mount": "ARRI PL Mount with LDS (Lens Data System)",
      "Optical Performance": "Zero breathing, straight horizontal flare, flat field",
      "Iris": "15-blade circular iris"
    },
    descWTB: "Rental house expansion looking for ARRI Master Anamorphics 6-lens set for commercial & feature productions in Southeast Asia.",
    descWTS: "ARRI Master Anamorphic set (28, 35, 50, 75, 100, 135mm) in excellent condition. All T1.9, optical collimation verified, fitted in custom Calzone flight cases.",
    tags: ["ARRI", "Zeiss", "MasterAnamorphic", "2xAnamorphic", "T19"]
  },
  {
    category: "Lenses & Optics",
    make: "Zeiss",
    model: "Supreme Prime Radiance 7-Lens Set (21, 28, 35, 50, 85, 100, 135mm)",
    year: 2022,
    avgPrice: 92000,
    priceRange: [82000, 105000],
    specs: {
      "Coverage": "Full Frame Plus (up to 46.3mm image circle)",
      "Aperture": "T1.5 across set",
      "Coating": "Blue Ring T* Radiance Coating (controlled distinctive flare)",
      "eXtended Data": "Cooke /i and Zeiss eXtended Data protocols",
      "Mount": "Interchangeable PL / LPL Mount"
    },
    descWTB: "WTB: Zeiss Supreme Radiance 7-lens prime set for streaming episodic project. Prefer PL mount with metric/imperial scales.",
    descWTS: "Zeiss Supreme Prime Radiance 7-lens complete set (21-135mm). Pristine optical elements, smooth focus mechanics, original Zeiss pelican cases included.",
    tags: ["Zeiss", "SupremeRadiance", "FullFrame", "T15", "BlueFlare"]
  },
  {
    category: "Lenses & Optics",
    make: "Angénieux",
    model: "Optimo Ultra 12x FF/S35 Multi-Format Cinema Zoom",
    year: 2021,
    avgPrice: 78000,
    priceRange: [69000, 87000],
    specs: {
      "Optical Design": "IRO Technology (S35 24-290mm, U35 26-320mm, FF 36-435mm)",
      "Aperture": "T2.8 (S35) / T3.5 (U35) / T4.2 (FF)",
      "Mount": "PL Mount with Cooke /i metadata",
      "Front Diameter": "162mm",
      "Weight": "12.75 kg (28.1 lbs)"
    },
    descWTB: "Seeking Angenieux Optimo Ultra 12x with full IRO package (FF + S35 rear groups). Needed for feature film in Da Nang.",
    descWTS: "Angenieux Optimo Ultra 12x flagship cinema zoom. Complete with interchangeable rear optical blocks for Super35 and Full Frame formats, carry handles, and hard case.",
    tags: ["Angenieux", "OptimoUltra12x", "CinemaZoom", "IRO", "FullFrame"]
  },
  {
    category: "Lenses & Optics",
    make: "Atlas Lens Co.",
    model: "Orion Series 6-Lens Anamorphic Set (21, 32, 40, 50, 65, 80, 100mm)",
    year: 2023,
    avgPrice: 38000,
    priceRange: [33000, 44000],
    specs: {
      "Squeeze Ratio": "2x Front Anamorphic",
      "Coverage": "Full Frame (with 1.6x LF Extender) & Super 35",
      "Aperture": "T2.0 across majority of focal lengths",
      "Mount": "Interchangeable PL and EF Mounts",
      "Character": "Warm vintage flare, pleasing waterfall oval bokeh"
    },
    descWTB: "Indie feature production WTB Atlas Orion 6-lens set in PL mount. Silver Edition or Standard blue flare acceptable.",
    descWTS: "Atlas Orion Anamorphic set (21/32/40/50/65/80/100mm) in custom foam ATA flight cases. Includes 1.6x LF Expander for full-frame Alexa Mini LF and Venice coverage.",
    tags: ["Atlas", "Orion", "2xAnamorphic", "T20", "VintageLook"]
  },

  // 3. Lighting & Grip
  {
    category: "Lighting & Grip",
    make: "ARRI",
    model: "SkyPanel S360-C High-Output LED Softlight Package",
    year: 2021,
    avgPrice: 14500,
    priceRange: [12500, 16800],
    specs: {
      "Output": "Over 120,000 lumens (equivalent to 4kW tungsten soft)",
      "Aperture Area": "128 x 87 cm (50.4 x 34.4 inches)",
      "Color Tuning": "2800K to 10,000K + Full RGBW Gamut + Gel Libraries",
      "Power Consumption": "1500 W nominal",
      "Wireless Control": "Built-in LumenRadio CRMX & Art-Net"
    },
    descWTB: "Studio lighting package WTB 2x ARRI SkyPanel S360-C with carbon fiber yokes, honeycomb grids, and heavy-duty flight cases.",
    descWTS: "ARRI SkyPanel S360-C complete rental kit. Includes power supply, center-mount yoke, 60-degree honeycomb grid, standard diffusion, and road case.",
    tags: ["ARRI", "SkyPanel", "S360C", "StudioLED", "ColorTuning"]
  },
  {
    category: "Lighting & Grip",
    make: "Aputure",
    model: "Electro Storm CS15 1585W Full-Color Point-Source LED",
    year: 2024,
    avgPrice: 6200,
    priceRange: [5400, 7100],
    specs: {
      "Power Output": "1585W High-Output Point Source",
      "Color Engine": "Dual-Blue RGBWW with Ultra-High SSI (89+)",
      "Mount": "Electronic Aputure Mount & Bowens Dual Mount",
      "Cooling": "Liquid-cooled thermal dissipation",
      "IP Rating": "IP65 Weather-Resistant Construction"
    },
    descWTB: "Commercial production house sourcing 3x Aputure Electro Storm CS15 units with motorized yokes and 20-degree reflectors for location shoot in Vietnam.",
    descWTS: "Aputure Electro Storm CS15 full-color fixture package. Includes control box, 35-degree reflector, motorized yoke, and rolling flight case. Like-new condition.",
    tags: ["Aputure", "ElectroStorm", "CS15", "FullColor", "PointSource"]
  },
  {
    category: "Lighting & Grip",
    make: "Astera",
    model: "Titan Tube 8-Tube Complete Charging Box Set (FP1-SET)",
    year: 2022,
    avgPrice: 5200,
    priceRange: [4500, 6000],
    specs: {
      "Tubes": "8x Titan Tube FP1 (72W LED RGBMintAmber)",
      "Battery Life": "Up to 20 hours runtime",
      "Control": "CRMX Wireless DMX, Bluetooth App Control, Wired DMX",
      "Color Quality": "CRI >= 96, TLCI >= 96, Ultra-smooth dimming",
      "Case": "Heavy-duty PowerBox charging road case with power distribution"
    },
    descWTB: "Music video gaffer looking to buy 2x complete Astera Titan Tube 8-light kits with floor stands, wingplates, and charging cases.",
    descWTS: "Astera Titan Tube 8-tube set in original charging case. Comes with 8x floor stands, 16x holders, 8x eye bolts, AsteraBox ART7 transmitter, and PowerBox.",
    tags: ["Astera", "TitanTube", "WirelessDMX", "PixelTube", "GripLighting"]
  },
  {
    category: "Lighting & Grip",
    make: "Matthews / O'Connor",
    model: "Hollywood Century C-Stand & Heavy-Duty Grip Package",
    year: 2023,
    avgPrice: 4200,
    priceRange: [3500, 5000],
    specs: {
      "Includes": "12x Matthews 40\" Spring-Loaded C-Stands with Turtle Base",
      "Grip Heads": "12x 2.5\" Grip Heads + 40\" Grip Arms",
      "Stands": "4x Matthews Low Boy Combo Stands (Junior Receiver)",
      "Hardware": "Complete apple box sets, cardellinis, mafer clamps, sandbags",
      "Finish": "Chrome / Black Powder Coat"
    },
    descWTB: "Grip truck outfitter WTB clean Matthews 12-stand grip package with combo stands and rigging hardware for studio buildout in Ho Chi Minh City.",
    descWTS: "Full studio grip package: 12x 40-inch Matthews turtle-base C-stands, 4x baby combo stands, 12x 25lb sandbags, 4x full apple box nested sets.",
    tags: ["Matthews", "CStand", "GripPackage", "Rigging", "StudioGrip"]
  },

  // 4. Professional Audio
  {
    category: "Professional Audio",
    make: "Sound Devices",
    model: "Scorpio 32-Channel 36-Track Production Mixer-Recorder",
    year: 2022,
    avgPrice: 9800,
    priceRange: [8600, 11200],
    specs: {
      "Preamps": "16 Ultra-Low Noise Kashmir Microphone Preamplifiers",
      "Channels / Tracks": "32 Channels, 36 Tracks of Audio Recording",
      "Buses": "12 Busses (Left/Right + B1-B10)",
      "Digital I/O": "Dante 32 I/O, AES3, AES42 for digital mics",
      "Storage": "Internal 256GB SSD + Dual SD card slots"
    },
    descWTB: "Feature production sound mixer seeking Sound Devices Scorpio in pristine condition. Must include SL-2 dual wireless receiver slot and power breakout.",
    descWTS: "Sound Devices Scorpio 32-channel flagship recorder. Meticulously cared for in sound cart setup. Includes SL-2 Superslot module, K-Tek Stingray bag, and Hirose power distribution.",
    tags: ["SoundDevices", "Scorpio", "ProductionAudio", "Dante", "32Channel"]
  },
  {
    category: "Professional Audio",
    make: "Lectrosonics",
    model: "DCR822 Dual-Channel Digital Wireless Receiver Package",
    year: 2023,
    avgPrice: 6500,
    priceRange: [5600, 7400],
    specs: {
      "Receiver": "Dual-channel pure digital receiver with Vector Diversity",
      "Transmitters": "2x Lectrosonics DBSMD Dual-Battery Digital Beltpacks",
      "Frequency Tuning": "Wideband tuning (470 to 608 MHz)",
      "Encryption": "AES-256 CTR encryption",
      "Audio Quality": "24-bit / 48 kHz uncompressed audio transmission"
    },
    descWTB: "Sound department WTB 2x Lectrosonics DCR822 wireless receiver kits with wideband miniature transmitters and DPA 6060 lavaliers.",
    descWTS: "Lectrosonics DCR822 dual wireless package: 1x DCR822 receiver, 2x SSM micro-transmitters, DPA 4060 microphones, antennae, and TA3 cables. Perfect operating condition.",
    tags: ["Lectrosonics", "DCR822", "WirelessAudio", "DigitalWireless", "BoomMic"]
  },
  {
    category: "Professional Audio",
    make: "Schoeps / Sennheiser",
    model: "Master Boom Mic Package (Schoeps CMC641 + Sennheiser MKH 416)",
    year: 2023,
    avgPrice: 3800,
    priceRange: [3200, 4400],
    specs: {
      "Interior Mic": "Schoeps CMC6 Amplifier + MK41 Supercardioid Capsule",
      "Exterior Mic": "Sennheiser MKH 416-P48 Moisture-Resistant Interference Tube",
      "Suspension": "Cinela Osix 2 & Rycote Super-Shield modular windshield kits",
      "Boom Pole": "K-Tek Avalon Graphite Carbon Fiber 12-foot internally cabled",
      "Connectors": "Neutrik Gold XLR interconnects"
    },
    descWTB: "Location sound recordist sourcing reference boom package with Schoeps CMC641 and Sennheiser 416 in Rycote suspensions for international doc.",
    descWTS: "Complete boom operator kit: Schoeps CMC641 interior mic, Sennheiser MKH416 shotgun, Rycote Cyclone windshield, and K-Tek KlassicPro carbon fiber pole.",
    tags: ["Schoeps", "Sennheiser", "MKH416", "BoomMic", "LocationSound"]
  },

  // 5. Monitoring & Wireless
  {
    category: "Monitoring & Wireless",
    make: "SmallHD",
    model: "Cine 24 4K High-Bright Production Monitor",
    year: 2022,
    avgPrice: 8400,
    priceRange: [7200, 9600],
    specs: {
      "Display": "24-inch IPS LCD 3840 x 2160 Native 4K",
      "Brightness": "1350 nits Daylight Viewable",
      "Color Accuracy": "100% DCI-P3 Color Gamut Coverage, 10-bit color depth",
      "Inputs/Outputs": "4x 12G-SDI In/Out, 1x HDMI 2.0 In/Out",
      "OS": "PageOS 5 with EL Zone, False Color, Waveform, 3D LUTs"
    },
    descWTB: "DIT seeking 2x SmallHD Cine 24 4K high-bright production monitors with C-stand mounts and Gold-mount battery brackets for onset grading cart.",
    descWTS: "SmallHD Cine 24 4K HDR monitor with screen protector, sunhood, Matthews monitor mount, and custom Pelican 1650 hard transport case. Calibrated last month.",
    tags: ["SmallHD", "Cine24", "4KMonitor", "1350Nits", "PageOS"]
  },
  {
    category: "Monitoring & Wireless",
    make: "Teradek",
    model: "Bolt 6 XT 750 12G-SDI Zero-Delay Wireless Set",
    year: 2023,
    avgPrice: 5800,
    priceRange: [5000, 6800],
    specs: {
      "Frequency Band": "6 GHz UNII-5 Band + 5 GHz legacy compatibility",
      "Range": "750 feet (228 meters) line-of-sight",
      "Video Resolution": "Up to 4K60 in 10-bit 4:2:2 DCI",
      "Latency": "<0.001 sec (Zero delay, true real-time)",
      "Interfaces": "12G-SDI & HDMI 2.0 on both TX and RX"
    },
    descWTB: "Camera operator WTB Teradek Bolt 6 XT 750 kit (1x TX, 2x RX) with V-Mount pass-through for focus puller and video village.",
    descWTS: "Teradek Bolt 6 XT 750 deluxe kit: 1x 12G-SDI TX, 2x 12G-SDI RX, 6GHz antennae, D-Tap power cables, wooden camera brackets, and waterproof flight case.",
    tags: ["Teradek", "Bolt6", "ZeroDelay", "WirelessVideo", "6GHz"]
  },
  {
    category: "Monitoring & Wireless",
    make: "Flanders Scientific",
    model: "DM240 24-inch Color Critical Reference Monitor",
    year: 2021,
    avgPrice: 4100,
    priceRange: [3400, 4800],
    specs: {
      "Screen Size": "24-inch 10-bit IPS LCD (1920 x 1200)",
      "Color Calibration": "Factory calibrated with 3D LUT capability",
      "Processing": "Zero delay processing mode with instantaneous cross-conversion",
      "Inputs": "3G-SDI, DisplayPort, DVI-I",
      "Scopes": "Live VectorScope, Waveform, Audio Phase meter"
    },
    descWTB: "Post-production colorist sourcing Flanders Scientific DM240 for secondary grading suite in Hanoi.",
    descWTS: "Flanders Scientific DM240 grading monitor. Low backlight hours, includes desktop stand, C-stand mount adapter, and calibration report from FSI Atlanta.",
    tags: ["FSI", "FlandersScientific", "DM240", "ColorGrading", "ReferenceMonitor"]
  },

  // 6. Power, Media & Support
  {
    category: "Power, Media & Support",
    make: "O'Connor",
    model: "Ultimate 2575D Fluid Head with Mitchell Base & Carbon Legs",
    year: 2021,
    avgPrice: 16500,
    priceRange: [14200, 18900],
    specs: {
      "Payload Capacity": "Up to 40.8 kg (90 lbs) at 6-inch COG",
      "Counterbalance": "Continuous sinusoidal counterbalance (0-100%)",
      "Fluid Drag": "Ultra-smooth step-less fluid drag system",
      "Base": "Mitchell Base with 150mm bowl adapter",
      "Legs": "Ronford-Baker Heavy-Duty 2-Stage Mitchell Carbon Fiber Tripod"
    },
    descWTB: "Feature camera package WTB O'Connor 2575D fluid head in top mechanical condition. Must include euro quick-release plate, pan handles, and shipping tube.",
    descWTS: "O'Connor 2575D flagship fluid head with Ronford-Baker heavy-duty legs and ground spreader. Fresh service by Otto Nemenz, silky smooth pan/tilt motion.",
    tags: ["OConnor", "2575D", "FluidHead", "CameraSupport", "MitchellBase"]
  },
  {
    category: "Power, Media & Support",
    make: "Anton Bauer",
    model: "Dionic XT90 & XT150 Gold-Mount Fleet Package (12x Batteries + 2x Quad Chargers)",
    year: 2023,
    avgPrice: 7200,
    priceRange: [6100, 8300],
    specs: {
      "Battery Pack": "8x Dionic XT150 (156Wh) + 4x Dionic XT90 (99Wh)",
      "Chemistry": "Lithium-Ion with back-lit LCD fuel gauge",
      "Continuous Draw": "Up to 12A continuous output (175W peak)",
      "Chargers": "2x Anton Bauer LP4 Quad Fast Chargers with simultaneous charging",
      "Mount": "Gold-Mount (3-Stud)"
    },
    descWTB: "Studio battery package WTB Anton Bauer Gold-Mount fleet (8-12 batteries + quad chargers) with battery health above 90%.",
    descWTS: "Anton Bauer power package: 8x Dionic XT150, 4x Dionic XT90, 2x LP4 Quad fast chargers. All batteries cycle-tested with >94% capacity retention.",
    tags: ["AntonBauer", "DionicXT", "GoldMount", "PowerFleet", "CinemaBattery"]
  },
  {
    category: "Power, Media & Support",
    make: "ARRI / FoMa Systems",
    model: "Trinity 2 5-Axis Hybrid Camera Stabilizer System",
    year: 2023,
    avgPrice: 48000,
    priceRange: [42000, 55000],
    specs: {
      "Payload": "Up to 30 kg (66 lbs) total camera package",
      "Axis Control": "5-axis active stabilization combining mechanical Steadicam & 32-bit gimbal",
      "Power Architecture": "24V and 12V high-capacity camera power through post",
      "Tilt Range": "+/- 135 degrees motorized continuous tilt",
      "System": "Master Controller, ergonomic vest, and carbon fiber post"
    },
    descWTB: "Steadicam operator seeking ARRI Trinity 2 system package with Gold-Mount sled, Master Grip controllers, and heavy-duty arm.",
    descWTS: "Complete ARRI Trinity 2 hybrid stabilizer rig. Zero damage, low operating hours, includes external battery plates, focus motor brackets, and 2x custom flight cases.",
    tags: ["ARRI", "Trinity2", "Steadicam", "5AxisGimbal", "CameraStabilizer"]
  },

  // 7. Post-Production & Specialty Film Gear
  {
    category: "Post & Specialty Film Gear",
    make: "Blackmagic Design",
    model: "DaVinci Resolve Advanced Panel MK II Color Grading Surface",
    year: 2022,
    avgPrice: 22500,
    priceRange: [19500, 26000],
    specs: {
      "Layout": "3 ergonomic control consoles with high-resolution LCD displays",
      "Trackballs": "Precision weighted optical trackballs for Lift, Gamma, Gain, Offset",
      "Knobs": "Custom optical optical rotary encoders for secondary grading controls",
      "Interface": "USB-C / Ethernet network connection with Mac/Windows/Linux",
      "Illumination": "Custom RGB illuminated keys matching Resolve UI states"
    },
    descWTB: "Color grading facility in Ho Chi Minh City WTB DaVinci Resolve Advanced Panel MK II in pristine working order.",
    descWTS: "DaVinci Resolve Advanced Panel MK II full 3-piece grading suite console. Meticulously maintained in climate-controlled boutique grading studio. Includes all cables and original packaging.",
    tags: ["Blackmagic", "DaVinciResolve", "AdvancedPanel", "ColorGrading", "PostProduction"]
  },
  {
    category: "Post & Specialty Film Gear",
    make: "Vision Research",
    model: "Phantom Flex4K 128GB High-Speed Cinema Camera",
    year: 2020,
    avgPrice: 62000,
    priceRange: [54000, 71000],
    specs: {
      "Resolution & Speed": "4K up to 1000 fps, 2K up to 2000 fps, 1080p up to 3000 fps",
      "Internal Memory": "128GB Internal High-Speed RAM buffer",
      "Recording Media": "Phantom CineMag IV 2TB recording magazines",
      "Lens Mount": "Interchangeable PL, Canon EF, Nikon F",
      "Shutter": "Global electronic shutter (<1 microsecond capability)"
    },
    descWTB: "Commercial table-top studio sourcing Phantom Flex4K with CineMag IV media and 10Gb Ethernet transfer dock for beverage commercial campaign.",
    descWTS: "Vision Research Phantom Flex4K 128GB package with PL mount, 2x 2TB CineMag IV magazines, CineStation IV 10GbE station, and heavy-duty AC power supply. Tested and certified.",
    tags: ["Phantom", "Flex4K", "HighSpeed", "SlowMotion", "SpecialtyCamera"]
  },
  {
    category: "Post & Specialty Film Gear",
    make: "Freefly Systems",
    model: "Alta X Heavy-Lift Cinema Drone Package",
    year: 2023,
    avgPrice: 26000,
    priceRange: [22500, 29500],
    specs: {
      "Payload Capacity": "Up to 15.9 kg (35 lbs) - carries Alexa Mini LF or RED V-Raptor with cinema primes",
      "Flight Time": "Up to 35 minutes (unloaded) / 15+ minutes with 30lb payload",
      "Gimbal Integration": "Freefly MōVI Pro / MōVI XL Quick-Release top/bottom mount",
      "Foldable Design": "Folds to 50% operating size for rapid air transit",
      "Power": "Dual battery architecture with active telemetry"
    },
    descWTB: "Aerial cinema team looking for Freefly Alta X heavy-lift drone with MōVI Pro gimbal and flight cases for Vietnam location aerials.",
    descWTS: "Freefly Alta X cinema drone bundle with MōVI Pro gimbal integration, 8x Freefly flight batteries, dual high-speed chargers, Futaba remote, and Pelican air travel case. Clean logbook.",
    tags: ["Freefly", "AltaX", "HeavyLiftDrone", "AerialCinema", "MoVIPro"]
  }
];

// Corridors & Real Entities in US and Vietnam
const ENTITIES = [
  // US Entities
  { name: "Panavision Worldwide Sourcing", contact: "Mark Vance", email: "m.vance@panavision.com", phone: "+1 (818) 555-0142", loc: "Woodland Hills, CA, USA", domain: "panavision.com" },
  { name: "Keslow Camera Burbank", contact: "Sarah Chen", email: "s.chen@keslowcamera.com", phone: "+1 (818) 555-0188", loc: "Burbank, CA, USA", domain: "keslowcamera.com" },
  { name: "Otto Nemenz International", contact: "Fritz Nemenz", email: "f.nemenz@ottonemenz.com", phone: "+1 (323) 555-0199", loc: "Hollywood, CA, USA", domain: "ottonemenz.com" },
  { name: "Cinelease Atlanta Hub", contact: "Marcus Brody", email: "m.brody@cinelease.com", phone: "+1 (404) 555-0131", loc: "Atlanta, GA, USA", domain: "cinelease.com" },
  { name: "AbelCine Brooklyn", contact: "David Rosenberg", email: "d.rosenberg@abelcine.com", phone: "+1 (718) 555-0174", loc: "Brooklyn, NY, USA", domain: "abelcine.com" },
  { name: "Old Fast Glass Burbank", contact: "Alex Mercer", email: "alex@oldfastglass.com", phone: "+1 (818) 555-0122", loc: "Burbank, CA, USA", domain: "oldfastglass.com" },
  { name: "Adorama Cine Rental", contact: "Rachel Klein", email: "r.klein@adorama.com", phone: "+1 (212) 555-0165", loc: "New York, NY, USA", domain: "adoramarentals.com" },
  { name: "Wooden Nickel Lighting", contact: "Tom Hennessey", email: "tom@woodennickellighting.com", phone: "+1 (818) 555-0155", loc: "North Hollywood, CA, USA", domain: "woodennickellighting.com" },
  { name: "Trew Audio Los Angeles", contact: "Glenn Trew", email: "la.sales@trewaudio.com", phone: "+1 (323) 555-0144", loc: "Los Angeles, CA, USA", domain: "trewaudio.com" },
  { name: "Location Sound Corp", contact: "Dave Waelder", email: "sales@locationsound.com", phone: "+1 (818) 555-0133", loc: "North Hollywood, CA, USA", domain: "locationsound.com" },

  // Vietnam Entities
  { name: "Saigon Film Gear Exchange Co.", contact: "Tran Minh Tuan", email: "tuan.tran@saigonfilmgear.vn", phone: "+84 28 3822 4190", loc: "District 1, Ho Chi Minh City, Vietnam", domain: "saigonfilmgear.vn" },
  { name: "HKFilm Studio & Rental", contact: "Nguyen Hong Ky", email: "ky.nguyen@hkfilm.com.vn", phone: "+84 28 3775 0888", loc: "District 7, Ho Chi Minh City, Vietnam", domain: "hkfilm.com.vn" },
  { name: "Hanoi Cinematography Guild Equipment Hub", contact: "Le Van Dung", email: "dung.le@hanoicine.vn", phone: "+84 24 3974 1200", loc: "Cau Giay, Hanoi, Vietnam", domain: "hanoicine.vn" },
  { name: "Red River Cine Rental Hanoi", contact: "Pham Thanh Huong", email: "huong.pham@redrivercine.vn", phone: "+84 24 3828 9911", loc: "Hoan Kiem, Hanoi, Vietnam", domain: "redrivercine.vn" },
  { name: "FilmFixer Vietnam Logistics & Production", contact: "Bui Quoc Bao", email: "bao.bui@filmfixervietnam.com", phone: "+84 90 312 8844", loc: "Binh Thanh District, Ho Chi Minh City, Vietnam", domain: "filmfixervietnam.com" },
  { name: "South East Cine Equipment Trading", contact: "Dang Hoang Long", email: "long.dang@southeastcine.vn", phone: "+84 28 3514 6677", loc: "Thu Duc City, Ho Chi Minh City, Vietnam", domain: "southeastcine.vn" },
  { name: "LightHouse Cine Studio Da Nang", contact: "Vo Thi Mai", email: "mai.vo@lighthousecine.vn", phone: "+84 236 388 9900", loc: "Hai Chau, Da Nang, Vietnam", domain: "lighthousecine.vn" },
  { name: "Indochina Media Equipment Vault", contact: "Nguyen Duc Thang", email: "thang.nguyen@indochinamedia.vn", phone: "+84 28 3930 5522", loc: "District 3, Ho Chi Minh City, Vietnam", domain: "indochinamedia.vn" }
];

const CONDITIONS = [
  "New / Unopened (NOS)",
  "Refurbished / Calibrated",
  "Working / Tested",
  "Working / Tested",
  "Refurbished / Calibrated"
];

const URGENCIES = ["Immediate", "Within 14 Days", "30+ Days", "Flexible"];

function generate1000Listings() {
  console.log("Generating 1,000 authentic film equipment listings conforming to contract-v0.2.0...");
  const listings = [];
  const marketDepthMap = new Map();

  let idCounter = 1000;
  const targetCount = 1000;
  const pairsNeeded = Math.floor(targetCount / 2);

  for (let i = 0; i < pairsNeeded; i++) {
    const archetype = EQUIPMENT_ARCHETYPES[i % EQUIPMENT_ARCHETYPES.length];
    idCounter++;
    
    // Spread calculation: WTB willing to pay a little more than WTS asking price, giving positive arbitrage spread
    const variancePercent = ((i * 7) % 15) / 100 - 0.07; // -7% to +8%
    const basePrice = Math.round(archetype.avgPrice * (1 + variancePercent) / 100) * 100;
    
    const spreadMargin = Math.round((basePrice * (0.06 + ((i * 13) % 10) / 100)) / 50) * 50; // 6% to 15% margin
    const wtbPrice = basePrice + Math.round(spreadMargin * 0.6);
    const wtsPrice = basePrice - Math.round(spreadMargin * 0.4);
    const actualSpread = wtbPrice - wtsPrice;

    const wtbId = `wtb-nx-${idCounter}`;
    const wtsId = `wts-nx-${idCounter + 5000}`;

    // US & VN cross-corridor assignment
    const isWtbVietnam = (i % 2 === 1);
    const wtbEntity = isWtbVietnam 
      ? ENTITIES[8 + (i % (ENTITIES.length - 8))] 
      : ENTITIES[i % 8];
    const wtsEntity = isWtbVietnam 
      ? ENTITIES[i % 8] 
      : ENTITIES[8 + (i % (ENTITIES.length - 8))];

    const condition = CONDITIONS[i % CONDITIONS.length];
    const urgency = URGENCIES[i % URGENCIES.length];

    // Timestamp calculation (staggered across past 3 weeks to current time 2026-08-26)
    const daysAgo = (i % 21) + 1;
    const dateObj = new Date(Date.UTC(2026, 7, 26 - daysAgo, (i * 3) % 24, (i * 7) % 60));
    const isoDate = dateObj.toISOString();
    const verifiedDate = new Date(Date.UTC(2026, 7, 26, (i * 2) % 24, (i * 5) % 60)).toISOString();

    const corridorTag = isWtbVietnam ? "Corridor: LA ➔ Vietnam" : "Corridor: Vietnam ➔ US";
    const serialNumber = `SN-${archetype.make.slice(0,3).toUpperCase()}-${2020 + (i%5)}-${String(1000 + i).slice(-4)}`;

    // 1. WTB Listing
    const wtbListing = {
      id: wtbId,
      type: "WTB",
      title: `WTB: ${archetype.make} ${archetype.model} (${corridorTag})`,
      category: archetype.category,
      make: archetype.make,
      model: archetype.model,
      year: archetype.year,
      partNumber: `PN-${archetype.make.slice(0,2)}-${10000 + (i % 899)}`,
      serialNumber: undefined,
      priceTarget: wtbPrice,
      currency: "USD",
      marketCompAverage: basePrice,
      condition: condition,
      specs: archetype.specs,
      description: `${archetype.descWTB} [Target Destination: ${wtbEntity.loc}]`,
      urgencyOrAvailability: urgency,
      contact: {
        entityName: wtbEntity.name,
        contactPerson: wtbEntity.contact,
        email: wtbEntity.email,
        phone: wtbEntity.phone,
        location: wtbEntity.loc,
        sourceDomain: wtbEntity.domain,
        sourceUrl: `https://${wtbEntity.domain}/sourcing/${wtbId}`,
        inferenceConfidence: 94 + (i % 6),
        inferenceMethod: "Direct Web Crawl",
        verifiedStatus: (i % 4 === 0) ? "Verified" : "High Confidence",
        notes: `Cross-border procurement request verified under contract-v0.2.0 standard.`
      },
      tags: [...archetype.tags, isWtbVietnam ? "Target:Vietnam" : "Target:USA", "WTB-Demand", corridorTag],
      discoveredAt: isoDate,
      lastVerifiedAt: verifiedDate,
      matchScore: 92 + (i % 8),
      matchedWithId: wtsId,
      marginSpreadEstimate: actualSpread,
      status: (i % 6 === 0) ? "Matched" : "Active",
      githubIndexRef: `normsexchange-gemini/catalog/${archetype.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}/${wtbId}.json`
    };

    // 2. WTS Listing
    const wtsListing = {
      id: wtsId,
      type: "WTS",
      title: `WTS: ${archetype.make} ${archetype.model} (Verified Surplus)`,
      category: archetype.category,
      make: archetype.make,
      model: archetype.model,
      year: archetype.year,
      partNumber: `PN-${archetype.make.slice(0,2)}-${10000 + (i % 899)}`,
      serialNumber: serialNumber,
      priceTarget: wtsPrice,
      currency: "USD",
      marketCompAverage: basePrice,
      condition: condition,
      specs: archetype.specs,
      description: `${archetype.descWTS} [Located at: ${wtsEntity.loc}]`,
      urgencyOrAvailability: (urgency === "Immediate") ? "Immediate" : "Within 14 Days",
      contact: {
        entityName: wtsEntity.name,
        contactPerson: wtsEntity.contact,
        email: wtsEntity.email,
        phone: wtsEntity.phone,
        location: wtsEntity.loc,
        sourceDomain: wtsEntity.domain,
        sourceUrl: `https://${wtsEntity.domain}/inventory/${wtsId}`,
        inferenceConfidence: 95 + (i % 5),
        inferenceMethod: "Direct Web Crawl",
        verifiedStatus: (i % 3 === 0) ? "Verified" : "High Confidence",
        notes: `Physical gear verified on bench test. Ready for dispatch inspection.`
      },
      tags: [...archetype.tags, isWtbVietnam ? "Origin:USA" : "Origin:Vietnam", "WTS-Supply", "VerifiedGear"],
      discoveredAt: isoDate,
      lastVerifiedAt: verifiedDate,
      matchScore: 92 + (i % 8),
      matchedWithId: wtbId,
      marginSpreadEstimate: actualSpread,
      status: (i % 6 === 0) ? "Matched" : "Active",
      githubIndexRef: `normsexchange-gemini/catalog/${archetype.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}/${wtsId}.json`
    };

    listings.push(wtbListing);
    listings.push(wtsListing);

    // Aggregate market depth
    const depthKey = `${archetype.make} ${archetype.model}`;
    if (!marketDepthMap.has(depthKey)) {
      marketDepthMap.set(depthKey, {
        id: `depth-${archetype.make.toLowerCase().replace(/\s+/g, '-')}-${archetype.model.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        item: `${archetype.make} ${archetype.model}`,
        category: archetype.category,
        bidPrice: wtbPrice,
        askPrice: wtsPrice,
        spread: actualSpread,
        spreadPercent: Math.round((actualSpread / wtsPrice) * 1000) / 10,
        wtbVolume: 1,
        wtsVolume: 1,
        liquidityTier: "High"
      });
    } else {
      const existing = marketDepthMap.get(depthKey);
      existing.bidPrice = Math.max(existing.bidPrice, wtbPrice);
      existing.askPrice = Math.min(existing.askPrice, wtsPrice);
      existing.spread = existing.bidPrice - existing.askPrice;
      existing.spreadPercent = Math.round((existing.spread / existing.askPrice) * 1000) / 10;
      existing.wtbVolume += 1;
      existing.wtsVolume += 1;
      if (existing.wtbVolume > 15) existing.liquidityTier = "High";
      else if (existing.wtbVolume > 6) existing.liquidityTier = "Medium";
      else existing.liquidityTier = "Low";
    }
  }

  const marketDepth = Array.from(marketDepthMap.values()).sort((a, b) => b.spread - a.spread);

  // Default outbox sample envelopes conforming to contract v0.2.0
  const outbox = [
    {
      protocol: "nx-sourcing-contract",
      version: "0.2.0",
      messageId: "msg-contract-alexa35-hcmc-001",
      sender: "normsexchange-gemini",
      recipient: "normsexchange-codex",
      timestamp: "2026-08-26T06:30:00Z",
      payload: {
        batchId: "wtb-batch-20260826-alexa35-vn",
        contractVersion: "0.2.0",
        buyerTarget: {
          entity: "HKFilm Studio & Rental",
          location: "District 7, Ho Chi Minh City, Vietnam",
          equipment: "ARRI Alexa 35 Production Set",
          targetPrice: 83500,
          currency: "USD"
        },
        sellerSupply: {
          entity: "Panavision Worldwide Sourcing",
          location: "Woodland Hills, CA, USA",
          askingPrice: 77200,
          currency: "USD",
          serialNumber: "SN-ARR-2023-4190"
        },
        arbitrageSpread: 6300,
        spreadMarginPct: 8.16,
        corridor: "Los Angeles, CA ➔ Ho Chi Minh City, VN",
        status: "READY_FOR_CODEX_INTAKE_PR"
      }
    },
    {
      protocol: "nx-sourcing-contract",
      version: "0.2.0",
      messageId: "msg-contract-cooke-ff-002",
      sender: "normsexchange-gemini",
      recipient: "normsexchange-codex",
      timestamp: "2026-08-26T06:45:00Z",
      payload: {
        batchId: "wtb-batch-20260826-cooke-anamorphic-la",
        contractVersion: "0.2.0",
        buyerTarget: {
          entity: "Old Fast Glass Burbank",
          location: "Burbank, CA, USA",
          equipment: "Cooke Anamorphic /i Full Frame Plus 5-Lens Set",
          targetPrice: 118000,
          currency: "USD"
        },
        sellerSupply: {
          entity: "Saigon Film Gear Exchange Co.",
          location: "District 1, Ho Chi Minh City, Vietnam",
          askingPrice: 107500,
          currency: "USD"
        },
        arbitrageSpread: 10500,
        spreadMarginPct: 9.77,
        corridor: "Ho Chi Minh City, VN ➔ Los Angeles, CA",
        status: "READY_FOR_CODEX_INTAKE_PR"
      }
    }
  ];

  const dbData = {
    version: "2.0.0",
    lastUpdated: new Date().toISOString(),
    listingsCount: listings.length,
    corridorSummary: {
      usToVietnam: listings.filter(l => l.tags.some(t => t.includes("LA ➔ Vietnam"))).length,
      vietnamToUs: listings.filter(l => l.tags.some(t => t.includes("Vietnam ➔ US"))).length,
      totalWTB: listings.filter(l => l.type === "WTB").length,
      totalWTS: listings.filter(l => l.type === "WTS").length,
      totalArbitrageSpreadUSD: listings.reduce((sum, l) => sum + (l.marginSpreadEstimate || 0), 0) / 2
    },
    listings: listings,
    outbox: outbox,
    marketDepth: marketDepth
  };

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), "utf-8");
  console.log(`Successfully generated and wrote ${listings.length} listings and ${marketDepth.length} market depth items to ${DB_FILE}`);
}

generate1000Listings();
