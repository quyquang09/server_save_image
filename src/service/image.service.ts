import fs from "fs";
import { Req } from "../routes/request";
import path from "path";
import ErrorHelper from "../common/error.helper";
import sharp from "sharp";
const crypto = require("crypto");
export default class ImageService {
  static getBase64Hash(base64Data: any) {
    return crypto.createHash("md5").update(base64Data).digest("hex");
  }
  static async getListImage(filePath: any, data: any) {
    console.log("test success");
    return "get success";
  }

  static async writeFileAsync(filePath: any, data: any) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, "base64", (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
  static async resizeImage(imageBuffer: any) {
    try {
      // Decode base64 image
      let imgBuffer = Buffer.from(imageBuffer, "base64");

      // Resize the image and get the buffer
      const resizedBuffer = await sharp(imgBuffer)
        .toFormat("webp") // Convert to webp format
        .toBuffer();

      // Convert the buffer to base64 and return the result
      return `${resizedBuffer.toString("base64")}`;
    } catch (error) {
      console.error("Error resizing and converting image:", error);
      throw error;
    }
  }
  static async uploadImage({ redata, hostString }: Req) {
    const { imageBase64, filePath } = redata;

    try {
      const regex = /([^\/]+)(?=\.(png|jpg|jpeg|gif|bmp|svg))/;
      const regexPath = /^(.*\/)([^\/]+\.(png|jpg|jpeg|gif|bmp|svg))/;
      const fileName = filePath.match(regex)[1];
      const uploadDir = "./storage/" + filePath.match(regexPath)[1];
      if (!fs.existsSync(uploadDir)) {
        try {
          fs.mkdirSync(uploadDir);
        } catch (error) {
          console.log(error);
        }
      }
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const dataResise = await ImageService.resizeImage(base64Data);
      const fileExtension = imageBase64.match(/^data:image\/(\w+);base64,/)[1];
      // Tính toán hash của file base64
      const fileHash = ImageService.getBase64Hash(dataResise);

      const existingFile = fs.readdirSync(uploadDir).find((file: any) => {
        try {
          const pathFile = path.join(uploadDir, file);

          // Check if the current item is a file and not a directory
          if (fs.statSync(pathFile).isFile()) {
            const fileContent = fs.readFileSync(pathFile); // Read as Buffer

            // Compare the hash of the file content with the provided hash
            console.log(
              ImageService.getBase64Hash(fileContent.toString("base64")) ===
                fileHash
            );
            return (
              ImageService.getBase64Hash(fileContent.toString("base64")) ===
              fileHash
            );
          }

          return false; // Skip if it's a directory
        } catch (err) {
          console.error(`Error reading file ${file}:`, err);
          return false;
        }
      });
      if (existingFile) {
        // Nếu file đã tồn tại, trả về đường dẫn của file đó
        const imageUrl = `${hostString}/storage/${
          filePath.match(regexPath)[1]
        }${existingFile}`;

        return imageUrl;
      } else {
        // Nếu file chưa tồn tại
        const uniqueFileName = `${fileName || Date.now()}-${Math.round(
          Math.random() * 1e9
        )}.${fileExtension}`;
        const pathFile = path.join(uploadDir, uniqueFileName);
        const resWrite = await ImageService.writeFileAsync(
          pathFile,
          dataResise
        );
        if (resWrite) {
          const imageUrl = `${hostString}/storage/${
            filePath.match(regexPath)[1]
          }${uniqueFileName}`;
          return imageUrl;
        } else {
          return ErrorHelper.error("Có lỗi xảy ra trong quá trình ghi file");
        }
      }
    } catch (error) {
      return ErrorHelper.error(
        "Định dạng Base64 không hợp lệ hoặc có lỗi xảy ra"
      );
    }
  }
  static async uploadExcel({ redata, hostString }: Req) {
    const { dataArrBf, filePath, fileName } = redata;
    try {
      const uploadDir = "./storage/" + filePath;
      if (!fs.existsSync(uploadDir)) {
        try {
          fs.mkdirSync(uploadDir);
        } catch (error) {
          console.log(error);
        }
      }
      // Tính toán hash của file base64
      const fileHash = ImageService.getBase64Hash(dataArrBf);

      const existingFile = fs.readdirSync(uploadDir).find((file: any) => {
        try {
          const pathFile = path.join(uploadDir, file);
          // Check if the current item is a file and not a directory
          if (fs.statSync(pathFile).isFile()) {
            const fileContent = fs.readFileSync(pathFile); // Read as Buffer

            // Compare the hash of the file content with the provided hash
            console.log(
              ImageService.getBase64Hash(fileContent.toString("base64")) ===
                fileHash
            );
            return (
              ImageService.getBase64Hash(fileContent.toString("base64")) ===
              fileHash
            );
          }

          return false; // Skip if it's a directory
        } catch (err) {
          console.error(`Error reading file ${file}:`, err);
          return false;
        }
      });
      if (existingFile) {
        // Nếu file đã tồn tại, trả về đường dẫn của file đó
        const imageUrl = `${hostString}/storage/${uploadDir}${existingFile}`;

        return imageUrl;
      } else {
        // Nếu file chưa tồn tại
        const uniqueFileName = `${fileName || Date.now()}-${Math.round(
          Math.random() * 1e9
        )}.${fileName}`;
        const pathFile = path.join(uploadDir, uniqueFileName);
        const resWrite = await ImageService.writeFileAsync(pathFile, dataArrBf);
        if (resWrite) {
          const imageUrl = `${hostString}/storage/${uploadDir}${uniqueFileName}`;
          return imageUrl;
        } else {
          return ErrorHelper.error("Có lỗi xảy ra trong quá trình ghi file");
        }
      }
    } catch (error) {
      return ErrorHelper.error(
        "Định dạng Base64 không hợp lệ hoặc có lỗi xảy ra"
      );
    }
  }
}
