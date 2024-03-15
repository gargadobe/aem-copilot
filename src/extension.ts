import * as vscode from 'vscode';
import { AEM_COMMANDS as commands } from './aem.commands';
import  { createCmdHandler } from './handlers/block.create';
import { infoCmdHandler } from './handlers/block.info';
import { enhanceBlock as enhanceCmdHandler } from './handlers/block.enhancer';
import { defaultHandler } from './handlers/default';
import { AEM_COMMAND_ID, LANGUAGE_MODEL_ID, PROCESS_COPILOT_CREATE_CMD } from './constants';
import { createFolderAndFiles } from './utils';
import { authorContent } from './handlers/block.content.author';

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
        let cmdResult: any;
        if (request.command == commands.INFO) {
            cmdResult =  await infoCmdHandler(request,  stream, token);
        } else if (request.command == commands.CREATE ) {
            cmdResult =  await createCmdHandler(request, stream, token);
        } else if (request.command == commands.ENHANCE) {
            cmdResult =  await enhanceCmdHandler(request, stream, token);
        } else if (request.command == commands.AUTHOR) {
            cmdResult =  await authorContent(request, stream, token);
        } else {
            cmdResult =  await defaultHandler(request, stream, token);
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

    // #TODO: Add followup provider  --> need to check
    aem.followupProvider = {
      provideFollowups(
        result: IAemChatResult,
        context: vscode.ChatContext,
        token: vscode.CancellationToken
      ) {
        return [
          {
            prompt: "How to build AEM blocks?",
            label: vscode.l10n.t("Build with AEM"),
            command: commands.INFO,
          } satisfies vscode.ChatFollowup,
        ];
      },
    };


    context.subscriptions.push(
        aem,
        vscode.commands.registerCommand(PROCESS_COPILOT_CREATE_CMD, async () => {
            const files = copilotResult.files
            await createFolderAndFiles(files);
        }),
    );
}

export function deactivate() { }
