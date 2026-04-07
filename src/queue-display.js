// Queue Display Page JavaScript

$(document).ready(function() {
    // Initialize display
    updateDisplay();
    
    // Auto-refresh every 3 seconds
    setInterval(updateDisplay, 3000);
    
    // Update clock
    updateClock();
    setInterval(updateClock, 1000);
});

function updateDisplay() {
    const queueData = typeof getQueueData === 'function' ? getQueueData() : getDisplayQueueDataFallback();
    
    $('#main-token').fadeOut(200, function() {
        $(this).text(queueData.currentToken).fadeIn(200);
    });
    
    $('#main-counter').text(queueData.currentCounter && queueData.currentCounter.toString().replace('Counter ', '') || '1');
    $('#queue-count').text(queueData.waitingCount);
    $('#avg-wait').text(queueData.avgWaitTime + ' min');
    updateUpcomingTokensList(queueData.upcomingTokens || []);
}

function getDisplayQueueDataFallback() {
    const tokens = [];
    for (let i = 1; i <= 100; i++) tokens.push(`A-${String(i).padStart(3, '0')}`);
    const idx = Math.floor(Math.random() * 90);
    return {
        currentToken: tokens[idx],
        currentCounter: '1',
        waitingCount: 99 - idx,
        avgWaitTime: (10 + (idx % 5)).toFixed(1),
        upcomingTokens: tokens.slice(idx + 1, idx + 7)
    };
}

function updateUpcomingTokensList(tokens) {
    const container = $('#upcoming-tokens');
    
    container.empty();
    
    tokens.forEach((token, index) => {
        const tokenEl = $(`
            <div class="bg-slate-700 border border-slate-600 rounded-lg p-4 text-center hover:bg-indigo-600 transition cursor-pointer transform hover:scale-110" style="animation-delay: ${index * 100}ms;">
                <div class="text-2xl font-bold text-white animate-fadeIn">${token}</div>
            </div>
        `);
        container.append(tokenEl);
    });
}

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = `${hours}:${minutes}`;
    $('#digital-clock').text(timeString);
    
    // Update date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    $('#current-date').text(dateString);
}
