import test from "node:test";
import assert from "node:assert/strict";
import { validateConfig, reasonTrailArgs, workspaceDirectory, invokeReasonTrail } from "../src/plugin.mjs";

test("validates a production project profile and omits credential material", () => {
  assert.deepEqual(validateConfig({ profile: "production", projectSlug: "my-project", confirmProduction: true }), {
    profile: "production",
    projectSlug: "my-project",
  });
});

test("requires explicit production confirmation and rejects credentials in config", () => {
  assert.throws(() => validateConfig({ profile: "production", projectSlug: "my-project" }), /confirmProduction/);
  assert.throws(() => validateConfig({ profile: "development", projectSlug: "my-project", apiToken: "no" }), /Do not put credentials/);
});

test("scopes context calls to the configured project and production profile", () => {
  assert.deepEqual(reasonTrailArgs("context", { profile: "production", projectSlug: "my-project" }), [
    "context", "--project", "my-project", "--profile", "production", "--confirm-production",
    "--request", "Relevant project decisions, open work, prior handovers, and verified repository context for the current Herdr workspace.",
  ]);
});

test("uses the live Herdr workspace cwd instead of the plugin checkout", () => {
  const cwd = workspaceDirectory({
    env: { HERDR_WORKSPACE_ID: "w1", HERDR_BIN_PATH: "herdr" },
    run: (command, args) => {
      assert.equal(command, "herdr");
      assert.deepEqual(args, ["api", "snapshot"]);
      return { status: 0, stdout: JSON.stringify({ result: { workspaces: [{ workspace_id: "w1", cwd: "/work/project" }], panes: [] } }) };
    },
    isDirectory: (path) => path === "/work/project",
  });
  assert.equal(cwd, "/work/project");
});

test("reads the workspace id from Herdr popup context when the environment id is absent", () => {
  const cwd = workspaceDirectory({
    env: { HERDR_PLUGIN_CONTEXT_JSON: JSON.stringify({ workspace: { id: "w2" } }) },
    run: (command, args) => {
      assert.equal(command, "herdr");
      assert.deepEqual(args, ["api", "snapshot"]);
      return { status: 0, stdout: JSON.stringify({ workspaces: [{ id: "w2", cwd: "/work/second" }] }) };
    },
    isDirectory: (path) => path === "/work/second",
  });
  assert.equal(cwd, "/work/second");
});

test("reads the current Herdr CLI snapshot envelope and resolves workspace cwd from its pane", () => {
  const cwd = workspaceDirectory({
    env: { HERDR_WORKSPACE_ID: "w1", HERDR_BIN_PATH: "herdr" },
    run: (command, args) => {
      assert.equal(command, "herdr");
      assert.deepEqual(args, ["api", "snapshot"]);
      return {
        status: 0,
        stdout: JSON.stringify({
          id: "cli:api:snapshot",
          result: {
            snapshot: {
              workspaces: [{ workspace_id: "w1" }],
              panes: [{ workspace_id: "w1", cwd: "/work/live-project" }],
            },
          },
        }),
      };
    },
    isDirectory: (path) => path === "/work/live-project",
  });
  assert.equal(cwd, "/work/live-project");
});

test("fails closed when Herdr cannot report an actual project directory", () => {
  assert.throws(() => workspaceDirectory({
    env: { HERDR_WORKSPACE_ID: "w1" },
    run: () => ({ status: 0, stdout: JSON.stringify({ result: { workspaces: [{ workspace_id: "w1" }], panes: [] } }) }),
    isDirectory: () => true,
  }), /refusing to query context against the plugin checkout/);
});

test("submits handover JSON on stdin without putting project text in process arguments", () => {
  const handover = { taskTitle: "Handover", taskSummary: "Implemented the Herdr bridge.", findings: ["Context is fetched on demand."] };
  const output = invokeReasonTrail("update", { profile: "production", projectSlug: "my-project" }, "/work/project", {
    input: JSON.stringify(handover),
    run: (command, args, options) => {
      assert.equal(command, process.execPath);
      assert.equal(args.at(-1), "--confirm-production");
      assert.equal(options.cwd, "/work/project");
      assert.deepEqual(JSON.parse(options.input), handover);
      assert.equal(args.some((arg) => arg.includes("Implemented the Herdr bridge")), false);
      return { status: 0, stdout: "{\"summarySaved\":true}\n" };
    },
  });
  assert.equal(output, "{\"summarySaved\":true}\n");
});
