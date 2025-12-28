import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
      toast.success("Password reset successfully!");
      
      // Redirect to login after a short delay
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired token.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md p-8 mx-auto text-center border shadow-2xl bg-slate-900/80 backdrop-blur-xl rounded-2xl border-slate-800">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/10">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">Password Reset!</h2>
        <p className="mb-6 text-slate-400">
          Your password has been successfully updated. Redirecting you to login...
        </p>
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    // Simple container without fixed height/width to fit inside AuthLayout
    <div className="w-full max-w-md p-8 mx-auto border shadow-2xl bg-slate-900/80 backdrop-blur-xl rounded-2xl border-slate-800">
      
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-white">New Password</h1>
        <p className="text-slate-400">Enter your new secure password below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">New Password</Label>
          <div className="relative group">
            <Lock className="absolute w-4 h-4 transition-colors left-3 top-3 text-slate-500 group-focus-within:text-emerald-400" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="pl-10 pr-10 text-white h-11 bg-slate-950/50 border-slate-700 focus:border-emerald-500"
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 6, message: "Must be at least 6 characters" }
              })} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
          <div className="relative group">
            <Lock className="absolute w-4 h-4 transition-colors left-3 top-3 text-slate-500 group-focus-within:text-emerald-400" />
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="••••••••" 
              className="pl-10 text-white h-11 bg-slate-950/50 border-slate-700 focus:border-emerald-500"
              {...register("confirmPassword", { 
                required: "Please confirm your password",
                validate: (val) => val === password || "Passwords do not match"
              })} 
            />
          </div>
          {errors.confirmPassword && <span className="text-xs text-red-400">{errors.confirmPassword.message}</span>}
        </div>

        <Button 
          type="submit" 
          className="w-full font-semibold text-white h-11 bg-emerald-600 hover:bg-emerald-700" 
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Set New Password"}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;