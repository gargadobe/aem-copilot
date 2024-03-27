import * as vscode from 'vscode';
import { AEM_COMMANDS as commands } from './aem.commands';
import  { createCmdHandler } from './handlers/block.create';
import { infoCmdHandler } from './handlers/block.info';
import { enhanceBlock as enhanceCmdHandler } from './handlers/block.enhancer';
import { defaultHandler } from './handlers/default';
import { AEM_COMMAND_ID, PROCESS_COPILOT_CREATE_CMD } from './constants';
import { createFolderAndFiles } from './utils';
import { fetchBlock } from './handlers/block.collections';

interface IAemChatResult extends vscode.ChatResult {
    metadata: {
        command: string;
    }
}

export function activate(context: vscode.ExtensionContext) {

    let copilotResult: any

    // Define a AEM chat handler. 
    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context2: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken): Promise<IAemChatResult> => {
        let cmdResult: any;
        if (request.command == commands.INFO) {
            cmdResult =  await infoCmdHandler(request,  stream, token);
        } else if (request.command == commands.CREATE ) {
            cmdResult =  await createCmdHandler(request, stream, token);
        } else if (request.command == commands.ENHANCE) {
            cmdResult =  await enhanceCmdHandler(request, stream, token);
        } else if (request.command == commands.COLLECION) {
            cmdResult =  await fetchBlock(request, stream, token);
        } else {
            cmdResult =  await defaultHandler(request, stream, token);
        }
      
        copilotResult = cmdResult;     
        return cmdResult.metadata;
    };

 
    const aem = vscode.chat.createChatParticipant(AEM_COMMAND_ID, handler);
    const path = vscode.Uri.joinPath(context.extensionUri, 'aem.jpeg');
    aem.iconPath = path;

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


    vscode.chat.registerChatVariableResolver(
      "cat_context",
      "Describes the state of mind and version of the cat",
      {
        resolve: (name, context, token) => {
          if (name == "cat_context") {
            const mood = Math.random() > 0.5 ? "happy" : "grumpy";
            return [
              {
                level: vscode.ChatVariableLevel.Short,
                value: "version 1.3 " + mood,
              },
              {
                level: vscode.ChatVariableLevel.Medium,
                value: "I am a playful cat, version 1.3, and I am " + mood,
              },
              {
                level: vscode.ChatVariableLevel.Full,
                value:
                  "I am a playful cat, version 1.3, this version prefer to explain everything using mouse and tail metaphores. I am " +
                  mood,
              },
            ];
          }
        },
      }
    );


    context.subscriptions.push(
        aem,
      vscode.commands.registerCommand(PROCESS_COPILOT_CREATE_CMD, async (data) => {
            console.log(data);
            const files = copilotResult.files
            await createFolderAndFiles(files);
        }),
    );
}

export function deactivate() { }
