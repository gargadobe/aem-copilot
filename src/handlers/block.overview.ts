import * as vscode from 'vscode';
import  * as prompts  from  '../prompts/create.block'
import { AEM_COMMANDS as commands } from '../aem.commands';
import { AEM_COMMAND_ID } from '../constants';

export async function infoCmdHandler(request: vscode.ChatRequest, access: any, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) {
    const userMesage = request.prompt;
    const messages = [
        new vscode.LanguageModelSystemMessage(prompts.CREATE_SYSTEM_MESSAGE),
        new vscode.LanguageModelUserMessage(userMesage),
    ];
    const chatRequest = access.makeChatRequest(messages, {}, token);
    let result= "";
    for await (const fragment of chatRequest.stream) {
        stream.markdown(fragment);
        result += fragment;
    }
    console.log(result);
    stream.button({
        command: AEM_COMMAND_ID,
        title: vscode.l10n.t(AEM_COMMAND_ID)
    });
    return { metadata: { command: commands.INFO } };
}