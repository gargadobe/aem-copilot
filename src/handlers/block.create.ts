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

  let systemMsg = prompts.SYSTEM_MESSAGE;

  // read the project level scripts/scripts.js and put that in string to replace in the system message
  let projectLevelScripts = "";
  let projectLevelStyles = "";
  const projectLevelScriptsUri = vscode.Uri.joinPath(
    vscode.workspace.workspaceFolders![0].uri,
    "scripts/scripts.js"
  );
  const projectLevelStylesUri = vscode.Uri.joinPath(
    vscode.workspace.workspaceFolders![0].uri,
    "styles/styles.css"
  );
  try {
    const projectLevelScriptsFile = await vscode.workspace.fs.readFile(
      projectLevelScriptsUri
    );
    projectLevelScripts = projectLevelScriptsFile.toString();
  } catch (error) {
    console.log("project level scripts file not found");
  }
  try {
    const projectLevelStylesFile = await vscode.workspace.fs.readFile(
      projectLevelStylesUri
    );
    projectLevelStyles = projectLevelStylesFile.toString();
  } catch (error) {
    console.log("project level styles file not found");
  }

  // systemMsg = systemMsg.replace("{project-level-scripts}", `scripts/scripts.js\n${projectLevelScripts}`);
  systemMsg = systemMsg.replace(
    "{project-level-styles}",
    `styles/styles.css\n${projectLevelStyles}`
  );

  const messages = [
    new vscode.LanguageModelChatSystemMessage(systemMsg),
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

  let resultObj: {
    metadata: { command: typeof commands.CREATE };
    files?: any;
  } = {
    metadata: {
      command: commands.CREATE,
    },
  };
  try {
    console.log(resultJsonStr);
    const blockMd: string = parseEDSblockJson(resultJsonStr);
    // console.log(blockMd);
    stream.markdown(blockMd);

    stream.button({
      command: PROCESS_COPILOT_CREATE_CMD,
      title: vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD),
    });
    resultObj.files = JSON.parse(resultJsonStr).files;
  } catch (error) {
    console.log("Error parsing result json", error);
    stream.markdown("Sorry I can't assist with that. Please try again..");
  }

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
  if (blockJson.mdtable) {
    mdString += `\n Corresponding table for block should be: \n ${blockJson.mdtable}`;
  }
  if (blockJson.inputHtml) {
    mdString += `\n Corresponding blockinput is:\n\`\`\`${blockJson.inputHtml}\n\`\`\`\n`;
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
