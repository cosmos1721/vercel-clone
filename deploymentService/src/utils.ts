import {exec, spawn} from 'child_process';
import path from 'path';
import fs from 'fs';

export function build(id: string){
    return new Promise((resolve) =>{
        const child = exec (`cd ${path.join(__dirname, `output/${id}`)} && npm install && npm run build`)
        child.stdout?.on("data", (data) => {
            console.log("stdout:" + data);
        });
        child.stderr?.on("data", (data) => {
            console.log("stderr:" + data);
        });
        child.on("close", (code) => {
            console.log("child process exited with code" + code);
            resolve("");
        });
    });

}

export const fetchAllFiles = (filePath : string) => {
    let response: string[] = [];
    
    const files = fs.readdirSync(filePath);
    files.forEach(file => {
        const fullPath = `${filePath}/${file}`;
        if (fs.statSync(fullPath).isDirectory()) {
            response = response.concat(fetchAllFiles(fullPath));
        }
        else {
            response.push(fullPath);
        }
        
    });
    return response;
}

