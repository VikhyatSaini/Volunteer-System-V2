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
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-slate-900/40">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600 rounded-full blur-[100px] opacity-20"></div>

        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <HeartHandshake className="text-white h-6 w-6" />
            </div>
            RallyPoint
          </h3>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight drop-shadow-md">
            Empower Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Community</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-sm leading-relaxed drop-shadow-sm">
            Connect with causes that matter. Join thousands of volunteers making a real difference today.
          </p>
        </div>

        <div className="relative z-10 pt-6 border-t border-slate-800/50">
          <p className="text-xs text-slate-400 font-medium italic">
            "The best way to find yourself is to lose yourself in the service of others."
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-slate-950/60">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400 text-sm">Sign in to access your volunteer portal.</p>
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
                <Link to="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Forgot Password?</Link>
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
            </div>

            <Button type="submit" variant="volunteer" className="w-full h-11 text-base font-semibold tracking-wide" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-400 mt-6">
            New here?{" "}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors inline-flex items-center group">
              Register as Volunteer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;










// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { Link, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Mail, Lock, Loader2, ArrowRight, HeartHandshake } from 'lucide-react';
// import useAuth from '../../hooks/useAuth';
// import { Button } from '../../components/ui/button';
// import { Input } from '../../components/ui/input';
// import { Label } from '../../components/ui/label';

// const Login = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const { register, handleSubmit, formState: { errors } } = useForm();

//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
//     const result = await login(data.email, data.password);
//     if (result.success) {
//       navigate('/dashboard'); 
//     }
//     setIsSubmitting(false);
//   };

//   return (
//     <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      
//       {/* 1. Volunteer Theme Background */}
//       <div 
//         className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center"
//       >
//         {/* Dark Slate Overlay for readability */}
//         <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"></div>
//       </div>

//       {/* 2. Floating Card Container */}
//       <motion.div 
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//         className="w-full max-w-5xl h-[600px] relative z-10 bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col lg:flex-row"
//       >
        
//         {/* Left Side - Community Visuals */}
//         <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-slate-900/40">
          
//           {/* Subtle Accent Glows */}
//           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
//           <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600 rounded-full blur-[100px] opacity-20"></div>

//           {/* Brand Logo */}
//           <div className="relative z-10">
//             <h3 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
//               <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
//                 <HeartHandshake className="text-white h-6 w-6" />
//               </div>
//               RallyPoint
//             </h3>
//           </div>

//           {/* Hero Text */}
//           <div className="relative z-10 space-y-6">
//             <h1 className="text-4xl font-bold text-white leading-tight">
//               Empower Your <br />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
//                 Community
//               </span>
//             </h1>
//             <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
//               Connect with causes that matter. Join thousands of volunteers making a real difference today.
//             </p>
//           </div>

//           {/* Testimonial / Footer */}
//           <div className="relative z-10 pt-6 border-t border-slate-800/50">
//             <p className="text-xs text-slate-500 font-medium italic">
//               "The best way to find yourself is to lose yourself in the service of others."
//             </p>
//           </div>
//         </div>

//         {/* Right Side - Login Form */}
//         <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-slate-950/50">
//           <div className="max-w-md w-full mx-auto space-y-8">
            
//             <div className="text-center lg:text-left">
//               <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
//               <p className="text-slate-400 text-sm">Sign in to access your volunteer portal.</p>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-slate-300">Email Address</Label>
//                 <div className="relative group">
//                   <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
//                   <Input 
//                     id="email" 
//                     type="email" 
//                     placeholder="volunteer@example.com"
//                     className="pl-10"
//                     {...register("email", { required: "Email is required" })}
//                   />
//                 </div>
//                 {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
//               </div>

//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="password" className="text-slate-300">Password</Label>
//                   <Link to="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
//                     Forgot Password?
//                   </Link>
//                 </div>
//                 <div className="relative group">
//                   <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
//                   <Input 
//                     id="password" 
//                     type="password" 
//                     placeholder="••••••••"
//                     className="pl-10"
//                     {...register("password", { required: "Password is required" })}
//                   />
//                 </div>
//                 {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
//               </div>

//               <Button 
//                 type="submit" 
//                 variant="volunteer" 
//                 className="w-full h-11 text-base font-semibold tracking-wide"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                 ) : (
//                   "Sign In"
//                 )}
//               </Button>
//             </form>

//             <div className="relative py-2">
//               <div className="absolute inset-0 flex items-center">
//                 <span className="w-full border-t border-slate-800" />
//               </div>
//               <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-slate-950 px-2 text-slate-500">Or continue with</span>
//               </div>
//             </div>

//             <Button variant="outline" className="w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
//               <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
//                 <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
//               </svg>
//               Google
//             </Button>

//             <div className="text-center text-sm text-slate-400 mt-6">
//               New here?{" "}
//               <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors inline-flex items-center group">
//                 Register as Volunteer
//                 <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
//               </Link>
//             </div>

//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;