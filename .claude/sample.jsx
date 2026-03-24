import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  Cpu, 
  Zap, 
  MessageSquare, 
  ArrowRight,
  Target,
  Settings,
  Layout,
  Database,
  Brain,
  Terminal,
  ChevronLeft,
  Share2,
  Download,
  GraduationCap,
  Layers,
  Award,
  ShieldCheck,
  List as ListIcon,
  GitBranch,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// --- Constants & Abstractions ---
const LLM_PROVIDERS = {
  OLLAMA: { name: 'Ollama (Local)', icon: Cpu },
  UPSTAGE: { name: 'Upstage (Cloud)', icon: Zap }
};

const ROLES = [
  { id: 'frontend', title: 'Frontend Architect', icon: Layout, desc: 'Modern UI/UX, React, Performance, WebAssembly' },
  { id: 'backend', title: 'Backend Engineer', icon: Terminal, desc: 'Microservices, Scalability, Distributed Systems' },
  { id: 'ai', title: 'AI Developer', icon: Brain, desc: 'LLM Fine-tuning, RAG, PyTorch, Vector DB' },
  { id: 'data', title: 'Data Scientist', icon: Database, desc: 'ETL Pipelines, ML Ops, Statistical Analysis' },
];

const LEVELS = [
  { id: 'beginner', title: 'Junior', icon: GraduationCap, desc: '기초 문법 및 핵심 도구 숙달' },
  { id: 'intermediate', title: 'Mid-Level', icon: Layers, desc: '아키텍처 설계 및 성능 최적화' },
  { id: 'expert', title: 'Senior/Lead', icon: Award, desc: '시스템 확장성 및 보안, 팀 리딩' },
];

// 난이도에 기반한 사고층 구조 (기초 -> 응용 -> 심화)
const MOCK_ROADMAPS = {
  beginner: {
    id: 'root',
    label: 'Backend 기초',
    children: [
      {
        id: 'lang',
        label: '언어 기초 (Core)',
        children: [
          { id: 'syntax', label: '문법과 타입 시스템', status: 'completed', missions: ['기본 데이터 타입 익히기', '제어문 활용'] },
          { id: 'func', label: '함수형 프로그래밍', status: 'current', missions: ['클로저와 고차함수', '함수 합성'] }
        ]
      },
      {
        id: 'web',
        label: '웹 통신 (Branch)',
        children: [
          { id: 'http', label: 'HTTP 프로토콜', status: 'pending', missions: ['요청/응답 구조 이해', '상태 코드 활용'] },
          { id: 'rest', label: 'RESTful API 설계', status: 'pending', missions: ['리소스 중심 설계', 'CRUD 인터페이스'] }
        ]
      }
    ]
  },
  intermediate: {
    id: 'root',
    label: 'Backend 중급',
    children: [
      {
        id: 'infra',
        label: '인프라 구축 (Core)',
        children: [
          { id: 'docker', label: 'Docker 컨테이너', status: 'completed', missions: ['이미지 빌드 및 최적화', '네트워크 구성'] },
          { id: 'k8s', label: 'Kubernetes 기초', status: 'current', missions: ['Pod/Deployment 개념', '서비스 노출'] }
        ]
      },
      {
        id: 'arch',
        label: '시스템 설계 (Branch)',
        children: [
          { id: 'msa', label: 'MSA 아키텍처', status: 'pending', missions: ['서비스 분리 전략', 'API 게이트웨이'] },
          { id: 'event', label: '이벤트 기반 설계', status: 'pending', missions: ['메시지 큐 활용', '비동기 워크플로우'] }
        ]
      }
    ]
  }
};

// --- Sub-Components ---

const ListViewNode = ({ node, depth = 0, onSelect, activeId }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isActive = activeId === node.id;

  return (
    <div className="w-full">
      <div 
        className={`flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer transition-all ${
          isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-slate-100 text-slate-700'
        }`}
        style={{ marginLeft: `${depth * 20}px` }}
        onClick={() => {
          onSelect(node);
          if (hasChildren) setIsOpen(!isOpen);
        }}
      >
        {hasChildren ? (
          isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        ) : (
          <div className="w-4" />
        )}
        
        {node.status === 'completed' ? (
          <CheckCircle size={18} className={isActive ? 'text-white' : 'text-green-500'} />
        ) : node.status === 'current' ? (
          <Circle size={18} className={`${isActive ? 'text-white' : 'text-blue-500'} animate-pulse`} />
        ) : (
          <Circle size={18} className="text-slate-300" />
        )}
        
        <span className="font-bold text-sm tracking-tight">{node.label}</span>
      </div>
      
      {hasChildren && isOpen && (
        <div className="mt-1">
          {node.children.map(child => (
            <ListViewNode 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              onSelect={onSelect} 
              activeId={activeId} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MindMapNode = ({ x, y, label, status, isActive, onClick }) => {
  const getColors = () => {
    if (status === 'completed') return { bg: '#22c55e', text: 'white', border: '#16a34a' };
    if (status === 'current') return { bg: '#3b82f6', text: 'white', border: '#2563eb' };
    return { bg: 'white', text: '#64748b', border: '#e2e8f0' };
  };

  const colors = getColors();

  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer" onClick={onClick}>
      <rect
        x="-75" y="-22" width="150" height="44" rx="22"
        fill={colors.bg}
        stroke={isActive ? '#3b82f6' : colors.border}
        strokeWidth={isActive ? '4' : '1'}
        className="shadow-md transition-all duration-300"
      />
      <text textAnchor="middle" dy=".3em" fontSize="12" fontWeight="700" fill={colors.text} className="select-none">{label}</text>
    </g>
  );
};

const MindMap = ({ data, onNodeClick, activeNodeId }) => {
  const width = 800;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;

  const renderNodes = () => {
    const elements = [];
    const mainBranches = data.children || [];
    const angleStep = (2 * Math.PI) / mainBranches.length;

    elements.push(
      <MindMapNode 
        key="root" x={centerX} y={centerY} label={data.label} 
        status="current" isActive={activeNodeId === 'root'} 
        onClick={() => onNodeClick(data)} 
      />
    );

    mainBranches.forEach((branch, i) => {
      const angle = i * angleStep;
      const bx = centerX + Math.cos(angle) * 180;
      const by = centerY + Math.sin(angle) * 120;

      elements.push(<line key={`l-b-${branch.id}`} x1={centerX} y1={centerY} x2={bx} y2={by} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />);
      elements.push(<MindMapNode key={branch.id} x={bx} y={by} label={branch.label} status={branch.status} isActive={activeNodeId === branch.id} onClick={() => onNodeClick(branch)} />);

      if (branch.children) {
        branch.children.forEach((leaf, j) => {
          const leafAngle = angle + (j - (branch.children.length - 1) / 2) * 0.5;
          const lx = bx + Math.cos(leafAngle) * 140;
          const ly = by + Math.sin(leafAngle) * 80;
          elements.push(<line key={`l-l-${leaf.id}`} x1={bx} y1={by} x2={lx} y2={ly} stroke="#e2e8f0" strokeWidth="1" />);
          elements.push(<MindMapNode key={leaf.id} x={lx} y={ly} label={leaf.label} status={leaf.status} isActive={activeNodeId === leaf.id} onClick={() => onNodeClick(leaf)} />);
        });
      }
    });
    return elements;
  };

  return (
    <div className="w-full h-full bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner overflow-hidden relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full p-10">{renderNodes()}</svg>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [step, setStep] = useState('role-selection'); 
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [viewMode, setViewMode] = useState('mindmap'); // mindmap, list
  const [provider, setProvider] = useState('UPSTAGE');
  const [useRAG, setUseRAG] = useState(true);
  const [activeNode, setActiveNode] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);

  const handleStartGeneration = () => {
    setStep('generating');
    setTimeout(() => {
      const data = MOCK_ROADMAPS[selectedLevel?.id] || MOCK_ROADMAPS.beginner;
      setRoadmapData(data);
      setStep('roadmap');
      setActiveNode(data.children[0].children[0]);
    }, 1500);
  };

  // --- Views ---

  if (step === 'role-selection') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-black text-slate-900 mb-2">커리어 패스 선택</h1>
        <p className="text-slate-500 mb-12">전문가로 성장하기 위한 첫 걸음을 떼어보세요.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
          {ROLES.map(role => (
            <button key={role.id} onClick={() => { setSelectedRole(role); setStep('level-selection'); }} className="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-blue-500 hover:shadow-2xl transition-all text-left group">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all"><role.icon size={32} /></div>
                <div><h3 className="text-xl font-bold mb-1">{role.title}</h3><p className="text-slate-500 text-sm leading-relaxed">{role.desc}</p></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'level-selection') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <button onClick={() => setStep('role-selection')} className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors"><ChevronLeft size={20}/> 뒤로 가기</button>
        <h1 className="text-4xl font-black text-slate-900 mb-2">현재 숙련도는 어느 정도인가요?</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-12">
          {LEVELS.map(level => (
            <button key={level.id} onClick={() => { setSelectedLevel(level); setStep('config'); }} className="bg-white p-10 rounded-[2.5rem] border-2 border-transparent hover:border-blue-500 hover:shadow-2xl transition-all flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all"><level.icon size={40} /></div>
              <h3 className="text-2xl font-bold mb-3">{level.title}</h3><p className="text-slate-500 text-sm">{level.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'config') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-xl border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl text-white"><selectedRole.icon size={24} /></div>
              <div><p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{selectedLevel.title} Level</p><h2 className="text-2xl font-black text-slate-900">{selectedRole.title}</h2></div>
            </div>
            <button onClick={() => setStep('level-selection')} className="text-xs font-bold text-slate-400 hover:text-slate-900 underline underline-offset-4">조건 변경</button>
          </div>
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(LLM_PROVIDERS).map(key => (
                <button key={key} onClick={() => setProvider(key)} className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${provider === key ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                  {React.createElement(LLM_PROVIDERS[key].icon, { size: 24 })}<span className="text-xs font-black">{LLM_PROVIDERS[key].name}</span>
                </button>
              ))}
            </div>
            <button onClick={handleStartGeneration} className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 group">로드맵 시각화 시작 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="relative mb-10"><div className="w-40 h-40 border-[6px] border-slate-50 border-t-blue-600 rounded-full animate-spin" /><div className="absolute inset-0 flex flex-col items-center justify-center"><Brain size={48} className="text-blue-600 animate-pulse mb-2" /></div></div>
        <h2 className="text-3xl font-black text-slate-900">{selectedLevel.title} 레벨 분석 중...</h2>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="h-20 border-b flex items-center justify-between px-10 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-2.5 rounded-2xl shadow-lg shadow-slate-200 cursor-pointer" onClick={() => setStep('role-selection')}><BookOpen size={24} className="text-white" /></div>
          <div><span className="font-black text-xl tracking-tight">AI Path</span></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-3"><div className="w-40 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-100"><div className="bg-gradient-to-r from-blue-500 to-green-400 h-full w-[42%]" /></div><span className="text-xs font-black text-slate-700">42%</span></div>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-2" />
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setViewMode('mindmap')} className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${viewMode === 'mindmap' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}>Mind Map</button>
            <button onClick={() => setViewMode('list')} className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}>List View</button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Visualization (Mindmap or List) */}
        <section className="flex-[1.4] p-10 flex flex-col overflow-hidden bg-slate-50/30">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              {viewMode === 'mindmap' ? <GitBranch className="text-blue-600" /> : <ListIcon className="text-blue-600" />}
              {viewMode === 'mindmap' ? '인터랙티브 마인드맵' : '커리큘럼 리스트'}
            </h2>
            <p className="text-slate-500 mt-2 font-medium">사고의 흐름에 따라 핵심(Core)에서 심화(Branch)로 기술을 확장하세요.</p>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {viewMode === 'mindmap' ? (
              <MindMap data={roadmapData} onNodeClick={setActiveNode} activeNodeId={activeNode?.id} />
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-inner h-full overflow-y-auto p-8 custom-scrollbar">
                <ListViewNode node={roadmapData} onSelect={setActiveNode} activeId={activeNode?.id} />
              </div>
            )}
          </div>
        </section>

        {/* Right: Content Section */}
        <section className="flex-1 border-l bg-white flex flex-col overflow-hidden">
          {activeNode ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="p-10 bg-slate-50/50 border-b">
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${activeNode.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{activeNode.status}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100">Step: {activeNode.id}</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-6 leading-tight">{activeNode.label}</h1>
                <p className="text-slate-500 font-medium leading-relaxed">이 단계는 전체 시스템의 뼈대를 이루는 핵심 개념입니다. 기초부터 탄탄히 다지는 미션을 수행하세요.</p>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                <div>
                  <h4 className="flex items-center gap-2 font-black text-slate-900 mb-6 uppercase tracking-wider text-sm"><Target size={18} className="text-blue-600" /> Learning Missions</h4>
                  <div className="space-y-4">
                    {(activeNode.missions || ['심화 개념 연구', '실무 케이스 스터디']).map((m, i) => (
                      <div key={i} className="flex items-start gap-5 p-6 bg-white rounded-3xl border border-slate-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group">
                        <div className="mt-1 w-6 h-6 rounded-lg border-2 border-slate-200 group-hover:border-blue-500 flex items-center justify-center transition-all"><CheckCircle size={14} className="text-blue-500 opacity-0 group-hover:opacity-100" /></div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative">
                  <div className="flex items-center gap-3 mb-8"><div className="p-2.5 bg-blue-600 rounded-xl"><MessageSquare size={20} /></div><h4 className="font-black">AI Master Tutor</h4></div>
                  <div className="bg-slate-800/50 p-5 rounded-2xl mb-8 text-sm font-medium border border-slate-800 tracking-tight">"{activeNode.label}"에 대해 궁금한 실무 적용 사례나 코드 예제가 필요한가요?</div>
                  <div className="relative">
                    <input type="text" placeholder="질문을 입력하세요..." className="w-full bg-slate-800/80 border-none rounded-2xl p-5 pr-14 text-sm font-medium focus:ring-2 focus:ring-blue-500" />
                    <button className="absolute right-2.5 top-2.5 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg"><ArrowRight size={20} /></button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-8"><Layout size={40} className="opacity-20" /></div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">탐험할 노드를 선택하세요</h3>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}