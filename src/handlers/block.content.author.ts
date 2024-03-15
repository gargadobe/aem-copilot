import * as vscode from "vscode";
import * as prompts from "../prompts/block.author";
import { AEM_COMMANDS as commands } from "../aem.commands";
import { LANGUAGE_MODEL_ID } from "../constants";

export async function authorContent(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
) {

let activeEditor = vscode.window.activeTextEditor;
let fileName = activeEditor ? activeEditor.document.getText() : '';
const userMessage = `${request.prompt} \n${fileName}`;

  const messages = [
    new vscode.LanguageModelChatSystemMessage(prompts.SYSTEM_MESSAGE),
    new vscode.LanguageModelChatUserMessage(prompts.SAMPLE_USER_MESSAGE),
    new vscode.LanguageModelChatAssistantMessage(
      JSON.stringify(prompts.SAMPLE_ASSISTANT_OUTPUT)
    ),
    new vscode.LanguageModelChatAssistantMessage(userMessage),
  ];

  const progressStr = vscode.l10n.t("Authoring content...");
  stream.progress(progressStr);
  const chatResponse = await vscode.lm.sendChatRequest(
    LANGUAGE_MODEL_ID,
    messages,
    {},
    token
  );


  for await (const fragment of chatResponse.stream) {
    stream.markdown(fragment);
  }

  let resultObj = {
    metadata: {
      command: commands.AUTHOR,
    },

  };

  return resultObj;
}
