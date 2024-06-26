import { Request, Response } from "express";
import User from "../models/user";
import cloudinary from 'cloudinary'
import Restaurant from "../models/restaurent";
import mongoose from "mongoose";
import Order from "../models/order";


const CreateMyRestaurant = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const existingRestaurant = await Restaurant.findOne({ user: req.userId })

        if (existingRestaurant) {
            return res.status(409).json({ message: "User restaurant already exists" })
        }

        // const image = req.file as Express.Multer.File;
        // const base64Img = Buffer.from(image.buffer).toString("base64");
        // const dataURI = `data:${image.mimetype};base64,${base64Img}`;

        // const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
        const imageUrl = await uploadImg(req.file as Express.Multer.File)

        const restaurant = new Restaurant(req.body);
        restaurant.imageUrl = imageUrl  //uploadResponse.url;
        restaurant.user = new mongoose.Types.ObjectId(req.userId)
        restaurant.lastUpdated = new Date()
        await restaurant.save()

        res.status(201).send(restaurant);
    } catch (error) {
        return res.status(500).json({ message: "Something Went Wrong" })
    }
}

const getMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.find({ user: req.userId })
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" })
        }
        res.json(restaurant)
    } catch (error) {
        console.log({error})
        res.status(500).json({
            message: "Error fetching restaurant"
        })
    }
}

const updateMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({
            user: req.userId
        })
        if (!restaurant) {
            return res.status(404).json({
                message: "Restaurant not found"
            })
        }

        restaurant.restaurantName = req.body.restaurantName;
        restaurant.city = req.body.city;
        restaurant.country = req.body.country;
        restaurant.deliveryPrice = req.body.deliveryPrice;
        restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
        restaurant.cuisines = req.body.cuisines;
        restaurant.menuItems = req.body.menuItems;
        restaurant.lastUpdated = new Date();

        if (req.file) {
            const imageUrl = await uploadImg(req.file as Express.Multer.File)
            restaurant.imageUrl = imageUrl;
        }

        await restaurant.save()
        res.status(200).send(restaurant)

    } catch (error) {
        console.error("error", error)
        res.status(500).json({ message: "Something Went Wrong" })
    }
}

const uploadImg = async (file: Express.Multer.File) => {
    const image = file;
    const base64Img = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Img}`;

    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url
}

const searchRestaurants = async (req: Request, res: Response) => {
    try {
        const city = req.params.city;
        const searchQuery = (req.query.searchQuery as string) || "";
        const selectedCuisines = (req.query.selectedCuisines as string) || "";
        const sortOptions = (req.query.sortOptions as string) || "lastUpdated";
        const page = parseInt(req.query.page as string) || 1;
        let query: any = {};

        query["city"] = new RegExp(city, "i");
        const cityCheck = await Restaurant.countDocuments(query)
        if (cityCheck === 0) {
            return res.status(404).json({
                data: 0,
                pagination: {
                    total: 0,
                    page: 1,
                    pages: 1
                }
            })
        }

        if (selectedCuisines) {
            //  URL = selectedCuisines= italian,burgers,chineese
            // [italian, burgers, chineese]
            // searchQuery = pasta
            const cuisinesArray = selectedCuisines.split(",").map((cuisine) => new RegExp(cuisine, "i"));
            query["cuisines"] = { $all: cuisinesArray }
        }

        if (searchQuery) {
            // restaurantName = Taj Restaurant
            // [italian, burgers, chineese]
            // searchQuery = pasta
            const searchRegex = new RegExp(searchQuery, "i");
            query["$or"] = [
                { restaurantName: searchRegex },
                { cuisines: { $in: [searchRegex] } }
            ]
        }

        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        const restaurants = await Restaurant.find(query)
            .sort({ [sortOptions]: 1 }).skip(skip).limit(pageSize).lean();

        const total = await Restaurant.countDocuments(query);

        const response = {
            data: restaurants,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / pageSize) //50 results, pageSize = 10 > page 5
            }
        }

        res.json(response)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" })
    }
}

const getRestaurantItems = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.restaurantId;

        const restaurant = await Restaurant.findById(restaurantId)

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" })
        }
        return res.json(restaurant)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" })
    }
}

// Get My Restaurant Orders
const getMyRestaurantOrders = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.userId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" })
        }

/* 
const orders = await Order.find({user :  req.userId})
        .populate("restaurant")
        .populate("user");

        res.json(orders)*/

        const orders = await Order.find({ restaurant: restaurant.id })
            .populate("restaurant")
            .populate("user");

        res.json(orders)

    } catch (error) {
        console.log({ error })
        res.status(500).json({ message: "Something went wrong!" })
    }
}

// Update Order Status
const updateOrderStatus =  async (req: Request, res: Response) => {
    try {
        const {orderId} = req.params;
        const {status} = req.body;
        const order = await Order.findById(orderId);

        if(!order){
            return res.status(404).json({message : "Order not found"})
        }

        const restaurant = await Restaurant.findById(order.restaurant)

        if(restaurant?.user?._id.toString() !== req.userId){
            return res.status(401).send();
        }

        order.status = status;
        await order.save();

        res.status(200).json(order)
    } catch (error) {
        console.log({error})
        res.status(500).json({message : "unable to update order status"})
    }
}

export {
    getMyRestaurant,
    CreateMyRestaurant,
    updateMyRestaurant,
    searchRestaurants,
    getRestaurantItems,
    getMyRestaurantOrders,
    updateOrderStatus
}