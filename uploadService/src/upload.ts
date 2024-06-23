import {S3} from "aws-sdk";
import fs from "fs";

import dotenv from "dotenv";

dotenv.config();

const s3 = new S3(
    {
        accessKeyId: process.env.AMAZON_ACCESS_KEY,
        secretAccessKey: process.env.AMAZON_SECRET_KEY
    }
    );


export const uploadFile = async (fileName: string, localFilePath: string) => {
    const file = fs.readFileSync(localFilePath);
    const resp = await s3.upload({
        Bucket: "vercel.test",
        Key: fileName,
        Body: file
    }).promise();
}

