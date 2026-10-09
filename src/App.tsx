import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimStep } from './types';
import { allAlgorithms } from './algorithms';
import CodeDisplay from './components/CodeDisplay';
import VariablePanel from './components/VariablePanel';
import ControlPanel from './components/ControlPanel';
import TreapVisualizer from './components/TreapVisualizer';
import GraphVisualizer from './components/GraphVisualizer';
import StringVisualizer from './components/StringVisualizer';
import BITVisualizer from './components/BITVisualizer';
import SegTreeVisualizer from './components/SegTreeVisualizer';
import NetworkFlowVisualizer from './components/NetworkFlowVisualizer';
import TreeChainVisualizer from './components/TreeChainVisualizer';
import SAMVisualizer from './components/SAMVisualizer';
import GSAMVisualizer from './components/GSAMVisualizer';
import ACVisualizer from './components/ACVisualizer';
import TrieVisualizer from './components/TrieVisualizer';
import PruferVisualizer from './components/PruferVisualizer';
import TarjanSCCVisualizer from './components/TarjanSCCVisualizer';
import LCAVisualizer from './components/LCAVisualizer';
import SplayVisualizer from './components/SplayVisualizer';
import MatrixVisualizer from './components/MatrixVisualizer';
import StepLog from './components/StepLog';
import CommentSection from './components/CommentSection';
import { validateInput, validateSteps, DEFAULT_CONFIG } from './utils/validation';

function App()
{
	const [selectedAlgo, setSelectedAlgo] = useState(0);
	const [inputText, setInputText] = useState(allAlgorithms[0].defaultInput);
	const [steps, setSteps] = useState<SimStep[]>([]);
	const [stepIdx, setStepIdx] = useState(-1);
	const [isRunning, setIsRunning] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [speed, setSpeed] = useState(800);
	const [error, setError] = useState<string | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const algo = allAlgorithms[selectedAlgo];
	const currentStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

	useEffect(() =>
	{
		setInputText(allAlgorithms[selectedAlgo].defaultInput);
		setSteps([]);
		setStepIdx(-1);
		setIsRunning(false);
		setIsPaused(false);
	}, [selectedAlgo]);

	useEffect(() =>
	{
		if (isRunning && !isPaused && stepIdx < steps.length - 1)
		{
			timerRef.current = setTimeout(() =>
			{
				setStepIdx(prev => prev + 1);
			}, speed);
		}
		else if (stepIdx >= steps.length - 1 && isRunning)
		{
			setIsRunning(false);
			setIsPaused(false);
		}
		return () =>
		{
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [isRunning, isPaused, stepIdx, steps.length, speed]);

	const handleRun = useCallback(() =>
	{
		setError(null);

		// 1. 验证输入
		const inputValidation = validateInput(inputText, DEFAULT_CONFIG);
		if (!inputValidation.valid)
		{
			setError(inputValidation.error || '输入验证失败');
			return;
		}

		// 2. 执行算法（带超时保护）
		const startTime = performance.now();
		let newSteps: SimStep[];

		try
		{
			newSteps = algo.run(inputText);
		}
		catch (e)
		{
			setError(`算法执行出错: ${e instanceof Error ? e.message : '未知错误'}`);
			return;
		}

		const executionTime = performance.now() - startTime;

		// 3. 检查执行时间
		if (executionTime > DEFAULT_CONFIG.maxExecutionTime)
		{
			setError(`执行时间过长（${(executionTime / 1000).toFixed(2)}秒），请减小输入规模`);
			return;
		}

		// 4. 验证步骤数
		const stepsValidation = validateSteps(newSteps, DEFAULT_CONFIG);
		if (!stepsValidation.valid)
		{
			setError(stepsValidation.error || '步骤数验证失败');
			return;
		}

		setSteps(newSteps);
		setStepIdx(0);
		setIsRunning(true);
		setIsPaused(false);
	}, [algo, inputText]);

	const handlePlay = () =>
	{
		if (steps.length === 0)
		{
			handleRun();
		}
		else if (stepIdx >= steps.length - 1)
		{
			setStepIdx(0);
			setIsRunning(true);
			setIsPaused(false);
		}
		else
		{
			setIsPaused(false);
		}
	};

	const handlePause = () => setIsPaused(true);
	const handleNext = () => { setIsRunning(false); setIsPaused(false); if (stepIdx < steps.length - 1) setStepIdx(p => p + 1); };
	const handlePrev = () => { setIsRunning(false); setIsPaused(false); if (stepIdx > 0) setStepIdx(p => p - 1); };
	const handleReset = () => { setIsRunning(false); setIsPaused(false); setStepIdx(-1); setSteps([]); };
	const handleFF = () => { setIsRunning(true); setIsPaused(false); };
	const handleSeek = (step: number) => { setIsRunning(false); setIsPaused(false); setStepIdx(step); };

	const mathAlgos = allAlgorithms.filter(a => a.category === 'math');
	const graphAlgos = allAlgorithms.filter(a => a.category === 'graph');
	const treeAlgos = allAlgorithms.filter(a => a.category === 'tree');
	const stringAlgos = allAlgorithms.filter(a => a.category === 'string');
	const dpAlgos = allAlgorithms.filter(a => a.category === 'dp');

	const categoryConfig =
	{
		math: { label: '数学', color: 'emerald', icon: '🔢' },
		graph: { label: '图论', color: 'indigo', icon: '🔗' },
		tree: { label: '树论', color: 'purple', icon: '🌳' },
		string: { label: '字符串', color: 'cyan', icon: '📝' },
		dp: { label: '动态规划', color: 'rose', icon: '📊' },
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-950 text-white">
			<header className="border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm sticky top-0 z-50">
				<div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold">
							Σ
						</div>
						<div>
							<h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
								算法可视化学习平台
							</h1>
							<p className="text-[10px] text-gray-500">Algorithm Visualizer — 支持 {allAlgorithms.length} 种经典算法</p>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-[1400px] mx-auto px-4 py-4">
				{/* 算法选择区域 */}
				<div className="mb-4 space-y-3">
					{Object.entries(categoryConfig).map(([category, config]) =>
					{
						const algos = allAlgorithms.filter(a => a.category === category);
						if (algos.length === 0) return null;

						return (
							<div key={category} className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-3">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-sm">{config.icon}</span>
									<h3 className="text-xs font-semibold text-gray-300">{config.label}</h3>
									<span className="text-[10px] text-gray-500">({algos.length})</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{algos.map((a) =>
									{
										const idx = allAlgorithms.indexOf(a);
										const isSelected = selectedAlgo === idx;
										const colorClasses =
										{
											math: isSelected ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'hover:bg-emerald-600/20 hover:text-emerald-300',
											graph: isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-indigo-600/20 hover:text-indigo-300',
											tree: isSelected ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'hover:bg-purple-600/20 hover:text-purple-300',
											string: isSelected ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'hover:bg-cyan-600/20 hover:text-cyan-300',
											dp: isSelected ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'hover:bg-rose-600/20 hover:text-rose-300',
										};

										return (
											<button
												key={a.id}
												onClick={() => setSelectedAlgo(idx)}
												className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-gray-800 text-gray-400 border border-gray-700 ${colorClasses[category as keyof typeof colorClasses]}`}
											>
												{a.name}
											</button>
										);
									})}
								</div>
							</div>
						);
					})}

					<div className="bg-gray-800/40 rounded-lg border border-gray-700/50 px-4 py-2">
						<p className="text-xs text-gray-400">{algo.desc}</p>
					</div>
				</div>

				{/* 错误提示 */}
				{error && (
					<div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
						<div className="flex items-start justify-between">
							<div className="flex items-start gap-2">
								<span className="text-red-400 text-lg">⚠️</span>
								<div>
									<h3 className="text-sm font-semibold text-red-400 mb-1">输入验证失败</h3>
									<p className="text-xs text-red-300">{error}</p>
								</div>
							</div>
							<button
								onClick={() => setError(null)}
								className="text-red-400 hover:text-red-300 text-lg"
							>
								×
							</button>
						</div>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
					<div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
						<div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
							<span className="text-xs text-gray-400 font-medium">📥 样例输入</span>
							<div className="flex items-center gap-2">
								<span className="text-[10px] text-gray-500">
									{inputText.length} / {DEFAULT_CONFIG.maxInputSize} 字符
								</span>
								<button
									onClick={handleRun}
									className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md transition-colors"
								>
									▶ 运行
								</button>
							</div>
						</div>
						<textarea
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							className={`w-full h-32 bg-gray-950 p-3 text-xs font-mono text-gray-300 placeholder-gray-700 focus:outline-none resize-none ${
								inputText.length > DEFAULT_CONFIG.maxInputSize ? 'border-red-500' : ''
							}`}
							placeholder="粘贴题目输入数据..."
							spellCheck={false}
						/>
					</div>

					<ControlPanel
						isRunning={isRunning}
						isPaused={isPaused}
						stepIdx={stepIdx}
						totalSteps={steps.length}
						speed={speed}
						onPlay={handlePlay}
						onPause={handlePause}
						onNext={handleNext}
						onPrev={handlePrev}
						onReset={handleReset}
						onFastForward={handleFF}
						onSpeed={setSpeed}
						onSeek={handleSeek}
					/>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
					<div className="lg:col-span-6">
						<CodeDisplay code={algo.code} currentLine={currentStep?.line || 0} />
					</div>

					<div className="lg:col-span-6 space-y-4">
						{currentStep && (
							<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
								<div className="flex items-center justify-between mb-2">
									<h3 className="text-xs font-semibold text-gray-300 flex items-center gap-2">
										<span>💬</span> 当前步骤
									</h3>
									<span className="text-[10px] bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded-full">
										行 {currentStep.line}
									</span>
								</div>
								<p className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
									{currentStep.desc}
								</p>
							</div>
						)}

						{currentStep && (algo.id === 'treap' || algo.id === 'fhq-treap') && (
							<TreapVisualizer key={`tp-${stepIdx}`} step={currentStep} algoId={algo.id} />
						)}
						{currentStep && ['ek', 'dinic', 'hlpp', 'mcmf'].includes(algo.id) && (
							<NetworkFlowVisualizer key={`nf-${stepIdx}`} step={currentStep} inputText={inputText} algoId={algo.id} />
						)}
						{currentStep && algo.category === 'graph' && !['ek', 'dinic', 'hlpp', 'mcmf'].includes(algo.id) && (
							<GraphVisualizer key={`gv-${stepIdx}`} step={currentStep} inputText={inputText} algoId={algo.id} />
						)}
						{currentStep && algo.category === 'string' && (
							<StringVisualizer key={`sv-${stepIdx}`} step={currentStep} inputText={inputText} algoId={algo.id} />
						)}
						{currentStep && algo.id === 'bit' && (
							<BITVisualizer key={`bit-${stepIdx}`} step={currentStep} />
						)}
						{currentStep && algo.id === 'segtree' && (
							<SegTreeVisualizer key={`seg-${stepIdx}`} step={currentStep} />
						)}
						{currentStep && algo.id === 'treechain' && (
							<TreeChainVisualizer key={`tc-${stepIdx}`} step={currentStep} inputText={inputText} />
						)}
						{currentStep && algo.id === 'sam' && (
							<SAMVisualizer key={`sam-${stepIdx}`} step={currentStep} inputText={inputText} />
						)}
						{currentStep && algo.id === 'gsam' && (
							<GSAMVisualizer key={`gsam-${stepIdx}`} step={currentStep} inputText={inputText} />
						)}
						{currentStep && algo.id === 'acautomaton' && (
							<ACVisualizer key={`ac-${stepIdx}`} step={currentStep} inputText={inputText} />
						)}
						{currentStep && algo.id === 'trie' && (
							<TrieVisualizer key={`trie-${stepIdx}`} step={currentStep} inputText={inputText} algoId={algo.id} />
						)}
						{currentStep && algo.id === 'prufer' && (
							<PruferVisualizer key={`pr-${stepIdx}`} step={currentStep} inputText={inputText} />
						)}
						{currentStep && algo.id === 'tarjanscc' && (
							<TarjanSCCVisualizer key={`tsc-${stepIdx}`} step={currentStep} inputText={inputText} />
						)}
						{currentStep && (algo.id === 'lca-binary-lifting' || algo.id === 'lcatarjan') && (
							<LCAVisualizer key={`lca-${stepIdx}`} step={currentStep} inputText={inputText} />
						)}
						{currentStep && algo.id === 'splay' && (
							<SplayVisualizer key={`sp-${stepIdx}`} step={currentStep} />
						)}
						{currentStep && algo.id === 'gauss' && (
							<MatrixVisualizer key={`matrix-${stepIdx}`} step={currentStep} />
						)}

						<VariablePanel step={currentStep} />

						{steps.length > 0 && (
							<StepLog steps={steps} currentIdx={stepIdx} />
						)}
					</div>
				</div>
				{/* 评论区 */}
				<CommentSection algoId={algo.id} algoName={algo.name} />
			</main>

			<footer className="border-t border-gray-800 mt-8 py-3">
				<div className="max-w-[1400px] mx-auto px-4 text-center text-[10px] text-gray-600">
					算法可视化学习平台 — 支持 {allAlgorithms.length} 种经典算法的动态模拟演示
				</div>
			</footer>		</div>
	);
}

export default App;
