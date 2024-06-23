import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import path from "path";
import { fetchAllFiles } from "./files";
import { uploadFile } from "./upload";
import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();


const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL is required");
}
const uploadClient = createClient({
  url: redisUrl
});
uploadClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});
uploadClient.connect();



const app = express();
app.use(cors());
app.use(express.json());




app.post("/upload", async (req, res) => {
  const repoUrl = req.body.repoUrl;

  if (!repoUrl) {
    return res.status(400).json({ error: "repoURL is required" });
  }

  const id = generate().toLowerCase();
  try {
    res.json({ id: id });
    await cloneRepo(repoUrl, id);
  }catch (error) {
    res.status(500).json({ error: "Process failed, try again" });
  }

});



app.get("/status", async (req, res) => {
  const id = req.query.id;
  const responseStatus = await uploadClient.hGet("status", id as string);
  res.json({ status: responseStatus 
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});



async function cloneRepo(repoUrl: string, id: string) {

  try {
    uploadClient.hSet("status", id, "Initalizing");
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
    console.log("Repository cloned");
    uploadClient.hSet("status", id, "Cloning repository");
    const files = fetchAllFiles(path.join(__dirname, `output/${id}`));
    const fileCount = files.length;
    console.log(`Found ${fileCount} files`);
    let count = 1;
    
    const uploadPromises = files.map(async file => {
      await uploadFile(file.slice(__dirname.length + 1), file);
      process.stdout.write(`\rCurrent file count: ${count}/${fileCount}`);
      count++;
      });
      
      await Promise.all(uploadPromises);
      uploadClient.hSet("status", id, "Uploading to Servers");
      console.log("\nAll files uploaded");

    uploadClient.lPush("upload-queue", id);
  } catch (error) {
    console.error(error);
  }
}