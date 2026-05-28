import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from "path";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const WORKING_DIR = '/workspace';

// Helper function: Folders ke andar jaakar relative paths ke sath saari files nikalne ke liye
async function getFilesRecursively(dir, baseDir = dir) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    
    const files = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (entry.isDirectory()) {
            // UPDATED: node_modules aur dist folder ko ignore karne ke liye
            if (entry.name === 'node_modules' || entry.name === 'dist') return [];
            
            return getFilesRecursively(fullPath, baseDir);
        } else {
            // UPDATED: .env file ko ignore karne ke liye
            if (entry.name === '.env') return [];
            
            return relativePath;
        }
    }));
    
    return files.flat();
}

app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello from sandbox agent", status: "success" });
});

// UPDATED: Ab yeh folder ke andar ki files ko bhi "src/index.html" ke format mein dega
app.get("/list-files", async (req, res) => {
    try {
        const allFiles = await getFilesRecursively(WORKING_DIR);
        res.status(200).json({ message: "Files list successfully", files: allFiles });
    } catch (err) {
        res.status(500).json({ message: `Error listing directory: ${err.message}`, status: "error" });
    }
});

app.get("/read-files", async (req, res) => {
    const files = req.query.files;
    if (!files) {
        return res.status(400).json({ message: "Missing 'files' query parameter", status: "error" });
    }

    let fileList = [];
    if (Array.isArray(files)) {
        fileList = files;
    } else if (typeof files === 'string') {
        fileList = files.split(",");
    } else {
        return res.status(400).json({ message: "Invalid 'files' parameter format", status: "error" });
    }

    const results = await Promise.all(fileList.map(async (file) => {
        const filePath = path.join(WORKING_DIR, file.trim());
        try {
            const content = await fs.promises.readFile(filePath, "utf-8");
            return { [file.trim()]: content };
        } catch (err) {
            return { [file.trim()]: `Error reading file: ${err.message}` };
        }
    }));

    res.status(200).json({ message: "File contents checked", files: results });
});

app.patch('/update-files', async (req, res) => {
    const updates = req.body.updates;
    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({ message: "Invalid request body. Expected 'updates' array.", status: "error" });
    }

    const results = await Promise.all(updates.map(async (update) => {
        const { file, content } = update;
        const filePath = path.join(WORKING_DIR, file);
        try {
            await fs.promises.writeFile(filePath, content, "utf-8");
            return { [filePath]: "File updated successfully", };
        } catch (err) {
            return { [filePath]: `Error updating file: ${err.message}`, };
        }
    }));

    res.status(200).json({ message: "file update results", results });
});

app.post('/create-files', async (req, res) => {
    const files = req.body.files;
    if (!files || !Array.isArray(files)) {
        return res.status(400).json({ message: "Invalid request body. Expected 'files' array.", status: "error" });
    }

    const results = await Promise.all(files.map(async (fileObj) => {
        const { file, content } = fileObj;
        const filePath = path.join(WORKING_DIR, file);
        try {
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            await fs.promises.writeFile(filePath, content, "utf-8");
            return { [filePath]: "File created successfully", };
        } catch (err) {
            return { [filePath]: `Error creating file: ${err.message}`, };
        }
    }));

    res.status(200).json({ message: "Files created successfully", files: results });
});

export default app;
