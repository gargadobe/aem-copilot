import * as vscode from "vscode";
import * as prompts from "../prompts/create.block";
import { AEM_COMMANDS as commands } from "../aem.commands";
import { LANGUAGE_MODEL_ID, PROCESS_COPILOT_CREATE_CMD } from "../constants";

export async function createCmdHandler(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
) {
  const userMesage = request.prompt;
  const messages = [
    new vscode.LanguageModelChatSystemMessage(prompts.SYSTEM_MESSAGE),
    new vscode.LanguageModelChatUserMessage(prompts.SAMPLE_USER_MESSAGE),
    new vscode.LanguageModelChatAssistantMessage(
      JSON.stringify(prompts.SAMPLE_ASSISTANT_OUTPUT)
    ),
    new vscode.LanguageModelChatAssistantMessage(userMesage),
  ];

  const progressStr = vscode.l10n.t("Creating AEM block...");
  stream.progress(progressStr);
  const chatResponse = await vscode.lm.sendChatRequest(
    LANGUAGE_MODEL_ID,
    messages,
    {},
    token
  );

  let resultJsonStr = "";

  for await (const fragment of chatResponse.stream) {
    resultJsonStr += fragment;
  }

  const blockMd: string = parseEDSblockJson(resultJsonStr);
  console.log(blockMd);
  stream.markdown(blockMd);
    
  stream.button({
    command: PROCESS_COPILOT_CREATE_CMD,
    title: vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD),
  });

  let resultObj = {
    metadata: {
      command: commands.CREATE,
    },
    files: JSON.parse(resultJsonStr).files,
  };

  return resultObj;
}

// parse the resultjson to create nice md string with

function parseEDSblockJson(resultJson: string) {
  resultJson = resultJson.replace(/\\\\/g, "\\");
  const blockJson = JSON.parse(resultJson);
  const fileTreeMd = createFileTreeMd(blockJson.tree);
    let mdString = `For Creating a block structure, the folder/file structure is as follows:\n
    ${fileTreeMd}\nFile Content of each files are as follows:\n`;
  for (const file of blockJson.files) {
    mdString += `## ${file.path}\n\`\`\`${file.type}\n${file.content}\n\`\`\`\n`;
  }
  return mdString;
}

function createFileTreeMd(tree: any, depth = 0) {
  let mdString = "";
  const indent = "    ".repeat(depth);
  if (tree.type === "directory") {
    mdString += `${indent}${tree.name}\n`;
    for (const child of tree.children) {
      mdString += createFileTreeMd(child, depth + 1);
    }
  } else {
    mdString += `${indent}├── ${tree.name}\n`;
  }
  return mdString;
}
