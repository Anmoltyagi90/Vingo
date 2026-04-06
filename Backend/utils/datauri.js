import path from "path";
import DataURIParser from "datauri/parser.js";

const getDataUri = (file) => {
  const parser = new DataURIParser();
  const extName = path.extname(file.originalname);
  return parser.format(extName, file.buffer);
};

export default getDataUri;
