import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import { Database } from "./database.types";

const supabaseUrl = "https://nyzskbfenfznkspkiukj.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "default-key";
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function getDeviceById(deviceId: number) {
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("id", deviceId);

  if (error) {
    console.error(
      "[DB Client] Error fetching device via id: " + deviceId,
      error,
    );
    return null;
  }

  if (!data || data.length === 0) {
    console.warn("[DB Client] No device found with id: " + deviceId);
    return null;
  }

  return data[0];
}

export async function getDiscountByDeviceId(deviceId: number) {
  const { data, error } = await supabase
    .from("discounts")
    .select("*")
    .eq("device_id", deviceId);

  if (error) {
    console.error(
      "[DB Client] Error fetching discount via deviceId: " + deviceId,
      error,
    );
    return null;
  }

  if (!data) {
    console.warn("[DB Client] No discount found with deviceId: " + deviceId);
    return null;
  }

  return data;
}

export async function getWarehouseById(id: number) {
  const { data, error } = await supabase
    .from("warehouses")
    .select("*")
    .eq("id", id);

  if (error) {
    console.error("[DB Client] Error fetching warehouse via id: " + id, error);
    return null;
  }

  if (!data || data.length === 0) {
    console.warn("[DB Client] No warehouse found with id: " + id);
    return null;
  }

  return data[0];
}

export async function getStocksByDeviceId(deviceId: number) {
  const { data, error } = await supabase
    .from("stock")
    .select("*")
    .eq("device_id", deviceId);

  if (error) {
    console.error(
      "[DB Client] Error fetching stocks via deviceId: " + deviceId,
      error,
    );
    return null;
  }

  if (!data) {
    console.warn("[DB Client] No stocks found with deviceId: " + deviceId);
    return null;
  }

  return data;
}

export async function updateStock(
  warehouseId: number,
  updatedStockUnits: number,
  deviceId: number,
) {
  const { data, error } = await supabase
    .from("stock")
    .update({ unit: updatedStockUnits })
    .eq("device_id", deviceId)
    .eq("warehouse_id", warehouseId)
    .select();

  if (error) {
    console.error(
      "[DB Client] Error updating stock for deviceId: " +
        deviceId +
        " in warehouseId: " +
        warehouseId,
      error,
    );
    return null;
  }

  if (!data || data.length === 0) {
    console.warn(
      "[DB Client] No stock updated for deviceId: " +
        deviceId +
        " in warehouseId: " +
        warehouseId,
    );
    return null;
  }

  return data[0];
}

export async function addOrder(
  totalPrice: number,
  discount: number,
  shippingCost: number,
) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      totalPrice: totalPrice,
      discount: discount,
      shipping: shippingCost,
    })
    .select();

  if (error) {
    console.error("[DB Client] Error adding order: ", error);
    return null;
  }

  if (!data || data.length === 0) {
    console.warn("[DB Client] No order added");
    return null;
  }

  return data[0].id;
}
