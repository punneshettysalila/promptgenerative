// Templates database
const templates = {
    creative: {
        context: "Creative writing project for a fantasy novel",
        instructions: "Generate a compelling character backstory with emotional depth",
        examples: "Character: Elara, a warrior with a hidden magical ability",
        output: "A detailed 300-word backstory with personality traits and motivations"
    },
    code: {
        context: "Building a web application feature",
        instructions: "Write clean, well-documented code with error handling",
        examples: "Function to validate email addresses with regex",
        output: "Complete function with comments, type hints, and unit tests"
    },
    analysis: {
        context: "Analyzing business metrics and trends",
        instructions: "Provide data-driven insights with actionable recommendations",
        examples: "Sales data showing 15% decline in Q3",
        output: "Structured analysis with root causes and strategic solutions"
    },
    email: {
        context: "Professional business communication",
        instructions: "Draft a polite and concise email",
        examples: "Follow-up email after client meeting",
        output: "Professional email with subject line, 3-4 paragraphs, and call-to-action"
    },
    marketing: {
        context: "Product launch campaign",
        instructions: "Create engaging marketing copy that converts",
        examples: "New eco-friendly water bottle targeting fitness enthusiasts",
        output: "Compelling copy with headlines, benefits, and strong CTA"
    },
    tutorial: {
        context: "Educational content for beginners",
        instructions: "Create a step-by-step tutorial with clear explanations",
        examples: "How to set up a Git repository",
        output: "Beginner-friendly tutorial with screenshots descriptions and tips"
    },
    brainstorm: {
        context: "Generating creative ideas for a project",
        instructions: "Brainstorm innovative and diverse solutions",
        examples: "New features for a mobile productivity app",
        output: "10-15 unique ideas with brief descriptions and feasibility notes"
    },
    summarize: {
        context: "Long-form content that needs condensing",
        instructions: "Summarize key points while maintaining essential information",
        examples: "5-page research article on climate change",
        output: "Concise 200-word summary with main findings and conclusions"
    }
};

// Tips database
const allTips = [
    "Use specific verbs like 'analyze', 'compare', 'create' instead of vague terms",
    "Include role-playing: 'Act as an expert in...'",
    "Specify the audience: 'Explain as if to a 10-year-old'",
    "Add constraints to guide the output: word count, format, style",
    "Use chain-of-thought prompting: 'Think step by step'",
    "Provide counter-examples of what NOT to do",
    "Include success metrics: 'Focus on clarity and conciseness'",
    "Test your prompt with variations to find the best version",
    "Use delimiters to separate different sections clearly",
    "Ask for reasoning: 'Explain your thought process'",
    "Specify the perspective: 'From a beginner's viewpoint'",
    "Request structured output: tables, lists, JSON format",
    "Use temperature control terminology: 'Be creative' vs 'Be factual'",
    "Include edge cases and how to handle them",
    "Ask for multiple alternatives: 'Provide 3 different approaches'"
];

let promptHistory = JSON.parse(localStorage.getItem('promptHistory')) || [];

document.addEventListener('DOMContentLoaded', function() {
    // Restore saved draft on page load
    restoreDraft();
    
    // Auto-save as user types
    setupAutoSave();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Load history
    displayHistory();
    
    // Character and word count
    setupCounters();
});

function restoreDraft() {
    let saved = localStorage.getItem('lastPrompt');
    if(saved) {
        let data = JSON.parse(saved);
        document.getElementById('context').value = data.context || '';
        document.getElementById('instructions').value = data.instructions || '';
        document.getElementById('examples').value = data.examples || '';
        document.getElementById('output').value = data.output || '';
        document.getElementById('constraints').value = data.constraints || '';
        
        // Restore checkboxes
        if(data.tones) {
            data.tones.forEach(tone => {
                const checkbox = document.querySelector(`input[name="tone"][value="${tone}"]`);
                if(checkbox) checkbox.checked = true;
            });
        }
        if(data.formats) {
            data.formats.forEach(format => {
                const checkbox = document.querySelector(`input[name="format"][value="${format}"]`);
                if(checkbox) checkbox.checked = true;
            });
        }
    }
}

function setupAutoSave() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', debounce(saveDraft, 1000));
    });
    
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', saveDraft);
    });
}

function saveDraft() {
    const data = {
        context: document.getElementById('context').value,
        instructions: document.getElementById('instructions').value,
        examples: document.getElementById('examples').value,
        output: document.getElementById('output').value,
        constraints: document.getElementById('constraints').value,
        tones: getSelectedValues('tone'),
        formats: getSelectedValues('format')
    };
    localStorage.setItem('lastPrompt', JSON.stringify(data));
}

function setupEventListeners() {
    // Template selection
    document.getElementById('template-select').addEventListener('change', function(e) {
        const template = templates[e.target.value];
        if(template) {
            document.getElementById('context').value = template.context;
            document.getElementById('instructions').value = template.instructions;
            document.getElementById('examples').value = template.examples;
            document.getElementById('output').value = template.output;
            updateCounters();
            addAnimation(e.target, 'pulse');
        }
    });
    
    // Generate prompt
    document.getElementById('generate-btn').addEventListener('click', generatePrompt);
    
    // AI Enhance
    document.getElementById('enhance-btn').addEventListener('click', enhancePrompt);
    
    // Clear all
    document.getElementById('clear-btn').addEventListener('click', clearAll);
    
    // Copy button
    document.getElementById('copy-btn').addEventListener('click', copyPrompt);
    
    // Save button
    document.getElementById('save-btn').addEventListener('click', saveToHistory);
    
    // Share button
    document.getElementById('share-btn').addEventListener('click', sharePrompt);
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', exportPrompt);
    
    // Random tip
    document.getElementById('random-tip-btn').addEventListener('click', showRandomTip);
    
    // AI Assistant
    document.getElementById('open-assistant-btn').addEventListener('click', openAssistant);
    document.getElementById('close-assistant').addEventListener('click', closeAssistant);
    document.getElementById('send-message-btn').addEventListener('click', sendMessage);
    document.getElementById('user-message').addEventListener('keypress', function(e) {
        if(e.key === 'Enter') sendMessage();
    });
}

function setupCounters() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', updateCounters);
    });
    updateCounters();
}

function updateCounters() {
    const allText = [
        document.getElementById('context').value,
        document.getElementById('instructions').value,
        document.getElementById('examples').value,
        document.getElementById('output').value,
        document.getElementById('constraints').value
    ].join(' ');
    
    const chars = allText.length;
    const trimmedText = allText.trim();
    const words = trimmedText === '' ? 0 : trimmedText.split(/\s+/).length;
    
    document.getElementById('char-count').textContent = `Characters: ${chars}`;
    document.getElementById('word-count').textContent = `Words: ${words}`;
}

function generatePrompt() {
    const context = document.getElementById('context').value.trim();
    const instructions = document.getElementById('instructions').value.trim();
    const examples = document.getElementById('examples').value.trim();
    const output = document.getElementById('output').value.trim();
    const constraints = document.getElementById('constraints').value.trim();
    const tones = getSelectedValues('tone');
    const formats = getSelectedValues('format');
    
    if(!context && !instructions && !examples && !output) {
        showNotification('Please fill in at least one field!', 'warning');
        return;
    }
    
    let prompt = "";
    
    // Add role and tone
    if(tones.length > 0) {
        prompt += `Tone: ${tones.join(', ')}\n\n`;
    }
    
    // Add main sections
    if(context) prompt += `Context:\n${context}\n\n`;
    if(instructions) prompt += `Instructions:\n${instructions}\n\n`;
    if(examples) prompt += `Examples:\n${examples}\n\n`;
    if(output) prompt += `Expected Output:\n${output}\n\n`;
    if(constraints) prompt += `Constraints:\n${constraints}\n\n`;
    
    // Add format preference
    if(formats.length > 0) {
        prompt += `Output Format: ${formats.join(', ')}\n`;
    }
    
    // Display
    document.getElementById('final-prompt').textContent = prompt;
    document.getElementById('final-prompt-section').style.display = 'block';
    
    // Calculate and display quality score
    const score = calculateQualityScore({context, instructions, examples, output, constraints, tones, formats});
    updateQualityMeter(score);
    
    // Add animation
    addAnimation(document.getElementById('final-prompt-section'), 'slideIn');
    
    // Save to localStorage
    saveDraft();
    
    showNotification('Prompt generated successfully! ✨', 'success');
}

function enhancePrompt() {
    const currentPrompt = document.getElementById('final-prompt').textContent;
    
    if(!currentPrompt) {
        showNotification('Generate a prompt first!', 'warning');
        return;
    }
    
    // Simulate AI enhancement with improvements
    let enhanced = currentPrompt;
    
    // Add structure if missing
    if(!enhanced.includes('Step-by-step')) {
        enhanced += "\n\nAdditional Instructions:\n- Think step-by-step\n- Show your reasoning\n- Provide specific examples";
    }
    
    // Add quality markers
    enhanced += "\n\nQuality Expectations:\n- Accuracy and factual correctness\n- Clear and concise language\n- Proper formatting and structure";
    
    document.getElementById('final-prompt').textContent = enhanced;
    
    // Recalculate quality score
    const score = Math.min(100, calculateQualityScore({
        context: document.getElementById('context').value,
        instructions: document.getElementById('instructions').value,
        examples: document.getElementById('examples').value,
        output: document.getElementById('output').value,
        constraints: document.getElementById('constraints').value,
        tones: getSelectedValues('tone'),
        formats: getSelectedValues('format')
    }) + 15);
    
    updateQualityMeter(score);
    addAnimation(document.getElementById('final-prompt'), 'glow');
    showNotification('Prompt enhanced with AI suggestions! 🚀', 'success');
}

function clearAll() {
    if(confirm('Clear all fields? This will erase your current prompt.')) {
        document.getElementById('prompt-form').reset();
        document.getElementById('final-prompt').textContent = '';
        document.getElementById('final-prompt-section').style.display = 'none';
        document.getElementById('template-select').value = '';
        updateCounters();
        localStorage.removeItem('lastPrompt');
        showNotification('All fields cleared!', 'info');
    }
}

function copyPrompt() {
    const prompt = document.getElementById('final-prompt').textContent;
    navigator.clipboard.writeText(prompt).then(() => {
        showNotification('Copied to clipboard! 📋', 'success');
        addAnimation(document.getElementById('copy-btn'), 'pulse');
    }).catch(() => {
        showNotification('Failed to copy. Please try again.', 'error');
    });
}

function saveToHistory() {
    const prompt = document.getElementById('final-prompt').textContent;
    if(!prompt) {
        showNotification('No prompt to save!', 'warning');
        return;
    }
    
    const historyItem = {
        id: Date.now(),
        prompt: prompt,
        timestamp: new Date().toLocaleString(),
        preview: prompt.substring(0, 100) + '...'
    };
    
    promptHistory.unshift(historyItem);
    if(promptHistory.length > 10) promptHistory.pop(); // Keep only last 10
    
    localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
    displayHistory();
    showNotification('Saved to history! 💾', 'success');
}

function displayHistory() {
    const historyList = document.getElementById('history-list');
    
    if(promptHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-message">No saved prompts yet.</p>';
        return;
    }
    
    historyList.innerHTML = promptHistory.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div class="history-preview">${item.preview}</div>
            <div class="history-meta">
                <span>${item.timestamp}</span>
                <div class="history-actions">
                    <button onclick="loadFromHistory(${item.id})" class="tiny-btn">Load</button>
                    <button onclick="deleteFromHistory(${item.id})" class="tiny-btn delete">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadFromHistory(id) {
    const item = promptHistory.find(h => h.id === id);
    if(item) {
        document.getElementById('final-prompt').textContent = item.prompt;
        document.getElementById('final-prompt-section').style.display = 'block';
        showNotification('Prompt loaded from history!', 'success');
        
        // Scroll to prompt
        document.getElementById('final-prompt-section').scrollIntoView({behavior: 'smooth'});
    }
}

function deleteFromHistory(id) {
    if(confirm('Delete this prompt from history?')) {
        promptHistory = promptHistory.filter(h => h.id !== id);
        localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
        displayHistory();
        showNotification('Deleted from history!', 'info');
    }
}

function sharePrompt() {
    const prompt = document.getElementById('final-prompt').textContent;
    if(!prompt) {
        showNotification('No prompt to share!', 'warning');
        return;
    }
    
    // Create shareable link (URL-encoded to safely handle Unicode)
    const encoded = encodeURIComponent(prompt);
    const shareUrl = `${window.location.href.split('?')[0]}?prompt=${encoded}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('Shareable link copied! 🔗', 'success');
    }).catch(() => {
        showNotification('Failed to create share link.', 'error');
    });
}

function exportPrompt() {
    const prompt = document.getElementById('final-prompt').textContent;
    if(!prompt) {
        showNotification('No prompt to export!', 'warning');
        return;
    }
    
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GenPai-Prompt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Prompt exported! 📥', 'success');
}

function ensureTipStyles() {
    // Inject tip styles and animations once to avoid inline style usage
    if (document.getElementById('dynamic-tip-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'dynamic-tip-styles';
    style.textContent = `
.tip-item {
    background: #ffe5e5;
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 8px;
}
@keyframes tip-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes tip-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
}
.tip-fade-in {
    animation: tip-fade-in 0.5s ease;
}
.tip-fade-out {
    animation: tip-fade-out 0.5s ease;
}
`;
    document.head.appendChild(style);
}

function showRandomTip() {
    ensureTipStyles();

    const randomTip = allTips[Math.floor(Math.random() * allTips.length)];
    const tipsList = document.getElementById('tips-list');
    
    // Highlight random tip
    const newLi = document.createElement('li');
    newLi.textContent = randomTip;
    newLi.classList.add('tip-item', 'tip-fade-in');
    
    tipsList.insertBefore(newLi, tipsList.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        newLi.classList.remove('tip-fade-in');
        newLi.classList.add('tip-fade-out');
        setTimeout(() => newLi.remove(), 500);
    }, 5000);
    
    showNotification('💡 New tip added!', 'info');
}

function openAssistant() {
    document.getElementById('ai-assistant').style.display = 'block';
    addAnimation(document.getElementById('ai-assistant'), 'slideIn');
    
    if(document.getElementById('chat-messages').children.length === 0) {
        addBotMessage("Hi! I'm GenPai Assistant. Ask me anything about prompt engineering!");
    }
}

function closeAssistant() {
    document.getElementById('ai-assistant').style.display = 'none';
}

function sendMessage() {
    const input = document.getElementById('user-message');
    const message = input.value.trim();
    
    if(!message) return;
    
    addUserMessage(message);
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateAssistantResponse(message);
        addBotMessage(response);
    }, 500);
}

function addUserMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'user-message';
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'bot-message';
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateAssistantResponse(userMessage) {
    const lowerMsg = userMessage.toLowerCase();
    
    // Template related questions
    if(lowerMsg.includes('template')) {
        return "🎯 I have 8 pre-built templates:\n\n1. Creative Writing - For stories & narratives\n2. Code Generation - For programming tasks\n3. Data Analysis - For business insights\n4. Email Writing - For professional emails\n5. Marketing Copy - For promotional content\n6. Tutorial Creation - For teaching guides\n7. Brainstorming - For idea generation\n8. Text Summarization - For condensing content\n\nSelect one from the dropdown to auto-fill the fields!";
    } 
    
    // Tone and style questions
    else if(lowerMsg.includes('tone') || lowerMsg.includes('style')) {
        return "🎭 You can select multiple tones to customize your prompt:\n\n• Professional - For business/formal contexts\n• Casual - For friendly, conversational tone\n• Humorous - For witty, entertaining content\n• Formal - For academic/official documents\n• Creative - For imaginative, artistic work\n\nTip: Combine tones like 'Professional + Humorous' for unique results!";
    } 
    
    // Quality score questions
    else if(lowerMsg.includes('quality') || lowerMsg.includes('score')) {
        return "📊 Quality Score Breakdown:\n\n• Context (10 pts) - Background info\n• Instructions (15 pts) - Clear directions\n• Examples (10 pts) - Sample inputs/outputs\n• Output Format (5 pts) - Expected result\n• Specificity (30 pts) - Detail level (100+ chars gets 10, 250+ gets 20, 400+ gets 30)\n• Enhancements (30 pts) - Constraints, tones, formats\n\n🎯 Aim for 80%+ score for best AI responses!\n\nTip: Use the AI Enhance button to automatically improve your score.";
    } 
    
    // Export, save, share questions
    else if(lowerMsg.includes('export') || lowerMsg.includes('save') || lowerMsg.includes('share')) {
        return "💾 You have 4 ways to save/share prompts:\n\n1. 📋 Copy Button - Copy to clipboard\n2. 💾 Save Button - Add to history (keeps last 10)\n3. 🔗 Share Button - Generate shareable link\n4. 📥 Export Button - Download as .txt file\n\nAll data is stored locally in your browser - nothing goes to any server! Your prompts stay private.";
    } 
    
    // AI Enhance questions
    else if(lowerMsg.includes('enhance') || lowerMsg.includes('improve')) {
        return "🚀 AI Enhance adds powerful improvements:\n\n✅ Adds step-by-step thinking instructions\n✅ Includes reasoning requirements\n✅ Adds quality expectations\n✅ Improves structure and clarity\n✅ Typically boosts quality score by 15-20%\n\nJust click the green 'AI Enhance' button after generating your prompt!";
    } 
    
    // How to use / help questions
    else if(lowerMsg.includes('help') || lowerMsg.includes('how') || lowerMsg.includes('use') || lowerMsg.includes('start')) {
        return "🚀 Quick Start Guide:\n\n1. Choose a template (optional) for quick start\n2. Fill in at least Context OR Instructions\n3. Select tone & format preferences\n4. Click 'Generate Prompt' ✨\n5. Use 'AI Enhance' 🚀 to improve further\n6. Copy, save, or export your prompt\n\nPro tip: More detail = better quality score = better AI responses!";
    } 
    
    // Clear/reset questions
    else if(lowerMsg.includes('clear') || lowerMsg.includes('reset') || lowerMsg.includes('delete')) {
        return "🗑️ To clear your work:\n\n• Click 'Clear All' button to reset all fields\n• To delete from history: Click the 'Delete' button next to saved prompts\n• Your draft auto-saves, so reloading the page restores your work\n\nWarning: Clear All will ask for confirmation before deleting!";
    }
    
    // Format questions
    else if(lowerMsg.includes('format') || lowerMsg.includes('output')) {
        return "📝 Output Format Options:\n\n• Structured - Organized with headings\n• Bullet Points - List format\n• Step-by-Step - Numbered instructions\n• JSON - Code-friendly format\n\nYou can select multiple formats! This tells the AI exactly how to present the response.";
    }
    
    // Constraints questions
    else if(lowerMsg.includes('constraint') || lowerMsg.includes('limit')) {
        return "⚙️ Constraints help refine AI responses:\n\nExamples:\n• 'Max 200 words'\n• 'Use bullet points only'\n• 'No technical jargon'\n• 'Include 3 examples'\n• 'Beginner-friendly language'\n\nConstraints guide the AI to follow specific rules or limitations!";
    }
    
    // Best practices questions
    else if(lowerMsg.includes('best') || lowerMsg.includes('practice') || lowerMsg.includes('tip')) {
        return "💎 Best Practices for Great Prompts:\n\n1. Be specific - Vague = vague results\n2. Provide context - Help AI understand\n3. Include examples - Show what you want\n4. Set constraints - Define boundaries\n5. Specify format - Get structured output\n6. Test & iterate - Refine your prompts\n\nClick 'Random Tip' button for more insights!";
    }
    
    // History questions
    else if(lowerMsg.includes('history') || lowerMsg.includes('previous')) {
        return "📚 Prompt History Features:\n\n• Auto-saves your last 10 prompts\n• Click 'Load' to restore any saved prompt\n• Click 'Delete' to remove from history\n• Timestamps show when each was created\n• All stored locally in your browser\n\nScroll down to see your saved prompts!";
    }
    
    // Examples questions
    else if(lowerMsg.includes('example')) {
        return "💡 Why Examples Matter:\n\nExamples show the AI exactly what you want!\n\nGood example:\n'Input: Write a haiku about cats'\n'Output: Soft paws on window / Whiskers twitch in morning light / Silent hunter waits'\n\nExamples increase quality score by 10 points and dramatically improve AI accuracy!";
    }
    
    // Default response with helpful suggestions
    else {
        return "🤖 I can help you with:\n\n• How to use templates\n• Understanding quality scores\n• Tone & format options\n• Saving & sharing prompts\n• AI Enhance feature\n• Best practices & tips\n• Output formats\n• Using constraints\n\nJust ask me anything! Try: 'How do I improve my quality score?' or 'What templates do you have?'";
    }
}

function calculateQualityScore(data) {
    let score = 0;
    
    // Completeness (40 points)
    if(data.context) score += 10;
    if(data.instructions) score += 15;
    if(data.examples) score += 10;
    if(data.output) score += 5;
    
    // Specificity (30 points)
    const totalLength = (data.context + data.instructions + data.examples + data.output).length;
    if(totalLength > 100) score += 10;
    if(totalLength > 250) score += 10;
    if(totalLength > 400) score += 10;
    
    // Enhancements (30 points)
    if(data.constraints) score += 10;
    if(data.tones && data.tones.length > 0) score += 10;
    if(data.formats && data.formats.length > 0) score += 10;
    
    return Math.min(100, score);
}

function updateQualityMeter(score) {
    const fill = document.getElementById('quality-fill');
    const scoreText = document.getElementById('quality-score');
    
    fill.style.width = score + '%';
    scoreText.textContent = score + '%';
    
    // Color based on score
    if(score >= 80) {
        fill.style.background = 'linear-gradient(90deg, #34a853 0%, #4caf50 100%)';
        fill.style.boxShadow = '0 2px 8px rgba(52, 168, 83, 0.4)';
    } else if(score >= 60) {
        fill.style.background = 'linear-gradient(90deg, #fbbc04 0%, #ffc107 100%)';
        fill.style.boxShadow = '0 2px 8px rgba(251, 188, 4, 0.4)';
    } else {
        fill.style.background = 'linear-gradient(90deg, #ea4335 0%, #f44336 100%)';
        fill.style.boxShadow = '0 2px 8px rgba(234, 67, 53, 0.4)';
    }
}

function getSelectedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map(cb => cb.value);
}

function base64ToUtf8(base64) {
    const binaryString = atob(base64);
    const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
}

function addAnimation(element, animationName) {
    element.style.animation = `${animationName} 0.5s ease`;
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Load prompt from URL if shared
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedPrompt = urlParams.get('prompt');
    
    if(sharedPrompt) {
        try {
            const decoded = decodeURIComponent(sharedPrompt);
            document.getElementById('final-prompt').textContent = decoded;
            document.getElementById('final-prompt-section').style.display = 'block';
            showNotification('Loaded shared prompt!', 'success');
        } catch(e) {
            console.error('Failed to load shared prompt:', e);
        }
    }
});
