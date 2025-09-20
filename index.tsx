
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPE DEFINITIONS ---
interface CtaData {
    message: string;
    buttonText: string;
    buttonUrl: string;
    position: 'bottom-left' | 'bottom-right' | 'bottom-banner' | 'custom';
    theme: 'light' | 'dark';
    bgColor: string;
    btnColor: string;
    profileImageUrl?: string;
    // New Canva-like features
    fontFamily: string;
    fontSize: number;
    scale: number;
    cornerRadius: number;
    customPosition?: { x: number; y: number };
}

type LinkPayload = 
    | { type: 'single'; data: CtaData & { targetUrl: string } }
    | { type: 'ab'; targetUrl: string, variants: [CtaData, CtaData] };

interface AISuggestion {
    message: string;
    buttonText: string;
}

// --- API & UTILS ---
let ai: GoogleGenAI | null = null;
try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
} catch (e) {
    console.error("Failed to initialize GoogleGenAI. Please check API_KEY.", e);
}


// --- CORE COMPONENTS ---

/**
 * The main CTA visual component. Used in both preview and the final viewer.
 */
const CtaComponent = ({ 
    data, 
    isEditable = false, 
    editingElement, 
    onStartEdit, 
    onUpdateText,
    onFinishEdit
}: { 
    data: Partial<CtaData>,
    isEditable?: boolean,
    editingElement?: string | null,
    onStartEdit?: (element: 'message' | 'buttonText') => void,
    onUpdateText?: (element: 'message' | 'buttonText', text: string) => void,
    onFinishEdit?: () => void
}) => {
    const themeStyles = data.theme === 'dark' 
        ? { color: '#ffffff', logoFilter: 'brightness(0) invert(1)', containerClass: 'cta-dark' } 
        : { color: '#1c1e21', logoFilter: '', containerClass: 'cta-light' };

    const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            onFinishEdit?.();
        }
    };
    
    // FIX: Extended React.CSSProperties to include the custom property '--cta-scale', resolving a TypeScript error on line 76.
    const containerStyle: React.CSSProperties & { '--cta-scale': number } = {
        backgroundColor: data.bgColor || '#ffffff',
        fontFamily: data.fontFamily || "'Inter', sans-serif",
        borderRadius: `${data.cornerRadius ?? 8}px`,
        '--cta-scale': data.scale ?? 1,
    };

    if (data.position === 'custom' && data.customPosition) {
        containerStyle.position = 'absolute';
        containerStyle.left = `${data.customPosition.x}px`;
        containerStyle.top = `${data.customPosition.y}px`;
        containerStyle.bottom = 'auto'; // override default position
        containerStyle.right = 'auto'; // override default position
    }


    return (
        <div 
            className={`cta-container cta-position-${data.position || 'bottom-left'} ${themeStyles.containerClass}`}
            style={containerStyle}
        >
            {data.profileImageUrl ? (
                 <img src={data.profileImageUrl} alt="Profile" className="cta-profile-img" />
            ) : (
                <div className="cta-logo" style={{ filter: themeStyles.logoFilter }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.468 3.823a4.072 4.072 0 0 1 5.21 5.21L13 14.732l-5.678-5.677L13.468 3.823Zm-1.616 9.19L3 14.732l5.677 5.678a4.072 4.072 0 0 0 5.21 0l.488-.488L5.94 11.488l6.912 1.523Z" fill="#1877F2"></path></svg>
                </div>
            )}
             {isEditable && editingElement === 'message' ? (
                <input
                    type="text"
                    value={data.message}
                    onChange={e => onUpdateText?.('message', e.target.value)}
                    onBlur={onFinishEdit}
                    onKeyDown={handleTextKeyDown}
                    className="cta-inline-edit"
                    autoFocus
                />
            ) : (
                <p 
                    className="cta-message" 
                    style={{ color: themeStyles.color, fontSize: `${data.fontSize ?? 14}px` }}
                    onDoubleClick={() => isEditable && onStartEdit?.('message')}
                >
                    {data.message || 'Ваше сообщение здесь...'}
                </p>
            )}
             {isEditable && editingElement === 'buttonText' ? (
                <input
                    type="text"
                    value={data.buttonText}
                    onChange={e => onUpdateText?.('buttonText', e.target.value)}
                    onBlur={onFinishEdit}
                    onKeyDown={handleTextKeyDown}
                    className="cta-inline-edit cta-inline-edit-button"
                    autoFocus
                />
            ) : (
                <a
                    href={data.buttonUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button"
                    style={{ 
                        backgroundColor: data.btnColor || '#1877F2',
                        borderRadius: `${data.cornerRadius ?? 8}px`,
                        fontSize: `${data.fontSize ?? 14}px`
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={() => isEditable && onStartEdit?.('buttonText')}
                >
                    {data.buttonText || 'Кнопка'}
                </a>
            )}
        </div>
    );
};

const AnalyticsView = () => (
    <div className="analytics-view">
        <div className="analytics-header">
            <h2>Аналитика</h2>
            <p>Отслеживайте эффективность ваших ссылок. <span>(Это демонстрация)</span></p>
        </div>
        <div className="stats-grid">
            <div className="stat-card">
                <h3>Всего показов</h3>
                <p>1,250,304</p>
                <span className="stat-change positive">+12.5%</span>
            </div>
            <div className="stat-card">
                <h3>Всего кликов</h3>
                <p>87,521</p>
                <span className="stat-change positive">+8.2%</span>
            </div>
            <div className="stat-card">
                <h3>CTR</h3>
                <p>7.00%</p>
                <span className="stat-change negative">-0.3%</span>
            </div>
        </div>
        <div className="chart-container">
            <h3>Активность за последние 30 дней</h3>
            <div className="chart">
                {[...Array(30)].map((_, i) => (
                    <div key={i} className="chart-bar" style={{ height: `${Math.random() * 80 + 15}%` }} title={`День ${i+1}`}></div>
                ))}
            </div>
        </div>
    </div>
);


const Slider = ({ label, value, onChange, min, max, step, unit }: { label: string, value: number, onChange: (v: number) => void, min: number, max: number, step: number, unit: string }) => (
    <div className="form-group">
        <label>{label}: <span>{value}{unit}</span></label>
        <input 
            type="range" 
            min={min} 
            max={max} 
            step={step} 
            value={value} 
            onChange={e => onChange(parseFloat(e.target.value))} 
        />
    </div>
);

const CtaForm = ({ data, setData, onGenerateAI }: { data: CtaData, setData: React.Dispatch<React.SetStateAction<CtaData>>, onGenerateAI: () => void }) => {
    const updateData = (field: keyof CtaData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <>
            <div className="form-group">
                <label htmlFor="profileImageUrl">URL изображения профиля (необязательно)</label>
                <input id="profileImageUrl" type="url" placeholder="https://your-site.com/logo.png" value={data.profileImageUrl} onChange={e => updateData('profileImageUrl', e.target.value)} />
            </div>
            <div className="form-group">
                <div className="label-with-action">
                    <label htmlFor="message">Сообщение (CTA)</label>
                    <button className="ai-button" onClick={onGenerateAI} title="Сгенерировать с помощью ИИ">✨ ИИ</button>
                </div>
                <input id="message" type="text" placeholder="Ваше сообщение..." value={data.message} onChange={e => updateData('message', e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="buttonText">Текст кнопки</label>
                <input id="buttonText" type="text" placeholder="Текст на кнопке" value={data.buttonText} onChange={e => updateData('buttonText', e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="buttonUrl">URL кнопки</label>
                <input id="buttonUrl" type="url" placeholder="https://your-brand.com" value={data.buttonUrl} onChange={e => updateData('buttonUrl', e.target.value)} />
            </div>
            <div className="form-group">
                <label>Позиция</label>
                <div className="radio-group">
                    <button className={data.position === 'bottom-left' ? 'active' : ''} onClick={() => updateData('position', 'bottom-left')}>Слева</button>
                    <button className={data.position === 'bottom-right' ? 'active' : ''} onClick={() => updateData('position', 'bottom-right')}>Справа</button>
                     <button className={data.position === 'bottom-banner' ? 'active' : ''} onClick={() => updateData('position', 'bottom-banner')}>Баннер</button>
                     <button className={data.position === 'custom' ? 'active' : ''} disabled>Перетащи</button>
                </div>
            </div>
             <div className="form-group">
                <label>Тема</label>
                <div className="radio-group">
                    <button className={data.theme === 'light' ? 'active' : ''} onClick={() => updateData('theme', 'light')}>Светлая</button>
                    <button className={data.theme === 'dark' ? 'active' : ''} onClick={() => updateData('theme', 'dark')}>Темная</button>
                </div>
            </div>
            <div className="form-group color-group">
                <div>
                    <label htmlFor="bgColor">Цвет фона</label>
                    <input id="bgColor" type="color" value={data.bgColor} onChange={e => updateData('bgColor', e.target.value)} />
                </div>
                <div>
                    <label htmlFor="btnColor">Цвет кнопки</label>
                    <input id="btnColor" type="color" value={data.btnColor} onChange={e => updateData('btnColor', e.target.value)} />
                </div>
            </div>
            <div className="form-divider">Продвинутый стиль</div>
            <div className="form-group">
                <label htmlFor="fontFamily">Шрифт</label>
                <select id="fontFamily" className="font-select" value={data.fontFamily} onChange={e => updateData('fontFamily', e.target.value)}>
                    <option style={{fontFamily: "'Inter', sans-serif"}} value="'Inter', sans-serif">Inter</option>
                    <option style={{fontFamily: "'Poppins', sans-serif"}} value="'Poppins', sans-serif">Poppins</option>
                    <option style={{fontFamily: "'Roboto', sans-serif"}} value="'Roboto', sans-serif">Roboto</option>
                    <option style={{fontFamily: "'Lora', serif"}} value="'Lora', serif">Lora</option>
                    <option style={{fontFamily: "'Playfair Display', serif"}} value="'Playfair Display', serif">Playfair Display</option>
                </select>
            </div>
            <Slider label="Размер шрифта" value={data.fontSize} onChange={v => updateData('fontSize', v)} min={10} max={24} step={1} unit="px" />
            <Slider label="Масштаб" value={data.scale} onChange={v => updateData('scale', v)} min={0.8} max={1.5} step={0.05} unit="x" />
            <Slider label="Скругление углов" value={data.cornerRadius} onChange={v => updateData('cornerRadius', v)} min={0} max={30} step={1} unit="px" />
        </>
    );
}

const AISuggestionsModal = ({ suggestions, onSelect, onClose, isLoading }: { suggestions: AISuggestion[], onSelect: (suggestion: AISuggestion) => void, onClose: () => void, isLoading: boolean }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>✨ AI Предложения</h3>
            {isLoading ? (
                <div className="loading-spinner"></div>
            ) : suggestions.length > 0 ? (
                <ul>
                    {suggestions.map((s, i) => (
                        <li key={i}>
                            <div className="suggestion-text">
                                <p><strong>Сообщение:</strong> {s.message}</p>
                                <p><strong>Текст кнопки:</strong> {s.buttonText}</p>
                            </div>
                            <button onClick={() => onSelect(s)}>Использовать</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Не удалось сгенерировать предложения. Попробуйте другой URL.</p>
            )}
            <button className="modal-close-btn" onClick={onClose}>Закрыть</button>
        </div>
    </div>
);


/**
 * The view for creating and configuring the CTA.
 */
const CreatorView = () => {
    const initialCtaData: CtaData = {
        message: 'Продвигайте свой бренд с каждой ссылкой!',
        buttonText: 'Узнать больше',
        buttonUrl: '',
        position: 'bottom-left',
        theme: 'light',
        bgColor: '#ffffff',
        btnColor: '#1877f2',
        profileImageUrl: '',
        fontFamily: "'Inter', sans-serif",
        fontSize: 14,
        scale: 1,
        cornerRadius: 8,
    };
    
    const [targetUrl, setTargetUrl] = useState('');
    const [data, setData] = useState<CtaData>(initialCtaData);
    const [variantA, setVariantA] = useState<CtaData>({...initialCtaData, message: 'Вариант А: Привлекайте новых клиентов!'});
    const [variantB, setVariantB] = useState<CtaData>({...initialCtaData, message: 'Вариант Б: Увеличьте свои продажи!', btnColor: '#f2184f', position: 'bottom-right'});
    const [activeAbVariant, setActiveAbVariant] = useState<'A' | 'B'>('A');

    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('create');
    
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewError, setPreviewError] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Canva-like editor state
    const [editingElement, setEditingElement] = useState<null | 'message' | 'buttonText'>(null);
    const dragData = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });
    const previewPanelRef = useRef<HTMLDivElement>(null);


    const handleGenerateLink = () => {
        if (!targetUrl) {
            alert('Пожалуйста, заполните "Целевой URL".');
            return;
        }

        let payload: LinkPayload;

        if(activeTab === 'create') {
             if (!data.buttonUrl) {
                alert('Пожалуйста, заполните "URL кнопки".');
                return;
            }
            payload = { type: 'single', data: { ...data, targetUrl } };
        } else { // A/B Test
             if (!variantA.buttonUrl || !variantB.buttonUrl) {
                alert('Пожалуйста, заполните "URL кнопки" для обоих вариантов.');
                return;
            }
            payload = { type: 'ab', targetUrl, variants: [variantA, variantB] };
        }

        const jsonString = JSON.stringify(payload);
        const encodedData = btoa(jsonString);
        const link = `${window.location.origin}${window.location.pathname}#${encodedData}`;
        setGeneratedLink(link);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const handleGenerateSuggestions = async () => {
        if (!ai) {
            alert("Сервис AI не инициализирован.");
            return;
        }
        const currentData = activeTab === 'create' ? data : (activeAbVariant === 'A' ? variantA : variantB);
        if (!targetUrl || !currentData.buttonUrl) {
            alert('Пожалуйста, укажите "Целевой URL" и "URL кнопки" для генерации предложений.');
            return;
        }
        
        setIsModalOpen(true);
        setIsAiLoading(true);
        setAiSuggestions([]);

        try {
            const prompt = `You are a marketing copywriter expert. Analyze the webpage at the URL "${targetUrl}". Based on its content, suggest 3 compelling and concise Call-To-Action (CTA) messages. For each message, also provide a short, motivating button text. The button will link to "${currentData.buttonUrl}". The goal is to maximize user clicks.`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            suggestions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        message: { type: Type.STRING, description: 'The compelling CTA message text.' },
                                        buttonText: { type: Type.STRING, description: 'The motivating button text.' }
                                    },
                                    required: ["message", "buttonText"]
                                }
                            }
                        }
                    }
                }
            });
            const json = JSON.parse(response.text);
            setAiSuggestions(json.suggestions || []);
// FIX: Corrected syntax for catch block. The `=>` is invalid here.
        } catch (error) {
            console.error("AI suggestion generation failed:", error);
            setAiSuggestions([]);
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const applySuggestion = (suggestion: AISuggestion) => {
        const currentSetData = activeTab === 'create' ? setData : (activeAbVariant === 'A' ? setVariantA : setVariantB);
        currentSetData(prev => ({ ...prev, ...suggestion }));
        setIsModalOpen(false);
    };
    
    // --- Direct Manipulation Handlers ---
    
    const handleStartEdit = (element: 'message' | 'buttonText') => {
        setEditingElement(element);
    };

    const handleUpdateText = (element: 'message' | 'buttonText', text: string) => {
         const currentSetData = activeTab === 'create' ? setData : (activeAbVariant === 'A' ? setVariantA : setVariantB);
         currentSetData(prev => ({ ...prev, [element]: text }));
    };
    
    const handleFinishEdit = () => {
        setEditingElement(null);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (editingElement) return; // Don't drag while editing text

        const target = e.currentTarget;
        const currentSetData = activeTab === 'create' ? setData : (activeAbVariant === 'A' ? setVariantA : setVariantB);
        const currentData = activeTab === 'create' ? data : (activeAbVariant === 'A' ? variantA : variantB);

        currentSetData(prev => ({...prev, position: 'custom'}));

        dragData.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initialX: target.offsetLeft,
            initialY: target.offsetTop
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragData.current.isDragging || !previewPanelRef.current) return;
        
        const dx = e.clientX - dragData.current.startX;
        const dy = e.clientY - dragData.current.startY;

        const previewRect = previewPanelRef.current.getBoundingClientRect();
        
        const currentSetData = activeTab === 'create' ? setData : (activeAbVariant === 'A' ? setVariantA : setVariantB);

        currentSetData(prev => {
             const newX = dragData.current.initialX + dx;
             const newY = dragData.current.initialY + dy;
             // a bit of clamping to stay within view, this could be improved
             const clampedX = Math.max(0, Math.min(newX, previewRect.width - (prev.scale * 300))); // assuming avg width
             const clampedY = Math.max(0, Math.min(newY, previewRect.height - (prev.scale * 60))); // assuming avg height
             return { ...prev, customPosition: { x: clampedX, y: clampedY } };
        });
    };

    const handleMouseUp = () => {
        dragData.current.isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'analytics':
                return <AnalyticsView />;
            case 'ab-test':
            case 'create':
            default:
                const isAbTest = activeTab === 'ab-test';
                const currentData = isAbTest ? (activeAbVariant === 'A' ? variantA : variantB) : data;
                const currentSetData = isAbTest ? (activeAbVariant === 'A' ? setVariantA : setVariantB) : setData;

                return (
                    <main className="creator-main">
                        <div className="form-panel">
                             <div className="form-group">
                                <label htmlFor="targetUrl">Целевой URL</label>
                                <input id="targetUrl" type="url" placeholder="https://example.com/article" value={targetUrl} onChange={e => { setTargetUrl(e.target.value); setPreviewError(false); }} />
                                <button className="preview-update-btn" onClick={() => setPreviewUrl(targetUrl)}>Обновить предпросмотр</button>
                            </div>

                            {isAbTest && (
                                <div className="ab-variant-switcher">
                                    <button className={activeAbVariant === 'A' ? 'active' : ''} onClick={() => setActiveAbVariant('A')}>Вариант А</button>
                                    <button className={activeAbVariant === 'B' ? 'active' : ''} onClick={() => setActiveAbVariant('B')}>Вариант B</button>
                                </div>
                            )}
                            <CtaForm data={currentData} setData={currentSetData} onGenerateAI={handleGenerateSuggestions} />
                            <button className="generate-btn" onClick={handleGenerateLink}>Сгенерировать ссылку</button>
                            {generatedLink && (
                                <div className="generated-link-container">
                                    <input type="text" readOnly value={generatedLink} />
                                    <button onClick={handleCopy}>{copied ? 'Скопировано!' : 'Копировать'}</button>
                                </div>
                            )}
                        </div>
                        <div className="preview-panel" ref={previewPanelRef}>
                            <div className="preview-header">Предпросмотр {isAbTest && `(Вариант ${activeAbVariant})`}</div>
                            <div className="preview-content">
                               {previewError ? (
                                    <div className="preview-error">
                                        <p>Не удалось загрузить предпросмотр.</p>
                                        <span>Этот сайт запрещает встраивание на другие страницы. Ваша ссылка будет работать корректно.</span>
                                    </div>
                               ) : previewUrl ? (
                                    <iframe 
                                        src={previewUrl}
                                        className="preview-iframe"
                                        title="Live Preview"
                                        sandbox="allow-scripts allow-same-origin"
                                        onError={() => setPreviewError(true)}
                                    ></iframe>
                               ) : (
                                    <div className="preview-bg"></div>
                               )}
                                <div 
                                    className={`cta-wrapper ${dragData.current.isDragging ? 'dragging' : ''}`} 
                                    onMouseDown={handleMouseDown}
                                    style={ currentData.position === 'custom' && currentData.customPosition ? { 
                                            position: 'absolute', 
                                            left: 0, top: 0, // Wrapper is at top-left
                                            transform: `translate(${currentData.customPosition.x}px, ${currentData.customPosition.y}px)`,
                                        } : {} }
                                >
                                    <CtaComponent 
                                        data={currentData}
                                        isEditable={true}
                                        editingElement={editingElement}
                                        onStartEdit={handleStartEdit}
                                        onUpdateText={handleUpdateText}
                                        onFinishEdit={handleFinishEdit}
                                    />
                                </div>
                            </div>
                        </div>
                    </main>
                )
        }
    }

    return (
        <div className="creator-wrapper">
             {isModalOpen && <AISuggestionsModal suggestions={aiSuggestions} isLoading={isAiLoading} onSelect={applySuggestion} onClose={() => setIsModalOpen(false)} />}
            <header className="creator-header">
                <h1>Link Brandyler</h1>
                <p>Добавьте свой призыв к действию на любую страницу в интернете.</p>
            </header>
            <div className="creator-tabs">
                <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>Создать</button>
                <button className={activeTab === 'ab-test' ? 'active' : ''} onClick={() => setActiveTab('ab-test')}>A/B Тесты</button>
                <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>Аналитика</button>
            </div>
            {renderContent()}
        </div>
    );
};

/**
 * The view for displaying the target page with the CTA overlay.
 */
const ViewerView = ({ encodedData }: { encodedData: string }) => {
    const [data, setData] = useState<(CtaData & { targetUrl: string }) | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const decodedString = atob(encodedData);
            const payload: LinkPayload = JSON.parse(decodedString);
            
            if (payload.type === 'single') {
                setData(payload.data);
            } else if (payload.type === 'ab') {
                const chosenVariant = payload.variants[Math.floor(Math.random() * payload.variants.length)];
                setData({ ...chosenVariant, targetUrl: payload.targetUrl });
            } else {
                 throw new Error('Invalid payload type');
            }

        } catch (e) {
            setError('Неверная или поврежденная ссылка.');
            console.error("Failed to decode or parse data:", e);
        }
    }, [encodedData]);

    if (error) {
        return <div className="error-view">{error}</div>;
    }

    if (!data) {
        return <div className="loading-view">Загрузка...</div>;
    }

    return (
        <div className="viewer-wrapper">
            <iframe 
                src={data.targetUrl} 
                className="viewer-iframe" 
                title="Target Content"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            ></iframe>
            <CtaComponent data={data} />
        </div>
    );
};

/**
 * Main App component that routes between Creator and Viewer.
 */
const App = () => {
    const [hash, setHash] = useState(window.location.hash.substring(1));

    useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash.substring(1));
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    return (
        <>
            <GlobalStyles />
            {hash ? <ViewerView encodedData={hash} /> : <CreatorView />}
        </>
    );
};

// --- STYLES ---

const GlobalStyles = () => (
    <style>{`
        :root {
            --primary-color: #1877f2;
            --primary-hover: #166fe5;
            --background-color: #f0f2f5;
            --panel-background: #ffffff;
            --text-primary: #1c1e21;
            --text-secondary: #65676b;
            --border-color: #dddfe2;
            --shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        }
        
        * { box-sizing: border-box; }

        .creator-wrapper {
            display: flex;
            flex-direction: column;
            height: 100vh;
            background-color: var(--background-color);
        }

        .creator-header {
            padding: 24px 48px;
            background-color: var(--panel-background);
            border-bottom: 1px solid var(--border-color);
        }
        .creator-header h1 { margin: 0; font-size: 24px; color: var(--primary-color); }
        .creator-header p { margin: 4px 0 0; color: var(--text-secondary); }

        .creator-tabs {
            padding: 0 48px;
            background: var(--panel-background);
            border-bottom: 1px solid var(--border-color);
            display: flex;
        }
        .creator-tabs button {
            padding: 16px 20px;
            border: none;
            background: none;
            font-size: 16px;
            font-weight: 600;
            color: var(--text-secondary);
            cursor: pointer;
            position: relative;
            border-bottom: 3px solid transparent;
            margin-bottom: -1px;
        }
        .creator-tabs button.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
        .creator-tabs button:disabled { color: #bec3c9; cursor: not-allowed; }

        .creator-main {
            flex-grow: 1;
            display: flex;
            overflow: hidden;
            padding: 24px 48px;
            gap: 24px;
        }

        .form-panel, .preview-panel {
            background: var(--panel-background);
            border-radius: 8px;
            box-shadow: var(--shadow);
            padding: 24px;
            overflow-y: auto;
        }
        
        .form-panel { flex: 0 0 400px; }
        .preview-panel { flex-grow: 1; display: flex; flex-direction: column; }
        
        .ab-variant-switcher {
            display: flex;
            background: var(--background-color);
            border-radius: 8px;
            padding: 4px;
            margin-bottom: 20px;
        }
        .ab-variant-switcher button {
            flex: 1;
            padding: 8px 12px;
            border: none;
            background: transparent;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
        }
        .ab-variant-switcher button.active {
            background: var(--panel-background);
            color: var(--primary-color);
            box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }


        .form-group { margin-bottom: 20px; }
        .form-group label {
            display: flex;
            justify-content: space-between;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
            color: var(--text-primary);
        }
        .form-group label span { font-weight: 400; color: var(--text-secondary); }

        .form-group input[type="text"], .form-group input[type="url"], .font-select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 16px;
        }
        .form-group input[type="color"] {
            width: 48px;
            height: 48px;
            border: 1px solid var(--border-color);
            padding: 4px;
            border-radius: 6px;
            cursor: pointer;
        }
        .form-group input[type="range"] { width: 100%; }
        .form-divider {
            margin-top: 32px;
            margin-bottom: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 8px;
        }
        
        .preview-update-btn {
             width: 100%;
             padding: 8px;
             font-size: 14px;
             background: #e4e6eb;
             color: var(--text-primary);
             border: 1px solid var(--border-color);
             border-radius: 6px;
             cursor: pointer;
             margin-top: 8px;
        }

        .label-with-action {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .ai-button {
            background: none;
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
        }

        .radio-group { display: flex; gap: 8px; }
        .radio-group button {
            flex-grow: 1;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            background: #f5f6f7;
            cursor: pointer;
        }
        .radio-group button.active {
            background-color: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }
        .radio-group button:disabled { background: #e9ecef; cursor: not-allowed; }
        
        .color-group { display: flex; gap: 24px; }

        .generate-btn {
            width: 100%;
            padding: 12px;
            font-size: 16px;
            font-weight: 600;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-top: 10px;
        }
        .generate-btn:hover { background-color: var(--primary-hover); }

        .generated-link-container { display: flex; margin-top: 16px; }
        .generated-link-container input { flex-grow: 1; border-right: 0; border-top-right-radius: 0; border-bottom-right-radius: 0; background: #f0f2f5; }
        .generated-link-container button { padding: 10px 15px; border-top-left-radius: 0; border-bottom-left-radius: 0; }

        .preview-header { font-weight: 600; margin-bottom: 16px; }
        .preview-content {
            flex-grow: 1;
            position: relative;
            border-radius: 8px;
            overflow: hidden;
            background: #e9ebee;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .preview-iframe { width: 100%; height: 100%; border: none; }
        .preview-bg {
             background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
            height: 100%;
            width: 100%;
        }
        .preview-error {
            text-align: center;
            padding: 20px;
            background: rgba(240, 242, 245, 0.9);
        }
        .preview-error p { margin: 0 0 8px; font-weight: 600; }
        .preview-error span { font-size: 14px; color: var(--text-secondary); }
        
        .cta-wrapper {
            position: relative;
            transition: box-shadow 0.2s;
        }
        .cta-wrapper:hover {
            cursor: grab;
        }
        .cta-wrapper.dragging {
            cursor: grabbing;
            z-index: 10000;
            box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        }
        .cta-wrapper:hover:not(.dragging) .cta-container {
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
            transform: scale(var(--cta-scale)) translateY(-4px);
        }

        .cta-container {
            position: absolute;
            bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 99999;
            animation: slide-up 0.5s ease-out;
            max-width: calc(100% - 40px);
            transform-origin: bottom;
            transform: scale(var(--cta-scale));
            transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
        }
        .cta-position-custom {
            position: absolute;
            animation: none;
            /* Position set by inline styles */
        }

        .cta-dark { border: 1px solid rgba(255,255,255,0.2); }
        .cta-light { border: 1px solid var(--border-color); }
        .cta-position-bottom-left { left: 20px; }
        .cta-position-bottom-right { right: 20px; }
        .cta-position-bottom-banner {
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 0;
            max-width: 100%;
            justify-content: center;
        }
        
        @keyframes slide-up {
          from { transform: scale(var(--cta-scale)) translateY(30px); opacity: 0; }
          to { transform: scale(var(--cta-scale)) translateY(0); opacity: 1; }
        }
        
        .cta-profile-img {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            object-fit: cover;
            flex-shrink: 0;
        }

        .cta-logo { display: flex; align-items: center; flex-shrink: 0;}
        .cta-message { margin: 0; font-weight: 500; line-height: 1.3; }
        .cta-button {
            padding: 8px 16px;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            white-space: nowrap;
            flex-shrink: 0;
            transition: transform 0.2s ease-out, filter 0.2s ease-out;
        }
        .cta-button:hover {
            transform: scale(1.03);
            filter: brightness(0.95);
        }
        .cta-inline-edit {
            padding: 4px;
            border: 1px solid var(--primary-color);
            border-radius: 4px;
            font-family: inherit;
            font-size: inherit;
            background: #f0f2f5;
        }
        .cta-inline-edit-button { padding: 8px 16px; }


        .analytics-view { padding: 24px 48px; }
        .analytics-header { margin-bottom: 32px; }
        .analytics-header h2 { margin: 0; font-size: 28px; }
        .analytics-header p { margin: 4px 0 0; font-size: 16px; color: var(--text-secondary); }
        .analytics-header span { color: var(--primary-color); font-weight: 500;}
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin-bottom: 32px;}
        .stat-card { background: var(--panel-background); padding: 24px; border-radius: 8px; box-shadow: var(--shadow); }
        .stat-card h3 { margin: 0 0 8px; font-size: 14px; color: var(--text-secondary); text-transform: uppercase; }
        .stat-card p { margin: 0; font-size: 32px; font-weight: 600; }
        .stat-change { font-weight: 600; }
        .stat-change.positive { color: #28a745; }
        .stat-change.negative { color: #dc3545; }
        
        .chart-container { background: var(--panel-background); padding: 24px; border-radius: 8px; box-shadow: var(--shadow); }
        .chart-container h3 { margin: 0 0 24px; }
        .chart { display: flex; align-items: flex-end; gap: 8px; height: 250px; border-bottom: 1px solid var(--border-color); }
        .chart-bar { flex: 1; background-color: var(--primary-color); border-radius: 4px 4px 0 0; transition: background-color 0.2s; }
        .chart-bar:hover { background-color: var(--primary-hover); }

        .viewer-wrapper { width: 100vw; height: 100vh; position: relative; }
        .viewer-iframe { width: 100%; height: 100%; border: none; }
        .error-view, .loading-view { display: grid; place-content: center; height: 100vh; font-size: 24px; background: #f0f2f5; }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .modal-content {
            background: var(--panel-background);
            padding: 24px;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
        }
        .modal-content h3 { margin: 0 0 20px; }
        .modal-content ul { list-style: none; padding: 0; margin: 0; max-height: 60vh; overflow-y: auto;}
        .modal-content li {
            background: var(--background-color);
            padding: 16px;
            border-radius: 6px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-content .suggestion-text p { margin: 0 0 4px; }
        .modal-content .suggestion-text strong { color: var(--text-primary); }
        .modal-content li button {
             padding: 6px 12px;
             font-size: 14px;
        }
        .modal-close-btn {
            width: 100%;
            padding: 10px;
            margin-top: 20px;
        }
        .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid var(--primary-color);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        @media (max-width: 900px) {
            .creator-main, .analytics-view { flex-direction: column; padding: 16px; }
            .form-panel { flex-basis: auto; }
            .preview-panel { min-height: 400px; }
            .creator-header, .creator-tabs { padding: 16px; }
        }
        
        @media (max-width: 480px) {
            .cta-container:not(.cta-position-bottom-banner) {
                flex-direction: column;
                left: 10px !important;
                right: 10px !important;
                bottom: 10px;
                align-items: stretch;
                text-align: center;
            }
            .cta-button { text-align: center; }
        }
    `}</style>
);


// --- RENDER ---
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
