import React, { useState } from 'react'
import { Users, DollarSign, ShoppingCart, ArrowUpRight, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useDashboardStats } from '@shared/hooks/useDashboardStats'
import { YearSelector } from '@shared/components/ui/year-selector'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card } from '@shared/components/ui/card'

const StatsPage: React.FC = () => {
	const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
	const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
	const { data: stats, isLoading, error } = useDashboardStats(selectedMonth, selectedYear)

	if (error) {
		console.error('Error loading stats:', error)
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('es-VE', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount)
	}

	const handleMonthBarClick = (monthData: any) => {
		// FIXED: Use the monthIndex to create the correct date
		const clickedDate = new Date(selectedYear, monthData.monthIndex, 1)
		setSelectedMonth(clickedDate)
	}

	const handleYearChange = (year: number) => {
		setSelectedYear(year)
		// Update selected month to the same month in the new year
		setSelectedMonth(new Date(year, selectedMonth.getMonth(), 1))
	}

	// Calculate some additional metrics
	const averageRevenuePerCase = stats?.totalCases ? stats.totalRevenue / stats.totalCases : 0
	const completionRate = stats?.totalCases ? (stats.completedCases / stats.totalCases) * 100 : 0
	const incompleteRate = stats?.totalCases ? (stats.incompleteCases / stats.totalCases) * 100 : 0

	return (
		<div className="p-3 sm:p-6">
			{/* <div className="text-sm text-gray-600 dark:text-gray-400">
							Mes seleccionado:{' '}
							<span className="font-medium">{format(selectedMonth, 'MMMM yyyy', { locale: es })}</span>
						</div> */}
			{/* KPI Cards Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
				{/* Total Revenue Card */}
				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
								<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
							</div>
							<div className="flex items-center text-green-600 dark:text-green-400">
								<ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
								<span className="text-xs sm:text-sm font-medium">{isLoading ? '...' : '+12.5%'}</span>
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos Totales</h3>
							<p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">
								{isLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
							</p>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
								Este mes: {isLoading ? '...' : formatCurrency(stats?.monthlyRevenue || 0)}
							</p>
						</div>
					</div>
				</Card>

				{/* Active Users Card */}
				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 sm:p-3 rounded-lg">
								<Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
							</div>
							<div className="flex items-center text-blue-600 dark:text-blue-400">
								<ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
								<span className="text-xs sm:text-sm font-medium">
									{isLoading ? '...' : `+${stats?.newPatientsThisMonth || 0}`}
								</span>
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pacientes Activos</h3>
							<p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">
								{isLoading ? '...' : stats?.uniquePatients || 0}
							</p>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
								Nuevos este mes: {isLoading ? '...' : stats?.newPatientsThisMonth || 0}
							</p>
						</div>
					</div>
				</Card>

				{/* Completed Projects Card */}
				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 sm:p-3 rounded-lg">
								<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
							</div>
							<div className="flex items-center text-purple-600 dark:text-purple-400">
								<ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
								<span className="text-xs sm:text-sm font-medium">
									{isLoading ? '...' : `${completionRate.toFixed(1)}%`}
								</span>
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Casos Completados</h3>
							<p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">
								{isLoading ? '...' : stats?.completedCases || 0}
							</p>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
								Total casos: {isLoading ? '...' : stats?.totalCases || 0}
							</p>
						</div>
					</div>
				</Card>

				{/* Incomplete Cases Card */}
				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 sm:p-3 rounded-lg">
								<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
							</div>
							<div className="flex items-center text-orange-600 dark:text-orange-400">
								<Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
								<span className="text-xs sm:text-sm font-medium">Pendientes</span>
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Casos Incompletos</h3>
							<p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">
								{isLoading ? '...' : stats?.incompleteCases || 0}
							</p>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
								Pagos pendientes: {isLoading ? '...' : formatCurrency(stats?.pendingPayments || 0)}
							</p>
						</div>
					</div>
				</Card>
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
				{/* 12-Month Revenue Trend Chart with Interactive Bars */}
				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
							<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
								Tendencia de Ingresos
							</h3>
							<div className="flex items-center gap-4">
								<YearSelector
									selectedYear={selectedYear}
									onYearChange={handleYearChange}
									minYear={2020}
									maxYear={new Date().getFullYear() + 2}
								/>
								<span className="text-sm text-gray-600 dark:text-gray-400">12 meses de {selectedYear}</span>
							</div>
						</div>
						<div className="relative h-48 sm:h-64 flex items-end justify-between gap-1 sm:gap-2">
							{isLoading ? (
								<div className="flex items-center justify-center w-full h-full">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
								</div>
							) : (
								stats?.salesTrendByMonth.map((month, _index) => {
									const maxRevenue = Math.max(...(stats?.salesTrendByMonth.map((m) => m.revenue) || [1]))
									const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
									const isSelected = month.isSelected
									return (
										<div
											key={month.month}
											className={`flex-1 rounded-t-sm transition-all duration-200 cursor-pointer hover:translate-y-[-4px] ${
												isSelected
													? 'bg-gradient-to-t from-purple-600 to-purple-400 shadow-lg'
													: 'bg-gradient-to-t from-blue-500 to-blue-300 hover:from-blue-600 hover:to-blue-400'
											}`}
											style={{ height: `${Math.max(height, 20)}%` }} // FIXED: Increased minimum height for better UX
											title={`${format(new Date(month.month), 'MMM yyyy', { locale: es })}: ${formatCurrency(
												month.revenue,
											)}`}
											onClick={() => handleMonthBarClick(month)}
										></div>
									)
								})
							)}
						</div>
						<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-4 overflow-x-auto">
							{/* FIXED: Force Spanish month labels regardless of system language */}
							{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((month) => (
								<span key={month} className="flex-shrink-0">
									{month}
								</span>
							))}
						</div>
						<div className="mt-4 text-center">
							<p className="text-sm text-gray-600 dark:text-gray-400">Haz clic en una barra para seleccionar el mes</p>
						</div>
					</div>
				</Card>

				{/* Service Distribution by Branch */}
				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
							Distribución por Sede
						</h3>
						<div className="flex items-center justify-center mb-4 sm:mb-6">
							<div className="relative size-36 sm:size-48">
								<svg className="size-full -rotate-90" viewBox="0 0 36 36">
									<circle
										cx="18"
										cy="18"
										r="14"
										fill="none"
										className="stroke-current text-gray-200 dark:text-neutral-700"
										strokeWidth="4"
									></circle>
									{stats?.revenueByBranch.map((branch, index) => {
										const colors = [
											'text-blue-500',
											'text-green-500',
											'text-orange-500',
											'text-red-500',
											'text-purple-500',
										]
										const offset = stats.revenueByBranch.slice(0, index).reduce((sum, b) => sum + b.percentage, 0)
										return (
											<circle
												key={branch.branch}
												cx="18"
												cy="18"
												r="14"
												fill="none"
												className={`stroke-current ${colors[index % colors.length]}`}
												strokeWidth="4"
												strokeDasharray={`${branch.percentage} ${100 - branch.percentage}`}
												strokeDashoffset={-offset}
											></circle>
										)
									})}
								</svg>
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-center">
										<p className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">
											{isLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
										</p>
										<p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
									</div>
								</div>
							</div>
						</div>
						<div className="space-y-3">
							{isLoading ? (
								<div className="space-y-2">
									{[1, 2, 3, 4].map((i) => (
										<div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 rounded"></div>
									))}
								</div>
							) : (
								stats?.revenueByBranch.map((branch, index) => {
									const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-500']
									return (
										<div key={branch.branch} className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full`}></div>
												<span className="text-sm text-gray-600 dark:text-gray-400">{branch.branch}</span>
											</div>
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
												{branch.percentage.toFixed(1)}% ({formatCurrency(branch.revenue)})
											</span>
										</div>
									)
								})
							)}
						</div>
					</div>
				</Card>
			</div>

			{/* Detailed Tables */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
				{/* Performance Metrics by Exam Type (Normalized) */}
				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
							Métricas por Tipo de Estudio
						</h3>
						<div className="overflow-x-auto">
							<table className="w-full min-w-full">
								<thead>
									<tr className="border-b border-gray-200 dark:border-gray-700">
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Estudio</th>
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Casos</th>
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Ingresos</th>
									</tr>
								</thead>
								<tbody>
									{isLoading ? (
										<tr>
											<td colSpan={3} className="py-8 text-center">
												<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
											</td>
										</tr>
									) : (
										stats?.revenueByExamType.slice(0, 5).map((exam, _index) => (
											<tr key={exam.examType} className="border-b border-gray-100 dark:border-gray-800">
												<td className="py-3">
													<div>
														<p className="font-medium text-gray-700 dark:text-gray-300 text-sm">{exam.examType}</p>
													</div>
												</td>
												<td className="py-3 text-gray-700 dark:text-gray-300 text-sm">{exam.count}</td>
												<td className="py-3 text-gray-700 dark:text-gray-300 font-medium text-sm">
													{formatCurrency(exam.revenue)}
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				</Card>

				{/* Status Metrics - UPDATED SECTION */}
				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
							Estatus
						</h3>
						<div className="space-y-4 sm:space-y-6">
							{/* Completed Cases */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
										<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Casos Completados</span>
									</div>
									<span className="text-sm font-bold text-green-700 dark:text-green-300">
										{isLoading ? '...' : `${completionRate.toFixed(1)}%`}
									</span>
								</div>
								<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
									<div
										className="bg-green-500 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
										style={{ width: `${completionRate}%` }}
									>
										{completionRate > 15 && (
											<span className="text-xs text-white font-medium">
												{stats?.completedCases || 0}
											</span>
										)}
									</div>
								</div>
								{completionRate <= 15 && (
									<div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
										{stats?.completedCases || 0} casos completados
									</div>
								)}
							</div>

							{/* Incomplete Cases */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
										<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Casos Incompletos</span>
									</div>
									<span className="text-sm font-bold text-red-700 dark:text-red-300">
										{isLoading ? '...' : `${incompleteRate.toFixed(1)}%`}
									</span>
								</div>
								<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
									<div
										className="bg-red-500 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
										style={{ width: `${incompleteRate}%` }}
									>
										{incompleteRate > 15 && (
											<span className="text-xs text-white font-medium">
												{stats?.incompleteCases || 0}
											</span>
										)}
									</div>
								</div>
								{incompleteRate <= 15 && (
									<div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
										{stats?.incompleteCases || 0} casos incompletos
									</div>
								)}
							</div>

							{/* Revenue per Case */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
										Ingreso Promedio por Caso
									</span>
									<span className="text-sm font-bold text-gray-700 dark:text-gray-300">
										{isLoading ? '...' : formatCurrency(averageRevenuePerCase)}
									</span>
								</div>
								<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
								</div>
							</div>

							{/* Patient Growth */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Crecimiento de Pacientes</span>
									<span className="text-sm font-bold text-gray-700 dark:text-gray-300">
										{isLoading ? '...' : `+${stats?.newPatientsThisMonth || 0} este mes`}
									</span>
								</div>
								<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div className="bg-orange-500 h-2 rounded-full" style={{ width: '72%' }}></div>
								</div>
							</div>

							{/* Pending Payments Indicator */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagos Pendientes</span>
									<span className="text-sm font-bold text-red-700 dark:text-red-300">
										{isLoading ? '...' : formatCurrency(stats?.pendingPayments || 0)}
									</span>
								</div>
								<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div
										className="bg-red-500 h-2 rounded-full"
										style={{
											width: `${
												stats?.pendingPayments ? Math.min((stats.pendingPayments / stats.totalRevenue) * 100, 100) : 0
											}%`,
										}}
									></div>
								</div>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	)
}

export default StatsPage