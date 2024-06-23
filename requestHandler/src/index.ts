import express from 'express';
import {S3} from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();
const s3 = new S3(
    {
        accessKeyId: process.env.AMAZON_ACCESS_KEY,
        secretAccessKey: process.env.AMAZON_SECRET_KEY
    }
    );

const app = express();

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL is required");
}

app.get('/*', async (req, res) => {
const host = req.hostname;
console.log(host)
const id = host.split('.')[0];
console.log(id)
const endpoint = req.path;
console.log(endpoint)

const contents = await s3.getObject({
    Bucket: "vercel.test",
    Key: `output/${id}/build${endpoint}`
}).promise();

const type = endpoint.endsWith("html") ? "text/html" : endpoint.endsWith("css") ? "text/css" : "application/javascript"
res.set("Content-Type", type);
res.send(contents.Body)


});




app.listen(3001);

