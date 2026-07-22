/* ============================================================
   SITE_DATA — single source of truth for both research projects.
   Authoring model: screenshots live as static files in
   /assets/screens (full) + /assets/thumbs (gallery); every image
   is referenced here by filename, never uploaded through the UI.
   To add evidence: drop the file in both folders, add one entry
   to the relevant stage's `evidence` array. Pins are optional,
   percentage-based [x, y] coordinates over the image.
   ============================================================ */

const SITE_DATA = {

  lmfe: {
    slug: "lmfe",
    name: "LM-FE App",
    tag: "Last-mile delivery executive",
    heroTitle: "The delivery executive\u2019s journey",
    heroAbstract: "A field study of the Delhivery LM-FE app, tracing one delivery executive\u2019s path from first login to end-of-day reconciliation \u2014 four stages, twenty-one touchpoints, and the friction hiding inside each one.",
    figmaUrl: "https://www.figma.com/design/Vw3Y3CjL1HXkhvmqY8lZLB/LM-FE-App-Research?node-id=336-10043",
    stages: [
      {
        id: "onboards",
        code: "STG\u201101",
        title: "User onboards to the application",
        narrative: "The executive\u2019s first contact with Delhivery: logging into the partner app, applying with Aadhaar KYC, and configuring the LM-FE app itself with a driving licence, PAN and bank details before a single delivery happens.",
        touchpoints: [
          "Logs into the partner app",
          "Applies to work as a Delhivery executive",
          "Adds Aadhaar details and completes the application",
          "Is prompted to download the app and reach their workplace",
          "Adds driving licence, PAN card and bank details to configure their LM-FE account"
        ],
        userChallenges: [
          "Accessibility of progressive CTAs while onboarding on the partner app can be improved",
          "FE App can be shown as downloaded, but is not accessible in the downloads"
        ],
        challenges: [
          {
            id: "onb-login-polish",
            severity: "critical",
            title: "Login and onboarding flows lack basic usability polish",
            body: "Ghost text for phone number format is missing, error states use incorrect colours (yellow instead of red), and there\u2019s no option to go back and edit the phone number once entered. OTP fields are too small, and new users are taken directly to PIN setup without any intimation that they\u2019re new.",
            evidence: ["login-otp-sent", "aadhaar-otp-generating", "aadhaar-otp-maxattempts"]
          },
          {
            id: "onb-doc-verify",
            severity: "critical",
            title: "Document verification and account setup is confusing and error-prone",
            body: "The stepper for DL, PAN and bank details is inconsistent \u2014 steps 1 and 2 are document uploads while step 3 is a form. Driving licence is shown as a \u201cNumber\u201d field when it\u2019s actually a 15-digit alphanumeric code. PAN\u2013Aadhaar linking copy needs refinement, and there\u2019s no help or guidance if users don\u2019t have their cards linked.",
            evidence: ["driving-licence-accepting", "pan-verified", "aadhaar-verified-validation"]
          },
          {
            id: "onb-landing",
            severity: "major",
            title: "The landing page and post-login experience fails to orient the user",
            body: "The page hierarchy is off \u2014 \u201cGood morning\u201d is prioritised over pending document verification. The landing page has only one CTA with no other relevant workflow details. Concepts like \u201cLastMile Pro\u201d and \u201cpermission to auto-start\u201d are not explained. There\u2019s no primary navigation \u2014 everything is hidden under a menu.",
            evidence: ["fe-home-docs-pending", "next-steps-welcome", "delhivery-home"]
          },
          {
            id: "onb-multilingual",
            severity: "major",
            title: "No multilingual support or accessibility features",
            body: "Users with lower literacy levels, which is critical for the target user base, have no language options or accessibility accommodations.",
            evidence: ["get-started", "fe-app-download"]
          }
        ],
        metrics: [
          { name: "Onboarding Completion Rate", def: "% of riders who start the partner-app signup and successfully complete all steps (DL, PAN, bank details) to become active on the FE app." },
          { name: "First-week Attrition Rate", def: "% of riders who leave within 7 days of onboarding. If riders don\u2019t understand the app, they churn before generating any value." },
          { name: "Document Verification Error Rate", def: "% of document submissions that fail on first attempt (DL format errors, PAN\u2013Aadhaar linking failures, bank verification failures)." },
          { name: "Support Ticket Volume During Onboarding", def: "Number of help requests raised in the first 7 days. If this is high, the app isn\u2019t self-explanatory enough." }
        ],
        opportunities: [
          { title: "Redesign the login and document verification flow as a single guided experience", body: "A unified, linear onboarding wizard with proper input masks, inline validation, and clear progress indication would directly reduce the document verification error rate and first-week attrition.", addresses: ["onb-login-polish", "onb-doc-verify"] },
          { title: "Build a meaningful post-login landing experience", body: "Restructuring the landing page to surface pending actions, explain key concepts, and provide primary navigation would reduce support ticket volume and help new riders orient themselves faster.", addresses: ["onb-landing"] },
          { title: "Introduce multilingual support and accessibility accommodations", body: "Adding regional language options and simplified UI patterns (icon-led navigation, voice guidance) would improve onboarding completion rate across Tier 2/3 cities.", addresses: ["onb-multilingual"] }
        ]
      },
      {
        id: "assign",
        code: "STG\u201102",
        title: "Assigning shipment to the driver",
        narrative: "Before any delivery, the executive books a working slot, punches in for the day, and waits for the team lead to assign shipments \u2014 which then surface on the Shipments tab.",
        touchpoints: [
          "Proceeds to book slots",
          "Selects a week",
          "Selects a day where slots are not fully booked yet",
          "Views a summary of slots and confirms the booking",
          "Starts delivering by punching in",
          "Gets deliveries assigned by the team lead, shown on the Shipments tab"
        ],
        userChallenges: [
          "User needs to be educated on what FWD, RVP and Direct orders are",
          "User isn\u2019t able to understand the difference between priority and flash",
          "Loading screens while creating a dispatch take longer than expected"
        ],
        challenges: [
          {
            id: "asn-hierarchy",
            severity: "critical",
            title: "Shipment list lacks critical information hierarchy",
            body: "Number of packages, proximity from current location, and potential earnings are secondary or missing. Users can\u2019t easily filter by priority.",
            evidence: ["shipments-list", "shipments-map"]
          },
          {
            id: "asn-route",
            severity: "major",
            title: "Route optimization is absent",
            body: "There\u2019s no shortest-path guidance for multiple delivery points. Riders have to manually find directions for each location one by one.",
            evidence: ["shipments-map"]
          },
          {
            id: "asn-dispatch-gaps",
            severity: "major",
            title: "Create dispatch flow has navigation and status gaps",
            body: "How a user navigates from the homepage to the shipment/dispatch screens is unclear. \u201cPunch out\u201d is not at the same hierarchical level as \u201ccreate dispatch.\u201d",
            evidence: ["dispatch-empty", "fe-home-activated"]
          },
          {
            id: "asn-iconography",
            severity: "minor",
            title: "Iconography and visual cues are inconsistent",
            body: "The lightning icon\u2019s purpose is unclear, amount tags are inconsistently shown, and the shipment/summary icons look off in terms of size and weight.",
            evidence: ["shipments-list"]
          }
        ],
        metrics: [
          { name: "Dispatch Creation Time", def: "Average time from punch-in to first dispatch created." },
          { name: "Dwell Time at Dispatch Center", def: "Time spent at the DC before leaving for deliveries." },
          { name: "Unassigned Shipment Ratio", def: "% of shipments sitting at the depot without being assigned to a rider." }
        ],
        opportunities: [
          { title: "Redesign the shipment list with an information hierarchy that supports decision-making", body: "Surfacing earnings potential, distance, and shipment type with inline education would reduce dispatch creation time and the learning curve for new riders.", addresses: ["asn-hierarchy"] },
          { title: "Introduce route optimization for multiple delivery points", body: "Even a basic route suggestion (ordered delivery sequence based on proximity) would reduce average delivery time per shipment and dwell time.", addresses: ["asn-route"] },
          { title: "Fix the create dispatch and punch-in/punch-out flow hierarchy", body: "Equalising the hierarchy of daily-use actions and fixing state management would streamline the DC-to-field transition.", addresses: ["asn-dispatch-gaps", "asn-iconography"] }
        ]
      },
      {
        id: "deliver",
        code: "STG\u201103",
        title: "Driver leaves for deliveries and completes them",
        narrative: "The densest stage: fulfilling deliveries in order, collecting COD or verifying prepaid orders, capturing proof of delivery, and handling the moments when a customer can\u2019t be reached at all.",
        touchpoints: [
          "Sees all deliveries on the Shipments tab",
          "Proceeds to fulfil deliveries in order",
          "For COD \u2014 takes payment and marks delivered",
          "Selects the delivery recipient",
          "Clicks a selfie to ensure the helmet is visible",
          "If the customer is unavailable, marks undelivered with a reason and OTP",
          "Once payment is done, marks the order complete",
          "For prepaid, gets the customer\u2019s signature or a photo"
        ],
        userChallenges: [
          "Map location vs. actual customer location is quite different",
          "Some customers are reluctant to give signatures/photos for prepaid orders",
          "The selfie requirement appears late in the flow",
          "App updates happen at any time, rendering the app unusable mid-delivery",
          "OTP for cancellations doesn\u2019t arrive for some customers",
          "Cancel order doesn\u2019t work for some orders"
        ],
        challenges: [
          {
            id: "del-payment",
            severity: "critical",
            title: "Payment collection flows are confusing",
            body: "COD warning appears before payment, UPI options don\u2019t feel like CTAs, the \u201cPayer\u201d label causes confusion, and cash/digital logic can split unpredictably.",
            evidence: ["order-detail-pending", "payment-pending-retry", "qr-verified-cod", "qr-payment-success"]
          },
          {
            id: "del-verification",
            severity: "critical",
            title: "Delivery verification has usability issues",
            body: "The selfie appears late in the flow, the self-signature workaround defeats the point of verification, and OTPs don\u2019t reach some customers.",
            evidence: ["pod-signature-pad", "pod-photo-capture", "pod-recipient-options"]
          },
          {
            id: "del-cancel",
            severity: "critical",
            title: "The cancel order flow is problematic",
            body: "Cancel doesn\u2019t work for some orders. There\u2019s no refund notification and no clear next steps once a cancellation is attempted.",
            evidence: ["nsl-reasons", "nsl-reschedule-selected", "reschedule-whatsapp-otp", "reschedule-whatsapp-otp-2", "reschedule-code-entry"]
          },
          {
            id: "del-geofence",
            severity: "major",
            title: "Map location vs. actual customer location discrepancy",
            body: "This causes delivery delays, and the app highlights the inaccuracy without helping resolve it.",
            evidence: ["geofence-not-verified", "order-detail-call0of2", "order-detail-call2of2"]
          }
        ],
        metrics: [
          { name: "First Attempt Delivery Rate (FADR)", def: "% of shipments delivered on the first attempt \u2014 the single most important operational metric." },
          { name: "Fake Attempt Rate", def: "% of delivery attempts marked as \u201cattempted\u201d without actual contact." },
          { name: "Average Delivery Time per Shipment", def: "Time from dispatch to delivery completion." },
          { name: "COD Collection Success Rate", def: "% of COD orders where payment is successfully collected on first attempt." },
          { name: "App Crash/Downtime During Delivery", def: "Frequency and duration of app unavailability during active delivery windows." },
          { name: "Customer Escalation Rate", def: "% of deliveries that trigger a customer complaint." },
          { name: "RTO (Return to Origin) Rate", def: "% of shipments that go back to the warehouse undelivered." }
        ],
        opportunities: [
          { title: "Overhaul the payment collection flow for COD orders", body: "A single, clear payment path per order (cash OR digital, not both simultaneously) with proper confirmation states.", addresses: ["del-payment"] },
          { title: "Rethink delivery verification to close loopholes while reducing friction", body: "Resequence verification (selfie upfront), close the self-signature loophole, add alternative verification methods.", addresses: ["del-verification"] },
          { title: "Build a reliable cancellation flow with fallback mechanisms", body: "SMS/WhatsApp/in-app OTP fallbacks and a clear post-cancellation status.", addresses: ["del-cancel"] },
          { title: "Address the map-to-actual-location discrepancy actively", body: "Allow riders to flag and correct addresses, show customer-provided landmarks, enable a quick call/chat before arrival.", addresses: ["del-geofence"] },
          { title: "Move app updates to off-peak hours", body: "Schedule updates to non-delivery hours or enable background updates.", addresses: [] }
        ]
      },
      {
        id: "summary",
        code: "STG\u201104",
        title: "Views details of shipments done",
        narrative: "The shortest stage on paper, but where trust is won or lost: the executive checks what they delivered, what they collected, and whether the numbers add up.",
        touchpoints: [
          "Views a summary of all parcels delivered according to status",
          "Views total collection and escalations done"
        ],
        userChallenges: [],
        userChallengesNote: "Nothing significant was pointed out by users themselves for this step.",
        challenges: [
          {
            id: "sum-clarity",
            severity: "major",
            title: "Summary and earnings screens lack clarity",
            body: "The incentive milestone chart doesn\u2019t explain its values. The productivity calculation is unclear, and time-based breakdowns are missing.",
            evidence: ["summary-progress"]
          },
          {
            id: "sum-pod",
            severity: "major",
            title: "POD issues are flagged but not actionable",
            body: "POD issues are shown under summary, but if PODs had issues, delivery shouldn\u2019t have been possible in the first place \u2014 this creates confusion.",
            evidence: ["pod-success-dialog", "pod-code-verified"]
          },
          {
            id: "sum-earnings",
            severity: "minor",
            title: "Earnings page lacks filtering and payout visibility",
            body: "No pending vs. completed payout info. No week/month/year filtering.",
            evidence: []
          },
          {
            id: "sum-debt",
            severity: "minor",
            title: "Issues here are systemic design debt",
            body: "Problems are less immediately felt but still represent design debt that erodes trust over time.",
            evidence: []
          }
        ],
        metrics: [
          { name: "Rider Earnings Accuracy", def: "Can riders accurately predict their weekly earnings based on what the app shows them?" },
          { name: "End-of-day Reconciliation Time", def: "Time it takes a rider to complete summary, submit collections, and punch out." },
          { name: "Rider NPS", def: "Would riders recommend this job/app to others?" },
          { name: "Customer CSAT Post-delivery", def: "Customer satisfaction score after delivery completion." }
        ],
        opportunities: [
          { title: "Make earnings and productivity data transparent and filterable", body: "Add clear labels, calculation breakdowns, and time-based filters.", addresses: ["sum-clarity", "sum-earnings"] },
          { title: "Resolve the POD flagging contradiction", body: "Either enforce POD quality at the point of delivery, or clearly explain post-delivery POD flags with actionable next steps.", addresses: ["sum-pod"] },
          { title: "Create a clear end-of-day flow from delivery completion to punch-out", body: "A guided end-of-day sequence that surfaces pending collections, flags issues, and leads to punch-out.", addresses: ["sum-clarity"] },
          { title: "Address systemic design debt as a retention lever", body: "Treating this phase as a retention lever (clear pay leads to trust leads to lower churn) would have an outsized impact.", addresses: ["sum-debt"] }
        ]
      }
    ],

    /* Evidence library — filename (no extension) -> display data.
       Pins are optional: [ [x%, y%, "note"], ... ] */
    evidence: {
      "login-otp-sent":            { caption: "Login \u2014 verification code sent" },
      "delhivery-home":            { caption: "Partner app home \u2014 earnings and referral" },
      "fe-app-download":           { caption: "FE app \u2014 background update loader" },
      "get-started":               { caption: "Get started \u2014 role selection, no language option" },
      "aadhaar-otp-generating":    { caption: "Aadhaar \u2014 generating OTP" },
      "aadhaar-otp-maxattempts":   { caption: "Aadhaar OTP \u2014 max attempts exceeded",
        pins: [[27,73,"Six OTP boxes read as barely tappable at real thumb size, in gloves or sunlight."],
               [50,81,"The failure state reads as a system limit (\u201cretry in 30 min\u201d), not guidance on what the rider can do right now."]] },
      "aadhaar-verifying":         { caption: "Aadhaar \u2014 verifying loader" },
      "aadhaar-verified-validation": { caption: "Aadhaar verified \u2014 father\u2019s name validation",
        pins: [[50,63,"Father\u2019s Name looks optional (a plus icon, not a required marker) until the summary rejects it."],
               [50,89,"The validation only surfaces after the rider reaches the bottom of the form, not inline at the field."]] },
      "next-steps-welcome":        { caption: "Next steps \u2014 FE app checklist and workplace info" },
      "fe-home-docs-pending":      { caption: "FE home \u2014 documents pending",
        pins: [[50,17,"The personal greeting is the visual anchor of the page \u2014 larger and bolder than the blocking task list right below it."],
               [50,33,"The three-step document checklist doesn\u2019t explain what each step unlocks or how long it takes."]] },
      "driving-licence-accepting": { caption: "Driving licence \u2014 accepting state",
        pins: [[50,73,"Labelled as a generic \u201cNumber\u201d field for what is actually a 15-character alphanumeric licence code, with no input mask."],
               [50,88,"The busy \u201cAccepting\u2026\u201d state gives no indication of what\u2019s being checked or how long it will take."]] },
      "pan-verified":              { caption: "PAN verified \u2014 Aadhaar linked" },
      "view-slots":                { caption: "View slots \u2014 week strip and earnings" },
      "fe-home-activated":         { caption: "FE home \u2014 activated, upcoming slot" },
      "selfie-gate":               { caption: "Attendance selfie \u2014 helmet and T-shirt checklist" },
      "safety-interstitial":       { caption: "Safety interstitial \u2014 ride slow, stay safe" },
      "dispatch-empty":            { caption: "Dispatch \u2014 no deliveries assigned yet" },
      "shipments-map":             { caption: "Shipments \u2014 map view, no route guidance" },
      "shipments-list":            { caption: "Shipments \u2014 expanded list",
        pins: [[71,8,"The lightning glyph appears with no legend anywhere \u2014 its meaning (priority) is never explained on screen."],
               [50,27,"Package count, distance and potential earning aren\u2019t part of the card at all \u2014 only status tags are, with no hierarchy between them."]] },
      "summary-progress":          { caption: "Summary \u2014 progress and collection",
        pins: [[24,43,"The ring shows a count but no benchmark \u2014 a rider can\u2019t tell if 0/5 this early in the day is normal or behind."]] },
      "order-detail-pending":      { caption: "Order detail \u2014 COD, payment pending" },
      "order-detail-success":     { caption: "Order detail \u2014 payment successful" },
      "order-detail-call0of2":     { caption: "Order detail \u2014 calls attempted 0/2",
        pins: [[50,16,"Two independent checks \u2014 calls and geofence \u2014 are fused into one banner with a single tone, so a rider can\u2019t tell which one is actually blocking them."]] },
      "order-detail-call2of2":     { caption: "Order detail \u2014 calls attempted 2/2" },
      "payment-pending-retry":     { caption: "Payment \u2014 pending, retry sheet",
        pins: [[92,8,"The only exit from a failed payment is a close button \u2014 there\u2019s no retry-without-losing-context path."],
               [50,91,"The button reads \u201cPENDING,\u201d stating a fact rather than prompting an action \u2014 there\u2019s no \u201cRetry payment\u201d label anywhere."]] },
      "geofence-not-verified":     { caption: "Order detail \u2014 geofence not verified",
        pins: [[50,39,"States the check failed but offers no way to correct or contest the location."],
               [50,58,"The rider\u2019s position and the expected pin are visibly different points \u2014 the discrepancy itself has no resolution path."]] },
      "qr-verified-cod":           { caption: "Order detail \u2014 QR-verified COD" },
      "qr-payment-success":        { caption: "QR payment \u2014 successful" },
      "pod-recipient-options":     { caption: "Proof of delivery \u2014 recipient options" },
      "pod-code-verified":         { caption: "Proof of delivery \u2014 code/QR verified" },
      "pod-signature-pad":         { caption: "Proof of delivery \u2014 signature pad",
        pins: [[50,45,"Nothing here distinguishes a customer\u2019s signature from the rider signing on their own behalf \u2014 the verification intent is easy to defeat."]] },
      "pod-photo-capture":         { caption: "Proof of delivery \u2014 photo capture" },
      "pod-success-signed":        { caption: "Proof of delivery \u2014 delivery successful (signed)" },
      "pod-success-dialog":        { caption: "Proof of delivery \u2014 delivery successful dialog" },
      "nsl-reasons":               { caption: "Mark undelivered \u2014 reasons and audio feedback",
        pins: [[50,55,"Recording a mandatory audio note is required for every non-delivery reason, including routine ones like \u201ccustomer unavailable\u201d \u2014 the friction is the same regardless of severity."]] },
      "nsl-reschedule-selected":   { caption: "Mark undelivered \u2014 reschedule selected" },
      "reschedule-whatsapp-otp":   { caption: "Reschedule \u2014 WhatsApp OTP dialog",
        pins: [[73,55,"WhatsApp is the only OTP channel offered \u2014 if it fails to arrive, there\u2019s no SMS or in-app fallback shown to the rider."]] },
      "reschedule-whatsapp-otp-2": { caption: "Reschedule \u2014 WhatsApp OTP dialog (repeat state)" },
      "reschedule-code-entry":     { caption: "Reschedule \u2014 customer code entry" }
    }
  }
};
