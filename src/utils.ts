import * as vscode from 'vscode';
import * as path from 'path';

export async function createFileWithContent(filePath: string, content: string): Promise<void> {
    const fileUri = vscode.Uri.file(filePath);
    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content, 'utf8'));
}

export async function createFolderAndFiles(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        const baseUri = workspaceFolders[0].uri;
        const newFolderPath = vscode.Uri.joinPath(baseUri, 'NewFolder');
        await vscode.workspace.fs.createDirectory(newFolderPath);

        const newFilePath = path.join(newFolderPath.fsPath, 'NewFile.txt');
        await createFileWithContent(newFilePath, 'Your content here');
    }
}