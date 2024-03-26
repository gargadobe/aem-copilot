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
  let blockName = request.prompt;
  blockName = blockName.trim().toLowerCase();
  const progressStr = vscode.l10n.t(
    "Fetching Block From Block Collection ...🤔"
  );
  stream.progress(progressStr);
  let resultObj: {
    metadata: { command: typeof commands.COLLECION };
    files?: any;
  } = {
    metadata: {
      command: commands.COLLECION,
    },
  };

  if (!BLOCK_COLLECTION_LIST.includes(blockName)) {
    const errorMsg = vscode.l10n.t(`Block not found in collection \n here is the list of available blocks: \n\n  - ${BLOCK_COLLECTION_LIST.join("\n - ")}`);
    console.log(errorMsg);
    stream.markdown(errorMsg);
  } else {
    const files = await fetchAEMBlock(blockName, stream);
    resultObj["files"] = files;
    stream.button({
            command: PROCESS_COPILOT_CREATE_CMD,
            title: vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD),
        });
  }
  return resultObj;
}

async function fetchAEMBlock(
  blockName: string,
  stream: vscode.ChatResponseStream
) {
  let blockJson = [];
  stream.markdown(`Here is ${blockName} from AEM block collection\n\n`);
  const blockJsURL = `${AEM_BLOCK_COLLECTION_URL}/${blockName}/${blockName}.js`;
  const blockCSSURL = `${AEM_BLOCK_COLLECTION_URL}/${blockName}/${blockName}.css`;
  const response = await fetch(blockJsURL);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${blockJsURL}: ${response.statusText}`);
  }
  const javscriptCode = await response.text();
  stream.markdown(`\`\`\`javascript\n\n${javscriptCode}\n\n\`\`\``);

  const response2 = await fetch(blockCSSURL);
  if (!response2.ok) {
    throw new Error(`Failed to fetch ${blockCSSURL}: ${response2.statusText}`);
  }
    const cssCode = await response2.text();
  stream.markdown(`\nBlock Styling CSS: ${blockName}.css \n\n`);
  stream.markdown(`\`\`\`css\n\n${cssCode}\n\`\`\``);

  blockJson.push(
    {
      name: `${blockName}.js`,
      type: javscriptCode,
      path: "blocks/" + blockName + "/" + blockName + ".js",
      content: javscriptCode,
    },
    {
      name: `${blockName}.css`,
      type: cssCode,
      path: "blocks/" + blockName + "/" + blockName + ".css",
      content: cssCode,
    }
  );

  return blockJson;
}

//  prompt: "How to build AEM blocks?",
//             label: vscode.l10n.t("Build with AEM"),
//   command: commands.INFO,
    

// async function getGitHubFolderContents(blockName: string, stream: vscode.ChatResponseStream, path?: string) {
//     try {
//         const url = `${AEM_BLOCK_COLLECTION_URL}/${blockName}${ path ? `/${path}` : ''}`;
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
//         }

//         const content = await response.json();

//         // Check if the response is a directory
//         if (Array.isArray(content)) {
//             for (const item of content) {
//                 if (item.type === 'file') {
//                     let file = {}
//                     const fileContentResponse = await fetch(item.download_url);
//                     if (!fileContentResponse.ok) {
//                         throw new Error(`Failed to fetch ${item.download_url}: ${fileContentResponse.statusText}`);
//                     }
//                     const fileContent = await fileContentResponse.text();
//                     // file['name'] = item.name;
//                     // file['content'] = fileContent;
//                     // file['type'] = 'file';
//                     // file['path'] = item.path;
//                     console.log(`File: ${file}`);
//                     stream.markdown(`\`\`\`${JSON.stringify(file)}\`\`\``);
//                 } else if (item.type === 'dir') {
//                     console.log(`Entering directory: ${item.path}`);
//                     await getGitHubFolderContents(blockName, stream, item.path);
//                 }
//             }
//         } else {
//             console.log(`Not a directory: ${url}`);
//         }
//     } catch (error) {
//         console.error('Error:', (error as Error).message);
//     }
// }
