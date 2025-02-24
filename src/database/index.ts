import mongoose from "mongoose";
import { serverENV } from "../env-config";
import { seedDatabase } from "./seeder";

export const connectDB = async () => {
    try {
        await mongoose.connect(serverENV.Database_URI, {
            retryWrites: true,
        });
        console.log("⚡ DB Connected");
        await seedDatabase();
    } catch (err) {
        console.log(" 🔥 DB Connection error:", err);
    }
};

function flattenObject(
    obj: Record<string, any>,
    prefix: string = ""
): Record<string, any> {
    let result: Record<string, any> = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            let newKey = prefix ? `${prefix}.${key}` : key;
            if (
                typeof obj[key] === "object" &&
                obj[key] !== null &&
                !Array.isArray(obj[key])
            ) {
                Object.assign(result, flattenObject(obj[key], newKey));
            } else {
                result[newKey] = obj[key];
            }
        }
    }
    return result;
}

export const updateObject = (obj: Record<string, any>) => {
    $set: flattenObject(obj);
};
