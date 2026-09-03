export const FIRST_AID_MODULES = [
  {
    id: 'severe_bleeding',
    title: 'Severe Bleeding Control',
    severity: 'CRITICAL',
    badgeColor: 'bg-red-600',
    summary: 'Direct firm pressure is the single most effective action to prevent fatal hemorrhage.',
    steps: [
      {
        step: 1,
        action: 'Call Emergency Dispatch (108 / 112 / 911)',
        detail: 'Put phone on speaker while delivering immediate care. Do not delay direct pressure.',
      },
      {
        step: 2,
        action: 'Apply Firm Direct Pressure',
        detail: 'Press directly on the bleeding site using sterile gauze or any available clean cloth. Maintain continuous, heavy downward pressure without lifting.',
      },
      {
        step: 3,
        action: 'Do NOT Remove Soaked Dressings',
        detail: 'If blood seeps through, add more cloth/dressings directly on top and continue pressing firmly.',
      },
      {
        step: 4,
        action: 'Tourniquet Usage (Trained Only)',
        detail: 'Only if catastrophic arterial limb bleeding does not stop with direct pressure, apply a commercial tourniquet 2-3 inches above the wound (never over a joint). Note time applied.',
      },
    ],
  },
  {
    id: 'airway',
    title: 'Airway & Breathing Care',
    severity: 'CRITICAL',
    badgeColor: 'bg-amber-600',
    summary: 'Maintain an open airway without moving the cervical spine if trauma is suspected.',
    steps: [
      {
        step: 1,
        action: 'Protect Neck and Spine',
        detail: 'Assume spinal injury in any vehicular accident. Keep head and neck completely aligned. Do not turn or twist head.',
      },
      {
        step: 2,
        action: 'Jaw-Thrust Maneuver (Trauma Safe)',
        detail: 'If victim is unconscious and struggling to breathe, gently lift angles of the lower jaw forward without tilting neck backward.',
      },
      {
        step: 3,
        action: 'Check Airway Clearance',
        detail: 'Only clear visible debris or vomit from the mouth if it can be done without blindly probing deep into the throat.',
      },
      {
        step: 4,
        action: 'Follow Dispatcher Audio Promptly',
        detail: 'Emergency dispatchers provide real-time verbal airway protocols while ambulances are en route.',
      },
    ],
  },
  {
    id: 'cpr',
    title: 'Hands-Only CPR Protocol',
    severity: 'LIFE-THREATENING',
    badgeColor: 'bg-red-700',
    summary: 'For unresponsive victims with absent or abnormal/agonal breathing.',
    steps: [
      {
        step: 1,
        action: 'Call Emergency Dispatch Immediately',
        detail: 'Confirm ALS ambulance response before beginning compressions.',
      },
      {
        step: 2,
        action: 'Center of Chest Positioning',
        detail: 'Place the heel of one hand in the center of the chest. Interlock your second hand on top. Keep arms straight and shoulders directly over hands.',
      },
      {
        step: 3,
        action: 'Push Hard and Fast (100–120 BPM)',
        detail: 'Compress at least 2 inches (5 cm) deep at a tempo of 100-120 beats/minute. Allow full chest recoil between compressions.',
      },
      {
        step: 4,
        action: 'Do Not Stop Until Paramedics Arrive',
        detail: 'If you tire, swap with another bystander seamlessly every 2 minutes.',
      },
    ],
  },
  {
    id: 'fracture',
    title: 'Suspected Fracture / Deformity',
    severity: 'URGENT',
    badgeColor: 'bg-orange-600',
    summary: 'Stabilize limbs in the position found. Do not manipulate or attempt to set bones.',
    steps: [
      {
        step: 1,
        action: 'Keep Injured Limb Still',
        detail: 'Support the limb with rolled jackets, towels, or firm splints on either side to minimize movement.',
      },
      {
        step: 2,
        action: 'Control Any Associated Bleeding',
        detail: 'Cover open fractures with clean, sterile dressing. Do not press directly on protruding bone fragments.',
      },
      {
        step: 3,
        action: 'Monitor Circulation',
        detail: 'Check pulse or sensation below the injury site (e.g. warmth of fingers or toes).',
      },
    ],
  },
];

export const MEDICAL_SAFETY_DISCLAIMER =
  "TraumaGrid is an assistive prototype engineered for educational and hackathon demonstration. It is NOT clinically validated and does NOT replace trained emergency medical professionals. Always follow emergency dispatch (108 / 112 / 911) instructions immediately.";
