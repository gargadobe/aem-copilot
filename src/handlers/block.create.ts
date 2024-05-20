import * as vscode from "vscode";
import * as prompts from "../prompts/create.block";
import { AEM_COMMANDS as commands } from "../aem.commands";
import {
  LANGUAGE_MODEL_ID,
  PROCESS_COPILOT_CREATE_CMD,
} from "../constants";
import { parseEDSblockJson } from "../utils";
import { blockTemplates } from "../block.templates";

async function getSelectedOption() {
  const options = Object.keys(blockTemplates).map((block) => ({
    label: block,
  }));

  options.push({ label: "None" });
  const selectedOption = await vscode.window.showQuickPick(options, {
    placeHolder: vscode.l10n.t("Select the base EDS block template"),
  });
  return selectedOption?.label || "tabs";
}

async function getProjectLevelStyles() {
  let projectLevelStyles = "";
  const projectLevelStylesUri = vscode.Uri.joinPath(
    vscode.workspace.workspaceFolders![0].uri,
    "styles/styles.css"
  );
  try {
    const projectLevelStylesFile = await vscode.workspace.fs.readFile(
      projectLevelStylesUri
    );
    projectLevelStyles = projectLevelStylesFile.toString();
  } catch (error) {
    console.log("project level styles file not found");
  }
  return projectLevelStyles;
}

async function getChatResponse(messages: vscode.LanguageModelChatMessage[], token: vscode.CancellationToken) {
  let resultJsonStr = "";
  const chatResponse = await vscode.lm.sendChatRequest(
    LANGUAGE_MODEL_ID,
    messages,
    {},
    token
  );
  for await (const fragment of chatResponse.stream) {
    resultJsonStr += fragment;
  }
  return resultJsonStr;
}

export async function createCmdHandler(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
) {

  // const progressStr = vscode.l10n.t("Selecting the base EDS block template...");
  // stream.progress(progressStr);
  

  const templateName = "None";
  if (templateName === "None") { 
    return createCmdHandlerWithoutTemplate(request, stream, token);
  }
  const progressStr2 = vscode.l10n.t(
      "Creating AEM block with base template..."
  );
  stream.progress(progressStr2);
  let userInput = request.prompt;

  let systemMsg = prompts.SYSTEM_MESSAGE;
  let userMsg = prompts.USER_MESSAGE;
  userMsg = userMsg.replace("#user_input", userInput);
  let templateOutput =
    blockTemplates[templateName as keyof typeof blockTemplates];
  userMsg = userMsg.replace("#base_block", JSON.stringify(templateOutput));

  let projectLevelStyles = await getProjectLevelStyles();
  systemMsg = systemMsg.replace(
    "{project-level-styles}",
    `styles/styles.css\n${projectLevelStyles}`
  );

  const messages = [
    new vscode.LanguageModelChatSystemMessage(systemMsg),
    new vscode.LanguageModelChatAssistantMessage(userMsg),
  ];

  try {
    let resultJsonStr = await getChatResponse(messages, token);
    console.log(resultJsonStr);
    const blockMd: string = parseEDSblockJson(resultJsonStr);
    stream.markdown(blockMd);
    stream.button({
      command: PROCESS_COPILOT_CREATE_CMD,
      title: vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD),
      arguments: [JSON.parse(resultJsonStr).files],
    });
  } catch (error) {
    console.log("Error parsing result json ", error);
    stream.markdown("Sorry I can't assist with that. Please try again..");
  }

  const resultObj = {
    metadata: {
      command: commands.CREATE,
    },
  };

  return resultObj;
}



async function createCmdHandlerWithoutTemplate(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
) {
  const userMesage = request.prompt;
  let systemMsg = prompts.SYSTEM_MESSAGE_WITHOUT_BASE_TEMPLATE;

  let projectLevelStyles = "";

  const projectLevelStylesUri = vscode.Uri.joinPath(
    vscode.workspace.workspaceFolders![0].uri,
    "styles/styles.css"
  );

  try {
    const projectLevelStylesFile = await vscode.workspace.fs.readFile(
      projectLevelStylesUri
    );
    projectLevelStyles = projectLevelStylesFile.toString();
  } catch (error) {
    console.log("project level styles file not found");
  }

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
    new vscode.LanguageModelChatUserMessage(prompts.SAMPLE_USER_MESSAGE_2),
    new vscode.LanguageModelChatAssistantMessage(
      JSON.stringify(prompts.SAMPLE_ASSISTANT_OUTPUT_2)
    ),
    new vscode.LanguageModelChatUserMessage(userMesage),
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

  try {
    console.log(resultJsonStr);
    const blockMd: string = parseEDSblockJson(resultJsonStr);
    stream.markdown(blockMd);

    stream.button({
      command: PROCESS_COPILOT_CREATE_CMD,
      title: vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD),
      arguments: [JSON.parse(resultJsonStr).files],
    });
  } catch (error) {
    console.log("Error parsing result json", error);
    stream.markdown("Some Network issues. Please try again..");
  }

  

   const resultObj = {
     metadata: {
       command: commands.CREATE,
     },
   };

   return resultObj;
}