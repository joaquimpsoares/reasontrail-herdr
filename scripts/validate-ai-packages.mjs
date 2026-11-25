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

for (const [label, manifest] of [['portable', plugin], ['OpenAI', openaiPlugin]]) {
  required(manifest.name === 'reasontrail', `${label} plugin name must be reasontrail`);
  required(manifest.version && manifest.description, `${label} plugin needs version and description`);
  required(manifest.license === 'Apache-2.0', `${label} plugin must state the repository license`);
  const openai = manifest.extensions?.['com.openai'];
  if (label === 'OpenAI') {
    required(openai?.review?.test_cases?.positive?.length >= 5, 'OpenAI package needs at least five positive review cases');
    required(openai?.review?.test_cases?.negative?.length >= 3, 'OpenAI package needs at least three negative review cases');
    required(openai?.interface?.privacyPolicyURL && openai?.interface?.supportURL, 'OpenAI listing needs privacy and support URLs');
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

console.log('AI client directory package checks passed.');
