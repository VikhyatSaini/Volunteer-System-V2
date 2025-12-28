import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, HeartHandshake, Eye, EyeOff } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await login(data.email, data.password);
    if (result.success) navigate('/dashboard');
    setIsSubmitting(false);
  };

  return (
    // Fixed height (600px) is mandatory for the flip to look like one object
    <div className="w-full h-[600px] bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col lg:flex-row">
      
      {/* LEFT SIDE: Visuals */}
      <div className="relative flex-col justify-between hidden w-1/2 p-12 overflow-hidden lg:flex bg-slate-900/40">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600 rounded-full blur-[100px] opacity-20"></div>

        <div className="relative z-10">
          <h3 className="flex items-center gap-3 text-2xl font-bold tracking-wide text-white">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-900/20">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            RallyPoint
          </h3>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-md">
            Empower Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Community</span>
          </h1>
          <p className="max-w-sm text-lg leading-relaxed text-slate-300 drop-shadow-sm">
            Connect with causes that matter. Join thousands of volunteers making a real difference today.
          </p>
        </div>

        <div className="relative z-10 pt-6 border-t border-slate-800/50">
          <p className="text-xs italic font-medium text-slate-400">
            "The best way to find yourself is to lose yourself in the service of others."
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex flex-col justify-center w-full p-8 lg:w-1/2 lg:p-16 bg-slate-950/60">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="mb-2 text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-sm text-slate-400">Sign in to access your volunteer portal.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input id="email" type="email" placeholder="volunteer@example.com" className="pl-10" {...register("email", { required: "Email is required" })} />
              </div>
              {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Link to="/forgot-password" className="text-xs transition-colors text-emerald-400 hover:text-emerald-300">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10" 
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

            <Button type="submit" variant="volunteer" className="w-full text-base font-semibold tracking-wide h-11" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-center text-slate-400">
            New here?{" "}
            <Link to="/register" className="inline-flex items-center font-semibold transition-colors text-emerald-400 hover:text-emerald-300 group">
              Register as Volunteer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;