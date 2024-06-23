import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import path from "path";
import { fetchAllFiles } from "./files";
import { uploadFile } from "./upload";
import { createClient } from "redis";

const uploadPublisher = createClient();
uploadPublisher.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/upload", async (req, res) => {
  const repoUrl = req.body.repoUrl;

  if (!repoUrl) {
    return res.status(400).json({ error: "repoURL is required" });
  }

  const id = generate();

  try {
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
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
    console.log("\nAll files uploaded");

    uploadPublisher.lPush("upload-queue", id);
    res.json({ id: id, files: files });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to clone repository" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
