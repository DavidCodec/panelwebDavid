import React, { memo, useCallback } from 'react'
import { type Control, useWatch } from 'react-hook-form'
import { type FormValues } from '@features/form/lib/form-schema'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@shared/components/ui/form'
import { Input } from '@shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { useEffect } from 'react'

interface PaymentHeaderProps {
	control: Control<FormValues>
	inputStyles: string
	exchangeRate?: number
	isLoadingRate?: boolean
}

export const PaymentHeader = memo(({ control, inputStyles, exchangeRate, isLoadingRate }: PaymentHeaderProps) => {
	const { profile } = useUserProfile()
	const totalAmount = useWatch({
		control,
		name: 'totalAmount',
	})
	const branch = useWatch({
		control,
		name: 'branch',
	})

	// Auto-set branch if user has an assigned branch
	useEffect(() => {
		if (profile?.assigned_branch && !branch) {
			// Set the branch to the user's assigned branch
			const setValue = control._options.context?.setValue
			if (setValue) {
				setValue('branch', profile.assigned_branch)
			}
		}
	}, [profile, branch, control])

	const totalInVes = React.useMemo(() => {
		if (exchangeRate && totalAmount) {
			const amount = parseFloat(String(totalAmount))
			if (!isNaN(amount) && amount > 0) {
				return (amount * exchangeRate).toFixed(2)
			}
		}
		return null
	}, [totalAmount, exchangeRate])

	// Memoize the amount change handler to prevent re-renders
	const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		// Only allow numbers and a single decimal point
		if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
			return value === '' ? 0 : parseFloat(value);
		}
		return e.target.value;
	}, []);

	return (
		<React.Fragment>
			<FormField
        control={control}
        name="branch"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm sm:text-base">Sede *</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              disabled={!!profile?.assigned_branch} // Disable if user has assigned branch
            >
              <FormControl>
                <SelectTrigger className={inputStyles}>
                  <SelectValue placeholder="Seleccione una sede" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {!profile?.assigned_branch ? (
                  <>
                    <SelectItem value="PMG">PMG</SelectItem>
                    <SelectItem value="CPC">CPC</SelectItem>
                    <SelectItem value="CNX">CNX</SelectItem>
                    <SelectItem value="STX">STX</SelectItem>
                    <SelectItem value="MCY">MCY</SelectItem>
                  </>
                ) : (
                  <SelectItem value={profile.assigned_branch}>{profile.assigned_branch}</SelectItem>
                )}
              </SelectContent>
            </Select>
            {profile?.assigned_branch && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Tu cuenta está limitada a la sede {profile.assigned_branch}
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
			<FormField
				control={control}
				name="totalAmount"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-sm sm:text-base">Monto Total ($)</FormLabel>
						<FormControl>
							<Input 
								type="text" 
								inputMode="decimal"
								placeholder="0" 
								value={field.value === 0 ? '' : field.value}
								onChange={(e) => {
									const value = e.target.value;
									// Only allow numbers and a single decimal point
									if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
										field.onChange(value === '' ? 0 : parseFloat(value));
									}
								}}
								className={inputStyles} 
							/>
						</FormControl>
						{totalInVes && <p className="text-xs sm:text-sm font-bold text-green-600">{totalInVes} VES</p>}
						<p className="text-[10px] sm:text-xs text-muted-foreground">
							{isLoadingRate ? 'Cargando tasa...' : `Tasa BCV: ${exchangeRate?.toFixed(2) || 'N/A'} VES/USD`}
						</p>
						<FormMessage />
					</FormItem>
				)}
			/>
		</React.Fragment>
	)
})

PaymentHeader.displayName = 'PaymentHeader'