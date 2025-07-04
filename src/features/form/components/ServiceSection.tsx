import { type Control, useWatch } from 'react-hook-form'
import { type FormValues } from '@features/form/lib/form-schema'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@shared/components/ui/form'
import { Input } from '@shared/components/ui/input'
import { AutocompleteInput } from '@shared/components/ui/autocomplete-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { useEffect, memo, useCallback } from 'react'

interface ServiceSectionProps {
	control: Control<FormValues>
	inputStyles: string
}

export const ServiceSection = memo(({ control, inputStyles }: ServiceSectionProps) => {
	const { profile } = useUserProfile()
	const branch = useWatch({ control, name: 'branch' })

	// Auto-set branch if user has an assigned branch - memoized with useCallback
	useEffect(() => {
		if (profile?.assigned_branch && !branch) {
			// Set the branch to the user's assigned branch
			const setValue = control._options.context?.setValue
			if (setValue) {
				setValue('branch', profile.assigned_branch)
			}
		}
	}, [profile, branch, control])

	return (
		<Card className="transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
			<CardHeader className="p-4 sm:p-6">
				<CardTitle className="text-lg sm:text-xl">Servicio</CardTitle>
				<div className="w-16 sm:w-20 h-1 bg-primary mt-1 rounded-full" />
			</CardHeader>
			<CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
				{/* Tipo de Examen - SIN AUTOCOMPLETADO (es un select) */}
				<FormField
					control={control}
					name="examType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tipo de Examen *</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className={inputStyles}>
										<SelectValue placeholder="Seleccione una opción" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="inmunohistoquimica">Inmunohistoquímica</SelectItem>
									<SelectItem value="biopsia">Biopsia</SelectItem>
									<SelectItem value="citologia">Citología</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Procedencia - CON AUTOCOMPLETADO */}
				<FormField
					control={control}
					name="origin"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Procedencia *</FormLabel>
							<FormControl>
								<AutocompleteInput
									fieldName="origin"
									placeholder="Hospital o Clínica"
									{...field}
									onChange={(e: any) => {
										const { value } = e.target
										if (/^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]*$/.test(value)) {
											field.onChange(e)
										}
									}}
									className={inputStyles}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Médico Tratante - CON AUTOCOMPLETADO */}
				<FormField
					control={control}
					name="treatingDoctor"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Médico Tratante *</FormLabel>
							<FormControl>
								<AutocompleteInput
									fieldName="treatingDoctor"
									placeholder="Nombre del Médico"
									{...field}
									onChange={(e) => {
										const { value } = e.target
										if (/^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]*$/.test(value)) {
											field.onChange(e)
										}
									}}
									className={inputStyles}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Tipo de Muestra - CON AUTOCOMPLETADO */}
				<FormField
					control={control}
					name="sampleType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tipo de Muestra *</FormLabel>
							<FormControl>
								<AutocompleteInput
									fieldName="sampleType"
									placeholder="Ej: Biopsia de Piel"
									{...field}
									onChange={(e) => {
										const { value } = e.target
										if (/^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]*$/.test(value)) {
											field.onChange(e)
										}
									}}
									className={inputStyles}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Cantidad de Muestras - PLACEHOLDER ACTUALIZADO */}
				<FormField
					control={control}
					name="numberOfSamples"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Cantidad de Muestras *</FormLabel>
							<FormControl>
								<Input 
									type="number" 
									placeholder="0" 
									{...field}
									value={field.value === 0 ? '' : field.value}
									onChange={(e) => {
										const value = e.target.value
										field.onChange(value === '' ? 0 : Number(value))
									}}
									className={inputStyles} 
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Relación - CON AUTOCOMPLETADO */}
				<FormField
					control={control}
					name="relationship"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Relación</FormLabel>
							<FormControl>
								<AutocompleteInput
									fieldName="relationship"
									placeholder="Relación con la muestra"
									{...field}
									className={inputStyles}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	)
})

ServiceSection.displayName = 'ServiceSection'