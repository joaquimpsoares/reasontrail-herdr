import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const required = (condition, message) => {
  if (!condition) throw new Error(message);
};
const exists = async (relative) => {
  try {
    await access(path.join(root, relative));
    return true;
  } catch {
    return false;
  }
};

const plugin = await readJson('plugin.json');
const mcp = await readJson('mcp.json');
const gemini = await readJson('gemini-extension.json');
const openaiPlugin = await readJson('integrations/ai-directories/openai-reasontrail/plugin.json');
const openaiMcp = await readJson('integrations/ai-directories/openai-reasontrail/mcp.json');
const openai = openaiPlugin.extensions?.['com.openai'];
const openaiInterface = openai?.interface;
const openaiReview = openai?.review;
const testCases = openaiReview?.test_cases;

for (const [label, manifest] of [['portable', plugin], ['OpenAI', openaiPlugin]]) {
  required(manifest.name === 'reasontrail', `${label} plugin name must be reasontrail`);
  required(manifest.version && manifest.description, `${label} plugin needs version and description`);
  required(manifest.license === 'Apache-2.0', `${label} plugin must state the repository license`);
  if (label === 'OpenAI') {
    required(testCases?.positive?.length === 5, 'OpenAI final review requires exactly five positive test cases');
    required(testCases?.negative?.length === 3, 'OpenAI final review requires exactly three negative test cases');
    required(typeof openai?.publication?.release_notes === 'string' && openai.publication.release_notes.trim().length > 0, 'OpenAI publication metadata needs release notes');
    required(typeof openaiInterface?.displayName === 'string' && openaiInterface.displayName.length <= 30, 'OpenAI display name must be at most 30 characters');
    required(typeof openaiInterface?.shortDescription === 'string' && openaiInterface.shortDescription.length <= 30, 'OpenAI final listing subtitle must be at most 30 characters');
    required(typeof openaiInterface?.longDescription === 'string' && openaiInterface.longDescription.length <= 4000, 'OpenAI long description must be at most 4,000 characters');
    required(Array.isArray(openaiInterface?.defaultPrompt) && openaiInterface.defaultPrompt.length <= 3
      && openaiInterface.defaultPrompt.every((prompt) => typeof prompt === 'string' && prompt.trim() && prompt.length <= 128), 'OpenAI listing supports at most three non-empty starter prompts, each at most 128 characters');
    for (const field of ['websiteURL', 'supportURL', 'privacyPolicyURL']) {
      let parsed;
      try { parsed = new URL(openaiInterface?.[field]); } catch {}
      required(parsed?.protocol === 'https:', `OpenAI listing ${field} must be an HTTPS URL`);
    }
  }
}

for (const ref of [plugin.extensions?.['com.openai']?.onboardingSkill, plugin.extensions?.['com.openai']?.interface?.composerIcon, plugin.extensions?.['com.openai']?.interface?.logo]) {
  if (ref) required(await exists(ref), `Missing plugin referenced file: ${ref}`);
}

required(mcp.mcpServers?.reasontrail?.url === 'https://app.reasontrail.ai/api/mcp', 'Portable package must point to the ReasonTrail remote MCP endpoint');
required(gemini.name === 'reasontrail-herdr', 'Gemini extension name must match the repository directory');
required(gemini.mcpServers?.reasontrail?.httpUrl === 'https://app.reasontrail.ai/api/mcp', 'Gemini extension must point to the ReasonTrail remote MCP endpoint');
required(openaiMcp.mcpServers?.reasontrail?.extensions?.['com.openai']?.auth?.client?.mode === 'dcr', 'OpenAI package must declare dynamic client registration');
required(openaiMcp.mcpServers?.reasontrail?.extensions?.['com.openai']?.auth?.baseScopes?.includes('brain:read'), 'OpenAI package must request the read scope');

const submissionBlockers = [];
if (!openaiInterface?.termsOfServiceURL) submissionBlockers.push('valid terms-of-service URL (owner-provided)');
if (!openaiReview?.demo_recording_url) submissionBlockers.push('accessible demo recording URL');
submissionBlockers.push('verified publisher identity and completed portal attestations');
submissionBlockers.push('reviewer credentials and sample tenant entered privately in the portal');
submissionBlockers.push('five positive and three negative cases executed against the reviewer tenant');
submissionBlockers.push('production domain verification and current successful MCP tool scan');

console.log('AI client directory package structure checks passed.');
console.log(`Final OpenAI submission is still blocked on: ${submissionBlockers.join('; ')}.`);
