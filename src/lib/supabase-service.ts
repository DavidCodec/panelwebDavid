import { supabase } from '@lib/supabase/config'
import { type FormValues } from '@features/form/lib/form-schema'
import { prepareSubmissionData } from '@features/form/lib/prepareSubmissionData'
import { calculatePaymentDetailsFromRecord } from '@features/form/lib/payment/payment-utils'
import type { MedicalRecordInsert } from '@shared/types/types'
import { generateMedicalRecordCode } from '@lib/code-generator'
import { differenceInYears, differenceInMonths, parseISO } from 'date-fns'

export interface MedicalRecord {
	id?: string
	full_name: string
	id_number: string
	phone: string
	date_of_birth: string // Changed from age: number to date_of_birth: string
	email?: string | null
	date: string
	exam_type: string
	origin: string
	treating_doctor: string
	sample_type: string
	number_of_samples: number
	relationship?: string | null
	branch: string
	total_amount: number
	exchange_rate?: number | null
	payment_status: string
	remaining: number
	payment_method_1?: string | null
	payment_amount_1?: number | null
	payment_reference_1?: string | null
	payment_method_2?: string | null
	payment_amount_2?: number | null
	payment_reference_2?: string | null
	payment_method_3?: string | null
	payment_amount_3?: number | null
	payment_reference_3?: string | null
	payment_method_4?: string | null
	payment_amount_4?: number | null
	payment_reference_4?: string | null
	comments?: string | null
	code?: string | null
	created_at?: string
	updated_at?: string
	created_by?: string | null
	created_by_display_name?: string | null
	material_remitido?: string | null
	informacion_clinica?: string | null
	descripcion_macroscopica?: string | null
	diagnostico?: string | null
	comentario?: string | null
	pdf_en_ready?: boolean | null
	generated_by?: string | null
	generated_by_display_name?: string | null
	generated_at?: string | null
}

export interface ChangeLog {
	id?: string
	medical_record_id: string
	user_id: string
	user_email: string
	field_name: string
	field_label: string
	old_value: string | null
	new_value: string | null
	changed_at: string
	created_at?: string
}

// Helper function to calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
	if (!dateOfBirth) return 0
	try {
		const birthDate = parseISO(dateOfBirth)
		return differenceInYears(new Date(), birthDate)
	} catch (error) {
		console.error('Error calculating age:', error)
		return 0
	}
}

// Helper function to get age display text (years or months)
export const getAgeDisplay = (dateOfBirth: string): string => {
	if (!dateOfBirth) return '0 años'
	try {
		const birthDate = parseISO(dateOfBirth)
		const now = new Date()
		const years = differenceInYears(now, birthDate)

		if (years === 0) {
			// For babies, show months
			const months = differenceInMonths(now, birthDate)
			return `${months} ${months === 1 ? 'mes' : 'meses'}`
		} else {
			// For older patients, show years
			return `${years} ${years === 1 ? 'año' : 'años'}`
		}
	} catch (error) {
		console.error('Error calculating age display:', error)
		return '0 años'
	}
}

// Nombre de la tabla nueva y limpia
const TABLE_NAME = 'medical_records_clean'
const CHANGE_LOG_TABLE = 'change_logs'

export const testConnection = async () => {
	try {
		console.log(`🔍 Probando conexión con Supabase (tabla ${TABLE_NAME})...`)

		const { data, error } = await supabase.from(TABLE_NAME).select('count', { count: 'exact', head: true })

		if (error) {
			console.error('❌ Error en test de conexión:', error)
			return { success: false, error }
		}

		console.log(`✅ Test de conexión exitoso con tabla ${TABLE_NAME}`)
		return { success: true, data }
	} catch (error) {
		console.error('❌ Error inesperado en test de conexión:', error)
		return { success: false, error }
	}
}

export const insertMedicalRecord = async (
	formData: FormValues,
	exchangeRate?: number,
): Promise<{ data: MedicalRecord | null; error: any }> => {
	try {
		console.log(`🚀 Iniciando inserción en tabla ${TABLE_NAME}...`)

		// Primero probamos la conexión
		const connectionTest = await testConnection()
		if (!connectionTest.success) {
			console.error('❌ Fallo en test de conexión:', connectionTest.error)
			return {
				data: null,
				error: {
					message: 'No se pudo conectar con la base de datos. Verifica tu conexión a internet.',
					code: 'CONNECTION_FAILED',
					details: connectionTest.error,
				},
			}
		}

		const submissionData = prepareSubmissionData(formData, exchangeRate)
		console.log(`📋 Datos preparados para ${TABLE_NAME}:`, submissionData)

		// Ensure total_amount is at least 0.01 to comply with database constraint
		if (submissionData.total_amount <= 0) {
			submissionData.total_amount = 0.01
			console.log('⚠️ Total amount was 0 or negative, adjusted to 0.01 to comply with database constraint')
		}

		// Generar el código único ANTES de la inserción
		console.log('🔢 Generando código único...')
		const newCode = await generateMedicalRecordCode(formData.examType, formData.registrationDate)
		console.log(`✅ Código generado: ${newCode}`)

		// Get current user info for tracking who created the record
		const {
			data: { user },
		} = await supabase.auth.getUser()

		// Get user's display name from profiles
		let displayName = null
		if (user) {
			const { data: profileData } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()

			displayName = profileData?.display_name || user.user_metadata?.display_name || null
		}

		// Convertir los datos preparados para que coincidan con el esquema de la base de datos
		const recordData: MedicalRecordInsert = {
			full_name: submissionData.full_name,
			id_number: submissionData.id_number,
			phone: submissionData.phone,
			date_of_birth: submissionData.date_of_birth,
			email: submissionData.email || undefined,
			date: submissionData.date,
			exam_type: submissionData.exam_type,
			origin: submissionData.origin,
			treating_doctor: submissionData.treating_doctor,
			sample_type: submissionData.sample_type,
			number_of_samples: submissionData.number_of_samples,
			relationship: submissionData.relationship || undefined,
			branch: submissionData.branch,
			total_amount: submissionData.total_amount,
			exchange_rate: submissionData.exchange_rate || undefined,
			payment_status: submissionData.payment_status,
			remaining: submissionData.remaining,
			payment_method_1: submissionData.payment_method_1,
			payment_amount_1: submissionData.payment_amount_1,
			payment_reference_1: submissionData.payment_reference_1,
			payment_method_2: submissionData.payment_method_2,
			payment_amount_2: submissionData.payment_amount_2,
			payment_reference_2: submissionData.payment_reference_2,
			payment_method_3: submissionData.payment_method_3,
			payment_amount_3: submissionData.payment_amount_3,
			payment_reference_3: submissionData.payment_reference_3,
			payment_method_4: submissionData.payment_method_4,
			payment_amount_4: submissionData.payment_amount_4,
			payment_reference_4: submissionData.payment_reference_4,
			comments: submissionData.comments || undefined,
			code: newCode, // ✨ Añadir el código generado
			created_by: user?.id || undefined,
			created_by_display_name: displayName || undefined,
			material_remitido: undefined,
			informacion_clinica: undefined,
			descripcion_macroscopica: undefined,
			diagnostico: undefined,
			comentario: undefined,
			pdf_en_ready: false,
		}

		console.log(`💾 Insertando datos en tabla ${TABLE_NAME}:`, recordData)

		const { data, error } = await supabase.from(TABLE_NAME).insert([recordData]).select().single()

		if (error) {
			console.error(`❌ Error insertando en ${TABLE_NAME}:`, error)

			// Manejo específico de errores
			if (error.code === 'PGRST116') {
				return {
					data: null,
					error: {
						message: `La tabla ${TABLE_NAME} no existe. Ejecuta la migración create_medical_records_clean.sql`,
						code: 'TABLE_NOT_EXISTS',
						details: error,
					},
				}
			}

			if (error.code === '42P01') {
				return {
					data: null,
					error: {
						message: `Error de base de datos: tabla ${TABLE_NAME} no encontrada.`,
						code: 'TABLE_NOT_FOUND',
						details: error,
					},
				}
			}

			if (error.code === '23514') {
				// Check if it's specifically the total_amount constraint
				if (error.message.includes('medical_records_clean_total_amount_check')) {
					return {
						data: null,
						error: {
							message: 'Error: El monto total debe ser mayor a cero. Por favor ingresa un valor válido.',
							code: 'TOTAL_AMOUNT_CONSTRAINT',
							details: error,
						},
					}
				}

				return {
					data: null,
					error: {
						message: 'Error de validación: verifica que todos los campos cumplan las restricciones.',
						code: 'VALIDATION_ERROR',
						details: error,
					},
				}
			}

			// Check for unique constraint violation on code
			if (error.code === '23505' && error.message.includes('code')) {
				return {
					data: null,
					error: {
						message: 'Error: Se generó un código duplicado. Inténtalo de nuevo.',
						code: 'DUPLICATE_CODE',
						details: error,
					},
				}
			}

			return { data: null, error }
		}
		console.log(`✅ Registro médico insertado exitosamente en ${TABLE_NAME}:`, data)
		console.log(`🎯 Código asignado: ${data.code}`)

		// If user is available, log the creation in change_logs
		if (user) {
			try {
				await saveChangeLog(data.id, user.id, user.email || 'unknown@email.com', [
					{
						field: 'created_record',
						fieldLabel: 'Registro Creado',
						oldValue: null,
						newValue: `Registro médico creado: ${data.code || data.id}`,
					},
				])
			} catch (logError) {
				console.error('Error logging record creation:', logError)
				// Continue even if logging fails
			}
		}

		return { data: data as MedicalRecord, error: null }
	} catch (error) {
		console.error(`❌ Error inesperado insertando en ${TABLE_NAME}:`, error)

		// Si es un error de red
		if (error instanceof TypeError && String(error).includes('fetch')) {
			return {
				data: null,
				error: {
					message: 'Error de conexión de red. Verifica tu conexión a internet.',
					code: 'NETWORK_ERROR',
					details: error,
				},
			}
		}

		return { data: null, error }
	}
}

export const getMedicalRecords = async () => {
	try {
		// Fetch all records without pagination
		const { data, error } = await supabase.from(TABLE_NAME).select('*').order('created_at', { ascending: false })

		return { data, error }
	} catch (error) {
		console.error(`Error fetching ${TABLE_NAME}:`, error)
		return { data: null, error }
	}
}

export const getMedicalRecordById = async (id: string) => {
	try {
		const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).maybeSingle()

		return { data, error }
	} catch (error) {
		console.error(`Error fetching record from ${TABLE_NAME}:`, error)
		return { data: null, error }
	}
}

export const searchMedicalRecords = async (searchTerm: string) => {
	try {
		// Search all records without pagination
		const { data, error } = await supabase
			.from(TABLE_NAME)
			.select('*')
			.or(
				`full_name.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,treating_doctor.ilike.%${searchTerm}%`,
			)
			.order('created_at', { ascending: false })

		return { data, error }
	} catch (error) {
		console.error(`Error searching ${TABLE_NAME}:`, error)
		return { data: null, error }
	}
}

export const updateMedicalRecord = async (id: string, updates: Partial<MedicalRecord>) => {
	try {
		console.log(`🔄 Updating medical record ${id} in ${TABLE_NAME}:`, updates)

		// Get the current record to calculate payment status
		const { data: currentRecord, error: fetchError } = await getMedicalRecordById(id)
		if (fetchError || !currentRecord) {
			console.error(`❌ Error fetching current record:`, fetchError)
			return { data: null, error: fetchError }
		}

		// Merge current record with updates to get the complete updated record
		const updatedRecord = { ...currentRecord, ...updates }

		// Calculate payment status and remaining amount based on the updated payment information
		const { paymentStatus, missingAmount } = calculatePaymentDetailsFromRecord(updatedRecord)

		// Add calculated fields and timestamp to updates
		const updatesWithCalculations = {
			...updates,
			payment_status: paymentStatus || 'N/A',
			remaining: missingAmount,
			updated_at: new Date().toISOString(),
		}

		console.log(`💰 Calculated payment status: ${paymentStatus}, remaining: ${missingAmount}`)

		const { data, error } = await supabase
			.from(TABLE_NAME)
			.update(updatesWithCalculations)
			.eq('id', id)
			.select()
			.single()

		if (error) {
			console.error(`❌ Error updating record in ${TABLE_NAME}:`, error)
			return { data: null, error }
		}

		console.log(`✅ Medical record updated successfully in ${TABLE_NAME}:`, data)
		return { data, error: null }
	} catch (error) {
		console.error(`❌ Error updating record in ${TABLE_NAME}:`, error)
		return { data: null, error }
	}
}

export const deleteMedicalRecord = async (id: string) => {
	try {
		console.log(`🗑️ Deleting medical record ${id} from ${TABLE_NAME}`)

		// Get record details before deleting for the log
		const { data: recordToDelete, error: fetchError } = await getMedicalRecordById(id)

		// If record doesn't exist, treat as successful deletion
		if (fetchError && (fetchError as any).code === 'PGRST116') {
			console.log(`⚠️ Record ${id} not found, treating as already deleted`)
			return { data: null, error: null }
		}

		if (fetchError) {
			console.error(`❌ Error fetching record before deletion:`, fetchError)
			return { data: null, error: fetchError }
		}

		// Log the deletion action first
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (user && recordToDelete) {
				await saveChangeLog(id, user.id, user.email || 'unknown@email.com', [
					{
						field: 'deleted_record',
						fieldLabel: 'Registro Eliminado',
						oldValue: `${recordToDelete.code || id} - ${recordToDelete.full_name}`,
						newValue: null,
					},
				])
				console.log(`✅ Deletion logged successfully for record ${id}`)
			} else {
				console.warn('⚠️ Could not log deletion: User or record not found')
			}
		} catch (logError) {
			console.error('❌ Error logging record deletion:', logError)
			// Continue with deletion even if logging fails
		}

		// Perform the actual deletion
		const { data, error } = await supabase.from(TABLE_NAME).delete().eq('id', id).select()

		if (error) {
			console.error(`❌ Error deleting record from ${TABLE_NAME}:`, error)
			return { data: null, error }
		}

		// Check if any records were deleted
		if (!data || data.length === 0) {
			console.log(`⚠️ No records were deleted for ID ${id} - record may not exist`)
			return { data: null, error: null }
		}

		console.log(`✅ Medical record deleted successfully from ${TABLE_NAME}:`, data[0])
		return { data: data[0], error: null }
	} catch (error) {
		console.error(`❌ Error deleting record from ${TABLE_NAME}:`, error)
		return { data: null, error }
	}
}

// Function to save change logs
export const saveChangeLog = async (
	medicalRecordId: string,
	userId: string,
	userEmail: string,
	changes: Array<{
		field: string
		fieldLabel: string
		oldValue: any
		newValue: any
	}>
) => {
	try {
		console.log('💾 Saving change logs for record:', medicalRecordId)

		const changeLogEntries = changes.map(change => ({
			medical_record_id: medicalRecordId,
			user_id: userId,
			user_email: userEmail,
			field_name: change.field,
			field_label: change.fieldLabel,
			old_value: change.oldValue === null || change.oldValue === undefined ? null : String(change.oldValue),
			new_value: change.newValue === null || change.newValue === undefined ? null : String(change.newValue),
			changed_at: new Date().toISOString()
		}))

		const { data, error } = await supabase
			.from(CHANGE_LOG_TABLE)
			.insert(changeLogEntries)
			.select()

		if (error) {
			console.error('❌ Error saving change logs:', error)
			return { data: null, error }
		}

		console.log('✅ Change logs saved successfully:', data)
		return { data, error: null }
	} catch (error) {
		console.error('❌ Unexpected error saving change logs:', error)
		return { data: null, error }
	}
}

// Function to get change logs for a medical record
export const getChangeLogsForRecord = async (medicalRecordId: string) => {
	try {
		const { data, error } = await supabase
			.from(CHANGE_LOG_TABLE)
			.select('*')
			.eq('medical_record_id', medicalRecordId)
			.order('changed_at', { ascending: false })

		return { data, error }
	} catch (error) {
		console.error(`Error fetching change logs for record ${medicalRecordId}:`, error)
		return { data: null, error }
	}
}

// Function to get all change logs with pagination
export const getAllChangeLogs = async (limit = 50, offset = 0) => {
	try {
		const { data, error } = await supabase
			.from(CHANGE_LOG_TABLE)
			.select('*, medical_records_clean!inner(id, full_name, code)')
			.order('changed_at', { ascending: false })
			.range(offset, offset + limit - 1)

		return { data, error }
	} catch (error) {
		console.error('Error fetching all change logs:', error)
		return { data: null, error }
	}
}

// Combined function to update medical record and save change log
export const updateMedicalRecordWithLog = async (
	id: string,
	updates: Partial<MedicalRecord>,
	changes: Array<{
		field: string
		fieldLabel: string
		oldValue: any
		newValue: any
	}>,
	userId: string,
	userEmail: string
) => {
	try {
		console.log('🔄 Starting medical record update with change log...')
		console.log('Updates to apply:', updates)
		console.log('Changes to log:', changes)

		// Update the medical record first (this now includes payment status calculation)
		const { data: updatedRecord, error: updateError } = await updateMedicalRecord(id, updates)

		if (updateError) {
			console.error('❌ Error updating medical record:', updateError)
			return { data: null, error: updateError }
		}

		console.log('✅ Medical record updated successfully:', updatedRecord)

		// Save change logs
		const { error: logError } = await saveChangeLog(id, userId, userEmail, changes)

		if (logError) {
			console.error('❌ Error saving change logs (record was updated):', logError)
			// Note: The record was already updated, so we don't return an error here
			// but we should log this for monitoring
		} else {
			console.log('✅ Change logs saved successfully')
		}

		console.log('✅ Medical record updated and change logs saved successfully')
		return { data: updatedRecord, error: null }
	} catch (error) {
		console.error('❌ Unexpected error in updateMedicalRecordWithLog:', error)
		return { data: null, error }
	}
}

// Función para obtener estadísticas
export const getMedicalRecordsStats = async () => {
	try {
		const { data, error } = await supabase.from(TABLE_NAME).select('total_amount, payment_status, created_at')

		if (error) return { data: null, error }

		const stats = {
			total: data.length,
			totalAmount: data.reduce((sum, record) => sum + record.total_amount, 0),
			completed: data.filter((record) => record.payment_status === 'Completado').length,
			pending: data.filter((record) => record.payment_status === 'Pendiente').length,
			incomplete: data.filter((record) => record.payment_status === 'Incompleto').length,
		}

		return { data: stats, error: null }
	} catch (error) {
		console.error(`Error getting stats from ${TABLE_NAME}:`, error)
		return { data: null, error }
	}
}

// Function to update PDF ready status
export const updatePdfReadyStatus = async (id: string, isReady: boolean) => {
	try {
		const { data, error } = await supabase
			.from(TABLE_NAME)
			.update({ pdf_en_ready: isReady })
			.eq('id', id)
			.select()
			.single()

		if (error) {
			console.error('❌ Error updating PDF ready status:', error)
			return { data: null, error }
		}

		console.log('✅ PDF ready status updated successfully:', data)
		return { data, error: null }
	} catch (error) {
		console.error('❌ Unexpected error updating PDF ready status:', error)
		return { data: null, error }
	}
}

// Mantener compatibilidad con nombres anteriores
export const insertCliente = insertMedicalRecord
export const getClientes = getMedicalRecords
export const getClienteById = getMedicalRecordById
export const searchClientes = searchMedicalRecords
export type Cliente = MedicalRecord