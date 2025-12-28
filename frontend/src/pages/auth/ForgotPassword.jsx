import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setIsEmailSent(true);
      toast.success("Reset link sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Simple container that fits inside AuthLayout (No fixed height/width)
    <div className="w-full max-w-md p-8 mx-auto border shadow-2xl bg-slate-900/80 backdrop-blur-xl rounded-2xl border-slate-800">
      
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-white">Reset Password</h1>
        <p className="text-slate-400">
          {isEmailSent 
            ? "Check your inbox for instructions." 
            : "Enter your email to receive a reset link."}
        </p>
      </div>

      {isEmailSent ? (
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-emerald-500/10">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="p-4 text-sm border rounded-lg bg-slate-950/50 border-slate-800 text-slate-300">
            We have sent a password reset link to your email address. Please check your inbox (and spam folder) to proceed.
          </div>
          <Link to="/login">
            <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-300">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute w-4 h-4 transition-colors left-3 top-3 text-slate-500 group-focus-within:text-emerald-400" />
              <Input 
                id="email" 
                type="email" 
                placeholder="volunteer@example.com" 
                className="pl-10 text-white h-11 bg-slate-950/50 border-slate-700 focus:border-emerald-500"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })} 
              />
            </div>
            {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
          </div>

          <Button 
            type="submit" 
            className="w-full font-semibold text-white h-11 bg-emerald-600 hover:bg-emerald-700" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Send Reset Link"}
          </Button>

          <div className="text-center">
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;