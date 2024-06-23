import {createClient, commandOptions} from "redis";
import { downloadBuildFolder, uploadBuildFiles } from "./aws";
import { build, fetchAllFiles } from "./utils";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL is required");
}

const subscriber = createClient({
    url: redisUrl
});

subscriber.connect();

async function processBuild(buildId: string) {
try {
    await downloadBuildFolder(`output/${buildId}`);
    subscriber.hSet("status", buildId, "Build in progress");
    await build(buildId);
    
    const dirPath = path.join(__dirname, `output/${buildId}/build`);
    const files = fetchAllFiles(dirPath);
    const fileCount = files.length;
    console.log(`Found ${fileCount} files`);
    let count = 1;
    const uploadBuildPromises = files.map(async file => {
        await uploadBuildFiles(file.slice(__dirname.length + 1), file);
        process.stdout.write(`\rUpload file count: ${count}/${fileCount}`);
        count++;
        });

    await Promise.all(uploadBuildPromises);
    console.log("\nAll files uploaded");

    subscriber.hSet("status", buildId, "Done");

    }catch (error) {
        console.error("Error processing build", error);
        subscriber.hSet("status", buildId, "Failed");
    }
}

async function main() {
    console.log("downloading files");
    while (1) {
        const resp = await subscriber.brPop(
            commandOptions({ isolated: true }),
            "upload-queue",
            0
            );
            
        // @ts-ignore
        const buildId = resp.element;
        processBuild(buildId);
    }
}

main().catch(err => console.error('Main function error:', err));



