import * as vscode from 'vscode';
import  * as prompts  from  '../prompts/create.block'
import { AEM_COMMANDS as commands } from '../aem.commands';
import { AEM_COMMAND_ID, LANGUAGE_MODEL_ID } from '../constants';

export async function enhanceBlock(request: vscode.ChatRequest,stream: vscode.ChatResponseStream, token: vscode.CancellationToken) {
    const userMesage = request.prompt;
    const messages = [
        new vscode.LanguageModelChatSystemMessage(prompts.CREATE_SYSTEM_MESSAGE),
        new vscode.LanguageModelChatUserMessage(userMesage),
    ];
    const progressStr = vscode.l10n.t("Enhancing AEM block...");
    stream.progress(progressStr);
    const chatResponse = await vscode.lm.sendChatRequest(LANGUAGE_MODEL_ID, messages, {}, token);
    let result= "";
    for await (const fragment of chatResponse.stream) {
      stream.markdown(fragment);
      result += fragment;
    }
    console.log(result);
    stream.button({
        command: AEM_COMMAND_ID,
        title: vscode.l10n.t(AEM_COMMAND_ID)
    });

    const resultObj  = {
        metadata: {
            command: commands.ENHANCE
        }
    }

    return resultObj;
}