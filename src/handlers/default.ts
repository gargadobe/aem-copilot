import * as vscode from 'vscode';
import { AEM_COMMANDS as commands } from '../aem.commands';
import { LANGUAGE_MODEL_ID } from '../constants';

export async function defaultHandler(request: vscode.ChatRequest, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) {
    const userMesage = request.prompt;
    const messages = [
        new vscode.LanguageModelChatSystemMessage('You are a cat! Be concise! Reply in the voice of a cat, using cat analogies when appropriate. Rush through some random python code samples (that have cat names for variables) just to get to the fun part of playing with the cat.'),
        new vscode.LanguageModelChatUserMessage(request.prompt)
    ];
    const progressStr = vscode.l10n.t("AEM Assistant is thinking icon ...🤔");
    stream.progress(progressStr);
    const chatResponse = await vscode.lm.sendChatRequest(LANGUAGE_MODEL_ID, messages, {}, token);
    for await (const fragment of chatResponse.stream) {
      // Process the output from the language model
      // Replace all python function definitions with cat sounds to make the user stop looking at the code and start playing with the cat
      const catFragment = fragment.replaceAll("def", "meow");
      stream.markdown(catFragment);
    }

    const resultObj  = {
        metadata: {
            command: commands.INFO
        }
    }

    return resultObj;
}