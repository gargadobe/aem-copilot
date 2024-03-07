import * as vscode from 'vscode';
import * as prompts from '../prompts/create.block'
import { AEM_COMMANDS as commands } from '../aem.commands';
import { PROCESS_COPILOT_CREATE_CMD } from '../constants';

export async function createCmdHandler(request: vscode.ChatRequest, access: any, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) {
    const userMesage = request.prompt;
    const messages = [
        new vscode.LanguageModelSystemMessage(prompts.CREATE_SYSTEM_MESSAGE),
        new vscode.LanguageModelUserMessage(userMesage),
    ];
    const chatRequest = access.makeChatRequest(messages, {}, token);
    let result = "";
    let resultJson = "";
    let flag = false;
    for await (const fragment of chatRequest.stream) {
        if (flag || fragment.includes("->")) {
            resultJson += fragment;
            flag = true;
        } else {
            stream.markdown(fragment);
            result += fragment;
        }
    }
    console.log(result);
    console.log(resultJson);
    const blockJson: string = parseFileStringWithFilenames(resultJson);

    stream.button({
        command: PROCESS_COPILOT_CREATE_CMD,
        title: vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD),
    });

    let resultObj = {
        metadata: {
            command: commands.CREATE
        },
        files: blockJson
    }

    return resultObj;
}

// create a function that parse the string and get a json object
function parseFileStringWithFilenames(str: string): any {
    const regex = /\[\s*{[\s\S]*?}\s*]/;
    const match = str.match(regex);
    let jsonObj = [];

    if (match) {
        // The JSON part is in match[0]
        let jsonStr = match[0];
        try {
            jsonObj = JSON.parse(jsonStr);
            console.log(jsonObj); // This should log the parsed JSON object.
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    } else {
        console.error("No JSON found in the string");
    }
    return jsonObj;
}



