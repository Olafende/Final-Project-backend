import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import { v2 as cloudinary }  from "cloudinary";
import mongoose from "mongoose";
import Order from "../models/Order";



const getMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant =await Restaurant.findOne({ user: req.userId });
        if (!restaurant) {
            return res.status(404).json({ message: "restaurant not found" });
        }
     res.json(restaurant);   
    }catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error fetching restaurant" });
    }
};


const createMyRestaurant = async (req: Request, res: Response) => {
    try{   
        const existingRestaurant = await Restaurant.findOne({user: req.userId });

        if(existingRestaurant) {
            return res
            .status(409)
            .json({ message: "User restaurant already exists" });
        }

        const imageUrl = await uploadImage(req.file as Express.Multer.File);

        const restaurant = new Restaurant(req.body);
        restaurant.imageUrl = imageUrl;
        restaurant.user = new mongoose.Types.ObjectId(req.userId);
        restaurant.lastUpdated = new Date();
        await restaurant.save();
        
        res.status(201).send(restaurant);
        } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


const updateMyRestaurant = async (req: Request, res: Response) => {
    try{
        const restaurant = await Restaurant.findOne({
            user: req.userId,
        });

        if (!restaurant) {
            return res.status(404).json({ message: "restaurant not found" });
        }

        restaurant.restaurantName = req.body.restaurantName;
        restaurant.city = req.body.city;
        restaurant.country = req.body.country;
        restaurant.deliveryPrice = req.body.deliveryPrice;
        restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
        restaurant.cuisines = req.body.cuisines;
        restaurant.menuItems = req.body.menuItems;
        restaurant.lastUpdated = new Date();

        if(req.file) {
            const imageUrl = await uploadImage(req.file as Express.Multer.File);
            restaurant.imageUrl = imageUrl;
        }

        await restaurant.save();
        res.status(200).send(restaurant);
    } catch (error) {
    console.log("error", error);   
    res.status(500).json({ message: "something went wrong" });       
  }          
};

const uploadImage = async (file: Express.Multer.File) => {
    const image = file; 

    const uploadResponse: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
            if(error) reject(error);
            else resolve(result);
        }).end(image.buffer);
    });

    return uploadResponse.url;
};

const getMyRestaurantOrders = async (req: Request, res: Response) => {
    try {
      const restaurant = await Restaurant.findOne({ user: req.userId });
      if (!restaurant) {
        return res.status(404).json({ message: "restaurant not found" });
      }
  
      const orders = await Order.find({ restaurant: restaurant._id })
        .populate("restaurant")
        .populate("user");
  
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "something went wrong" });
    }
  };
  
  const updateOrderStatus = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
  
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "order not found" });
      }
  
      const restaurant = await Restaurant.findById(order.restaurant);
  
      if (restaurant?.user?._id.toString() !== req.userId) {
        return res.status(401).send();
      }
  
      order.status = status;
      await order.save();
  
      res.status(200).json(order);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "unable to update order status" });
    }
  };

export default {
    updateOrderStatus,
    getMyRestaurantOrders,
    getMyRestaurant,
    createMyRestaurant,
    updateMyRestaurant,
};