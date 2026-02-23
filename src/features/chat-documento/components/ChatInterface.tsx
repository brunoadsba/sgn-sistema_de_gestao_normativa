'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, User, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface ChatInterfaceProps {
    documentContext?: string | null | undefined
}

export function ChatInterface({ documentContext }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Olá! Sou seu assistente normativo, NEX. Analisei o seu documento e estou pronto para tirar dúvidas específicas ou ajudar na remediação dos gaps. O que deseja saber?',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const [isTyping, setIsTyping] = useState(false)

    const handleSend = async () => {
        if (!input.trim() || isTyping) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        const newMessages = [...messages, userMsg]
        setMessages(newMessages)
        setInput('')
        setIsTyping(true)

        try {
            const res = await fetch('/api/chat-documento', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                    documentContext: documentContext
                })
            })

            const data = await res.json()
            if (data.success) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.reply,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, aiMsg])
            } else {
                throw new Error(data.error || 'Erro ao comunicar com a IA')
            }
        } catch (error) {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Desculpe, encontrei um erro na analise neural: ' + (error instanceof Error ? error.message : 'Erro desconhecido.'),
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMsg])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-white/50 dark:bg-gray-950/20 backdrop-blur-xl">
            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800"
            >
                <div className="max-w-4xl mx-auto w-full space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-4 max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 text-indigo-600'
                                        }`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`p-4 sm:p-5 rounded-3xl text-[14px] sm:text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                                        : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-200 rounded-tl-sm'
                                        }`}>
                                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input Area Premium */}
            <div className="p-4 sm:p-5 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 shrink-0">
                <div className="max-w-4xl mx-auto w-full">
                    <div className="relative group">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                            disabled={isTyping}
                            placeholder={isTyping ? "Analisando contexto..." : "O que deseja saber sobre o documento?"}
                            className="w-full bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-white/10 rounded-2xl py-4 pl-5 pr-14 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none min-h-[56px] max-h-32 text-gray-700 dark:text-gray-200 disabled:opacity-50 font-medium placeholder:text-gray-400 shadow-inner"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2.5 bottom-2.5 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all shadow-md active:scale-95"
                        >
                            {isTyping ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-3 text-center uppercase tracking-widest font-black flex items-center justify-center gap-1.5 opacity-80">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Grounding estrito no seu documento
                    </p>
                </div>
            </div>
        </div>
    )
}
