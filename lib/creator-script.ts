export type ScriptLanguage = "english" | "hinglish" | "hindi";
export type ScriptTone = "creator" | "architect" | "tactical";

export interface ExtractedNode {
  id: string;
  label: string;
  summary: string;
  category: string;
  tags?: string[];
}

export interface ExtractedEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ScriptSection {
  nodeId: string;
  concept: string;
  category: string;
  summary: string;
  timecode: string;
  visualAction: string;
  hook: string;
  talkingPoints: string;
  analogy: string;
  codeSnippet?: string;
  gotcha?: string;
  audiencePrompt: string;
}

export interface CreatorScript {
  title: string;
  targetAudience: string;
  language: ScriptLanguage;
  tone: ScriptTone;
  durationMinutes: number;
  hook: string;
  premise: string;
  sections: ScriptSection[];
  outro: string;
  markdown: string;
}

export interface ScriptGeneratorOptions {
  language?: ScriptLanguage;
  tone?: ScriptTone;
  sourceContent?: string;
}

interface DomainKnowledge {
  analogy: Record<ScriptLanguage, string>;
  gotcha: Record<ScriptLanguage, string>;
  codeSnippet: string;
}

const DOMAIN_KNOWLEDGE: Record<string, DomainKnowledge> = {
  loop: {
    analogy: {
      english: "Imagine an airport runway controller: planes on the tarmac (macrotasks) must wait for all priority medical transports (microtasks) before they get clearance to take off.",
      hinglish: "Socho ek busy airport runway ka traffic controller hai — jab tak saare VIP priority flights (microtasks) land nahi ho jaate, tab tak normal flights (macrotasks) ko take-off clearance nahi milti.",
      hindi: "इसे एक व्यस्त हवाई अड्डे के एयर ट्रैफिक कंट्रोलर की तरह समझिए — जब तक सभी आपातकालीन वीआईपी विमान (माइक्रोटास्क) रनवे खाली नहीं कर देते, तब तक सामान्य विमान (मैक्रोटास्क) उड़ान नहीं भर सकते।",
    },
    gotcha: {
      english: "Microtasks (Promises, queueMicrotask) run BEFORE macrotasks (setTimeout, setInterval), even with a 0ms delay!",
      hinglish: "Promises aur microtasks hamesha setTimeout(0) se pehle execute hote hain! Yeh interview me 90% log galat karte hain.",
      hindi: "माइक्रोटास्क (Promises, queueMicrotask) हमेशा 0ms वाले setTimeout से पहले निष्पादित होते हैं!",
    },
    codeSnippet: `console.log("1");\nsetTimeout(() => console.log("2 (Macro)"), 0);\nPromise.resolve().then(() => console.log("3 (Micro)"));\nconsole.log("4");\n// Output order: 1 -> 4 -> 3 -> 2`,
  },
  stack: {
    analogy: {
      english: "Think of a spring-loaded cafeteria tray dispenser — the last tray pushed down is the very first one pulled off (Last In, First Out).",
      hinglish: "Imagine karo shadi ki buffet me rakhi hui plates — jo plate sabse aakhri me upar rakhi jaati hai, sabse pehle wahi uthayi jaati hai (LIFO).",
      hindi: "भोजन कक्ष में रखी थालियों के ढेर की तरह सोचिए — जो थाली सबसे अंत में ऊपर रखी जाती है, वही सबसे पहले उठाई जाती है (LIFO नियम)।",
    },
    gotcha: {
      english: "Unbounded recursion without a base case exhausts call stack frames, triggering 'Maximum call stack size exceeded'.",
      hinglish: "Agar recursion me sahi base condition nahi lagayi, toh browser stack overflow throw karke crash ho jayega!",
      hindi: "यदि पुनरावर्तन (recursion) में सही समापन शर्त नहीं है, तो 'Maximum call stack size exceeded' की त्रुटि आएगी।",
    },
    codeSnippet: `function recurse(depth = 0) {\n  if (depth > 10000) return "Safe!";\n  return recurse(depth + 1); // Stack frame allocation\n}`,
  },
  heap: {
    analogy: {
      english: "Unlike the orderly vertical stack of trays, the heap is a giant warehouse with numbered bays where large objects and closures are allocated dynamically.",
      hinglish: "Stack jahan ek tight line hai, Heap ek bada warehouse hai jahan bade-bade data objects aur closures apni marzi se jagah lete hain.",
      hindi: "कॉल स्टैक एक पंक्ति की तरह है, जबकि हीप एक विशाल गोदाम की तरह है जहाँ बड़े डेटा ऑब्जेक्ट्स और क्लोजर्स को गतिशील रूप से स्थान मिलता है।",
    },
    gotcha: {
      english: "Detached DOM trees and uncleared setInterval callbacks in closures will leak heap memory indefinitely.",
      hinglish: "Dhyan rahe, agar setInterval ko cleanup nahi kiya ya detached DOM nodes reh gaye, toh memory leak ho jayegi!",
      hindi: "क्लोजर्स में भूले हुए setInterval या असंबद्ध DOM नोड्स अनिश्चित काल तक मेमोरी लीक करते रहेंगे।",
    },
    codeSnippet: `// Allocated in the Heap; reference pointer sits on Call Stack\nconst memoryHeavyCache = new Map();\nfunction cacheData(key, value) {\n  memoryHeavyCache.set(key, new Array(100_000).fill(value));\n}`,
  },
  fiber: {
    analogy: {
      english: "React Fiber is like cooperative multitasking: it breaks big render tasks into tiny units of work that can pause if an urgent user keystroke arrives.",
      hinglish: "React Fiber ek smart air traffic control jaisa hai — agar user koi button dabata hai, toh React background render ko beech me pause karke pehle button ka click handle karta hai.",
      hindi: "रिएक्ट फाइबर एक सहकारी मल्टीटास्किंग प्रणाली की तरह है — यह बड़े रेंडरिंग कार्य को छोटे हिस्सों में बांटता है ताकि यूजर का इनपुट कभी लैग न करे।",
    },
    gotcha: {
      english: "Never perform side effects inside the render phase; fibers can be aborted and restarted multiple times!",
      hinglish: "Render function ke andar kabhi API call ya mutations mat karna, kyunki Fiber reconciler render ko multiple baar cancel aur restart kar sakta hai.",
      hindi: "रेंडर चरण में कभी भी साइड इफेक्ट्स न करें, क्योंकि फाइबर सुलह प्रक्रिया कार्य को कई बार रद्द और पुनः प्रारंभ कर सकती है।",
    },
    codeSnippet: `import { useTransition } from 'react';\nconst [isPending, startTransition] = useTransition();\n\nfunction handleSearch(query: string) {\n  startTransition(() => {\n    setFilteredResults(expensiveFilter(query));\n  });\n}`,
  },
  docker: {
    analogy: {
      english: "Containers are like separate shipping crates on a cargo vessel: they share the ship's engine (host OS kernel) but have sealed compartments (namespaces & cgroups).",
      hinglish: "Docker containers virtual machines nahi hote! Wo ek hi building ke alag-alag rooms hain jo electricity aur water pipe (OS kernel) share karte hain lekin unke darwaze alag hain.",
      hindi: "कंटेनर अलग आभासी मशीनें नहीं हैं, बल्कि एक ही जहाज पर अलग-अलग माल डिब्बे हैं जो एक ही इंजन (होस्ट कर्नेल) साझा करते हैं।",
    },
    gotcha: {
      english: "Containers are processes on the host. Root inside an un-namespaced container can lead to host compromise!",
      hinglish: "Docker container me root user host OS ka root ban sakta hai agar user namespaces theek se configure na ho!",
      hindi: "कंटेनर होस्ट पर चलने वाली प्रक्रियाएं हैं। कंटेनर के अंदर रूट यूजर होस्ट सिस्टम की सुरक्षा को जोखिम में डाल सकता है।",
    },
    codeSnippet: `# Secure rootless container execution\nFROM node:20-alpine\nUSER node\nWORKDIR /home/node/app\nCOPY --chown=node:node package*.json ./\nRUN npm ci --only=production\nCMD ["node", "server.js"]`,
  },
  database: {
    analogy: {
      english: "An index is like the thumb tabs in a 1,000-page dictionary: you jump directly to the target letter instead of scanning every page one-by-one.",
      hinglish: "Database indexing bilkul kitaab ke aakhri page waali index list jaisi hai — har page padhne ki jagah direct uss page number pe pahunch jaate ho.",
      hindi: "डेटाबेस इंडेक्स किसी बड़ी पुस्तक की विषय-सूची की तरह है — हर पृष्ठ को क्रमिक रूप से पढ़ने के बजाय आप सीधे अभीष्ट पृष्ठ पर पहुँच जाते हैं।",
    },
    gotcha: {
      english: "Too many indexes slow down INSERT/UPDATE operations due to constant B-tree node splits and re-balancing.",
      hinglish: "Har column pe index mat lagao! Reads fast ho jaenge lekin inserts aur updates bohot slow ho jaenge.",
      hindi: "हर कॉलम पर इंडेक्स न लगाएं; इससे पढ़ने की गति बढ़ती है किंतु लिखने और अपडेट करने की गति धीमी हो जाती है।",
    },
    codeSnippet: `CREATE INDEX CONCURRENTLY idx_users_email_verified \nON users (email) \nWHERE email_verified IS NOT NULL;`,
  },
};

function getDomainKnowledge(text: string): DomainKnowledge | null {
  const lower = text.toLowerCase();
  if (lower.includes("loop") || lower.includes("event") || lower.includes("microtask")) return DOMAIN_KNOWLEDGE.loop;
  if (lower.includes("stack") || lower.includes("lifo") || lower.includes("call")) return DOMAIN_KNOWLEDGE.stack;
  if (lower.includes("heap") || lower.includes("memory") || lower.includes("leak") || lower.includes("gc")) return DOMAIN_KNOWLEDGE.heap;
  if (lower.includes("fiber") || lower.includes("react") || lower.includes("reconciliation") || lower.includes("hook")) return DOMAIN_KNOWLEDGE.fiber;
  if (lower.includes("docker") || lower.includes("container") || lower.includes("k8s") || lower.includes("cgroup")) return DOMAIN_KNOWLEDGE.docker;
  if (lower.includes("database") || lower.includes("sql") || lower.includes("index") || lower.includes("query") || lower.includes("b-tree")) return DOMAIN_KNOWLEDGE.database;
  return null;
}

export function generateSemanticCreatorScript(
  title: string,
  nodes: ExtractedNode[],
  _edges: ExtractedEdge[] = [],
  options: ScriptGeneratorOptions = {},
): CreatorScript {
  const language = options.language || "english";
  const tone = options.tone || "creator";
  const sourceContent = options.sourceContent || "";

  let currentTimeSec = 15;

  const sections: ScriptSection[] = nodes.map((node, index) => {
    const text = `${node.label} ${node.summary} ${sourceContent}`.toLowerCase();
    const domain = getDomainKnowledge(text);

    // Timing calculation
    const startMin = Math.floor(currentTimeSec / 60);
    const startSec = String(currentTimeSec % 60).padStart(2, "0");
    const duration = tone === "tactical" ? 60 : 120;
    currentTimeSec += duration;
    const endMin = Math.floor(currentTimeSec / 60);
    const endSec = String(currentTimeSec % 60).padStart(2, "0");
    const timecode = `${startMin}:${startSec} - ${endMin}:${endSec}`;

    // Analogies & Gotchas
    let analogyText = "";
    let gotchaText = "";
    let codeSnippet = domain?.codeSnippet;

    if (domain) {
      analogyText = domain.analogy[language];
      gotchaText = domain.gotcha[language];
    } else {
      if (language === "hinglish") {
        analogyText = `Socho ${node.label} ek specialized factory worker jaisa hai, jiska sirf ek hi strict kaam hai aur wo bina kisi distraction ke apna role execute karta hai.`;
        gotchaText = `Developers aksar ${node.label} ko uske parent module ke sath confuse kar dete hain.`;
      } else if (language === "hindi") {
        analogyText = `${node.label} को एक समर्पित तकनीकी कारीगर की तरह समझिए, जिसका केवल एक निश्चित कार्य होता है और वह बिना किसी व्यवधान के अपनी भूमिका निभाता है।`;
        gotchaText = `डेवलपर्स अक्सर ${node.label} और उसकी निर्भरताओं के बीच भ्रमित हो जाते हैं।`;
      } else {
        analogyText = `Think of ${node.label} like an assembly line station where each unit has a single, strictly verified responsibility.`;
        gotchaText = `Watch out: Developers frequently conflate ${node.label} with its upstream dependency or misuse its state lifecycle.`;
      }
      codeSnippet = `// ${node.label} implementation\nfunction handle${node.label.replace(/[^a-zA-Z0-9]/g, "")}() {\n  // Core architectural step\n  return { status: "ready", concept: "${node.label}" };\n}`;
    }

    // Visual camera direction
    let visualAction = "";
    if (language === "hinglish") {
      visualAction = `Camera direct [${node.label}] card pe zoom karega, canvas pe glowing connections highlight honge.`;
    } else if (language === "hindi") {
      visualAction = `कैमरा स्क्रीन पर [${node.label}] नोड पर ज़ूम करेगा और संबंधित कनेक्शन को हाइलाइट करेगा।`;
    } else {
      visualAction = `Zoom in to [${node.label}] (${node.category.toUpperCase()}) on canvas with glowing incoming and outgoing connections.`;
    }

    // Spoken humanised script
    let talkingPoints = "";
    let sceneHook = "";
    let audiencePrompt = "";

    if (language === "hinglish") {
      if (tone === "creator") {
        sceneHook = `Ab aate hain sabse interesting concept pe: ${node.label}!`;
        talkingPoints = `Dosto, ab dhyan se dekho screen pe. Hum baat kar rahe hain ${node.label} ki. [pause] Asal me hota kya hai ki ${node.summary}. Agar aap production codebase me kaam kar rahe ho, toh yahi wo point hai jahan sabse zyada performance bottlenecks aate hain. Dekho kaise ye card pichle concept se connected hai. Simple si baat hai — jab tak ye samajh nahi aayega, scalable system banana mushkil hai.`;
        audiencePrompt = `Kya aapne kabhi apne project me ${node.label} ka issue face kiya hai? Comment karke zaroor batao!`;
      } else if (tone === "architect") {
        sceneHook = `Architectural component: ${node.label} ke core design decisions.`;
        talkingPoints = `Is section me hum ${node.label} ke internal trade-offs analyze karenge. ${node.summary}. System architecture ke nazarie se, iska primary responsibility execution overhead ko minimize karna aur modularity maintain karna hai. Canvas pe iske downstream graph connections ko note kijiye.`;
        audiencePrompt = `Aapke production infrastructure me ${node.label} ke liye kaunsa pattern use hota hai?`;
      } else {
        sceneHook = `${node.label} — key facts aur code summary.`;
        talkingPoints = `Quick breakdown: ${node.label}. ${node.summary}. Yeh direct code level execution me essential role play karta hai. Dhyan rakhein gotcha aur code example ka.`;
        audiencePrompt = `Is syntax me koi doubt ho toh comment karein.`;
      }
    } else if (language === "hindi") {
      if (tone === "creator") {
        sceneHook = `अब बात करते हैं सबसे महत्वपूर्ण अवधारणा की: ${node.label}!`;
        talkingPoints = `साथियों, अब अपनी स्क्रीन पर ध्यान दीजिए। हम बात कर रहे हैं ${node.label} की। [pause] सरल शब्दों में कहें तो, ${node.summary}। किसी भी बड़े सॉफ्टवेयर प्रोजेक्ट में, यह हिस्सा अत्यंत महत्वपूर्ण होता है क्योंकि यह पूरे सिस्टम की स्थिरता को निर्धारित करता है। हमारे माइंड मैप पर देखिए कि यह कैसे अन्य नोड्स से जुड़ा हुआ है।`;
        audiencePrompt = `क्या आपने कभी अपने कोड में ${node.label} का उपयोग किया है? नीचे कमेंट में बताएं!`;
      } else if (tone === "architect") {
        sceneHook = `आर्किटेक्चरल विश्लेषण: ${node.label} की आंतरिक कार्यप्रणाली।`;
        talkingPoints = `इस खंड में हम ${node.label} के आंतरिक सिद्धांतों का मूल्यांकन करेंगे। ${node.summary}। सिस्टम डिज़ाइन के दृष्टिकोण से, यह घटक स्केलेबिलिटी और विश्वसनीयता सुनिश्चित करने के लिए केंद्रीय भूमिका निभाता है।`;
        audiencePrompt = `आपकी राय में ${node.label} का सबसे प्रभावी उपयोग क्या है?`;
      } else {
        sceneHook = `${node.label} — संक्षिप्त तकनीकी विवरण।`;
        talkingPoints = `संक्षिप्त रूप में: ${node.label}। ${node.summary}। उत्पादन वातावरण में त्रुटिरहित कोड लिखने के लिए इस नियम को हमेशा ध्यान में रखें।`;
        audiencePrompt = `कोई प्रश्न होने पर नीचे टिप्पणी करें।`;
      }
    } else {
      // English
      if (tone === "creator") {
        sceneHook = `Now, here's the concept that separates good coders from great architects: ${node.label}!`;
        talkingPoints = `Look right here on the canvas. We're talking about ${node.label}. [pause] Here's what's actually happening under the hood: ${node.summary}. If you're building real-world software, this is where so many developers hit insidious bugs because they treat it like a black box. But when you look at how this node bridges our system, the intuition clicks immediately.`;
        audiencePrompt = `Drop a comment: have you ever been bitten by a ${node.label} edge case in production?`;
      } else if (tone === "architect") {
        sceneHook = `Architectural Component Analysis: ${node.label}.`;
        talkingPoints = `In this segment, we examine the formal design primitives of ${node.label}. Specifically: ${node.summary}. From a distributed systems and memory perspective, this component provides critical boundaries. Observe the incoming dependency graph and how downstream consumers rely on this contract.`;
        audiencePrompt = `How do you handle resiliency and backpressure around ${node.label} in your cluster?`;
      } else {
        sceneHook = `Tactical Breakdown: ${node.label}.`;
        talkingPoints = `Key facts for ${node.label}: ${node.summary}. Keep the implementation focused and observe the code snippet and gotchas below.`;
        audiencePrompt = `Questions? Let us know below.`;
      }
    }

    return {
      nodeId: node.id,
      concept: node.label,
      category: node.category,
      summary: node.summary,
      timecode,
      visualAction,
      hook: sceneHook,
      talkingPoints,
      analogy: analogyText,
      codeSnippet,
      gotcha: gotchaText,
      audiencePrompt,
    };
  });

  const durationEstimate = Math.max(5, Math.ceil(currentTimeSec / 60));

  // Opening Hook and Premise
  let overallHook = "";
  let overallPremise = "";
  let overallOutro = "";

  if (language === "hinglish") {
    overallHook = `Stop guessing karo ki ${title} background me kaise kaam karta hai! Aaj ke is masterclass me hum step-by-step poore system ka x-ray karenge.`;
    overallPremise = `Dosto, ${title} ko samajhna junior developer aur senior engineer ke beech ka asli fark hota hai. Humne poore topic ko ${sections.length} interactive visual concepts me break kiya hai.`;
    overallOutro = `Aur ye tha ${title} ka complete mental model! Ab aapke paas poora roadmap hai. Mindmap ko save karein, code try karein, aur agle video ke liye subscribe karein!`;
  } else if (language === "hindi") {
    overallHook = `अनुमान लगाना बंद कीजिए कि ${title} वास्तव में कैसे काम करता है! आज के इस विशेष मास्टरक्लास में हम पूरे सिस्टम का एक-एक घटक गहराई से समझेंगे।`;
    overallPremise = `${title} को गहराई से समझना केवल परीक्षा या इंटरव्यू के लिए ही नहीं, बल्कि उत्पादन स्तर के सॉफ्टवेयर निर्माण के लिए अनिवार्य है। हमने इसे ${sections.length} मुख्य भागों में विभाजित किया है।`;
    overallOutro = `और यह था ${title} का संपूर्ण वैचारिक मॉडल! इस माइंड मैप का उपयोग करें, कोड का परीक्षण करें और अपने विचार साझा करें। धन्यवाद!`;
  } else {
    overallHook = `Stop guessing how ${title} works under the hood! In today's masterclass, we are visually tracing every single architectural layer step-by-step.`;
    overallPremise = `Understanding ${title} is what separates junior developers who copy snippets from senior engineers who architect resilient systems. We've mapped this out across ${sections.length} core concepts.`;
    overallOutro = `And that is the complete architectural mental model for ${title}! You now have the exact blueprint. Take this interactive mindmap, experiment with the code, and build something extraordinary!`;
  }

  const markdown = `# 🎬 Masterclass Lecture Script: ${title}
*Language: ${language.toUpperCase()} | Tone: ${tone.toUpperCase()} | Estimated Duration: ~${durationEstimate} mins*

---

## ⚡ Opening Hook (0:00 - 0:15)
> "${overallHook}"

## 🎯 Premise & Educational Roadmap
${overallPremise}

---

## 📚 Scene-by-Scene Teaching Guide (${sections.length} Scenes)

${sections
  .map(
    (s, i) => `### Scene ${i + 1}: ${s.concept} (\`${s.timecode}\`)
- **Category:** \`${s.category.toUpperCase()}\`
- **🎥 Visual Camera Cue:** ${s.visualAction}
- **⚡ Scene Lead-In:** "${s.hook}"
- **💡 Memorable Analogy:** ${s.analogy}

#### 🎙️ Spoken Script & Lecture Delivery:
${s.talkingPoints}

${s.codeSnippet ? `#### 💻 Technical Implementation Example:\n\`\`\`typescript\n${s.codeSnippet}\n\`\`\`` : ""}

${s.gotcha ? `> ⚠️ **Teaching Pitfall & Gotcha:** ${s.gotcha}` : ""}

> 💬 **Engagement Prompt for Viewers:** ${s.audiencePrompt}
`
  )
  .join("\n---\n\n")}

---

## 🏁 Outro & Call to Action (Final 30 Seconds)
"${overallOutro}"
`;

  return {
    title,
    targetAudience: "Software Engineers, System Architects & Technical Creators",
    language,
    tone,
    durationMinutes: durationEstimate,
    hook: overallHook,
    premise: overallPremise,
    sections,
    outro: overallOutro,
    markdown,
  };
}
