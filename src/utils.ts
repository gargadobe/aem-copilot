import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export async function createFileWithContent(
  filePath: string,
  content: string
): Promise<void> {
  const fileUri = vscode.Uri.file(filePath);
  await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content, "utf8"));
}

export async function createFolderAndFiles(files: any[]): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders) {
    const baseUri = workspaceFolders[0].uri;
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Creating files",
        cancellable: false,
      },
      async (progress) => {
        if (files.length > 0) { 
          // split files[0] by / and if first starts with blocks and second would represent the block name , check if that folder exist then delete that
          const blockName = files[0].path.split("/")[1];
          const blockPath = path.join(baseUri.fsPath, "/blocks/" + blockName);
          if (fs.existsSync(blockPath
          )) {
            fs.rmdirSync(blockPath, { recursive: true });
          }
        }

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const newFilePath = vscode.Uri.joinPath(baseUri, file.path);
          const dirPath = path.dirname(newFilePath.fsPath);
          fs.mkdirSync(dirPath, { recursive: true });
          try {
            await vscode.workspace.fs.stat(newFilePath);
          } catch (err) {
            await createFileWithContent(newFilePath.fsPath, file.content);
            const document = await vscode.workspace.openTextDocument(
              newFilePath
            ); // open the document
            const editor = await vscode.window.showTextDocument(document); // show the document in the editor
            await vscode.commands.executeCommand(
              "editor.action.formatDocument"
            ); // format the document
          }
          progress.report({
            increment: 100.0 / files.length,
            message: `Creating file: ${file.path}`,
          });
        }
      }
    );
  }
}

interface File {
  name: string;
  path: string;
  content?: string;
}

/**
 * Parses a string into a JSON object containing file information using regular expressions,
 * including extracting file names based on the provided structure.
 *
 * @param str - The string to parse.
 * @returns An array of objects, each representing a file with its name, type, and content.
 */
export function parseFileStringWithFilenames(str: string): File[] {
  const regex = /```([^`]+)```/g;
  let matches = str.match(regex);
  let count = 0;
  let files: File[] = [];
  if (matches) {
    for (let match of matches) {
      let content = match.slice(3, -3);
      content = content?.trim();

      if (
        content &&
        (content.startsWith("javascript") || content.startsWith("css"))
      ) {
        content = content.replace(/(javascript|css)/, "");
        content = content?.trim();
      } else if (count === 0) {
        const filesTemp = getFilePaths(content);
        for (let file of filesTemp) {
          files.push(file);
        }
      } else if (files[count - 1]) {
        const file = files[count - 1];
        file.content = content;
      }
      count++;
    }
  }
  return files;
}

function getFilePaths(fileTree: string): File[] {
  const lines = fileTree.trim().split("\n").slice(1);
  let result: File[] = [];
  let currentPath: string[] = [];
  let name: any;

  lines.forEach((line) => {
    const depth = (line.match(/\|   /g) || []).length;
    name = line.split("├── ");
    name = name.length > 1 ? name.pop() : name[0];
    name = name.split("└── ");
    name = name.length > 1 ? name.pop() : name[0];
    name = name?.trim();

    currentPath = currentPath.slice(0, depth);

    if (name) {
      currentPath[depth] = name;
      const path = currentPath.join("/");
      result.push({ name, path });
    }
  });

  result = result.filter((file) => file.name.includes("."));
  return result;
}


// parse the resultjson to create nice md string with

export function parseEDSblockJson(resultJson: string) {
  resultJson = resultJson.replace(/\\\\/g, "\\");
  const blockJson = JSON.parse(resultJson);
  const fileTreeMd = createFileTreeMd(blockJson.tree);
  let mdString = `For Creating a block structure, the folder/file structure is as follows:\n
    ${fileTreeMd}\nFile Content of each files are as follows:\n`;
  for (const file of blockJson.files) {
    mdString += `## ${file.path}\n\`\`\`${file.type}\n${file.content}\n\`\`\`\n`;
  }
  if (blockJson.mdtable) {
    mdString += `\n Corresponding table for block should be: \n ${blockJson.mdtable}\n\n`;
  }
  // if (blockJson.inputHtml) {
  //   mdString += `\n Corresponding blockinput is:  \n\`\`\`${blockJson.inputHtml}\n\`\`\`\n`;
  // }
  return mdString;
}

function createFileTreeMd(tree: any, depth = 0) {
  let mdString = "";
  const indent = "    ".repeat(depth);
  if (tree.type === "directory") {
    mdString += `${indent}${tree.name}\n`;
    for (const child of tree.children) {
      mdString += createFileTreeMd(child, depth + 1);
    }
  } else {
    mdString += `${indent}├── ${tree.name}\n`;
  }
  return mdString;
}
