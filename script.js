document.addEventListener('DOMContentLoaded', function() {
    // Restore saved draft on page load
    let saved = localStorage.getItem('lastPrompt');
    if(saved) {
        let data = JSON.parse(saved);
        document.getElementById('context').value = data.context || '';
        document.getElementById('instructions').value = data.instructions || '';
        document.getElementById('examples').value = data.examples || '';
        document.getElementById('output').value = data.output || '';
    }

    document.getElementById('generate-btn').addEventListener('click', function() {
        // Collect inputs
        const context = document.getElementById('context').value.trim();
        const instructions = document.getElementById('instructions').value.trim();
        const examples = document.getElementById('examples').value.trim();
        const output = document.getElementById('output').value.trim();

        // Build the prompt
        let prompt = "";
        if(context) prompt += `Context: ${context}\n`;
        if(instructions) prompt += `Instructions: ${instructions}\n`;
        if(examples) prompt += `Examples: ${examples}\n`;
        if(output) prompt += `Expected Output: ${output}`;

        // Display
        document.getElementById('final-prompt').textContent = prompt;

        // Save to localStorage
        localStorage.setItem('lastPrompt', JSON.stringify({context, instructions, examples, output}));
    });
});
