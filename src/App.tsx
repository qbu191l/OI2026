import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimStep } from './types';
import { allAlgorithms } from './algorithms';
import CodeDisplay from './components/CodeDisplay';
import VariablePanel from './components/VariablePanel';
import ControlPanel from './components/ControlPanel';
import TreapVisualizer from './components/TreapVisualizer';
import GraphVisualizer from './components/GraphVisualizer';
import StepLog from './components/StepLog';

function App()
{
	const [selectedAlgo, setSelectedAlgo] = useState(0);
	const [inputText, setInputText] = useState(allAlgorithms[0].defaultInput);
	const [steps, setSteps] = useState<SimStep[]>([]);
	const [stepIdx, setStepIdx] = useState(-1);
	const [isRunning, setIsRunning] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [speed, setSpeed] = useState(800);
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
		const newSteps = algo.run(inputText);
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

	const treeAlgos = allAlgorithms.filter(a => a.category === 'tree');

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
							<p className="text-[10px] text-gray-500">Algorithm Visualizer — 平衡树专题</p>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-[1400px] mx-auto px-4 py-4">
				<div className="mb-4">
					<div className="flex flex-wrap gap-2 mb-3">
						<span className="text-xs text-gray-500 self-center mr-1">平衡树:</span>
						{treeAlgos.map((a) =>
						{
							const idx = allAlgorithms.indexOf(a);
							return (
								<button
									key={a.id}
									onClick={() => setSelectedAlgo(idx)}
									className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
										selectedAlgo === idx
											? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
											: 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
									}`}
								>
									{a.name}
								</button>
							);
						})}
					</div>

					<div className="bg-gray-800/40 rounded-lg border border-gray-700/50 px-4 py-2">
						<p className="text-xs text-gray-400">{algo.desc}</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
					<div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
						<div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
							<span className="text-xs text-gray-400 font-medium">📥 样例输入</span>
							<button
								onClick={handleRun}
								className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md transition-colors"
							>
								▶ 运行
							</button>
						</div>
						<textarea
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							className="w-full h-32 bg-gray-950 p-3 text-xs font-mono text-gray-300 placeholder-gray-700 focus:outline-none resize-none"
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
						{currentStep && algo.category === 'graph' && (
							<GraphVisualizer key={`gv-${stepIdx}`} step={currentStep} inputText={inputText} algoId={algo.id} />
						)}

						<VariablePanel step={currentStep} />

						{steps.length > 0 && (
							<StepLog steps={steps} currentIdx={stepIdx} />
						)}
					</div>
				</div>
			</main>

			<footer className="border-t border-gray-800 mt-8 py-3">
				<div className="max-w-[1400px] mx-auto px-4 text-center text-[10px] text-gray-600">
					算法可视化学习平台 — 平衡树专题
				</div>
			</footer>
		</div>
	);
}

export default App;
