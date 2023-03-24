"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const upload = (0, multer_1.default)({
    dest: "uploads"
});
app.set("view engine", "ejs");
app.get("/", (req, res) => {
    res.render("index");
});
app.get("/upload", (req, res) => {
    res.render("upload");
});
app.post("/upload", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const path = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    const orginialName = (_b = req.file) === null || _b === void 0 ? void 0 : _b.originalname;
    if (path == undefined || orginialName == undefined) {
        return res.send("<h1>Error</h1>");
    }
    yield prisma.file.create({
        data: {
            path: path,
            orginialName: orginialName
        }
    });
    res.redirect("/files");
}));
app.get("/files", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield prisma.file.findMany();
    res.render("files", { files: files, url: req.headers.origin });
}));
app.get("/file/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.file.update({
        where: {
            id: req.params.id
        },
        data: {
            downloadCount: {
                increment: 1
            }
        }
    });
    const file = yield prisma.file.findUnique({
        where: {
            id: req.params.id
        }
    });
    if (file == null) {
        return res.send("Error");
    }
    res.download(file.path, file.orginialName);
}));
app.listen(3000, () => console.log("Server has been started!"));
