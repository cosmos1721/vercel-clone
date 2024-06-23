import {S3} from "aws-sdk";
import fs from "fs";
import path, { resolve } from "path";

import dotenv from "dotenv";

dotenv.config();

const s3 = new S3(
    {
        accessKeyId: process.env.AMAZON_ACCESS_KEY,
        secretAccessKey: process.env.AMAZON_SECRET_KEY
    }
    );


export async function downloadBuildFolder(pathPrefix: string) {
    const fetchFiles = await s3.listObjectsV2({
        Bucket: "vercel.test",
        Prefix: pathPrefix
    }).promise();

    const files = fetchFiles.Contents?.map(async ({Key})=>{
        return new Promise (async (resolve) => {
            if (!Key) {
                resolve("");
                return;
                }
                
        const outputPath = path.join(__dirname, Key);
        const dirName = path.dirname(outputPath);
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
            }

        const file = fs.createWriteStream(outputPath);
        s3.getObject({
            Bucket: "vercel.test",
            Key : Key 
        }).createReadStream().pipe(file).on("finish", () => {
            resolve("");
        })
        })
    }) || [];
    console.log("awaiting files");
    
    await Promise.all(files?.filter(x => x !== undefined));
    console.log(files.length);
    console.log("deleting files from s3");

    await s3.deleteObjects({
        Bucket: "vercel.test",
        Delete: {
            Objects: (fetchFiles.Contents || []).filter(item => item.Key).map(({Key}) => ({ Key: Key! })) // Ensure Key is non-nullable
        }
    }).promise();
    
    }

    
export const uploadBuildFiles = async (fileName: string, localFilePath: string) => {
    const file = fs.readFileSync(localFilePath) ;
    const resp = await s3.upload({
        Bucket: "vercel.test",
        Key: fileName,
        Body: file
        }).promise();
        }
    console.log("done build folder uploading");

