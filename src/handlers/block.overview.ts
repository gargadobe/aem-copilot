import * as vscode from "vscode";
import * as prompts from "../prompts/eds.info.prompt";
import { AEM_COMMANDS as commands } from "../aem.commands";
import { AEM_COMMAND_ID } from "../constants";

export async function infoCmdHandler(
  request: vscode.ChatRequest,
  access: any,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
) {
  const userMesage = request.prompt;
  const messages = [
    new vscode.LanguageModelSystemMessage(prompts.EDS_INFO_PROMPT_MSG),
    new vscode.LanguageModelUserMessage(userMesage),
  ];
  const chatRequest = access.makeChatRequest(messages, {}, token);
  let result = "";
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    let uri = editor.document.uri;
    let selection = editor.selection;

    let location;
    if (selection.isEmpty) {
      // If the selection is empty, create a range that represents the entire document
      let start = new vscode.Position(0, 0);
      let end = new vscode.Position(
        editor.document.lineCount - 1,
        editor.document.lineAt(editor.document.lineCount - 1).text.length
      );
      let range = new vscode.Range(start, end);
      location = new vscode.Location(uri, range);
    } else {
      // If there is a selection, use it to create the location
      location = new vscode.Location(uri, selection);
    }

    stream.reference(location);
  }

  for await (const fragment of chatRequest.stream) {
    stream.markdown(fragment);
    result += fragment;
  }
  console.log(result);
  stream.button({
    command: AEM_COMMAND_ID,
    title: vscode.l10n.t(AEM_COMMAND_ID),
  });

  const resultObj = {
    metadata: {
      command: commands.INFO,
    },
  };

  return resultObj;
}
