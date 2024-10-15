import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
const fs = require("fs");
dotenv.config();

const allowedOrigins = [
  "http://app.luxas.com.vn",
  "http://125.212.231.227:80",
  "http://125.212.231.227",
  "http://localhost:3000",
  "http://localhost:8080",
];

const app = express();
const uploadDir = "./image";
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    optionsSuccessStatus: 200,
  })
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.post("/upload/image", (req, res) => {
  try {
    const { imageBase64, fileName } = req.body;
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const fileExtension = imageBase64.match(/^data:image\/(\w+);base64,/)[1]; // Lấy phần mở rộng file
    console.log(base64Data);
    const uniqueFileName = `${fileName || Date.now()}-${Math.round(
      Math.random() * 1e9
    )}.${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    fs.writeFile(filePath, base64Data, "base64", (err) => {
      if (err) {
        return res.status(500).json({ error: "Lỗi khi lưu hình ảnh" });
      }
      const imageUrl = `${req.protocol}://${req.get(
        "host"
      )}/images/${uniqueFileName}`;
      res.status(200).json({
        message: "Hình ảnh đã được tải lên thành công!",
        imageUrl: imageUrl,
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Định dạng Base64 không hợp lệ hoặc có lỗi xảy ra" });
  }
});

app.listen(8083, "0.0.0.0", () => {
  console.log(`Listening on port ${8083}`);
});
