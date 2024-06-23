import { toEditorSettings } from "typescript";

const TOKEN_LEN = 6;


export function generate(){
    let token = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < TOKEN_LEN; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
}