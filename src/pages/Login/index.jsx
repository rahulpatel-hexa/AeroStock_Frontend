import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useLogin } from '../../hooks/useAuth'

export default function Login() {
    const token = useAuthStore((s) => s.token)
    const { mutate: login, isPending } = useLogin()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ defaultValues: { email: '', password: '' } })

    if (token) return <Navigate to="/dashboard" replace />

    const onSubmit = (data) => login(data)

    const inputClass = (hasError) =>
        `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${hasError
            ? 'border-red-400 focus:ring-red-200'
            : 'border-slate-200 focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20'
        }`

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                {/* Logo */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6c5ce7] text-lg font-bold text-white">
                        A
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight text-slate-800">AeroStock</h1>
                        <p className="text-[9px] font-semibold tracking-wider text-slate-500">
                            AVIATION INVENTORY
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
                <p className="mb-6 mt-1 text-sm text-slate-500">Login to your account</p>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">Email</label>
                        <input
                            type="email"
                            placeholder="admin@aerostock.com"
                            className={inputClass(errors.email)}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Enter a valid email',
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter password"
                                className={inputClass(errors.password)}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Minimum 6 characters' },
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>



                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-lg bg-[#6c5ce7] py-2.5 text-sm font-semibold text-white transition hover:bg-[#5b4bd6] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isPending ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-slate-400">
                    Demo: staff@aerostock.com / Staff@123
                </p>
            </div>
        </div>
    )
}