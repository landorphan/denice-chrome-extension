// Clean up unwanted tags (script, style, and JSON-LD)
function cleanHtml(html: string) {
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    html = html.replace(/<!--[\s\S]*?-->/g, '');  // Remove HTML comments
    html = html.replace(/\s*style=["'][^"']*["']/gi, ''); // Remove inline styles
    return html;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'gatherPageData') {
        const pageContent = cleanHtml(document.documentElement.outerHTML);
        const pageUrl = window.location.href;
        
        // Send the cleaned content and URL back to the popup
        sendResponse({
            content: pageContent,
            url: pageUrl
        });
    }
});
