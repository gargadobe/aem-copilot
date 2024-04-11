import * as vscode from 'vscode';
import { AEM_COMMANDS as commands } from '../aem.commands';
import { LANGUAGE_MODEL_ID } from '../constants';
import { SYSTEM_MESSAGE } from '../prompts/default';

export async function defaultHandler(request: vscode.ChatRequest, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) {
    const messages = [
        new vscode.LanguageModelChatSystemMessage(SYSTEM_MESSAGE),
        new vscode.LanguageModelChatUserMessage(request.prompt)
    ];
    const progressStr = vscode.l10n.t("AEM Assistant is thinking ...🤔");
    stream.progress(progressStr);
    const chatResponse = await vscode.lm.sendChatRequest(LANGUAGE_MODEL_ID, messages, {}, token);
    for await (const fragment of chatResponse.stream) {
      stream.markdown(fragment);
    }

    const testFn = {
        "bingo": "fda",
        "fdas": "fds"
   }

   stream.button({
     command: "test",
     title: vscode.l10n.t("test"),
     arguments: [testFn , stream, token],
   });

    const resultObj  = {
        metadata: {
            command: commands.INFO
        }
    }

    return resultObj;
}