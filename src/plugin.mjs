import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const cliEntrypoint = join(pluginRoot, "node_modules", "@reasontrail", "cli", "bin", "reasontrail.mjs");
const PROJECT_SLUG = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function validateConfig(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("ReasonTrail plugin config must be a JSON object.");
  }
  if (Object.keys(value).some((key) => /token|password|secret|api.?key/i.test(key))) {
    throw new Error("Do not put credentials in the Herdr plugin config. Sign in with the ReasonTrail CLI instead.");
  }
  if (!new Set(["development", "production"]).has(value.profile)) {
    throw new Error("Set profile to development or production in the plugin config.");
  }
  if (typeof value.projectSlug !== "string" || !PROJECT_SLUG.test(value.projectSlug)) {
    throw new Error("Set projectSlug to the ReasonTrail project slug you intend to use.");
  }
  if (value.profile === "production" && value.confirmProduction !== true) {
    throw new Error("Production access requires confirmProduction: true. Each Herdr action remains an explicit invocation.");
  }
  return { profile: value.profile, projectSlug: value.projectSlug };
}

export function loadConfig(env = process.env, readFile = readFileSync) {
  const directory = env.HERDR_PLUGIN_CONFIG_DIR;
  if (!directory) throw new Error("Herdr did not provide HERDR_PLUGIN_CONFIG_DIR.");
  const path = join(directory, "config.json");
  if (!existsSync(path)) throw new Error(`Create ${path} from config.example.json, then set your ReasonTrail project and profile.`);
  let parsed;
  try {
    parsed = JSON.parse(readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read the ReasonTrail plugin config: ${error.message}`);
  }
  return validateConfig(parsed);
}

function findWorkspace(snapshot, workspaceId) {
  const root = snapshot?.result?.snapshot ?? snapshot?.snapshot ?? snapshot?.result ?? snapshot;
  const workspace = (root?.workspaces ?? []).find((item) => (item.workspace_id ?? item.id) === workspaceId);
  if (!workspace) throw new Error(`Herdr workspace ${workspaceId} is missing from its live session snapshot.`);
  const candidate = workspace.cwd ?? workspace.worktree?.path ?? workspace.path;
  if (typeof candidate === "string" && candidate.length) return candidate;

  const panes = root?.panes ?? [];
  const pane = panes.find((item) => (item.workspace_id ?? item.workspaceId) === workspaceId && typeof item.cwd === "string" && item.cwd.length);
  if (pane) return pane.cwd;
  throw new Error("Herdr did not report a working directory for this workspace; refusing to query context against the plugin checkout.");
}

export function workspaceDirectory({ env = process.env, run = spawnSync, isDirectory = (path) => existsSync(path) && statSync(path).isDirectory() } = {}) {
  let workspaceId = env.HERDR_WORKSPACE_ID;
  if (!workspaceId && env.HERDR_PLUGIN_CONTEXT_JSON) {
    try {
      const context = JSON.parse(env.HERDR_PLUGIN_CONTEXT_JSON);
      workspaceId = context.workspace_id ?? context.workspace?.workspace_id ?? context.workspace?.id;
    } catch {
      throw new Error("Herdr provided invalid plugin context JSON.");
    }
  }
  if (!workspaceId) throw new Error("Open this action from a Herdr workspace so its project can be identified.");
  const herdr = env.HERDR_BIN_PATH || "herdr";
  const result = run(herdr, ["api", "snapshot"], { encoding: "utf8", timeout: 5000, windowsHide: true });
  if (result.error) throw new Error(`Could not read the Herdr workspace: ${result.error.message}`);
  if (result.status !== 0) throw new Error((result.stderr || "Herdr session snapshot failed.").trim());
  let snapshot;
  try {
    snapshot = JSON.parse(result.stdout);
  } catch {
    throw new Error("Herdr returned an unreadable session snapshot.");
  }
  const directory = findWorkspace(snapshot, workspaceId);
  if (!isDirectory(directory)) throw new Error("Herdr's current workspace directory is not available on this device.");
  return directory;
}

export function reasonTrailArgs(command, config) {
  const args = [command, "--project", config.projectSlug, "--profile", config.profile];
  if (config.profile === "production") args.push("--confirm-production");
  if (command === "context") {
    args.push("--request", "Relevant project decisions, open work, prior handovers, and verified repository context for the current Herdr workspace.");
  }
  return args;
}

export function invokeReasonTrail(command, config, cwd, { run = spawnSync, input } = {}) {
  if (!existsSync(cliEntrypoint)) throw new Error("ReasonTrail CLI dependency is missing. Reinstall this Herdr plugin.");
  const result = run(process.execPath, [cliEntrypoint, ...reasonTrailArgs(command, config)], {
    cwd,
    encoding: "utf8",
    input,
    timeout: 120_000,
    windowsHide: true,
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.error) throw new Error(`ReasonTrail CLI failed to start: ${result.error.message}`);
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || `ReasonTrail CLI exited with status ${result.status}.`).trim());
  return result.stdout;
}

async function promptHandover() {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    stdout.write("ReasonTrail handover\nDo not enter passwords, tokens, or other credentials. This sends a summary for governed review; it does not capture the chat transcript.\n\n");
    const taskTitle = (await rl.question("Task or workstream title: ")).trim();
    const taskSummary = (await rl.question("What changed or was completed? ")).trim();
    const decisionsText = (await rl.question("Decision or finding to propose (optional): ")).trim();
    const remainingWork = (await rl.question("What remains or is blocked? (optional): ")).trim();
    if (!taskTitle || !taskSummary) throw new Error("A title and a short summary are required; nothing was sent.");
    const answer = (await rl.question("Send this handover to ReasonTrail for review? (y/N): ")).trim().toLowerCase();
    if (answer !== "y" && answer !== "yes") {
      stdout.write("Cancelled. Nothing was sent.\n");
      return null;
    }
    return {
      taskTitle,
      taskSummary,
      ...(decisionsText ? { findings: [decisionsText] } : {}),
      ...(remainingWork ? { remainingWork } : {}),
    };
  } finally {
    rl.close();
  }
}

async function main() {
  const action = process.argv[2];
  try {
    const config = loadConfig();
    const cwd = workspaceDirectory();
    if (action === "context") {
      stdout.write(invokeReasonTrail("context", config, cwd));
      return;
    }
    if (action === "handover") {
      const handover = await promptHandover();
      if (!handover) return;
      const output = invokeReasonTrail("update", config, cwd, { input: JSON.stringify(handover) });
      stdout.write(output);
      return;
    }
    throw new Error("Use the declared Herdr context action or handover pane.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
