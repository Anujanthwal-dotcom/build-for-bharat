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
  visualAction: string;
  talkingPoints: string;
  analogy: string;
  codeSnippet?: string;
  gotcha?: string;
}

export interface CreatorScript {
  title: string;
  targetAudience: string;
  durationMinutes: number;
  hook: string;
  premise: string;
  sections: ScriptSection[];
  outro: string;
  markdown: string;
}

/**
 * Intelligent semantic generator for technical creator scripts.
 * Runs instantly in the browser without requiring external paid API keys,
 * crafting rich educational analogies, code snippets, visual directions, and talking points.
 */
export function generateSemanticCreatorScript(
  title: string,
  nodes: ExtractedNode[],
  _edges: ExtractedEdge[] = [],
  sourceContent?: string,
): CreatorScript {
  const sections: ScriptSection[] = nodes.map((node) => {
    const text = `${node.label} ${node.summary} ${sourceContent || ""}`.toLowerCase();

    // Contextual analogy and code generation based on technical concepts
    let analogy = "Think of this like an assembly line station where each unit has a single, strictly verified responsibility.";
    let codeSnippet = `// ${node.label} in action\nfunction handle${node.label.replace(/[^a-zA-Z0-9]/g, "")}() {\n  console.log("Processing ${node.label}...");\n}`;
    let gotcha = `Watch out: Developers often confuse ${node.label} with its upstream dependency.`;

    if (text.includes("event loop") || text.includes("loop")) {
      analogy = "Imagine a conductor at a busy airport terminal directing passengers to gates only when the runway is completely clear.";
      codeSnippet = `console.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");\n// Output: 1, 4, 3, 2`;
      gotcha = "Microtasks (Promises, queueMicrotask) run BEFORE macrotasks (setTimeout, setInterval), even with a 0ms delay!";
    } else if (text.includes("stack") || text.includes("call stack")) {
      analogy = "Think of a spring-loaded stack of cafeteria trays — the last tray pushed down is the first one pulled off (LIFO).";
      codeSnippet = `function baz() { console.trace(); }\nfunction bar() { baz(); }\nfunction foo() { bar(); }\nfoo();`;
      gotcha = "Exceeding the maximum call stack size causes 'Maximum call stack size exceeded' (Stack Overflow) via un-terminated recursion.";
    } else if (text.includes("heap") || text.includes("memory")) {
      analogy = "Unlike an organized stack of trays, the heap is an open warehouse with numbered storage shelves for large objects and closures.";
      codeSnippet = `const largeBuffer = new Array(1_000_000).fill({ active: true });\n// Allocated in the Heap; reference pointer sits on Call Stack`;
      gotcha = "Detached DOM nodes or uncleared setInterval callbacks in closures will prevent Garbage Collection and leak memory.";
    } else if (text.includes("fiber") || text.includes("reconciliation") || text.includes("react")) {
      analogy = "Think of React Fibers like an air traffic control system that can pause a slow cargo flight to let an urgent medical flight land first.";
      codeSnippet = `import { useTransition } from 'react';\nconst [isPending, startTransition] = useTransition();\nstartTransition(() => { setFilter(newVal); });`;
      gotcha = "Never perform synchronous blocking I/O or state mutability inside render passes; fiber reconciliation must remain pure.";
    } else if (text.includes("queue") || text.includes("microtask")) {
      analogy = "Microtasks are VIP line holders who get admitted ahead of regular scheduled arrivals between every single event turn.";
      codeSnippet = `queueMicrotask(() => {\n  console.log("Executed right before browser repaint");\n});`;
      gotcha = "An infinite loop of recursive microtask scheduling will starve macrotasks and completely lock up the browser UI thread!";
    } else if (text.includes("docker") || text.includes("container") || text.includes("cgroup") || text.includes("namespace")) {
      analogy = "Namespaces are tinted glass partitions giving each process its own view, while cgroups are the electricity meters limiting resource consumption.";
      codeSnippet = `unshare --mount --uts --ipc --net --pid --fork bash\n# Creates isolated process hierarchy via Linux kernel namespaces`;
      gotcha = "Containers are NOT lightweight virtual machines — they are standard host processes constrained by kernel primitives.";
    } else if (text.includes("index") || text.includes("b-tree") || text.includes("b+ tree")) {
      analogy = "A B+ tree is like a library's card catalog index system where all book records sit on leaf shelves, linked sequentially for range browsing.";
      codeSnippet = `CREATE INDEX idx_users_created_at ON users(created_at DESC);\nEXPLAIN ANALYZE SELECT * FROM users WHERE created_at > NOW() - INTERVAL '7 days';`;
      gotcha = "Indexes dramatically speed up reads, but every write/update incurs write-amplification penalty because tree nodes must re-balance.";
    } else if (text.includes("rust") || text.includes("borrow") || text.includes("ownership")) {
      analogy = "Ownership is a physical deed of property: only one person can hold the exclusive deed at a time, or multiple people can read it simultaneously.";
      codeSnippet = `let s1 = String::from("hello");\nlet s2 = &s1; // Shared immutable borrow (&T)\nprintln!("s1 is {s1}, s2 is {s2}");`;
      gotcha = "You can have ANY number of immutable references (&T), OR exactly ONE mutable reference (&mut T) — never both concurrently!";
    } else if (text.includes("auth") || text.includes("jwt") || text.includes("session") || text.includes("oauth")) {
      analogy = "A JWT is like a sealed concert wristband stamped with an tamper-proof hologram signature: venue staff can verify it without calling the box office.";
      codeSnippet = `import jwt from 'jsonwebtoken';\nconst token = jwt.sign({ userId: '123' }, process.env.JWT_SECRET!, { expiresIn: '1h' });`;
      gotcha = "Never store sensitive API secrets or PII passwords inside JWT payloads, as base64 payloads can be decoded by anyone.";
    } else if (text.includes("database") || text.includes("sql") || text.includes("prisma") || text.includes("orm")) {
      analogy = "An ORM is like an automated translator between two ambassadors speaking completely different languages (Object-Oriented code and Relational Tables).";
      codeSnippet = `const user = await prisma.user.findUnique({\n  where: { id: userId },\n  include: { projects: true }\n});`;
      gotcha = "Beware the N+1 query problem! Always eager-load relations using include or joins instead of fetching inside a loop.";
    }

    const talkingPoints = `In this segment, we break down ${node.label}. ${node.summary}. As tech creators and educators, the core intuition to convey is how this fits into the broader execution architecture. Notice how this node connects with surrounding concepts on our canvas.`;

    return {
      nodeId: node.id,
      concept: node.label,
      category: node.category,
      summary: node.summary,
      visualAction: `Zoom in to [${node.label}] (${node.category.toUpperCase()}) on canvas and highlight connections`,
      talkingPoints,
      analogy,
      codeSnippet,
      gotcha,
    };
  });

  const durationEstimate = Math.max(5, sections.length * 3);

  const markdown = `# 🎬 Masterclass Lecture Script: ${title}
*Estimated Lecture / Video Duration: ~${durationEstimate} minutes*

---

## ⚡ Opening Hook (First 15 Seconds)
> "Stop guessing how ${title} works under the hood. In today's deep-dive masterclass, we will visually trace every architectural component step-by-step so you can master it for production and system design interviews."

## 🎯 Premise & Educational Roadmap
Understanding ${title} is what separates junior coders who copy snippets from senior engineers who architect scalable systems. We have broken this system down into **${sections.length} core concepts**.

---

## 📚 Scene-by-Scene Teaching Guide

${sections
  .map(
    (s, i) => `### Scene ${i + 1}: ${s.concept}
- **Category:** \`${s.category.toUpperCase()}\`
- **Visual Action on Canvas:** ${s.visualAction}
- **💡 Student Analogy:** ${s.analogy}

#### 🎙️ Spoken Script & Lecture Notes:
${s.talkingPoints}

${s.codeSnippet ? `#### 💻 Technical Example:\n\`\`\`typescript\n${s.codeSnippet}\n\`\`\`` : ""}

${s.gotcha ? `> ⚠️ **Teaching Tip & Common Pitfall:** ${s.gotcha}` : ""}
`
  )
  .join("\n---\n\n")}

---

## 🏁 Outro & Call to Action (Final 30 Seconds)
"And that is the complete architectural mental model for **${title}**! You now have the exact blueprint. Take this mindmap, test the code, and fork this project to build your own curriculum. Hit like, subscribe, and share with fellow engineers!"
`;

  return {
    title,
    targetAudience: "Software Engineers & Technical Creators",
    durationMinutes: durationEstimate,
    hook: `Stop guessing how ${title} works under the hood. In this masterclass, we will visually dissect the entire architecture step-by-step.`,
    premise: `Understanding ${title} is crucial for production reliability and technical interview mastery.`,
    sections,
    outro: `And that's the complete mental model for ${title}! Clone this mindmap, test the code, and build something incredible.`,
    markdown,
  };
}

