import { Params } from "../../swagger/params.type";

export const FileExcelUpload: Params = {
  dataArrBf: {
    type: "string",
    required: true,
  },
  filePath: {
    type: "string",
    required: true,
  },
  fileName: {
    type: "string",
    required: true,
  },
};
