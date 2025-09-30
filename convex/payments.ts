import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Credit packages
export const creditPackages = [
  { credits: 10, price: 150, label: "10 credits", description: "$1.50" },
  { credits: 30, price: 400, label: "30 credits", description: "$4.00" },
  { credits: 60, price: 700, label: "60 credits", description: "$7.00" },
  { credits: 120, price: 1300, label: "120 credits", description: "$13.00" },
];

// Create a payment intent for purchasing credits
export const createPaymentIntent = action({
  args: {
    clerkId: v.string(),
    packageIndex: v.number(), // Index of the credit package
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: args.clerkId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const creditPackage = creditPackages[args.packageIndex];
    if (!creditPackage) {
      throw new Error("Invalid package selected");
    }

    // Create purchase record
    const purchaseId = await ctx.runMutation(api.payments.createPurchaseRecord, {
      userId: user._id,
      amount: creditPackage.price,
      credits: creditPackage.credits,
    });

    // In a real app, you would create a Stripe PaymentIntent here
    // For now, return mock data
    return {
      clientSecret: `mock_secret_${purchaseId}`,
      purchaseId,
      amount: creditPackage.price,
      credits: creditPackage.credits,
    };
  },
});

// Create a purchase record (internal mutation)
export const createPurchaseRecord = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    const purchaseId = await ctx.db.insert("creditPurchases", {
      userId: args.userId,
      amount: args.amount,
      credits: args.credits,
      status: "pending",
      purchasedAt: Date.now(),
    });

    return purchaseId;
  },
});

// Confirm payment and add credits to user
export const confirmPayment = mutation({
  args: {
    purchaseId: v.id("creditPurchases"),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const purchase = await ctx.db.get(args.purchaseId);
    if (!purchase) {
      throw new Error("Purchase not found");
    }

    if (purchase.status === "completed") {
      throw new Error("Purchase already completed");
    }

    // Update purchase status
    await ctx.db.patch(args.purchaseId, {
      status: "completed",
      stripePaymentIntentId: args.stripePaymentIntentId,
    });

    // Get user and add credits
    const user = await ctx.db.get(purchase.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(purchase.userId, {
      credits: user.credits + purchase.credits,
      totalCreditsEverPurchased: user.totalCreditsEverPurchased + purchase.credits,
    });

    return {
      newBalance: user.credits + purchase.credits,
      creditsAdded: purchase.credits,
    };
  },
});

// Mark payment as failed
export const markPaymentFailed = mutation({
  args: {
    purchaseId: v.id("creditPurchases"),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.purchaseId, {
      status: "failed",
      stripePaymentIntentId: args.stripePaymentIntentId,
    });
  },
});

// Get purchase history for a user
export const getPurchaseHistory = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return [];
    }

    const purchases = await ctx.db
      .query("creditPurchases")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return purchases;
  },
});

// Get recent successful purchases (for billing history)
export const getRecentPurchases = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return [];
    }

    const query = ctx.db
      .query("creditPurchases")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc");

    const purchases = args.limit
      ? await query.take(args.limit)
      : await query.collect();

    // Filter for completed purchases and format for display
    return purchases
      .filter(p => p.status === "completed")
      .map(purchase => ({
        id: purchase._id,
        date: purchase.purchasedAt,
        amount: purchase.amount / 100, // Convert cents to dollars
        credits: purchase.credits,
        status: purchase.status,
        description: `${purchase.credits} credits purchased`,
      }));
  },
});

// Simulate a purchase completion (for testing without Stripe)
export const simulatePurchase = action({
  args: {
    clerkId: v.string(),
    packageIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: args.clerkId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const creditPackage = creditPackages[args.packageIndex];
    if (!creditPackage) {
      throw new Error("Invalid package selected");
    }

    // Create and immediately complete purchase
    const purchaseId = await ctx.runMutation(api.payments.createPurchaseRecord, {
      userId: user._id,
      amount: creditPackage.price,
      credits: creditPackage.credits,
    });

    const result = await ctx.runMutation(api.payments.confirmPayment, {
      purchaseId,
      stripePaymentIntentId: `simulated_${Date.now()}`,
    });

    return result;
  },
});