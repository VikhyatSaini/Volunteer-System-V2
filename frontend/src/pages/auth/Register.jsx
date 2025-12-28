import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2, Sparkles, Eye, EyeOff, Phone } from 'lucide-react'; // <--- 1. Import Phone Icon
import useAuth from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // <--- 2. Pass mobileNumber to the register function
    // Make sure your auth.service.js is updated to accept this argument!
    const result = await registerUser(data.name, data.email, data.password, data.mobileNumber);
    if (result.success) navigate('/dashboard');
    setIsSubmitting(false);
  };

  return (
    // <--- 3. Increased height to 650px to fit the new field
    <div className="w-full h-[650px] bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col lg:flex-row">
      
      {/* LEFT SIDE: Form */}
      <div className="flex flex-col justify-center w-full p-8 lg:w-1/2 lg:p-12 bg-slate-950/60">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="mb-2 text-2xl font-bold text-white">Create Account</h2>
            <p className="text-sm text-slate-400">Join the movement today. It's free.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <Input id="name" type="text" placeholder="Jane Doe" className="pl-10 focus:border-blue-500/50" {...register("name", { required: "Name is required" })} />
              </div>
              {errors.name && <span className="text-xs text-red-400">{errors.name.message}</span>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10 focus:border-blue-500/50" {...register("email", { required: "Email is required" })} />
              </div>
              {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
            </div>

            {/* --- NEW FIELD: Mobile Number --- */}
            <div className="space-y-2">
              <Label htmlFor="mobileNumber" className="text-slate-300">Mobile Number</Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <Input 
                  id="mobileNumber" 
                  type="tel" 
                  placeholder="+1 234 567 8900" 
                  className="pl-10 focus:border-blue-500/50" 
                  {...register("mobileNumber", { 
                    required: "Mobile number is required",
                    minLength: { value: 10, message: "Please enter a valid number" } 
                  })} 
                />
              </div>
              {errors.mobileNumber && <span className="text-xs text-red-400">{errors.mobileNumber.message}</span>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10 focus:border-blue-500/50" 
                  {...register("password", { required: "Password is required" })} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
            </div>

            <Button type="submit" variant="register" className="w-full mt-2 text-base font-semibold tracking-wide h-11" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-sm text-center text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="inline-flex items-center font-semibold text-blue-400 transition-colors hover:text-blue-300 group">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Visuals */}
      <div className="relative flex-col justify-between hidden w-1/2 p-12 overflow-hidden lg:flex bg-slate-900/40">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-500/10 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-30"></div>
        
        <div className="relative z-10">
          <h3 className="flex items-center gap-3 text-2xl font-bold tracking-wide text-white">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-900/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            RallyPoint
          </h3>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-md">
            Be the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Change Maker</span>
          </h1>
          <p className="max-w-sm text-lg leading-relaxed text-slate-300 drop-shadow-sm">
            Your journey starts here. Create an account to track your hours, join exclusive events, and build your volunteer portfolio.
          </p>
        </div>

        <div className="relative z-10 flex gap-8 pt-6 border-t border-slate-800/50">
          <div><p className="text-2xl font-bold text-white">10k+</p><p className="text-xs tracking-wider uppercase text-slate-400">Volunteers</p></div>
          <div><p className="text-2xl font-bold text-white">500+</p><p className="text-xs tracking-wider uppercase text-slate-400">Events</p></div>
        </div>
      </div>

    </div>
  );
};

export default Register;