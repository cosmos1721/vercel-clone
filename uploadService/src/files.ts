import fs from 'fs';

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