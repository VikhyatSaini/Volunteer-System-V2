import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';
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
    const result = await registerUser(data.name, data.email, data.password);
    if (result.success) navigate('/dashboard');
    setIsSubmitting(false);
  };

  return (
    // Fixed height (600px) must match Login page exactly
    <div className="w-full h-[600px] bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col lg:flex-row">
      
      {/* LEFT SIDE: Form (Swapped - This was on Right in Login) */}
      <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-slate-950/60">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400 text-sm">Join the movement today. It's free.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <Input id="name" type="text" placeholder="Jane Doe" className="pl-10 focus:border-blue-500/50" {...register("name", { required: "Name is required" })} />
              </div>
              {errors.name && <span className="text-xs text-red-400">{errors.name.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10 focus:border-blue-500/50" {...register("email", { required: "Email is required" })} />
              </div>
              {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
            </div>

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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
            </div>

            <Button type="submit" variant="register" className="w-full h-11 text-base font-semibold tracking-wide mt-2" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-400 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors inline-flex items-center group">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Visuals (Swapped - This was on Left in Login) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-slate-900/40">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-500/10 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-30"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Sparkles className="text-white h-5 w-5" />
            </div>
            RallyPoint
          </h3>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight drop-shadow-md">
            Be the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Change Maker</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-sm leading-relaxed drop-shadow-sm">
            Your journey starts here. Create an account to track your hours, join exclusive events, and build your volunteer portfolio.
          </p>
        </div>

        <div className="relative z-10 pt-6 border-t border-slate-800/50 flex gap-8">
          <div><p className="text-2xl font-bold text-white">10k+</p><p className="text-xs text-slate-400 uppercase tracking-wider">Volunteers</p></div>
          <div><p className="text-2xl font-bold text-white">500+</p><p className="text-xs text-slate-400 uppercase tracking-wider">Events</p></div>
        </div>
      </div>

    </div>
  );
};

export default Register;











// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { Link, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { User, Mail, Lock, Loader2, ArrowRight, Sparkles } from 'lucide-react';
// import useAuth from '../../hooks/useAuth';
// import { Button } from '../../components/ui/button';
// import { Input } from '../../components/ui/input';
// import { Label } from '../../components/ui/label';

// const Register = () => {
//   const { register: registerUser } = useAuth(); // Rename to avoid conflict with hook-form
//   const navigate = useNavigate();
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const { register, handleSubmit, formState: { errors } } = useForm();

//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
//     // Call the register function from AuthContext
//     const result = await registerUser(data.name, data.email, data.password);
    
//     if (result.success) {
//       // On success, redirect to dashboard (or login if you prefer they login manually)
//       navigate('/dashboard'); 
//     }
//     setIsSubmitting(false);
//   };

//   return (
//     <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      
//       {/* 1. Background Image - Teamwork Theme */}
//       <div 
//         className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2064&auto=format&fit=crop')] bg-cover bg-center"
//       >
//         {/* Blue/Indigo Tinted Overlay */}
//         <div className="absolute inset-0 bg-slate-950/40 mix-blend-multiply"></div>
//         <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/10"></div>
//       </div>

//       {/* 2. Floating Card Container */}
//       <motion.div 
//         initial={{ opacity: 0, scale: 0.95, y: 20 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//         className="w-full max-w-5xl h-[650px] relative z-10 bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col lg:flex-row"
//       >
        
//         {/* Left Side - Inspiration Visuals */}
//         <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-slate-900/40">
          
//           {/* Blue/Indigo Glows */}
//           <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-500/10 to-transparent"></div>
//           <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-30"></div>
//           <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 rounded-full blur-[120px] opacity-20"></div>

//           {/* Header/Logo Area */}
//           <div className="relative z-10">
//             <h3 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
//               <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
//                 <Sparkles className="text-white h-5 w-5" />
//               </div>
//               RallyPoint
//             </h3>
//           </div>

//           {/* Hero Text */}
//           <div className="relative z-10 space-y-6">
//             <h1 className="text-4xl font-bold text-white leading-tight drop-shadow-md">
//               Be the <br />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
//                 Change Maker
//               </span>
//             </h1>
//             <p className="text-slate-300 text-lg max-w-sm leading-relaxed drop-shadow-sm">
//               Your journey starts here. Create an account to track your hours, join exclusive events, and build your volunteer portfolio.
//             </p>
//           </div>

//           {/* Stat/Footer */}
//           <div className="relative z-10 pt-6 border-t border-slate-800/50 flex gap-8">
//             <div>
//               <p className="text-2xl font-bold text-white">10k+</p>
//               <p className="text-xs text-slate-400 uppercase tracking-wider">Volunteers</p>
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-white">500+</p>
//               <p className="text-xs text-slate-400 uppercase tracking-wider">Events</p>
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Register Form */}
//         <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-slate-950/60 relative">
          
//           {/* Close/Back Button (Optional) */}
//           <Link to="/" className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
//             ✕
//           </Link>

//           <div className="max-w-md w-full mx-auto space-y-6">
            
//             <div className="text-center lg:text-left">
//               <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
//               <p className="text-slate-400 text-sm">Join the movement today. It's free.</p>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
//               {/* Full Name */}
//               <div className="space-y-2">
//                 <Label htmlFor="name" className="text-slate-300">Full Name</Label>
//                 <div className="relative group">
//                   <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
//                   <Input 
//                     id="name" 
//                     type="text" 
//                     placeholder="Jane Doe"
//                     className="pl-10 focus:border-blue-500/50 focus:ring-blue-500/20"
//                     {...register("name", { required: "Name is required" })}
//                   />
//                 </div>
//                 {errors.name && <span className="text-xs text-red-400">{errors.name.message}</span>}
//               </div>

//               {/* Email */}
//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-slate-300">Email Address</Label>
//                 <div className="relative group">
//                   <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
//                   <Input 
//                     id="email" 
//                     type="email" 
//                     placeholder="you@example.com"
//                     className="pl-10 focus:border-blue-500/50 focus:ring-blue-500/20"
//                     {...register("email", { required: "Email is required" })}
//                   />
//                 </div>
//                 {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
//               </div>

//               {/* Password */}
//               <div className="space-y-2">
//                 <Label htmlFor="password" className="text-slate-300">Password</Label>
//                 <div className="relative group">
//                   <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
//                   <Input 
//                     id="password" 
//                     type="password" 
//                     placeholder="••••••••"
//                     className="pl-10 focus:border-blue-500/50 focus:ring-blue-500/20"
//                     {...register("password", { 
//                       required: "Password is required",
//                       minLength: { value: 6, message: "Must be at least 6 characters" }
//                     })}
//                   />
//                 </div>
//                 {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
//               </div>

//               <Button 
//                 type="submit" 
//                 variant="register" 
//                 className="w-full h-11 text-base font-semibold tracking-wide mt-2"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                 ) : (
//                   "Create Account"
//                 )}
//               </Button>
//             </form>

//             <div className="relative py-2">
//               <div className="absolute inset-0 flex items-center">
//                 <span className="w-full border-t border-slate-800" />
//               </div>
//               <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-slate-950 px-2 text-slate-500">Or sign up with</span>
//               </div>
//             </div>

//             <Button variant="outline" className="w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
//               <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
//                 <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
//               </svg>
//               Google
//             </Button>

//             <div className="text-center text-sm text-slate-400 mt-4">
//               Already have an account?{" "}
//               <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors inline-flex items-center group">
//                 Sign In
//                 <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
//               </Link>
//             </div>

//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Register;