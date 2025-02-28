
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Get the Resend API key from environment variables
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email template types
type EmailType = "WELCOME" | "BUDGET_SHARED";

// Email request data interface
interface EmailRequest {
  type: EmailType;
  to: string;
  data: {
    fullName?: string;
    budgetName?: string;
    inviterName?: string;
    loginLink?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { type, to, data }: EmailRequest = await req.json();
    let emailResponse;

    console.log(`Sending ${type} email to ${to}`);

    switch (type) {
      case "WELCOME":
        emailResponse = await resend.emails.send({
          from: "Budget App <onboarding@resend.dev>",
          to: [to],
          subject: "Welcome to Budget App!",
          html: `
            <h1>Welcome to Budget App, ${data.fullName || "there"}!</h1>
            <p>Thank you for signing up. You're now ready to create and manage your budgets.</p>
            <p>Let's get started by creating your first budget or exploring the app features.</p>
            <p>Best regards,<br>The Budget App Team</p>
          `,
        });
        break;

      case "BUDGET_SHARED":
        emailResponse = await resend.emails.send({
          from: "Budget App <notifications@resend.dev>",
          to: [to],
          subject: `${data.inviterName} has shared a budget with you`,
          html: `
            <h1>Budget Shared: ${data.budgetName}</h1>
            <p>Hello,</p>
            <p>${data.inviterName} has shared their budget "${data.budgetName}" with you.</p>
            <p>You can access this budget by <a href="${data.loginLink}">logging in to your account</a>.</p>
            <p>If you don't have an account yet, please sign up using this email address.</p>
            <p>Best regards,<br>The Budget App Team</p>
          `,
        });
        break;

      default:
        throw new Error("Invalid email type");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
