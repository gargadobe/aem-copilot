import * as vscode from 'vscode';
import { AEM_COMMANDS as commands } from './aem.commands';
import  { createCmdHandler } from './handlers/block.create';
import { infoCmdHandler } from './handlers/block.overview';
import { enhanceBlock as enhanceCmdHandler } from './handlers/block.enhancer';
import { defaultHandler } from './handlers/default';
import { AEM_COMMAND_ID, LANGUAGE_MODEL_ID, PROCESS_COPILOT_CREATE_CMD } from './constants';
import { createFolderAndFiles } from './utils';

interface IAemChatResult extends vscode.ChatResult {
    metadata: {
        command: string;
    }
}


export function activate(context: vscode.ExtensionContext) {

    let copilotResult: any

    // Define a AEM chat handler. 
    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context2: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken): Promise<IAemChatResult> => {
        // To talk to an LLM in your subcommand handler implementation, your
        // extension can use VS Code's `requestChatAccess` API to access the Copilot API.
        // The GitHub Copilot Chat extension implements this provider.

        const access = await vscode.lm.requestLanguageModelAccess(LANGUAGE_MODEL_ID);
        let cmdResult: any;
        if (request.command == commands.INFO) {
            cmdResult =  await infoCmdHandler(request, access, stream, token);
        } else if (request.command == commands.CREATE ) {
            cmdResult =  await createCmdHandler(request, access, stream, token);
        } else if (request.command == commands.ENHANCE) {
            cmdResult =  await enhanceCmdHandler(request, access, stream, token);
        } else {
            cmdResult =  await defaultHandler(request, access, stream, token);
        }
        copilotResult = cmdResult;
        
        return cmdResult.metadata;
    };

    // Chat participants appear as top-level options in the chat input
    // when you type `@`, and can contribute sub-commands in the chat input
    // that appear when you type `/`.
    const aem = vscode.chat.createChatParticipant(AEM_COMMAND_ID, handler);
    aem.isSticky = true; // Assistant is persistant, whenever a user starts interacting with @aem, @aem will automatically be added to the following messages
    aem.iconPath = vscode.Uri.joinPath(context.extensionUri, 'aem.png');
    aem.description = vscode.l10n.t('Hi! What can I help you with?');
    aem.commandProvider = {
        provideCommands(token) {
            return [
                { name: commands.CREATE, description: 'Given a block name, create corresponding files' },
                { name: commands.ENHANCE, description: 'Enhance an existing AEM EDS block' },
                { name: commands.INFO, description: 'Information About AEM EDS blocks' }
            ];
        }
    };

    // #TODO: Add followup provider  --> need to check
    aem.followupProvider = {
        provideFollowups(result: IAemChatResult, token: vscode.CancellationToken) {
            return [{
                prompt: 'How to build AEM blocks?',
                label: vscode.l10n.t('Build with AEM'),
                command: commands.INFO
            } satisfies vscode.ChatFollowup];
        }
    };

    //#TODO Need to check how i can use chat variables
    vscode.chat.registerChatVariableResolver('aem_context', 'Describes the state of mind and version of the cat', {
        resolve: (name, context, token) => {
            if (name == 'aem_context') {
                const mood = Math.random() > 0.5 ? 'happy' : 'grumpy';
                return [
                    {
                        level: vscode.ChatVariableLevel.Short, 
                        value: 'version 1.3 ' + mood 
                    },
                    {
                        level: vscode.ChatVariableLevel.Medium, 
                        value: 'I am a playful cat, version 1.3, and I am ' + mood 
                    },
                    {
                        level: vscode.ChatVariableLevel.Full, 
                        value: 'I am a playful cat, version 1.3, this version prefer to explain everything using mouse and tail metaphores. I am ' + mood 
                    }
                ]
            }
        }
    });

    context.subscriptions.push(
        aem,
        vscode.commands.registerCommand(PROCESS_COPILOT_CREATE_CMD, async () => {
            const files = copilotResult.files
            await createFolderAndFiles(files);
        }),
    );
}

export function deactivate() { }
