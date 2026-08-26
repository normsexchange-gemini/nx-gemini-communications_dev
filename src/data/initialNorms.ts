import { Norm } from "../types";

export const INITIAL_NORMS: Norm[] = [
  {
    id: "async-4h-slack-sla",
    title: "The 4-Hour Async Response SLA",
    category: "Communication",
    tagline: "Break the tyranny of immediate Slack replies without leaving peers stranded.",
    description: "Establishes a universal expectation that chat messages do not require an immediate ping-back. Deep work is protected, while ensuring business continuity with predictable turnaround windows.",
    triggerSituation: "Receiving a non-urgent direct message or mention during core working hours.",
    explicitRule: "Default expectation for responses is within 4 working hours. If something is a genuine P0 incident, use the `@oncall-urgent` handle or phone bridge. Never assume silence implies ignorance.",
    violationRemedy: "If someone messages multiple times within 4 hours without urgency, reply with: 'In focused flow right now; on track to review by [Time].'",
    reciprocityIndex: 88,
    frictionRisk: "High",
    clarityScore: 95,
    antiPatterns: [
      "Sending 'quick question?' and waiting for a live reply before typing the question",
      "Treating read receipts as binding commitments for immediate execution"
    ],
    adoptionWeeks: 2,
    culturalContextNotes: "Essential for bridging low-context cultures (direct expectation) and high-context cultures (where delayed response might otherwise be misread as passive hostility).",
    votesCount: 412,
    adoptionsCount: 1890,
    tags: ["Async", "DeepWork", "Slack", "Focus"],
    author: {
      name: "Dr. Elena Rostova",
      role: "Organizational Systems Researcher",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      organization: "Async Work Institute"
    }
  },
  {
    id: "deep-work-wednesday-sanctuary",
    title: "Deep Work Wednesday Sanctuary",
    category: "Meetings & Time",
    tagline: "A recurring zero-meeting weekday dedicated exclusively to flow-state output.",
    description: "Blocks an entire calendar day across the organization to eliminate fragmented 30-minute calendar gaps, fostering substantial creative and technical breakthrough time.",
    triggerSituation: "Scheduling any internal sync, standup, 1:1, or committee meeting on a Wednesday.",
    explicitRule: "Zero internal meetings permitted on Wednesdays. All recurring syncs are shifted to Tue/Thu. If an external client insists, the meeting host must explicitly apologize to their deep-work calendar.",
    violationRemedy: "Team members have blanket permission to decline any internal invite scheduled on Wednesday with reason code #DeepWorkWed.",
    reciprocityIndex: 92,
    frictionRisk: "Medium",
    clarityScore: 98,
    antiPatterns: [
      "Scheduling a 'quick 15-minute alignment' at 1:00 PM that fractures both morning and afternoon flow",
      "Replacing verbal meetings with mandatory real-time Slack chat storms"
    ],
    adoptionWeeks: 3,
    culturalContextNotes: "Highly valued in autonomous engineering and creative teams. Requires upfront alignment with stakeholder-heavy sales & ops functions.",
    votesCount: 528,
    adoptionsCount: 2450,
    tags: ["NoMeetings", "Productivity", "FlowState", "CalendarHygiene"],
    author: {
      name: "Marcus Vance",
      role: "VP of Engineering & Team Systems",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      organization: "Distributed Scale Lab"
    }
  },
  {
    id: "blameless-incident-retrospective",
    title: "Blameless Outage Retrospective",
    category: "Engineering",
    tagline: "Treat system failures as systemic learning opportunities, never personal shortcomings.",
    description: "A formal psychological agreement that human error is the symptom of an imperfect system architecture, not the root cause. Focuses on guardrails rather than blame.",
    triggerSituation: "Following any service degradation, production outage, or critical data defect.",
    explicitRule: "Post-incident reviews must never attribute fault to an individual's name. Questions focus on 'What information or safety net was missing?' rather than 'Why did you click that?'",
    violationRemedy: "If an attendee asks an accusatory question during the post-mortem, the facilitator immediately interrupts: 'Let us reframe how the system permitted that state.'",
    reciprocityIndex: 96,
    frictionRisk: "High",
    clarityScore: 92,
    antiPatterns: [
      "Subtly singling out junior engineers in summary incident slides",
      "Skipping the retro because 'we already know who messed up'"
    ],
    adoptionWeeks: 4,
    culturalContextNotes: "Critical in high-power-distance cultural backgrounds where public admission of error carries severe social shame.",
    votesCount: 680,
    adoptionsCount: 3120,
    tags: ["DevOps", "PsychologicalSafety", "PostMortem", "Resilience"],
    author: {
      name: "Siddharth Nair",
      role: "Principal Reliability Architect",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      organization: "Cloud Resilience Forum"
    }
  },
  {
    id: "reciprocal-social-equity-compact",
    title: "The Reciprocal Favors Ledger (Zero Hidden Debt)",
    category: "Reciprocity & Social",
    tagline: "Make mutual assistance transparent and balanced so social goodwill never turns into quiet resentment.",
    description: "Based on classical Social Exchange Theory: relationships degrade when one party accumulates unacknowledged support debt. This norm establishes open acknowledgment and mutual favor circulation.",
    triggerSituation: "When a colleague steps in to cover your on-call shift, do extra code review, or prep slides.",
    explicitRule: "Always state the cost and thank publicly in team channels. Within 14 days, proactively offer a reciprocal favor ('I'll take your Friday deploy shift' or 'I will draft the next RFC').",
    violationRemedy: "If a peer consistently requests favors without reciprocating, have a structured 1:1 check-in referencing mutual exchange balance rather than emotional critique.",
    reciprocityIndex: 100,
    frictionRisk: "High",
    clarityScore: 86,
    antiPatterns: [
      "Quietly keeping a mental tally of grievances instead of communicating balance",
      "Treating favors as permanent entitlements rather than voluntary social generosity"
    ],
    adoptionWeeks: 3,
    culturalContextNotes: "Essential across varied reciprocity cultures—distinguishing between immediate transactional payback (Western) vs long-term relational gift exchange (Guanxi / On).",
    votesCount: 345,
    adoptionsCount: 1240,
    tags: ["SocialExchange", "Reciprocity", "TeamTrust", "Equity"],
    author: {
      name: "Prof. Kenneth Meyer",
      role: "Social Exchange Theorist",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      organization: "Behavioral Dynamics Lab"
    }
  },
  {
    id: "high-low-context-briefing",
    title: "High-Context vs Low-Context Briefing Bridge",
    category: "Cross-Cultural",
    tagline: "Eliminate misinterpretation between direct and indirect communicators with dual-layer specs.",
    description: "Provides both direct, concise bullet points (for low-context cultures like US/Germany/Netherlands) and background contextual narratives (for high-context cultures like Japan/Brazil/Saudi Arabia).",
    triggerSituation: "Publishing a project brief, strategic announcement, or cross-team requirement doc.",
    explicitRule: "Every strategic brief must include: Layer 1 (The TL;DR Direct Action Table) followed by Layer 2 (The Relational Context & Why This Matters for Stakeholders).",
    violationRemedy: "If feedback suggests confusion or perceived abruptness, update the brief with the missing context layer within 24 hours.",
    reciprocityIndex: 84,
    frictionRisk: "High",
    clarityScore: 90,
    antiPatterns: [
      "Sending single-sentence command emails that read as blunt aggression in high-context regions",
      "Writing 5-page philosophical memos with no clear action items or deadlines"
    ],
    adoptionWeeks: 3,
    culturalContextNotes: "Directly bridges Hofstede cultural dimensions and Erin Meyer's Culture Map.",
    votesCount: 490,
    adoptionsCount: 1980,
    tags: ["CrossCultural", "GlobalTeams", "CommunicationMap", "Diversity"],
    author: {
      name: "Mei-Ling Zhou",
      role: "Global Collaboration Consultant",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      organization: "Global Culture Grid"
    }
  },
  {
    id: "disagree-and-commit-48h-cooling",
    title: "Disagree & Commit with 48h Cooling Window",
    category: "Decision Making",
    tagline: "Vigorous debate before the gavel falls, 100% unified execution after.",
    description: "Protects psychological safety during debates while preventing zombie arguments and passive sabotage during execution.",
    triggerSituation: "When a team decision has reached the final vote and consensus is not 100% unanimous.",
    explicitRule: "Dissenters are required to voice all counter-arguments prior to sign-off. Once decided, all parties commit 100% to execution for 48 hours without revisiting, unless new empirical data emerges.",
    violationRemedy: "If someone undermines the decision in side channels, any team member can invoke 'Code Commit 48' to redirect focus back to agreed execution.",
    reciprocityIndex: 89,
    frictionRisk: "Medium",
    clarityScore: 94,
    antiPatterns: [
      "Nodding along in the group meeting and then complaining in 1:1 DMs immediately after",
      "Refusing to execute until full philosophical agreement is achieved"
    ],
    adoptionWeeks: 2,
    culturalContextNotes: "Helps teams move forward when consensus-driven cultures clash with command-driven decisiveness.",
    votesCount: 610,
    adoptionsCount: 2890,
    tags: ["Decisiveness", "Commitment", "ExecutiveNorms", "Leadership"],
    author: {
      name: "Alexandre Dupuis",
      role: "Strategy & Governance Director",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      organization: "Governance Dynamics"
    }
  },
  {
    id: "24h-pr-review-turnaround",
    title: "The 24-Hour PR Review Turnaround & Karma",
    category: "Engineering",
    tagline: "Never let pull requests rot; treat teammate code reviews with the same urgency as writing code.",
    description: "Code sitting in review is depreciating inventory. This norm sets a guaranteed 24-hour turnaround for PRs under 400 lines.",
    triggerSituation: "When tagged as an assigned reviewer on a pull request.",
    explicitRule: "Review within 24 working hours (Approve, Request Changes, or Leave Comments). If a PR exceeds 400 lines, the author must provide a 2-minute Loom walkthrough.",
    violationRemedy: "Automated Slack nudge at hour 20; if unreviewed at 24 hours, author may reassign to secondary reviewer without social friction.",
    reciprocityIndex: 94,
    frictionRisk: "High",
    clarityScore: 97,
    antiPatterns: [
      "Letting PRs sit for 5 days while starting new feature branches",
      "Leaving vague 'looks weird' comments without actionable suggestions"
    ],
    adoptionWeeks: 2,
    culturalContextNotes: "Balances individual sprint velocity against communal code health.",
    votesCount: 570,
    adoptionsCount: 2600,
    tags: ["CodeReview", "Agile", "EngineeringStandards", "Velocity"],
    author: {
      name: "Tara O'Connor",
      role: "Engineering Director",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      organization: "Modern Dev Norms"
    }
  },
  {
    id: "harmonized-customs-compliance-audit",
    title: "Harmonized Standards & Customs Compliance Cadence",
    category: "Trade & Compliance",
    tagline: "Cross-border regulatory alignment, HS classification checks, and audit trails.",
    description: "Ensures that product data, tariff codes, origin proofs, and trade compliance norms are synchronized across supply chain and engineering systems before border transit.",
    triggerSituation: "When releasing cross-border products, international SKU updates, or tariff schedule modifications.",
    explicitRule: "Every cross-border product manifest must undergo automated HS code validation and dual-sign-off from compliance lead within 48h of trade classification update.",
    violationRemedy: "If customs discrepancy flags exceed 0.5% in a quarter, trigger a root-cause alignment sprint with the global logistics unit.",
    reciprocityIndex: 90,
    frictionRisk: "High",
    clarityScore: 96,
    antiPatterns: [
      "Shipping international cargo with placeholder tariff codes to hit delivery targets",
      "Treating trade regulations as an afterthought left only to external freight forwarders"
    ],
    adoptionWeeks: 4,
    culturalContextNotes: "Ensures international legal compliance across WCO (World Customs Organization) standards and regional trade pacts.",
    votesCount: 310,
    adoptionsCount: 890,
    tags: ["Customs", "TradeCompliance", "HSCode", "InternationalTrade", "SupplyChain"],
    author: {
      name: "Raymond Chen",
      role: "Global Trade & Customs Strategist",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      organization: "WebCustoms Trade Institute"
    }
  },
  {
    id: "camera-optional-meetings",
    title: "Camera-Optional Meetings by Default",
    category: "Meetings & Time",
    tagline: "Reduce Zoom fatigue and sensory overload by decoupling attention from video feeds.",
    description: "A formal recognition that active presence does not require continuous facial performance on webcam.",
    triggerSituation: "Joining standard internal check-ins, sprint planning, or 1:1s.",
    explicitRule: "Video is completely optional unless explicitly marked [Camera On: Social Celebration / Client Facing]. No one is asked 'Why is your camera off today?'",
    violationRemedy: "If a meeting organizer demands video without prior notice, attendees can post the 🎧 status in chat.",
    reciprocityIndex: 82,
    frictionRisk: "Low",
    clarityScore: 91,
    antiPatterns: [
      "Judging someone's engagement solely by whether their video box is active",
      "Calling out someone's background or attire in public meetings"
    ],
    adoptionWeeks: 1,
    culturalContextNotes: "Reduces anxiety for neurodivergent teammates and employees in shared household environments.",
    votesCount: 460,
    adoptionsCount: 2150,
    tags: ["ZoomFatigue", "RemoteWork", "Inclusion", "Wellness"],
    author: {
      name: "Nadia Al-Mansoor",
      role: "Workplace Ergonomics & Inclusion Lead",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      organization: "Human-First Workplace"
    }
  },
  {
    id: "public-praise-private-critique",
    title: "Public Praise, Private Critique",
    category: "Leadership",
    tagline: "Amplify wins to the group; deliver constructive feedback in high-safety private 1:1s.",
    description: "Maintains high psychological safety and prevents defensive posturing by ensuring critiques are never performed as spectator sports.",
    triggerSituation: "When noticing a mistake, missed deadline, or behavioral friction in a colleague.",
    explicitRule: "Never reprimand or point out flaws in shared Slack channels or large meetings. Schedule a 15-minute 1:1 or send a warm direct message with specific examples and proposed paths forward.",
    violationRemedy: "If public criticism occurs, the leader must post a public apology acknowledging the breach of the critique norm.",
    reciprocityIndex: 95,
    frictionRisk: "High",
    clarityScore: 98,
    antiPatterns: [
      "Using sarcastic emojis or 'roasting' teammates in general company channels",
      "Praising only the most vocal contributors while ignoring silent backend heroes"
    ],
    adoptionWeeks: 2,
    culturalContextNotes: "Universal psychological hygiene; indispensable in face-saving cultural environments.",
    votesCount: 715,
    adoptionsCount: 3890,
    tags: ["Leadership", "PsychologicalSafety", "Feedback", "Culture"],
    author: {
      name: "Dr. Gregory Scott",
      role: "Executive Leadership Coach",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      organization: "Executive Dynamics Group"
    }
  },
  {
    id: "five-minute-favor-compact",
    title: "The 'Five-Minute Favor' Mentorship Compact",
    category: "Reciprocity & Social",
    tagline: "Always say yes to requests that take 5 minutes or less to help a colleague unlock progress.",
    description: "Popularized by Adam Grant's Give and Take. Creating a micro-giving culture where small low-friction gestures generate immense team velocity and goodwill.",
    triggerSituation: "A peer asks for a quick intro, file link, or sanity-check that takes <5 minutes.",
    explicitRule: "Commit to fulfilling 5-minute favor requests within 4 hours if within working bandwidth. If it will take >5 minutes, politely scope it: 'I can give you 5 min on this right now, or schedule 30m on Friday.'",
    violationRemedy: "Celebrate the top monthly micro-giver in the team shoutouts channel.",
    reciprocityIndex: 98,
    frictionRisk: "Low",
    clarityScore: 90,
    antiPatterns: [
      "Turning simple 2-minute answers into 45-minute calendar booking requests",
      "Abusing the favor rule to offload substantive work under the guise of 'a quick check'"
    ],
    adoptionWeeks: 2,
    culturalContextNotes: "Instills Adam Grant's 'Giver vs Taker' dynamic into operational habits.",
    votesCount: 540,
    adoptionsCount: 2310,
    tags: ["Mentorship", "Generosity", "AdamGrant", "SocialCapital"],
    author: {
      name: "Maya Lin",
      role: "Community & Culture Strategist",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      organization: "High Velocity Culture Lab"
    }
  },
  {
    id: "async-decision-rfc-72h",
    title: "Async Decision RFC with 72-Hour Sunset Timer",
    category: "Decision Making",
    tagline: "No more endless bikeshedding; proposals pass automatically if no blocking objections emerge.",
    description: "Transforms decision-making from synchronous bottleneck meetings into written, time-boxed Requests for Comments with clear veto criteria.",
    triggerSituation: "Proposing an architectural change, process update, or tool migration.",
    explicitRule: "Publish the RFC doc with an explicit 72-hour timer. If no blocker with concrete alternative is lodged within 72h, the proposal is deemed approved and execution begins immediately.",
    violationRemedy: "Late objections after the 72h window are logged for v2 consideration only and cannot block current deployment.",
    reciprocityIndex: 87,
    frictionRisk: "Medium",
    clarityScore: 96,
    antiPatterns: [
      "Blocking an RFC with vague 'I don't feel good about this' without proposing a solution",
      "Re-opening settled RFCs after implementation has started"
    ],
    adoptionWeeks: 3,
    culturalContextNotes: "Empowers introverted and asynchronous thinkers across global timezones who are otherwise talked over in live calls.",
    votesCount: 480,
    adoptionsCount: 2100,
    tags: ["RFC", "AsyncGovernance", "Decisions", "Documentation"],
    author: {
      name: "Kasper Lindqvist",
      role: "Open Source Governance Architect",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      organization: "Nordic Tech Guild"
    }
  }
];

export const INITIAL_SIMULATION_SCENARIOS = [
  {
    id: "scenario-oncall-swap",
    title: "The Weekend On-Call Dilemma",
    context: "Sarah has an unexpected family wedding on Saturday and asks Kevin to take her 24-hour PagerDuty on-call shift.",
    actorA: "Sarah (Requestor)",
    actorB: "Kevin (Colleague)",
    choiceOptions: [
      {
        id: "opt-1",
        action: "Kevin accepts unconditionally and Sarah makes an explicit reciprocal pact ('I will take your next holiday shift in November').",
        outcomeText: "Healthy Reciprocity achieved! Both parties experience high psychological safety and trust increases without unspoken debt.",
        equityImpactA: +15,
        equityImpactB: +15,
        relationshipTrustChange: +25,
        socialTheoryPrinciple: "Explicit Reciprocity & Generalized Exchange: Transparent matching of effort prevents social debt buildup."
      },
      {
        id: "opt-2",
        action: "Kevin reluctantly accepts with a sigh. Sarah says 'Thanks so much!' and forgets about it after the weekend.",
        outcomeText: "Hidden Social Debt! Kevin feels unappreciated and harbor silent resentment; next time Sarah needs help, Kevin creates an excuse.",
        equityImpactA: -10,
        equityImpactB: -25,
        relationshipTrustChange: -30,
        socialTheoryPrinciple: "Unreciprocated Benefaction: Asymmetric social exchange generates grievance and withdrawal."
      },
      {
        id: "opt-3",
        action: "Kevin says he cannot do 24 hours, but offers to cover the peak 8-hour daytime window if Sarah finds someone for the night.",
        outcomeText: "Constructive Boundary Setting! Honest negotiation maintains fairness without passive aggression.",
        equityImpactA: +5,
        equityImpactB: +10,
        relationshipTrustChange: +12,
        socialTheoryPrinciple: "Negotiated Exchange: Realistic boundary communication preserves long-term collaboration equity."
      }
    ]
  },
  {
    id: "scenario-pr-bottleneck",
    title: "The Urgent Code Review Standoff",
    context: "Devon has a critical security patch ready. Mateo is in deep work preparing for a client pitch tomorrow morning.",
    actorA: "Devon (Developer)",
    actorB: "Mateo (Senior Reviewer)",
    choiceOptions: [
      {
        id: "opt-1",
        action: "Devon follows the '4-Hour Async SLA' with [P0 Security Hotfix] tag and a 90-second summary. Mateo takes a 10-minute focus break to review.",
        outcomeText: "High Velocity Synergy! Clear signals prevent interruptive panic while expediting critical security path.",
        equityImpactA: +20,
        equityImpactB: +15,
        relationshipTrustChange: +20,
        socialTheoryPrinciple: "Signaling Theory: Accurate urgency metadata allows optimal cost-benefit calculation for the helper."
      },
      {
        id: "opt-2",
        action: "Devon pings Mateo on Slack 4 times, then sends a DM to Mateo's manager claiming engineering is blocked.",
        outcomeText: "Escalation Friction! Mateo feels undermined and hostile. Trust between squads plummets.",
        equityImpactA: -30,
        equityImpactB: -20,
        relationshipTrustChange: -40,
        socialTheoryPrinciple: "Social Coercion Penalty: Forcing compliance via hierarchical pressure damages horizontal social bonds."
      }
    ]
  }
];
