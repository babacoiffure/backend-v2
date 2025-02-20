import { Router } from "express";
import multer from "multer";
import path from "path";
import { destroyImage, uploadImage } from "../../libraries/cloudinary";
import { handleAsyncHttp } from "../../middleware/controller";

export const fileUploadRouter = Router();

// Set up storage engine with multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "..", "..", "..", "uploads")); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname); // Append the original extension
  },
});

// Initialize upload variable with multer
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allowed file extensions
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Error: File upload only supports the following filetypes - " +
            filetypes,
        ),
      );
    }
  },
});

fileUploadRouter.post(
  "/upload",
  upload.fields([
    { name: "multiple", maxCount: 10 },
    { name: "single", maxCount: 1 },
  ]),
  handleAsyncHttp(async (req, res) => {
    const multiple = (req.files as Record<string, [any]>)?.multiple;
    const single = (req.files as Record<string, [any]>)?.single?.[0];
    let uploads: { multiple: any[]; single: any } = {
      multiple: [],
      single: {},
    };
    if (multiple && multiple?.length) {
      for (let file of multiple) {
        const { public_id, secure_url } = await uploadImage(file.path);
        uploads.multiple.push({
          publicId: public_id,
          secureURL: secure_url,
        });
      }
    }
    if (single) {
      const { public_id, secure_url } = await uploadImage(
        single.path,
        "service_images",
      );
      console.log(public_id, "Plu");
      uploads = {
        ...uploads,
        single: {
          publicId: public_id,
          secureURL: secure_url,
        },
      };
    }
    res.success("Files uploaded...", {
      multiple: multiple?.length > 0 ? uploads.multiple : undefined,
      single: single ? uploads.single : undefined,
    });
  }),
);
fileUploadRouter.post(
  "/destroy",
  handleAsyncHttp(async (req, res) => {
    const { multiple, single } = req.body;
    if (multiple?.length) {
      for (let upload of multiple) {
        const { publicId } = upload;
        await destroyImage(publicId);
      }
    }
    if (single) {
      const { publicId } = single;
      await destroyImage(publicId);
    }
    res.success("Images destroyed.");
  }),
);
