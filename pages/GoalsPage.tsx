import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
	Target,
	Plus,
	Edit2,
	Trash2,
	BookOpen,
	TrendingUp,
	CheckCircle,
	ArrowLeft
} from 'lucide-react';
import { buttonStyles } from '../utils/designSystem';
import { API_BASE_URL } from '../utils/api';
import type { User } from '../src/types';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';

interface Goal {
	id: number | string;
	title: string;
	description?: string;
	category: string;
	target_value: number;
	current_value: number;
	target_date?: string;
	is_completed?: boolean;
}

interface JournalEntry {
	id: number | string;
	prompt?: string;
	content: string;
	entry_date: string;
}

interface ReadinessData {
	overall: number;
	technical: number;
	soft: number;
	leadership?: number;
}

export default function GoalsPage(): JSX.Element {
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [readiness, setReadiness] = useState<ReadinessData | null>(null);
	const [goals, setGoals] = useState<Goal[]>([]);
	const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Form states
	const [showGoalForm, setShowGoalForm] = useState<boolean>(false);
	const [showJournalForm, setShowJournalForm] = useState<boolean>(false);
	const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

	interface GoalFormData {
		title: string;
		description: string;
		category: string;
		target_value: number;
		target_date: string;
	}

	const [goalForm, setGoalForm] = useState<GoalFormData>({
		title: '',
		description: '',
		category: 'readiness',
		target_value: 0,
		target_date: ''
	});

	interface JournalFormData {
		prompt: string;
		content: string;
	}

	const [journalForm, setJournalForm] = useState<JournalFormData>({
		prompt: '',
		content: ''
	});

	useEffect(() => {
		const userData = localStorage.getItem('currentUser');
		if (!userData) {
			navigate('/');
			return;
		}
		const parsed = JSON.parse(userData);
		setUser(parsed);
		fetchData(parsed.id);
	}, [navigate]);

	const fetchData = async (userId: number | string): Promise<void> => {
		setLoading(true);
		setError(null);
		try {
			// Fetch readiness
			const readinessRes = await fetch(
				`${API_BASE_URL}/dashboard?user_id=${userId}`
			);
			if (readinessRes.ok) {
				const readinessData = await readinessRes.json();
				setReadiness(readinessData.readiness as ReadinessData);
			}

			// Fetch goals
			const goalsRes = await fetch(`${API_BASE_URL}/goals?user_id=${userId}`);
			if (goalsRes.ok) {
				const goalsData = await goalsRes.json();
				setGoals(goalsData as Goal[]);
			}

			// Fetch journal entries
			const journalRes = await fetch(
				`${API_BASE_URL}/journal?user_id=${userId}&limit=10`
			);
			if (journalRes.ok) {
				const journalData = await journalRes.json();
				setJournalEntries(journalData as JournalEntry[]);
			}
		} catch {
			setError('Failed to load data');
		} finally {
			setLoading(false);
		}
	};

	const handleCreateGoal = async (
		e: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		e.preventDefault();
		if (!user) return;
		console.log('Creating goal with form data:', goalForm);
		try {
			let formattedDate: string | null = null;
			if (goalForm.target_date) {
				// Convert YYYY-MM-DD to YYYY-MM-DDT00:00:00
				formattedDate =
					goalForm.target_date.length === 10
						? `${goalForm.target_date}T00:00:00`
						: goalForm.target_date;
			}
			const payload = {
				...goalForm,
				target_date: formattedDate
			};
			console.log('Sending payload:', payload);

			const res = await fetch(`${API_BASE_URL}/goals?user_id=${user.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			console.log('Response status:', res.status);

			if (res.ok) {
				const result = await res.json();
				console.log('Goal created successfully:', result);
				await fetchData(user.id);
				setShowGoalForm(false);
				setGoalForm({
					title: '',
					description: '',
					category: 'readiness',
					target_value: 0,
					target_date: ''
				});
				alert('Goal created successfully!');
			} else {
				const errorData = await res.text();
				console.error('Failed to create goal:', errorData);
				alert('Failed to create goal: ' + errorData);
			}
		} catch (e) {
			const err = e instanceof Error ? e : new Error('Unknown error');
			console.error('Error creating goal:', e);
			alert('Failed to create goal: ' + err.message);
		}
	};

	const handleUpdateGoal = async (
		e: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		e.preventDefault();
		if (!user || !editingGoal) return;
		try {
			const res = await fetch(
				`${API_BASE_URL}/goals/${editingGoal.id}?user_id=${user.id}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(goalForm)
				}
			);
			if (res.ok) {
				await fetchData(user.id);
				setEditingGoal(null);
				setShowGoalForm(false);
				setGoalForm({
					title: '',
					description: '',
					category: 'readiness',
					target_value: 0,
					target_date: ''
				});
			}
		} catch (e) {
			const err = e instanceof Error ? e : new Error('Unknown error');
			alert('Failed to update goal: ' + err.message);
		}
	};

	const handleDeleteGoal = async (goalId: number | string): Promise<void> => {
		if (!user) return;
		if (!window.confirm('Are you sure you want to delete this goal?')) return;
		try {
			const res = await fetch(
				`${API_BASE_URL}/goals/${goalId}?user_id=${user.id}`,
				{
					method: 'DELETE'
				}
			);
			if (res.ok) {
				await fetchData(user.id);
			}
		} catch (e) {
			const err = e instanceof Error ? e : new Error('Unknown error');
			alert('Failed to delete goal: ' + err.message);
		}
	};

	const handleUpdateProgress = async (
		goalId: number | string,
		currentValue: number
	): Promise<void> => {
		if (!user) return;
		try {
			const res = await fetch(
				`${API_BASE_URL}/goals/${goalId}/progress?user_id=${user.id}&current_value=${currentValue}`,
				{
					method: 'PATCH'
				}
			);
			if (res.ok) {
				await fetchData(user.id);
			}
		} catch (e) {
			const err = e instanceof Error ? e : new Error('Unknown error');
			alert('Failed to update progress: ' + err.message);
		}
	};

	const handleCreateJournal = async (
		e: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		e.preventDefault();
		if (!user) return;
		try {
			const res = await fetch(`${API_BASE_URL}/journal?user_id=${user.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(journalForm)
			});
			if (res.ok) {
				await fetchData(user.id);
				setShowJournalForm(false);
				setJournalForm({ prompt: '', content: '' });
			}
		} catch (e) {
			const err = e instanceof Error ? e : new Error('Unknown error');
			alert('Failed to create journal entry: ' + err.message);
		}
	};

	const handleDeleteJournal = async (
		entryId: number | string
	): Promise<void> => {
		if (!user) return;
		if (!window.confirm('Are you sure you want to delete this journal entry?'))
			return;
		try {
			const res = await fetch(
				`${API_BASE_URL}/journal/${entryId}?user_id=${user.id}`,
				{
					method: 'DELETE'
				}
			);
			if (res.ok) {
				await fetchData(user.id);
			}
		} catch (e) {
			const err = e instanceof Error ? e : new Error('Unknown error');
			alert('Failed to delete journal entry: ' + err.message);
		}
	};

	const startEditGoal = (goal: Goal): void => {
		setEditingGoal(goal);
		setGoalForm({
			title: goal.title,
			description: goal.description || '',
			category: goal.category,
			target_value: goal.target_value,
			target_date: goal.target_date ? goal.target_date.split('T')[0] : ''
		});
		setShowGoalForm(true);
	};

	// Animation variants - gentle and not too fast
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.12,
				delayChildren: 0.2
			}
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: 'easeOut' as const
			}
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen bg-[#F7F9FC] flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A7AFE] mx-auto mb-4'></div>
					<p className='text-[#4B5563]'>Loading...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className='min-h-screen bg-[#F7F9FC] flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-[#4B5563]'>Loading...</p>
				</div>
			</div>
		);
	}

	const currentReadiness: ReadinessData = readiness || {
		overall: user?.readiness_score || 0,
		technical: user?.technical_score || 0,
		soft: user?.soft_skills_score || 0
	};

	const getProgressPercentage = (goal: Goal): number => {
		if (goal.target_value === 0) return 0;
		return Math.min(
			100,
			Math.round((goal.current_value / goal.target_value) * 100)
		);
	};

	const journalPrompts = [
		'What was my biggest challenge this week?',
		'What skill do I want to develop next?',
		'What progress have I made toward my goals?',
		'What obstacles am I facing?',
		'What am I grateful for in my learning journey?'
	];

	return (
		<div className='min-h-screen bg-[#F7F9FC] flex flex-col'>
			{/* Navbar */}
			<Navbar showSkipToDashboard={true} />

			{/* Main Content */}
			<motion.div
				className='flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full'
				initial='hidden'
				animate='visible'
				variants={containerVariants}>
				{/* Header */}
				<motion.div
					className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'
					variants={itemVariants}>
					<div>
						<h1 className='text-3xl md:text-4xl font-bold text-[#1C1C1C] mb-2'>
							Self-Reflection & Goals
						</h1>
						<p className='text-[#4B5563]'>
							Track your progress and reflect on your journey
						</p>
					</div>
					<div className='flex items-center gap-3'>
						<button
							onClick={() => navigate(-1)}
							className='flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F7F9FC] text-[#4B5563] border border-[#E5E7EB] rounded-lg transition-colors duration-200'>
							<ArrowLeft className='w-4 h-4' />
							<span className='hidden sm:inline'>Back</span>
						</button>
						<button
							onClick={() => navigate('/dashboard')}
							className='px-4 py-2 bg-[#3A7AFE] hover:bg-[#2E6AE8] text-white rounded-lg transition-colors duration-200'>
							Dashboard
						</button>
					</div>
				</motion.div>

				{/* Error Message */}
				{error && (
					<motion.div
						className='mb-6 rounded-lg border border-[#DC2626] bg-[#fef2f2] px-4 py-3 text-sm text-[#DC2626]'
						variants={itemVariants}
						initial='hidden'
						animate='visible'>
						{error}
					</motion.div>
				)}

				{/* Two-Column Layout */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
					{/* Where I Am Now */}
					<motion.div
						className='bg-white rounded-xl shadow-sm p-4 md:p-6 border border-[#E5E7EB]'
						variants={itemVariants}
						whileHover={{ y: -2, transition: { duration: 0.2 } }}>
						<h2 className='text-xl md:text-2xl font-semibold text-[#1C1C1C] mb-4 flex items-center gap-2'>
							<Target className='h-5 w-5 md:h-6 md:w-6 text-[#3A7AFE]' />
							Where I Am Now
						</h2>
						<div className='space-y-3 md:space-y-4'>
							<div className='p-3 md:p-4 bg-[#F7F9FC] rounded-lg border border-[#E5E7EB]'>
								<div className='text-xs md:text-sm text-[#4B5563] mb-1'>
									Overall Readiness
								</div>
								<div className='text-2xl md:text-3xl font-bold text-[#3A7AFE]'>
									{Math.round(currentReadiness.overall)}%
								</div>
							</div>
							<div className='p-3 md:p-4 bg-[#f0fdf4] rounded-lg border border-[#dcfce7]'>
								<div className='text-xs md:text-sm text-[#4B5563] mb-1'>
									Technical Skills
								</div>
								<div className='text-2xl md:text-3xl font-bold text-[#4CAF50]'>
									{Math.round(currentReadiness.technical)}%
								</div>
							</div>
							<div className='p-3 md:p-4 bg-[#fffbeb] rounded-lg border border-[#fef3c7]'>
								<div className='text-xs md:text-sm text-[#4B5563] mb-1'>
									Soft Skills
								</div>
								<div className='text-2xl md:text-3xl font-bold text-[#EAB308]'>
									{Math.round(currentReadiness.soft)}%
								</div>
							</div>
						</div>
					</motion.div>

					{/* Where I Want To Be */}
					<motion.div
						className='bg-white rounded-xl shadow-sm p-4 md:p-6 border border-[#E5E7EB]'
						variants={itemVariants}
						whileHover={{ y: -2, transition: { duration: 0.2 } }}>
						<h2 className='text-xl md:text-2xl font-semibold text-[#1C1C1C] mb-4 flex items-center gap-2'>
							<TrendingUp className='h-5 w-5 md:h-6 md:w-6 text-[#3A7AFE]' />
							Where I Want To Be
						</h2>
						{!showGoalForm ? (
							<motion.button
								onClick={() => {
									setEditingGoal(null);
									setGoalForm({
										title: '',
										description: '',
										category: 'readiness',
										target_value: 0,
										target_date: ''
									});
									setShowGoalForm(true);
								}}
								className='w-full p-4 border-2 border-dashed border-[#E5E7EB] rounded-lg hover:border-[#3A7AFE] transition-colors duration-200 flex items-center justify-center gap-2 text-[#4B5563]'
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}>
								<Plus className='h-5 w-5' />
								Set a New Goal
							</motion.button>
						) : (
							<form
								onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
								className='space-y-4'>
								<input
									type='text'
									placeholder='Goal Title'
									value={goalForm.title}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setGoalForm({ ...goalForm, title: e.target.value })
									}
									className='w-full p-2 md:p-3 border border-[#E5E7EB] rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#3A7AFE] focus:border-transparent'
									required
								/>
								<textarea
									placeholder='Description (optional)'
									value={goalForm.description}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setGoalForm({ ...goalForm, description: e.target.value })
									}
									className='w-full p-2 md:p-3 border border-[#E5E7EB] rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#3A7AFE] focus:border-transparent'
									rows={2}
								/>
								<select
									value={goalForm.category}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
										setGoalForm({ ...goalForm, category: e.target.value })
									}
									className='w-full p-2 md:p-3 border border-[#E5E7EB] rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#3A7AFE] focus:border-transparent'>
									<option value='readiness'>Overall Readiness</option>
									<option value='technical'>Technical Skills</option>
									<option value='soft_skills'>Soft Skills</option>
									<option value='leadership'>Leadership</option>
								</select>
								<input
									type='number'
									placeholder='Target Value (%)'
									value={goalForm.target_value}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setGoalForm({
											...goalForm,
											target_value: parseFloat(e.target.value) || 0
										})
									}
									className='w-full p-2 md:p-3 border border-[#E5E7EB] rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#3A7AFE] focus:border-transparent'
									min='0'
									max='100'
									step='0.1'
									required
								/>
								<input
									type='date'
									value={goalForm.target_date}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setGoalForm({ ...goalForm, target_date: e.target.value })
									}
									className='w-full p-2 md:p-3 border border-[#E5E7EB] rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#3A7AFE] focus:border-transparent'
								/>
								<div className='flex flex-col sm:flex-row gap-2'>
									<button
										type='submit'
										className={`${buttonStyles.primary} flex-1 px-4 py-2 text-sm md:text-base`}
										onClick={() => console.log('Create Goal button clicked!')}>
										{editingGoal ? 'Update Goal' : 'Create Goal'}
									</button>
									<button
										type='button'
										onClick={() => {
											setShowGoalForm(false);
											setEditingGoal(null);
										}}
										className='px-4 py-2 bg-[#E5E7EB] hover:bg-[#d1d5db] text-[#4B5563] rounded-lg text-sm md:text-base transition-colors duration-200'>
										Cancel
									</button>
								</div>
							</form>
						)}
					</motion.div>
				</div>

				{/* Goal Tracking Dashboard */}
				<motion.div
					className='bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 md:mb-8 border border-[#E5E7EB]'
					variants={itemVariants}
					whileHover={{ y: -2, transition: { duration: 0.2 } }}>
					<h2 className='text-xl md:text-2xl font-bold text-[#1C1C1C] mb-4 flex items-center gap-2'>
						<CheckCircle className='h-5 w-5 md:h-6 md:w-6 text-[#4CAF50]' />
						Goal Tracking Dashboard
					</h2>
					{goals.length === 0 ? (
						<div className='text-center py-8 text-gray-500'>
							<p>No goals set yet. Create your first goal above!</p>
						</div>
					) : (
						<div className='space-y-4'>
							{goals.map((goal, index) => {
								const progress = getProgressPercentage(goal);
								return (
									<motion.div
										key={goal.id}
										className='border border-[#E5E7EB] rounded-lg p-3 md:p-4 bg-white'
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											delay: index * 0.1,
											duration: 0.4,
											ease: 'easeOut'
										}}
										whileHover={{ y: -2, transition: { duration: 0.2 } }}>
										<div className='flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2'>
											<div className='flex-1 min-w-0'>
												<h3 className='font-semibold text-base md:text-lg text-[#1C1C1C]'>
													{goal.title}
												</h3>
												{goal.description && (
													<p className='text-xs md:text-sm text-[#4B5563] mt-1'>
														{goal.description}
													</p>
												)}
												<div className='mt-2 flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-[#4B5563]'>
													<span className='capitalize'>
														{goal.category.replace('_', ' ')}
													</span>
													<span>Target: {goal.target_value}%</span>
													{goal.target_date && (
														<span className='whitespace-nowrap'>
															By:{' '}
															{new Date(goal.target_date).toLocaleDateString()}
														</span>
													)}
													{goal.is_completed && (
														<span className='text-[#4CAF50] font-semibold'>
															✓ Completed
														</span>
													)}
												</div>
											</div>
											<div className='flex gap-2 flex-shrink-0'>
												<button
													onClick={() => startEditGoal(goal)}
													className='p-2 text-[#3A7AFE] hover:bg-[#3A7AFE]/10 rounded transition-colors duration-200'>
													<Edit2 className='h-4 w-4' />
												</button>
												<button
													onClick={() => handleDeleteGoal(goal.id)}
													className='p-2 text-[#DC2626] hover:bg-[#fef2f2] rounded transition-colors duration-200'>
													<Trash2 className='h-4 w-4' />
												</button>
											</div>
										</div>
										<div className='mt-3'>
											<div className='flex items-center justify-between mb-1 gap-2'>
												<span className='text-xs md:text-sm text-[#4B5563]'>
													Progress: {goal.current_value.toFixed(1)}% /{' '}
													{goal.target_value}%
												</span>
												<span className='text-xs md:text-sm font-semibold text-[#1C1C1C]'>
													{progress}%
												</span>
											</div>
											<div className='w-full bg-[#E5E7EB] rounded-full h-2 md:h-3'>
												<div
													className={`h-2 md:h-3 rounded-full transition-all ${
														goal.is_completed ? 'bg-[#4CAF50]' : 'bg-[#3A7AFE]'
													}`}
													style={{ width: `${progress}%` }}
												/>
											</div>
											{!goal.is_completed && (
												<div className='mt-2'>
													<input
														type='number'
														placeholder='Update progress'
														min='0'
														max={goal.target_value}
														step='0.1'
														className='w-full sm:w-32 p-2 border border-[#E5E7EB] rounded text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7AFE] focus:border-transparent'
														onKeyPress={(
															e: React.KeyboardEvent<HTMLInputElement>
														) => {
															if (e.key === 'Enter') {
																const value = parseFloat(e.currentTarget.value);
																if (!isNaN(value)) {
																	handleUpdateProgress(goal.id, value);
																	e.currentTarget.value = '';
																}
															}
														}}
													/>
												</div>
											)}
										</div>
									</motion.div>
								);
							})}
						</div>
					)}
				</motion.div>

				{/* Self-Reflection Journal */}
				<motion.div
					className='bg-white rounded-xl shadow-sm p-4 md:p-6 border border-[#E5E7EB]'
					variants={itemVariants}
					whileHover={{ y: -2, transition: { duration: 0.2 } }}>
					<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3'>
						<h2 className='text-xl md:text-2xl font-semibold text-[#1C1C1C] flex items-center gap-2'>
							<BookOpen className='h-5 w-5 md:h-6 md:w-6 text-[#3A7AFE]' />
							Self-Reflection Journal
						</h2>
						{!showJournalForm && (
							<motion.button
								onClick={() => {
									setJournalForm({ prompt: '', content: '' });
									setShowJournalForm(true);
								}}
								className='px-4 py-2 bg-[#3A7AFE] hover:bg-[#2E6AE8] text-white rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 text-sm md:text-base w-full sm:w-auto'
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}>
								<Plus className='h-4 w-4' />
								New Entry
							</motion.button>
						)}
					</div>

					{showJournalForm && (
						<form
							onSubmit={handleCreateJournal}
							className='mb-6 space-y-4 border-b pb-6'>
							<select
								value={journalForm.prompt}
								onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
									setJournalForm({ ...journalForm, prompt: e.target.value })
								}
								className='w-full p-2 md:p-3 border border-[#E5E7EB] rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#3A7AFE] focus:border-transparent'>
								<option value=''>Select a prompt (optional)</option>
								{journalPrompts.map((prompt, idx) => (
									<option key={idx} value={prompt}>
										{prompt}
									</option>
								))}
							</select>
							<textarea
								placeholder='Write your reflection here...'
								value={journalForm.content}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									setJournalForm({ ...journalForm, content: e.target.value })
								}
								className='w-full p-2 md:p-3 border border-[#E5E7EB] rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#3A7AFE] focus:border-transparent'
								rows={6}
								required
							/>
							<div className='flex flex-col sm:flex-row gap-2'>
								<button
									type='submit'
									className='px-4 py-2 bg-[#3A7AFE] hover:bg-[#2E6AE8] text-white rounded-lg transition-colors duration-200 text-sm md:text-base flex-1'>
									Save Entry
								</button>
								<button
									type='button'
									onClick={() => {
										setShowJournalForm(false);
										setJournalForm({ prompt: '', content: '' });
									}}
									className='px-4 py-2 bg-white hover:bg-[#F7F9FC] text-[#4B5563] border border-[#E5E7EB] rounded-lg transition-colors duration-200 text-sm md:text-base'>
									Cancel
								</button>
							</div>
						</form>
					)}

					{journalEntries.length === 0 ? (
						<div className='text-center py-8 text-[#4B5563]'>
							<p>No journal entries yet. Start reflecting on your journey!</p>
						</div>
					) : (
						<div className='space-y-4'>
							{journalEntries.map((entry, index) => (
								<motion.div
									key={entry.id}
									className='border border-[#E5E7EB] rounded-lg p-3 md:p-4 bg-white'
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										delay: index * 0.1,
										duration: 0.4,
										ease: 'easeOut'
									}}
									whileHover={{ y: -2, transition: { duration: 0.2 } }}>
									{entry.prompt && (
										<div className='text-xs md:text-sm font-semibold text-[#3A7AFE] mb-2'>
											{entry.prompt}
										</div>
									)}
									<p className='text-xs md:text-sm text-[#4B5563] whitespace-pre-wrap break-words'>
										{entry.content}
									</p>
									<div className='mt-3 flex items-center justify-between gap-2'>
										<span className='text-xs text-[#6b7280]'>
											{new Date(entry.entry_date).toLocaleDateString()}
										</span>
										<button
											onClick={() => handleDeleteJournal(entry.id)}
											className='text-xs text-[#DC2626] hover:text-[#b91c1c] transition-colors duration-200 px-2 py-1 hover:bg-[#fef2f2] rounded'>
											Delete
										</button>
									</div>
								</motion.div>
							))}
						</div>
					)}
				</motion.div>
			</motion.div>

			{/* Footer */}
			<Footer />
		</div>
	);
}
