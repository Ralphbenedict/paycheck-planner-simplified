
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface for the share budget request
interface ShareBudgetRequest {
  budgetId: string;
  userEmail: string;
  permission: "read" | "write";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get session to identify the authenticated user
    const authHeader = req.headers.get("Authorization")?.split(" ")[1];
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getUser(authHeader);
    if (sessionError || !sessionData.user) {
      throw new Error("Not authenticated");
    }

    const requesterId = sessionData.user.id;
    const { budgetId, userEmail, permission }: ShareBudgetRequest = await req.json();

    // Check if the requester owns the budget
    const { data: budgetData, error: budgetError } = await supabase
      .from("budgets")
      .select("id, name, created_by")
      .eq("id", budgetId)
      .single();

    if (budgetError || !budgetData) {
      throw new Error("Budget not found");
    }

    if (budgetData.created_by !== requesterId) {
      throw new Error("You don't have permission to share this budget");
    }

    // Check if the target user exists, if not create a placeholder
    let targetUserId: string | null = null;
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (userError || !userData) {
      console.log("User not found with email:", userEmail);
    } else {
      targetUserId = userData.id;
    }

    // Add as collaborator
    const { data: collaboratorData, error: collaboratorError } = await supabase
      .from("collaborators")
      .insert({
        budget_id: budgetId,
        user_id: targetUserId,
        email: userEmail,
        permission: permission,
      })
      .select()
      .single();

    if (collaboratorError) {
      if (collaboratorError.message.includes("duplicate key")) {
        // Update existing collaborator instead
        const { error: updateError } = await supabase
          .from("collaborators")
          .update({ permission: permission })
          .eq("budget_id", budgetId)
          .eq("email", userEmail);

        if (updateError) {
          throw new Error("Failed to update collaborator");
        }
      } else {
        throw new Error("Failed to add collaborator");
      }
    }

    // Get the requester's name
    const { data: requesterData, error: requesterError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", requesterId)
      .single();

    if (requesterError || !requesterData) {
      throw new Error("Failed to retrieve requester information");
    }

    // Send email notification
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        type: "BUDGET_SHARED",
        to: userEmail,
        data: {
          inviterName: requesterData.full_name || "Someone",
          budgetName: budgetData.name,
          loginLink: `${req.headers.get("origin")}/auth`,
        },
      }),
    });

    if (!response.ok) {
      console.error("Failed to send email notification");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Budget shared successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sharing budget:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to share budget" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
