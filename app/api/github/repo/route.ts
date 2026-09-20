import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";

interface TreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

function parseGitHubUrl(url: string): { owner: string; repo: string; branch?: string } | null {
  try {
    const cleaned = url.trim().replace(/\.git$/, "").replace(/\/$/, "");
    const parsed = new URL(cleaned);
    if (!parsed.hostname.includes("github.com")) return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    // Handle /owner/repo/tree/branch format
    const branch = parts.length >= 4 && parts[2] === "tree" ? parts[3] : undefined;
    return { owner: parts[0], repo: parts[1], branch };
  } catch {
    // Try owner/repo shorthand
    const match = url.trim().match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    if (match) return { owner: match[1], repo: match[2] };
    return null;
  }
}

function buildDirectoryTree(items: TreeItem[]): string {
  const lines: string[] = [];

  // Group by top-level directory
  const topLevel = new Map<string, TreeItem[]>();
  const rootFiles: TreeItem[] = [];

  for (const item of items) {
    const parts = item.path.split("/");
    if (parts.length === 1) {
      rootFiles.push(item);
    } else {
      const dir = parts[0];
      if (!topLevel.has(dir)) topLevel.set(dir, []);
      topLevel.get(dir)!.push(item);
    }
  }

  // Root files
  if (rootFiles.length > 0) {
    lines.push("📁 / (root)");
    for (const f of rootFiles) {
      const icon = f.type === "tree" ? "📂" : "📄";
      lines.push(`  ${icon} ${f.path}`);
    }
    lines.push("");
  }

  // Directories (sorted, limit depth to 3 levels for readability)
  const sortedDirs = [...topLevel.keys()].sort();
  for (const dir of sortedDirs) {
    const children = topLevel.get(dir)!;
    const fileCount = children.filter((c) => c.type === "blob").length;
    const dirCount = children.filter((c) => c.type === "tree").length;
    lines.push(`📂 ${dir}/ (${fileCount} files, ${dirCount} subdirs)`);

    // Show up to 2 levels inside each directory
    const shown = new Set<string>();
    for (const child of children) {
      const relative = child.path.substring(dir.length + 1);
      const parts = relative.split("/");
      if (parts.length <= 2) {
        const indent = "  ".repeat(parts.length);
        const icon = child.type === "tree" ? "📂" : "📄";
        const key = parts.slice(0, 2).join("/");
        if (!shown.has(key)) {
          shown.add(key);
          lines.push(`${indent}${icon} ${relative}`);
        }
      }
    }

    // If there are deeply nested items we skipped
    const deepCount = children.filter((c) => c.path.substring(dir.length + 1).split("/").length > 2).length;
    if (deepCount > 0) {
      lines.push(`    ... and ${deepCount} more nested items`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { repoUrl, branch } = body as { repoUrl: string; branch?: string };

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "Invalid GitHub URL. Use format: https://github.com/owner/repo" },
        { status: 400 },
      );
    }

    const { owner, repo } = parsed;
    const targetBranch = branch || parsed.branch;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "MindFlow-App",
    };
    // Use GITHUB_TOKEN if available for higher rate limits
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Fetch repo metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      const status = repoRes.status;
      if (status === 404) {
        return NextResponse.json(
          { success: false, error: `Repository "${owner}/${repo}" not found. Make sure it's a public repo.` },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { success: false, error: `GitHub API error (${status})` },
        { status: status },
      );
    }
    const repoData = await repoRes.json();
    const defaultBranch = targetBranch || repoData.default_branch || "main";

    // 2. Fetch repo tree (recursive)
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers },
    );
    if (!treeRes.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch repository tree. Check if the branch exists." },
        { status: 400 },
      );
    }
    const treeData = await treeRes.json();
    const treeItems: TreeItem[] = (treeData.tree || []).map((item: { path: string; type: string; size?: number }) => ({
      path: item.path,
      type: item.type === "tree" ? "tree" : "blob",
      size: item.size,
    }));

    // 3. Fetch README
    let readmeContent = "";
    try {
      const readmeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        { headers: { ...headers, Accept: "application/vnd.github.v3.raw" } },
      );
      if (readmeRes.ok) {
        readmeContent = await readmeRes.text();
        // Limit README size
        if (readmeContent.length > 15000) {
          readmeContent = readmeContent.substring(0, 15000) + "\n\n... (README truncated)";
        }
      }
    } catch {
      // README not found — not critical
    }

    // 4. Try to fetch package.json or similar entry-point config files
    let packageJson = "";
    const configFiles = ["package.json", "pyproject.toml", "Cargo.toml", "go.mod", "pom.xml", "build.gradle"];
    for (const configFile of configFiles) {
      const exists = treeItems.some((item) => item.path === configFile);
      if (!exists) continue;
      try {
        const configRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${configFile}?ref=${defaultBranch}`,
          { headers: { ...headers, Accept: "application/vnd.github.v3.raw" } },
        );
        if (configRes.ok) {
          const content = await configRes.text();
          packageJson += `\n--- ${configFile} ---\n${content.substring(0, 5000)}\n`;
        }
      } catch {
        // skip
      }
      // Only fetch first found config
      break;
    }

    // 5. Build structured content
    const directoryTree = buildDirectoryTree(treeItems);

    const totalFiles = treeItems.filter((i) => i.type === "blob").length;
    const totalDirs = treeItems.filter((i) => i.type === "tree").length;

    const content = [
      `# GitHub Repository: ${owner}/${repo}`,
      ``,
      `**Description:** ${repoData.description || "No description"}`,
      `**Language:** ${repoData.language || "Unknown"}`,
      `**Stars:** ${repoData.stargazers_count} | **Forks:** ${repoData.forks_count}`,
      `**Default Branch:** ${defaultBranch}`,
      `**Total Files:** ${totalFiles} | **Total Directories:** ${totalDirs}`,
      ``,
      `## Directory Structure`,
      ``,
      directoryTree,
      readmeContent ? `## README\n\n${readmeContent}` : "",
      packageJson ? `## Project Configuration\n${packageJson}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({
      success: true,
      content,
      meta: {
        owner,
        repo,
        branch: defaultBranch,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        totalFiles,
        totalDirs,
      },
    });
  } catch (error: unknown) {
    console.error("GitHub fetch error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch repository";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
