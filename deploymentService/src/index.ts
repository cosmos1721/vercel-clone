import {createClient, commandOptions} from "redis";
import { downloadBuildFolder, uploadBuildFiles } from "./aws";
import { build, fetchAllFiles } from "./utils";
import path from "path";

const subscriber = createClient();
subscriber.connect();

async function main() {
    console.log("downloading files");
    while (1) {
        const resp = await subscriber.brPop(
            commandOptions({ isolated: true }),
            "upload-queue",
            0
        );

        //@ts-ignore
        const buildId = resp.element;
        await downloadBuildFolder(`output/${buildId}`);
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

        subscriber.lPush("build-queue", buildId);

    }
}
main();



