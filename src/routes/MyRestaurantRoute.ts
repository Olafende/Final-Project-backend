import express from "express";
import multer from "multer";
import MyRestaurantController from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/Auth";
import { validateMyRestaurantRequest } from "../middleware/validation";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 8 * 1024 * 1024, //5mb
    },
});

router.get(
    "/order",
    jwtCheck,
    jwtParse,
    MyRestaurantController.getMyRestaurantOrders
  );
  
  router.patch(
    "/order/:orderId/status",
    jwtCheck,
    jwtParse,
    MyRestaurantController.updateOrderStatus
  );
  

router.get(
    "/", 
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