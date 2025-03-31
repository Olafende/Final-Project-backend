import express from "express";
import multer from "multer";
import MyRestaurantController from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/Auth";
import { validateMyRestaurantRequest } from "../middleware/validation";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, //5mb
    },
});

router.get(
    "/", 
    upload.single("imageFile"),
    validateMyRestaurantRequest,
    jwtCheck, 
    jwtParse, 
    MyRestaurantController.getMyRestaurant
);

// /api/my/restaurant
router.post(
    "/", 
    upload.single("imageFile"),
    validateMyRestaurantRequest,
    jwtCheck, //ensures that we get a valid token in the request.
    jwtParse, //hold the current users login info, out of the token and passes it on to the request.
    MyRestaurantController.createMyRestaurant
);

router.put(
    "/", 
    upload.single("imageFile"), validateMyRestaurantRequest, 
    jwtCheck, 
    jwtParse, 
    MyRestaurantController.updateMyRestaurant
);

export default router;