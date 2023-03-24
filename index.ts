import express, { Express, Response, Request} from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";

const app: Express = express();
const prisma = new PrismaClient();
const upload = multer({
    dest: "uploads"
})

type File = {
    path: string
    orginialName: string
    downloadCount: number
}

app.set("view engine", "ejs");

app.get("/", (req: Request, res: Response) => {
    res.render("index");
});

app.get("/upload", (req: Request, res: Response) => {
    res.render("upload");
});

app.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
    const path = req.file?.path;
    const orginialName = req.file?.originalname;

    if(path == undefined || orginialName == undefined) {
        return res.send("<h1>Error</h1>");
    }

    await prisma.file.create({
        data: {
            path: path,
            orginialName: orginialName
        }
    })
    res.redirect("/files");
});

app.get("/files", async (req: Request, res: Response) => {
    const files = await prisma.file.findMany();
    res.render("files", { files: files , url: req.headers.origin });
});

app.get("/file/:id", async (req: Request, res: Response) => {
    await prisma.file.update({
        where: {
            id: req.params.id
        },
        data: {
            downloadCount: {
                increment: 1
            }
        }
    })

    const file = await prisma.file.findUnique({
        where: {
            id: req.params.id
        }
    })

    if(file == null) {
        return res.send("Error");
    }

    res.download(file.path, file.orginialName);

});

app.listen(3000, () => console.log("Server has been started!"));