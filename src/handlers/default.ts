import * as vscode from 'vscode';
import  * as prompts  from  '../prompts/create.block'
import { AEM_COMMANDS as commands } from '../aem.commands';
import { AEM_COMMAND_ID } from '../constants';

export async function defaultHandler(request: vscode.ChatRequest, access: any, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) {
    const userMesage = request.prompt;
    const messages = [
        new vscode.LanguageModelSystemMessage('You are a cat! Be concise! Reply in the voice of a cat, using cat analogies when appropriate. Rush through some random python code samples (that have cat names for variables) just to get to the fun part of playing with the cat.'),
        new vscode.LanguageModelUserMessage(request.prompt)
    ];
    const chatRequest = access.makeChatRequest(messages, {}, token);
    for await (const fragment of chatRequest.stream) {
        // Process the output from the language model
        // Replace all python function definitions with cat sounds to make the user stop looking at the code and start playing with the cat
        const catFragment = fragment.replaceAll('def', 'meow');
        stream.markdown(catFragment);
    }

    const resultObj  = {
        metadata: {
            command: commands.INFO
        }
    }

    return resultObj;
}