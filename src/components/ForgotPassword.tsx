import { useState } from 'react'
import { Lock, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { resetPassword } from '../firebase/auth'

function ForgotPassword() {
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		
		try {
			setMessage('')
			setError('')
			setLoading(true)
			await resetPassword(email)
			setMessage('Revisa tu correo electrónico para obtener instrucciones de restablecimiento de contraseña.')
		} catch (err: any) {
			if (err.code === 'auth/user-not-found') {
				setError('No se encontró una cuenta con este correo electrónico.')
			} else if (err.code === 'auth/invalid-email') {
				setError('Correo electrónico inválido.')
			} else {
				setError('Error al enviar el correo de restablecimiento. Inténtalo de nuevo.')
			}
		}
		setLoading(false)
	}

	return (
		<div className="w-screen h-screen bg-dark flex items-center justify-center">
			<div className="flex flex-col items-center justify-center bg-white p-8 rounded-none md:rounded-lg w-screen h-screen md:h-auto md:w-full md:max-w-md">
				<div className="text-center mb-4 flex flex-col items-center justify-center">
					<div className="p-4 bg-blue-500 rounded-full mb-4">
						<Lock className="text-white size-12" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Restablecer Contraseña</h1>
					<p className="text-gray-600">Ingresa tu correo electrónico para recibir instrucciones</p>
				</div>

				<form className="w-full" onSubmit={handleResetPassword}>
					<div className="flex flex-col gap-2 mb-4 w-full">
						<p className="text-sm text-gray-600">Correo electrónico:</p>
						<input
							type="email"
							name="email"
							placeholder="tu@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="border-2 border-gray-900 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
							autoComplete="email"
						/>
					</div>

					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
							{error}
						</div>
					)}

					{message && (
						<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
							{message}
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
					>
						{loading ? 'Enviando...' : 'Enviar Correo de Restablecimiento'}
					</button>
				</form>

				{/* Footer */}
				<div className="mt-6 text-center">
					<Link 
						to="/login" 
						className="flex items-center justify-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
					>
						<ArrowLeft size={16} />
						Volver al inicio de sesión
					</Link>
				</div>
			</div>
		</div>
	)
}

export default ForgotPassword