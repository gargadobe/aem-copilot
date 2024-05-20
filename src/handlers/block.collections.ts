import * as vscode from "vscode";
import { AEM_COMMANDS as commands } from "../aem.commands";
import {
  AEM_BLOCK_COLLECTION_URL,
  BLOCK_COLLECTION_LIST,
  PROCESS_COPILOT_CREATE_CMD,
} from "../constants";

export async function fetchBlock(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
) {
  const blockName = request.prompt.trim().toLowerCase();
  stream.progress(vscode.l10n.t("Fetching Block From Block Collection ...🤔"));

  if (blockName === "ls" || !BLOCK_COLLECTION_LIST.includes(blockName)) {
    const message = blockName === "ls" ? 
      `List of available blocks: \n\n  - ${BLOCK_COLLECTION_LIST.join("\n - ")}` :
      `Block not found in collection \n here is the list of available blocks: \n\n  - ${BLOCK_COLLECTION_LIST.join("\n - ")}`;
    stream.markdown(vscode.l10n.t(message));
    return;
  }

  try {
    const files = await fetchAEMBlock(blockName, stream);
    stream.button({
      command: PROCESS_COPILOT_CREATE_CMD,
      title: vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD),
      arguments: [files],
    });
  } catch (error) {
    stream.markdown(`Error fetching block:`);
  }

  return {
    metadata: {
      command: commands.COLLECION,
    },
  };
}

async function fetchAEMBlock(
  blockName: string,
  stream: vscode.ChatResponseStream
) {
  const fileTreeMd = `
    ${blockName}
    ├── ${blockName}.js
    └── ${blockName}.css
  `;

  stream.markdown(`The folder/file structure is as follows:\n${fileTreeMd}\nFile Content of each files are as follows:\n\n`);

  const blockJsURL = `${AEM_BLOCK_COLLECTION_URL}/${blockName}/${blockName}.js`;
  const blockCSSURL = `${AEM_BLOCK_COLLECTION_URL}/${blockName}/${blockName}.css`;

  const [javascriptCode, cssCode] = await Promise.all([
    fetchFile(blockJsURL, 'javascript', stream),
    fetchFile(blockCSSURL, 'css', stream)
  ]);

  return [
    {
      name: `${blockName}.js`,
      type: 'javascript',
      path: `blocks/${blockName}/${blockName}.js`,
      content: javascriptCode,
    },
    {
      name: `${blockName}.css`,
      type: 'css',
      path: `blocks/${blockName}/${blockName}.css`,
      content: cssCode,
    }
  ];
}

async function fetchFile(url: string, language: string, stream: vscode.ChatResponseStream) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  const code = await response.text();
  stream.markdown(`\`\`\`${language}\n\n${code}\n\n\`\`\``);
  return code;
}