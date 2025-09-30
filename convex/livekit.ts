"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { AccessToken } from "livekit-server-sdk";

// Generate LiveKit access token for authenticated user
export const generateToken = action({
  args: {
    clerkId: v.string(),
    language1: v.string(),
    language2: v.string(),
    roomName: v.string(),
  },
  handler: async (ctx, args) => {
    // Get LiveKit credentials from environment variables
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      throw new Error(
        "LiveKit credentials not configured. Please set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL in .env.local"
      );
    }

    // Query user to get their information
    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: args.clerkId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Validate user has sufficient credits (minimum 0.05 for session start)
    const minimumCredits = 0.05;
    if (user.credits < minimumCredits) {
      throw new Error(
        `Insufficient credits. Minimum ${minimumCredits} credits required to start a session. You have ${user.credits.toFixed(2)} credits.`
      );
    }

    // Create LiveKit access token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: args.clerkId,
      // Include user metadata in the token
      metadata: JSON.stringify({
        language1: args.language1,
        language2: args.language2,
        userId: user._id,
      }),
    });

    // Grant permission to join the room
    at.addGrant({
      roomJoin: true,
      room: args.roomName,
    });

    // Generate and return the JWT token
    const token = await at.toJwt();

    return {
      token,
      url: livekitUrl,
    };
  },
});