
import { useEffect } from "react";
import { AuthForm } from "@/components/AuthComponents";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/"); // Redirect to home if already authenticated
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate("/");
        }
      }
    );

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Budget App</h1>
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
