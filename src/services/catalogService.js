import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase.js";
import {
  DEFAULT_PRODUCTS,
  DEFAULT_RETAILERS,
  DEFAULT_BEATS,
  DEFAULT_SALESMEN
} from "../data/mockCatalog.js";

const PRODUCTS_CACHE_KEY = "@soft_billing_catalog_products";
const RETAILERS_CACHE_KEY = "@soft_billing_catalog_retailers";

export async function fetchCatalogFromCloud() {
  let products = null;
  let retailers = null;

  try {
    // 1. Attempt to fetch live catalog synced by Desktop Master
    const prodDocRef = doc(db, "catalog", "products");
    const prodSnap = await getDoc(prodDocRef);
    if (prodSnap.exists() && Array.isArray(prodSnap.data()?.items) && prodSnap.data().items.length > 0) {
      products = prodSnap.data().items;
      await AsyncStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products));
    }

    const retDocRef = doc(db, "catalog", "retailers");
    const retSnap = await getDoc(retDocRef);
    if (retSnap.exists() && Array.isArray(retSnap.data()?.items) && retSnap.data().items.length > 0) {
      retailers = retSnap.data().items;
      await AsyncStorage.setItem(RETAILERS_CACHE_KEY, JSON.stringify(retailers));
    }
  } catch (error) {
    console.warn("[CatalogService] Could not reach cloud catalog, will fall back to cache:", error.message);
  }

  // 2. If not loaded from cloud, load from local storage cache
  if (!products) {
    const cachedProds = await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);
    if (cachedProds) {
      try {
        products = JSON.parse(cachedProds);
      } catch (e) {
        products = null;
      }
    }
  }

  if (!retailers) {
    const cachedRets = await AsyncStorage.getItem(RETAILERS_CACHE_KEY);
    if (cachedRets) {
      try {
        retailers = JSON.parse(cachedRets);
      } catch (e) {
        retailers = null;
      }
    }
  }

  // 3. Fallback to default mock catalog if first time launching offline
  if (!products || products.length === 0) {
    products = DEFAULT_PRODUCTS;
  }
  if (!retailers || retailers.length === 0) {
    retailers = DEFAULT_RETAILERS;
  }

  // Extract distinct beats
  const beatsSet = new Set(DEFAULT_BEATS);
  retailers.forEach(r => {
    if (r.beat_name) beatsSet.add(r.beat_name);
  });

  return {
    products,
    retailers,
    beats: Array.from(beatsSet),
    salesmen: DEFAULT_SALESMEN
  };
}
